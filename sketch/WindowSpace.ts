enum Action {
    NONE,
    MOVE,
    RESIZE
};
/** Содержит набор переменных для указания мыши, что ей делать при пемещении */
class DragMode {
    /** Что делать при перемещении мыши с зажатой левой кнопкой? */
    action = Action.NONE;
    /** Отвечает за какую сторону будет происходить изменения размера окна */
    resizeEdge: Edges;
}

class WindowSpace {
    /** Указывает, если WindowSpace сейчас должно производить обновление или нет */
    isActive: boolean = true;
    /** Список всех окон в данном WindowSpace */
    private consoleWindows: ConsoleWindow[] = [];
    /** Добавляет новое окно с контентом и помещает его поверх других */
    addWindow(x: number, y: number, width: number, height: number, contentHandler: ContentHandler) {
        // Выбираем случайный ID для окна
        let id: number;
        do {
            id = Math.floor(Math.random() * 1000);
        } while (this.consoleWindows.find(x => x.id == id));

        // Инициализируем новое окно и добавляем ему необходимый контент
        let cw = new ConsoleWindow(x, y, width, height, id, `Window#${id}`);
        cw.attachContent(contentHandler);

        // Добавляем окно в начало массива
        this.consoleWindows.unshift(cw);
    }

    removeWindow(id: number) {
        let cw = this.consoleWindows.find(x => x.id == id);
        if (!cw) throw new Error("No window with such ID found!");

        cw.destroy();
        this.consoleWindows = this.consoleWindows.filter(x => x.id != id);
    }

    /** Ставит окно выше всех остальных */
    moveOnTop(cw: ConsoleWindow) {
        let index = this.consoleWindows.indexOf(cw);
        if (index == -1) throw new Error("Couldn't find such window inside consoleWindows array!");
        let temp = this.consoleWindows[index];

        this.consoleWindows.splice(index, 1);
        this.consoleWindows.unshift(temp);
    }

    /** Что делать при перетаскивании мыши в данный момент? */
    currentDragMode: DragMode = new DragMode();
    /** Выбранное окно для взаимодействия (перемещение + ресайз) */
    selectedWindow: ConsoleWindow = null;
    /** Окно, на котором произведён фокус контента */
    focusedWindow: ConsoleWindow = null;

    /** Указывает, если мышь сейчас перетаскивают с зажатой кнопкой мыши */
    isDragging: boolean = false;

    draw() {
        // Рисуем в обратном порядке (окна первее в массиве должны рисоваться выше)
        for (let i = this.consoleWindows.length - 1; i >= 0; i--) {
            const cw = this.consoleWindows[i];

            if (this.selectedWindow == cw)
                cw.draw(color(200, 100, 100));
            else if (this.focusedWindow == cw)
                cw.draw(color(100, 100, 200));
            else
                cw.draw();
        }
    }

    update() {
        if (this.isActive) {
            this.forceUpdateCursor("default");
            for (let i = 0; i < this.consoleWindows.length; i++) {
                const cw = this.consoleWindows[i];

                cw.updateContent();
                if (this.analyzeMouse(cw)) break;
            }
        }
    }

    currentCursor: string = "default";
    /**
     * Обновляет текущий курсор мыши ТОЛЬКО если до этого он был default-ным
     * @param newCursor новый курсор
     */
    safeUpdateCursor(newCursor: string) {
        if (this.currentCursor != "default") return;

        cursor(newCursor);
        this.currentCursor = newCursor;
    }

    /**
     * Обновляет текущий курсор мыши независимо от его предыдущего состояния
     * @param newCursor новый курсор
     */
    forceUpdateCursor(newCursor: string) {
        cursor(newCursor);
        this.currentCursor = newCursor;
    }

    prevMouseResult: boolean = false;
    /**
     * Анализирует позицию мыши на конкретном окне и возвращает true, если с ней можно
     * произвести какие-то взаимодействия.
     * Если мышь производит drag, то возвращается предыдущий результат
     * @param cw консольное окно внутри массива consoleWindows, которое нужно проверить
     */
    analyzeMouse(cw: ConsoleWindow): boolean {
        if (this.isDragging) return this.prevMouseResult;

        // Получаем новые
        let results: CoordCheckResults = cw.coordCheck(mouseX, mouseY);

        // Можно ли взаимодействовать с этим окном?
        //let canBeInteracted = false;

        // Проверка на нажатие и наводки на крест
        if (results.overCross) {
            this.safeUpdateCursor("pointer");

            if (mouseIsPressed) {
                this.removeWindow(cw.id);
                this.prevMouseResult = false;
                return false;
            }
        }

        // Проверка всех краёв
        for (let i: Edges = Edges.TOP; i <= Edges.BOTTOM; i++) {
            if (results.onEdges[i]) {
                // Мы на границе "i"

                if (i == Edges.LEFT || i == Edges.RIGHT) this.safeUpdateCursor("ew-resize");
                else this.safeUpdateCursor("ns-resize");

                if (mouseIsPressed) {
                    this.currentDragMode.action = Action.RESIZE;
                    this.currentDragMode.resizeEdge = i;
                    this.selectedWindow = cw;

                    //canBeInteracted = true;
                }
            }
        }

        // Проверка, если мышь находится на верхней полоске
        if (results.overTopBar) {
            this.safeUpdateCursor("default");
            if (mouseIsPressed) {
                this.currentDragMode.action = Action.MOVE;
                this.selectedWindow = cw;

                //canBeInteracted = true;

                // У последнего окна должен быть выше приоритет для дальнейшего захвата
                // Перемещаем его из своего место на первое
                this.moveOnTop(cw);
            }
        }
        // Если мышь не над верхней полоской и до этого мы не навели курсор на края - убираем selectedWindow
        else if (this.currentDragMode.action != Action.RESIZE) {
            this.selectedWindow = null;
        }

        // Проверка, если мышь находится внутри контента
        if (results.overContent) {
            this.safeUpdateCursor("text");
            if (mouseIsPressed) {
                this.focusedWindow = cw;
                //canBeInteracted = true;

                /*// У последнего окна должен быть выше приоритет для дальнейшего захвата
                // Перемещаем его из своего место на первое
                this.moveOnTop(cw);*/
            }
        }

        //this.prevMouseResult = canBeInteracted;
        //return canBeInteracted;

        this.prevMouseResult = results.isInside;
        return results.isInside;
    }

    onMousePress() { }

    onMouseDrag() {
        this.isDragging = true;

        let sW = this.selectedWindow;

        if (sW) {
            // this.isDraggingWindow = true;

            const dX = (mouseX - pmouseX), dY = (mouseY - pmouseY);
            if (this.currentDragMode.action == Action.MOVE) {
                sW.move(sW.x + dX, sW.y + dY);
            }
            else if (this.currentDragMode.action == Action.RESIZE) {
                if (this.currentDragMode.resizeEdge == Edges.TOP) {
                    sW.height -= dY;
                    sW.y += dY;
                }
                if (this.currentDragMode.resizeEdge == Edges.BOTTOM)
                    sW.height += dY;

                if (this.currentDragMode.resizeEdge ==Edges.LEFT) {
                    sW.width -= dX;
                    sW.x += dX;
                }
                if (this.currentDragMode.resizeEdge == Edges.RIGHT)
                    sW.width += dX;

                // Убеждаемся, что параметры окна в норме
                // (Не даём ширине и высоте уменьшиться дальше ста пикселей)
                if (sW.width < TBH + 100) sW.width = TBH + 100;
                if (sW.height < TBH + 100) sW.height = TBH + 100;
                if (sW.x < 0) sW.x = 0;
                if (sW.y < 0) sW.y = 0;
            }
        }
    }

    onMouseRelease() {
        // Сбрасываем все предыдущие результаты из AnalyzeMouse
        this.forceUpdateCursor("default");
        this.currentDragMode.action = Action.NONE;
        this.selectedWindow = null;

        this.isDragging = false;
    }

}