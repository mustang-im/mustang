export function formatter() {
  return {
    catalogExtension: '.json',
    parse: (content: string) => {
      let json = JSON.parse(content);
      return json;
    },
    serialize: (json) => {
      let catalog = {};
      for (let key in json) {
        catalog[key] = {
          message: json[key]["message"],
          location: json[key].origin?.[0][0].split("/").pop(),
        }
      }
      return JSON.stringify(catalog, null, 2);
    }
  }
}