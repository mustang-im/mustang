export const strings = [];

export function extractStrings() {
  return {
    name: "extract-strings",
    enforce: "post",
    closeBundle: () => {
      strings.forEach(s => console.log(s));
    }
  }
}

