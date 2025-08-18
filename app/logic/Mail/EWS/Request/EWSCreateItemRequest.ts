export class EWSCreateItemRequest {
  m$CreateItem: any = {
    m$Items: {},
  };

  constructor(attributes?: {[key: string]: string | boolean | object}) {
    Object.assign(this.m$CreateItem, attributes);
  }

  addField(type: string, key: string, value: any, FieldURI?: string, FieldIndex?: string) {
    if (value != null) {
      let item = (this.m$CreateItem.m$Items["t$" + type] ||= {});
      if (FieldIndex) {
        let array = (item["t$" + key] ||= {t$Entry: []}).t$Entry;
        let entry = array.find(entry => entry.Key == FieldIndex);
        if (entry) {
          Object.assign(entry, value.t$Entry);
        } else {
          array.push(value.t$Entry);
        }
      } else {
        item["t$" + key] = value;
      }
    }
  }
}
