let windowSpace: WindowSpace;
function setup() {
    createCanvas(windowWidth, windowHeight);
    windowSpace = new WindowSpace();
    windowSpace.addWindow(100, 100, 500, 500, new TestHandler());
    windowSpace.addWindow(300, 300, 500, 500, new TestHandler());
}

function draw() {
    background(0);

    windowSpace.update();
    windowSpace.draw();
}

function mouseDragged() {
    windowSpace.onMouseDrag();
}

function mouseReleased() {
    windowSpace.mouseReleased();
}

function windowResized() {
    resizeCanvas(windowWidth, windowHeight);
}