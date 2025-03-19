import { XMPPChat } from "./XMPPChat";

export class XMPP1to1Chat extends XMPPChat {
  async listMembers(): Promise<void> {
  }

  async listMessages() {
    let index = 0;
    let complete = false;
    while (!complete) {
      let resultJSON = await this.account.client.searchHistory({
        with: this.id,
        paging: { index: index, max: 50 },
      });
      if (!resultJSON?.results?.length || index > 1000000) {
        break;
      }
      for (let itemJSON of resultJSON.results) {
        this.addMessage(itemJSON.item.message, false);
      }
      index += resultJSON.results.length;
      complete = !!resultJSON.complete;
    }
    this.lastMessage ??= this.messages.first;
  }

  async getLastMessage() {
    if (this.messages.hasItems) {
      return;
    }
    let resultJSON = await this.account.client.searchHistory({
      with: this.id,
      paging: { max: 1 },
    });
    let itemJSON = resultJSON?.results?.[0];
    if (!itemJSON) {
      return;
    }
    let msg = this.addMessage(itemJSON.item.message);
    this.lastMessage = msg;
  }
}
