import prettyBytes from 'pretty-bytes';

export function fileSize(sizeInBytes: number) {
  return prettyBytes(sizeInBytes, {
    binary: true,
    locale: navigator.language,
    maximumFractionDigits: 0,
  })
    .replace("i", "");
}
