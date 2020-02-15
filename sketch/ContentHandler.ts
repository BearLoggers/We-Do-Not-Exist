interface ContentHandler {
    /** Строка, в котором находится контент окна */
    content: string;
    /** Можно ли редактировать контент, находящийся до самой последней строки? */
    isPastEditable: boolean;

    /** Ссылка на родительский ConsoleWindow */
    parent: ConsoleWindow;

    /** Получить нажатие на клавишу, отправленное от WindowSpace */
    receiveKeyEvent(event: KeyboardEvent): void;

    /** Обновляет контент */
    update(): void;

    /** Отрисовка контента */
    draw(): void;

    /*
       Первичная инициализация контента
       производится в конструкторе
    */
}

/**
 * Извлекает из переданной клавиши текст для ввода
 * (например Enter = '\n')
 * @param keyStroke название клавиши, которое нужно преобразовать
 * @param withBackspace если передано true, то при вводе Backspace будет вернут "Backspace"
 */
function getTypeable(keyStroke: string, withBackspace = false) {
    // Специальные клавиши
    if (keyStroke.length > 1) {
        switch (keyStroke) {
            case "Enter":
                return '\n';

            case "Tab":
                return '\t';

            case "Backspace":
                return withBackspace ? "Backspace" : "";

            default:
                return '';
        }
    }
    // Обычные клавиши
    else {
        return keyStroke;
    }
}

/**
 * Возвращает спец клавиши, если они были введены, иначе пустую строку
 * @param keyStroke название клавиши, которое нужно преобразовать
 */
function getSpecialKeys(keyStroke: string) {
    // Специальные клавиши
    if (keyStroke.length > 1) {
        return keyStroke;
    }
    // Обычные клавиши
    else {
        return '';
    }
}

class TestHandler implements ContentHandler {
    content = "I am a test content! Hello World!";
    speed = 0.3;
    isPastEditable = false;

    parent: ConsoleWindow = null;

    startColor: p5.Color;
    endColor: p5.Color;
    lerpValue: number = 0;
    colorGoingUp: boolean = true;

    constructor() {
        this.startColor = color(255, 0, 0);
        this.endColor = color(0, 255, 0);
    }

    backspaceContent() {
        this.content = this.content.substr(0, this.content.length - 1);
    }

    receiveKeyEvent(event: KeyboardEvent) {
        console.log(`Window#${this.parent.id}'s TestContent got`, event);

        if (event.ctrlKey && event.altKey && event.key == "PageUp") {
            this.parent.deleteFlag = true;
        }
        else if (event.key == "ArrowUp") {
            this.speed += 0.1;
        }
        else if (event.key == "ArrowDown") {
            this.speed -= 0.1;
        }

        let typeable = getTypeable(event.key, true);
        if (typeable == "Backspace") this.backspaceContent();
        else this.content += typeable;
    }

    update() {
        this.speed = constrain(this.speed, 0, 100);

        if (this.colorGoingUp) {
            this.lerpValue += 0.01 * this.speed;
            if (this.lerpValue >= 1) this.colorGoingUp = false;
        }
        else {
            this.lerpValue -= 0.01 * this.speed;
            if (this.lerpValue <= 0) this.colorGoingUp = true;
        }
    }

    draw() {
        let { x, y, width, height } = this.parent;
        fill(lerpColor(this.startColor, this.endColor, this.lerpValue));
        text(this.content + `\nSpeed: ${this.speed}`, x, y, width, height);
    }
}