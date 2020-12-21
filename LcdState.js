class LcdState {
    constructor(color, invert, topFullText, bottomFullText) {
        this.color = color;
        this.invert = invert;
        this.topFullText = topFullText;
        this.bottomFullText = bottomFullText;
        this.scrollOffsetTop = 0;
        this.scrollOffsetBottom = 0;
    }

    get topSevenChars() {
        if(this.topFullText.length <= 7) return this.topFullText.padEnd(7);
        let topLinePadded = this.topFullText + '   ' + this.topFullText.substring(0, 7);
        return topLinePadded.substring(this.scrollOffsetTop, this.scrollOffsetTop + 7);
    }

    get bottomSevenChars() {
        if(this.bottomFullText.length <= 7) return this.bottomFullText.padEnd(7);
        let bottomLinePadded = this.bottomFullText + '   ' + this.bottomFullText.substring(0, 7);
        return bottomLinePadded.substring(this.scrollOffsetBottom, this.scrollOffsetBottom + 7);
    }

    // TODO: implement PAUSE_TICK
    advanceTop(forwards = true) {
        if(forwards) this.scrollOffsetTop = this.scrollOffsetTop == this.topFullText.length + 2 ? 0 : this.scrollOffsetTop + 1;
        if(!forwards) this.scrollOffsetTop = this.scrollOffsetTop == 0 ? this.topFullText.length + 2 : this.scrollOffsetTop - 1;
    }

    advanceBottom(forwards = true) {
        if(forwards) this.scrollOffsetBottom = this.scrollOffsetBottom == this.bottomFullText.length + 2 ? 0 : this.scrollOffsetBottom + 1;
        if(!forwards) this.scrollOffsetBottom = this.scrollOffsetBottom == 0 ? this.bottomFullText.length + 2 : this.scrollOffsetBottom - 1;
    }

    advance() {
        this.advanceTop();
        this.advanceBottom();
    }

}

module.exports = LcdState;