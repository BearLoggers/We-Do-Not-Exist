let windowSpace: WindowSpace;
function setup() {
    createCanvas(windowWidth, windowHeight);
    windowSpace = new WindowSpace();
    windowSpace.addWindow(100, 100, 500, 500, new TestHandler());
    windowSpace.addWindow(300, 300, 500, 500, new TestHandler());
    windowSpace.addWindow(900, 200, 500, 500, new TestHandler());

    window.addEventListener("keydown", keyDownHandler);
    window.addEventListener("keyup", keyUpHandler);
}

/** Прошлое состояние мыши - была ли она нажата кадром ранее? */
let pMouseIsPressed: boolean = false;
/** Прошлое состояние клавиатуры - было ли что-то нажато кадром ранее? */
let pKeyIsPressed: boolean = false;

/** Переменная, хранящая ID таймера для обработки удерживаемой клавиши */
let keyHeldTimer: number = null;
/** Можно ли вводить клавишу много раз, удерживая её? */
let keyCanBeSpammed: boolean = false;
/** Задержка до режими спама клавиши */
let keySpamDelay = 500;

/** Буфер нажатий на клавиши */
const keyBuffer: KeyboardEvent[] = [];

function draw() {
    background(0);

    /* Обработчики событий мыши (обязательно до вызова update) */
    if (mouseIsPressed && pMouseIsPressed)
        windowSpace.onMouseDrag();

    else if (mouseIsPressed && !pMouseIsPressed)
        windowSpace.onMousePress();

    else if (!mouseIsPressed && pMouseIsPressed)
        windowSpace.onMouseRelease();

    /* Обработчик клавиатуры */
    if (keyBuffer.length > 0) {
        for (let event of keyBuffer) windowSpace.receiveKeyEvent(event);
        keyBuffer.length = 0;
    }

    windowSpace.update();
    windowSpace.draw();

    pMouseIsPressed = mouseIsPressed;
    pKeyIsPressed = keyIsPressed;
}

// Для дебага
let noDefaultKeyBehavior = true;

function keyDownHandler(e: KeyboardEvent) {
    if (e.key == "F10") noDefaultKeyBehavior = !noDefaultKeyBehavior;

    keyBuffer.push(e);

    if (noDefaultKeyBehavior) e.preventDefault();
}

function keyUpHandler(e: KeyboardEvent) {
    clearTimeout(keyHeldTimer);
    keyCanBeSpammed = false;

    if (noDefaultKeyBehavior) e.preventDefault();
}

function windowResized() {
    resizeCanvas(windowWidth, windowHeight);
}