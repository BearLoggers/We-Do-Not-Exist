interface ContentHandler {
    /** Строка, в котором находится контент окна */
    content: string;
    /** Можно ли редактировать контент, находящийся до самой последней строки? */
    isPastEditable: boolean;

    /** Ссылка на родительский ConsoleWindow */
    parent: ConsoleWindow;

    /** Обновляет контент */
    update(): void;

    /** Отрисовка контента */
    draw(): void;

    /*
       Первичная инициализация контента и
       опциональное создание обработчика событий
       для клавиатуры производится в конструкторе
    */
}

class TestHandler implements ContentHandler {
    content = "I am a test content!";
    isPastEditable = false;

    parent: ConsoleWindow = null;

    constructor() { }

    update() { }

    draw() {
        let { x, y, width, height } = this.parent;
        fill(255);
        text(this.content, x, y, width, height);
    }
}