class Point {
    x: number;
    y: number;

    constructor(x: number, y: number) {
        this.x = x;
        this.y = y;
    }

    isInsideRect(rectX: number, rectY: number, width: number, height: number) {
        return (this.x >= rectX  &&  this.y >= rectY  &&
                this.x <= (rectX + width) && this.y <= (rectY + height));
    }
}