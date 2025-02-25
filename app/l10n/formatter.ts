export function formatter() {
  return {
    catalogExtension: '.json',
    parse: (content: string) => {
      let json = JSON.parse(content);
      return json;
    },
    serialize: (json,{ existing }) => {
      let catalog = {};
      existing = JSON.parse(existing);
      for (let key in json) {
        catalog[key] = {
          message: existing[key] ?? json[key]["message"],
          source: json[key].origin?.[0][0].split("/").pop(),
        }
      }
      return JSON.stringify(catalog, null, 2);
    }
  }
}