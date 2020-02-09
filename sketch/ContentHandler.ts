// TODO: Переход с HTML на Canvas

interface ContentHandler {
    /** Ссылка на Div (p5.Element), в котором хранится контент окна */
    content: p5.Element;

    /** Ссылка на родительский ConsolwWindow */
    parent: ConsoleWindow;

    /** Обновляет контент, конвертирует его в HTML, убеждается, что контент занимает место внутри окна */
    update(): void;

    /*
       Первичная инициализация контента и
       опциональное создание обработчика событий
       для клавиатуры производится в конструкторе
    */
}

interface TextContentHandler extends ContentHandler {
    /** Весь контент в текстовом варианте */
    textContent: string;
    /** Можно ли редактировать контент, находящийся до самой последней строки? */
    isPastEditable: boolean;
}

class TestHandler implements TextContentHandler {
    textContent = "I am a test content!";
    content = createP(this.textContent);
    isPastEditable: boolean = false;

    parent: ConsoleWindow = null;

    constructor() { }

    update() {
        this.content.position(this.parent.x + TP, this.parent.y + TP + TBH);
        this.content.size(this.parent.width - 2*TP, this.parent.height - 2*TP - TBH);
    }
}