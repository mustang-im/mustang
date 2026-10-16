export class TextWidth {
  protected readonly context: CanvasRenderingContext2D | null = document.createElement("canvas").getContext("2d");

  constructor(element: Element) {
    let style = getComputedStyle(element);
    if (this.context) {
      this.context.font = `${style.fontStyle} ${style.fontWeight} ${style.fontSize} ${style.fontFamily}`;
    }
  }

  of(text: string): number {
    return Math.ceil(this.context?.measureText(text).width ?? 0);
  }

  ofLongestWord(text: string): number {
    return Math.max(0, ...text.split(/\s+/).map(word => this.of(word)));
  }
}
