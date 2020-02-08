const Edges = {
    TOP: 0,
    LEFT: 1,
    RIGHT: 2,
    BOTTOM: 3,
};

// EdgeGrabDistance - дистанция в пикселях, с которой можно начать "захват" на изменение размера окна
const EGD = 8;
// TopBarHeight - высота полоски статуса окна
const TBH = 30;
// ButtonSize - ширина и высота кнопок на полоске статуса
const BS = TBH;
// TextPadding - ширина и высота отступа текста от краёв окна
const TP = 10;

class ConsoleWindow {
    constructor(x, y, width, height, title, stroke) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;

        this.content = null;
        this.contentHandler = null;

        this.title = title || "Window";
        this.stroke = stroke || color(255, 255, 255);
    }

    draw() {
        stroke(this.stroke);
        strokeWeight(4);

        /*
                  (1)
                ------
            (2) |    | (3)
                ------
                  (4)
        */
        fill(0);
        rect(this.x, this.y, this.width, this.height);

        line(this.x, this.y, this.x + this.width, this.y);                              // (1)
        line(this.x, this.y, this.x, this.y + this.height);                             // (2)
        line(this.x + this.width, this.y, this.x + this.width, this.y + this.height);   // (3)
        line(this.x, this.y + this.height, this.x + this.width, this.y + this.height);  // (4)


        /*
            ____________________
            |    Title(2)    |x| (3)
            --------------------
                    (1)
        */

        line(this.x, this.y + TBH, this.x + this.width, this.y + TBH);  // (1)

        /* (2) */
        push();
        textSize(20);
        textAlign(CENTER, CENTER);
        fill(255);
        strokeWeight(3);
        stroke(10);
        text(this.title, this.x, this.y, this.width, TBH);
        pop();

        /* (3) */

        // Разделитель
        const endX = this.x + this.width;
        line(endX - BS, this.y, endX - BS, this.y + BS);
        // Крестик
        strokeWeight(1);
        line(endX - BS + 5, this.y + 5, endX - 5, this.y + BS - 5);     // Обратная черта
        line(endX - 5, this.y + 5, endX - BS + 5, this.y + BS - 5);     // Прямая черта

        /*
            --------------
            | some text  |
            | content    |
            --------------
        */

        /*push();
        textSize(15);
        fill(255);
        strokeWeight(2);
        stroke(10);
        text(this.content, this.x + TP, this.y + TP + TBH, this.width - 2*TP, this.height - 2*TP - TBH);
        pop();*/
    }

    mouseCheck(checkX, checkY) {
        const point = new Point(checkX, checkY);
        const rX = this.x, rY = this.y, w = this.width, h = this.height;

        // isInteractable - если можно менять размер окна или перемещать его
        let result = {isInteractable: false, onEdges: [], overCross: false, overInsides: false};
        // Взаимодействовать можно за верхнюю полоску (без кнопки закрытия)
        result.isInteractable = point.isInsideRect(rX, rY, w - BS, TBH);

        // Мышка на кресте
        result.overCross = point.isInsideRect(rX + w - BS, rY, BS, BS);

        // Мышь внутри рабочей части окна
        result.overInsides = point.isInsideRect(rX, rY + TBH, w, h - TBH);

        // Мышь в небольшой границе от краёв
        result.onEdges[Edges.TOP]    = point.isInsideRect(rX, rY - EGD, w, EGD);
        result.onEdges[Edges.LEFT]   = point.isInsideRect(rX - EGD, rY, EGD, h);
        result.onEdges[Edges.RIGHT]  = point.isInsideRect(rX + w, rY, EGD, h);
        result.onEdges[Edges.BOTTOM] = point.isInsideRect(rX, rY + h, w, EGD);

        // Если мы захватили хотя бы одну границу - это считается за isInteractable
        for (let edge in result.onEdges)
            result.isInteractable = result.isInteractable || result.onEdges[edge];

        return result;
    }

    init(contentHandler) {
        this.contentHandler = contentHandler;
        this.contentHandler.init(this);
        this.content = this.contentHandler.content;
    }

    updateContent() {
        this.contentHandler.update();
    }
}


// HELPER:
class Point {
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }

    isInsideRect(rectX, rectY, width, height) {
        return (this.x >= rectX  &&  this.y >= rectY  &&
                this.x <= (rectX + width) && this.y <= (rectY + height));
    }
}