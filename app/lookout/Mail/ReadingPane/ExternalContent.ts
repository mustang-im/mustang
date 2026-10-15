export class ExternalContent {
  static hasExternalContent(html: string | null | undefined): boolean {
    if (!html) {
      return false;
    }
    const kExternalReference = /<(img|image|video|audio|source|input|link|iframe|object|embed)\b[^>]*\s(src|srcset|href|poster|data)\s*=\s*["']?\s*(https?:)?\/\/|\sbackground\s*=\s*["']?\s*(https?:)?\/\/|url\(\s*["']?\s*(https?:)?\/\//i;
    return kExternalReference.test(html);
  }
}
