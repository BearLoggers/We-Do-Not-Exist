/**
 * Края окна
 */
enum Edges {
    TOP,
    LEFT,
    RIGHT,
    BOTTOM,
};

/** Показывает, где именно находятся данная точка относительно консольного окна
 *
 *
 * @field overTopBar: находится ли данная точка на верхей полоске
 *
 * @field onEdges: находится ли данная точка на краях какого-то Edge (ключ - enum Edges)
 *
 * @field overCross: находится ли данная точка на кресте
 *
 * @field overContent: находится ли данная точка на внутреннем контенте
 *
 * @field isInside: находится ли курсор в целом внутри + на окраинах
*/
interface CoordCheckResults {
    overTopBar: boolean,
    onEdges: boolean[],
    overCross: boolean,
    overContent: boolean,

    isInside: boolean
};

/** EdgeGrabDistance - дистанция в пикселях, с которой можно начать "захват" на изменение размера окна */
const EGD = 8;

/** TopBarHeight - высота полоски статуса окна */
const TBH = 30;

/**  ButtonSize - ширина и высота кнопок на полоске статуса */
const BS = TBH;

/** TextPadding - ширина и высота отступа текста от краёв окна */
const TP = 10;

class ConsoleWindow {
    x: number;
    y: number;
    width: number;
    height: number;

    stroke: p5.Color;
    title: string;

    /** Случаный ID, который выдается окну WindowSpace-м */
    id: number;

    contentHandler: ContentHandler = null;

    constructor(x: number, y: number, width: number, height: number, id: number, title?: string, stroke?: p5.Color) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;

        this.id = id;

        this.title = title || "Window";
        this.stroke = stroke || color(255, 255, 255);
    }

    draw(newStroke?: p5.Color): void {
        stroke(newStroke || this.stroke);
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
            |    Title(3)    |x| (2)
            --------------------
                    (1)
        */

        line(this.x, this.y + TBH, this.x + this.width, this.y + TBH);  // (1)

        /* (2) */

        // Разделитель
        const endX = this.x + this.width;
        line(endX - BS, this.y, endX - BS, this.y + BS);
        // Крестик
        strokeWeight(1);
        line(endX - BS + 5, this.y + 5, endX - 5, this.y + BS - 5);     // Обратная черта
        line(endX - 5, this.y + 5, endX - BS + 5, this.y + BS - 5);     // Прямая черта

        /* (3) */
        textSize(20);
        textAlign(CENTER, CENTER);
        fill(255);
        strokeWeight(3);
        stroke(10);
        text(this.title, this.x, this.y, this.width, TBH);

        /* Контент */
        this.contentHandler.draw();
    }

    attachContent(ch: ContentHandler) {
        this.contentHandler = ch;
        ch.parent = this;
    }

    updateContent() {
        if (this.contentHandler == null) throw new Error("Content wasn't attached to a window!");

        this.contentHandler.update();
    }

    destroy() {
        //this.contentHandler.content.remove();
        console.log(`Window#${this.id} was removed`);
    }

    /** Проверяет, где находится координата относительно окна */
    coordCheck(checkX: number, checkY: number): CoordCheckResults {
        const point = new Point(checkX, checkY);
        const rX = this.x, rY = this.y, w = this.width, h = this.height;

        let result: CoordCheckResults =
            {overTopBar: false, onEdges: [], overCross: false, overContent: false, isInside: false};
        // Взаимодействовать можно за верхнюю полоску (без кнопки закрытия)
        result.overTopBar = point.isInsideRect(rX, rY, w - BS, TBH);

        // Мышка на кресте
        result.overCross = point.isInsideRect(rX + w - BS, rY, BS, BS);

        // Мышь внутри рабочей части окна
        result.overContent = point.isInsideRect(rX, rY + TBH, w, h - TBH);

        // Мышь в небольшой границе от краёв
        result.onEdges[Edges.TOP]    = point.isInsideRect(rX, rY - EGD, w, EGD);
        result.onEdges[Edges.LEFT]   = point.isInsideRect(rX - EGD, rY, EGD, h);
        result.onEdges[Edges.RIGHT]  = point.isInsideRect(rX + w, rY, EGD, h);
        result.onEdges[Edges.BOTTOM] = point.isInsideRect(rX, rY + h, w, EGD);

        // Если мы хоть как-то можем взаимодействовать с окном - нужно поставить true в isInside
        result.isInside = result.overTopBar || result.overCross || result.overContent;
        for (let edge in result.onEdges)
            result.isInside = result.isInside || result.onEdges[edge];

        return result;
    }

    move(x: number, y: number) {
        this.x = x;
        this.y = y;
    }
    resize(w: number, h: number) {
        this.width = w;
        this.height = h;
    }
}