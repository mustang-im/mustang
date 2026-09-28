/** Removes the quoted text of the email that this email replies to,
 * including the "X wrote:" line above it */
export function removeQuotes(text: string): string {
  let lines = text.split("\n");
  let kept: string[] = [];
  for (let i = 0; i < lines.length; i++) {
    let line = lines[i];
    if (kOriginalMessage.test(line) ||
        /^_{10,}\s*$/.test(line) && kOutlookHeader.test(lines[i + 1] ?? "")) {
      break; // Outlook: The whole original email follows
    }
    if (!line.startsWith(">")) {
      kept.push(line);
      continue;
    }
    while (kept.length && !kept.at(-1).trim()) {
      kept.pop();
    }
    if (kWroteLine.test(kept.at(-1) ?? "")) {
      kept.pop();
    }
  }
  return kept.join("\n").trim();
}

/** Removes everything after the signature separator "-- " */
export function removeSignature(text: string): string {
  let pos = text.search(/^-- ?$/m);
  return (pos < 0 ? text : text.slice(0, pos)).trim();
}

/** Removes legal disclaimers and company registration details at the end of the email */
export function removeDisclaimer(text: string): string {
  let paragraphs = text.trim().split(/\n\s*\n/);
  while (paragraphs.length > 1 && kDisclaimer.test(paragraphs.at(-1))) {
    paragraphs.pop();
  }
  return paragraphs.join("\n\n");
}

const kOriginalMessage = /^\s*-{2,}\s*(Original Message|Ursprüngliche Nachricht|Message d'origine|Messaggio originale|Mensaje original|Oorspronkelijk bericht)\s*-{2,}\s*$/i;
const kOutlookHeader = /^\s*(From|Von|De|Da|Van):/i;
const kWroteLine = /\b(wrote|schrieb|a écrit|ha scritto|escribió|schreef)\b.*:\s*$/i;
const kDisclaimer = /confidential|intended recipient|intended solely|privileged|vertraulich|irrtümlich|nicht der (richtige|beabsichtigte) (Adressat|Empfänger)|Geschäftsführ|Registergericht|Handelsregister|Amtsgericht|USt-?Id/i;
