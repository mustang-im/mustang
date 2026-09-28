import { SearchEMail } from "../Store/SearchEMail";
import { SQLSearchEMail } from "./SQLSearchEMail";
import { getDatabase } from "./SQLDatabase";
import type { EMail } from "../EMail";
import { removeQuotes, removeSignature, removeDisclaimer } from "../cleanPlaintext";
import { convertHTMLToText } from "../../util/convertHTML";
import { getSQLiteDatabase } from "../../util/backend-wrapper";
import { RunOnce } from "../../util/flow/RunOnce";
import { sleep } from "../../util/util";
import { appGlobal } from "../../app";
import sql, { type Database } from "../../../../lib/rs-sqlite/index";
import { ArrayColl } from "svelte-collections";

/** Finds emails whose meaning matches `bodyText`, even when they use other words.
 * Compares the text embeddings which `indexEMails()` calculates in the background. */
export class RAGSearchEMail extends SearchEMail {
  async startSearch(limit?: number): Promise<ArrayColl<EMail>> {
    if (!this.bodyText) {
      return new ArrayColl<EMail>();
    }
    let [vector] = await embed(["query: " + this.bodyText]);
    // Scan the 1-bit vectors, then re-rank the best ones with the more precise 8-bit vectors
    let rows = await (await getVectorDatabase()).all(sql`
      WITH coarse AS (
        SELECT emailID, embeddingInt8 FROM emailVec
        WHERE embedding MATCH vec_quantize_binary(vec_f32(${vector})) AND k = ${kCoarseResults})
      SELECT emailID, vec_distance_cosine(vec_int8(embeddingInt8), vec_quantize_int8(vec_f32(${vector}), 'unit')) AS distance
      FROM coarse
      WHERE distance < ${kMaxDistance}
      ORDER BY distance
      `) as any[];
    if (!rows.length) {
      return new ArrayColl<EMail>();
    }
    let dbSearch = new SQLSearchEMail();
    dbSearch.copyFrom(this);
    dbSearch.bodyText = null;
    dbSearch.emailIDs = rows.map(row => row.emailID);
    return await dbSearch.startSearch(limit);
  }

  /** Calculates the embeddings of all emails, newest first,
   * then of new emails as they arrive. Runs forever. */
  static async indexEMails() {
    let vectorDB = await getVectorDatabase();
    let mailDB = await getDatabase();
    while (true) {
      let indexed = await vectorDB.get(sql`SELECT min(emailID) AS oldest, max(emailID) AS newest FROM emailVec`) as any;
      let newest = indexed.newest ?? (await mailDB.get(sql`SELECT max(id) AS id FROM email`) as any).id ?? 0;
      let oldest = indexed.oldest ?? newest + 1;
      // Indexing in ID order leaves no gaps, even when we stop in the middle
      let emails = await mailDB.all(sql`
        SELECT id, subject, contactName, plaintext, html FROM email
        WHERE id > ${newest} ORDER BY id LIMIT ${kBatchSize}`) as any[];
      if (!emails.length) {
        emails = await mailDB.all(sql`
          SELECT id, subject, contactName, plaintext, html FROM email
          WHERE id < ${oldest} ORDER BY id DESC LIMIT ${kBatchSize}`) as any[];
      }
      if (!emails.length) {
        await sleep(60);
        continue;
      }
      let vectors = await embed(emails.map(email => {
        let body = email.plaintext ?? (email.html ? convertHTMLToText(email.html) : "");
        body = removeDisclaimer(removeSignature(removeQuotes(body)));
        return `passage: Subject: ${email.subject}\nFrom: ${email.contactName ?? ""}\n\n${body}`.slice(0, 2000);
      }));
      for (let i = 0; i < emails.length; i++) {
        await vectorDB.run(sql`
          INSERT INTO emailVec (emailID, embedding, embeddingInt8)
          VALUES (CAST(${emails[i].id} AS INTEGER), vec_quantize_binary(vec_f32(${vectors[i]})), vec_quantize_int8(vec_f32(${vectors[i]}), 'unit'))`);
      }
    }
  }
}

/** When changing it, delete mail-vec.db */
const kModel = "Xenova/multilingual-e5-small";
const kBatchSize = 32;
/** The approximate 1-bit search gets slow with many results */
const kCoarseResults = 150;
/** Cosine distance. TODO Tune with real emails */
const kMaxDistance = 0.21;

let embedder: Function;
let embedderRunOnce = new RunOnce<Function>();

/** @returns one vector per text, as JSON array */
async function embed(texts: string[]): Promise<string[]> {
  embedder ??= await embedderRunOnce.runOnce(() => appGlobal.remoteApp.createTextEmbedder(kModel));
  let tensor = await embedder(texts, { pooling: "mean", normalize: true });
  let vectors = await tensor.tolist() as number[][];
  return vectors.map(vector => JSON.stringify(vector));
}

let vectorDatabase: Database;
let openRunOnce = new RunOnce<Database>();

async function getVectorDatabase(): Promise<Database> {
  return vectorDatabase ?? await openRunOnce.runOnce(async () => {
    let db = await getSQLiteDatabase("mail-vec.db");
    await db.migrate(sql`
      CREATE VIRTUAL TABLE emailVec USING vec0(
        emailID INTEGER PRIMARY KEY,
        embedding bit[384],
        +embeddingInt8 BLOB
      );`);
    await db.pragma('journal_mode = WAL');
    return vectorDatabase = db;
  });
}
