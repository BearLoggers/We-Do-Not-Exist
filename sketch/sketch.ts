let windowSpace: WindowSpace;
function setup() {
    createCanvas(windowWidth, windowHeight);
    windowSpace = new WindowSpace();
    windowSpace.addWindow(100, 100, 500, 500, new TestHandler());
    windowSpace.addWindow(300, 300, 500, 500, new TestHandler());
    windowSpace.addWindow(900, 200, 500, 500, new TestHandler());
}

/** Прошлое состояние мыши - была ли она нажата кадром ранее? */
let pMouseIsPressed: boolean = false;

function draw() {
    background(0);

    /* Обработчики событий мыши (обязательно до вызова update) */
    if (mouseIsPressed && pMouseIsPressed)
        windowSpace.onMouseDrag();

    else if (mouseIsPressed && !pMouseIsPressed)
        windowSpace.onMousePress();

    else if (!mouseIsPressed && pMouseIsPressed)
        windowSpace.onMouseRelease();


    windowSpace.update();
    windowSpace.draw();

    pMouseIsPressed = mouseIsPressed;
}

function windowResized() {
    resizeCanvas(windowWidth, windowHeight);
}