/*function swap(arr, ind1, ind2) {
    let t = arr[ind1];
    arr[ind1] = arr[ind2];
    arr[ind2] = t;
}*/

let consoleFont, titleFont, narratorFont;
function preload() {
    consoleFont = titleFont = narratorFont = loadFont('fonts/Inconsolata/Inconsolata-Regular.ttf');
}

const consoleWindows = [];
function setup() {
    createCanvas(windowWidth, windowHeight);
    let cW = new ConsoleWindow(width / 2 - 250, 300, 400, 300, "Test Window");
    cW.init(new BlinkingTerminal());
    consoleWindows.push(cW);
}

const DragMode = {
    MOVE: 0,
    RESIZE: 1
};
let dragging = {mode: DragMode.MOVE, onEdges: []};
let grabbedWindow = null;
let selectedWindow = null;
function draw() {
    background(0);
    cursor('default');

    let atLeastOneEdgeFound = false;
    let atLeastOneSelected = false;
    for (let i = 0; i < consoleWindows.length; i++) {
        const cw = consoleWindows[i];
        cw.updateContent();
        // Анализируем, где находится мышь (на краях/внутри/снаружи)
        if (grabbedWindow == null) {
            let result = cw.mouseCheck(mouseX, mouseY);

            // Сначада проверка на края
            for (let edge in result.onEdges) {
                if (result.onEdges[edge] == true) {
                    // Есть нахождение на границе edge.
                    if (edge == Edges.LEFT || edge == Edges.RIGHT) cursor('ew-resize');
                    else cursor('ns-resize');

                    atLeastOneEdgeFound = true;
                    dragging.mode  = DragMode.RESIZE;
                    dragging.edges = result.onEdges;
                }
            }

            if (result.overCross && mouseIsPressed) {
                cw.stroke = color(100, 200, 100);
            }

            if (result.overInsides) {
                cursor('text');
                if (mouseIsPressed && !atLeastOneSelected) {
                    if (selectedWindow != null)
                        selectedWindow.stroke = color(255);

                    selectedWindow = cw;
                    cw.stroke = color(100, 100, 200);
                    atLeastOneSelected = true;
                }
            }

            if (result.isInteractable && mouseIsPressed) {
                // У последнего окна должен быть выше приоритет для дальнейшего захвата
                // Перемещаем его из своего место на первое, всё остальное сдвигаем
                let temp = consoleWindows[i];
                consoleWindows.splice(i, 1);
                consoleWindows.unshift(temp);

                grabbedWindow = cw;
                cw.stroke = color(200, 100, 100);
            }
        }
    }

    if (!atLeastOneEdgeFound && !grabbedWindow) {
        dragging.mode = DragMode.MOVE;
    }

    if (!atLeastOneSelected && mouseIsPressed) {
        if (selectedWindow)
            selectedWindow.stroke = color(255);
        selectedWindow = null;
    }

    // if ((!atLeastOneEdgeFound && !grabbedWindow)) cursor('default');

    // Рисуем в обратном порядке (окна первее в массиве должны рисоваться выше)
    for (let i = consoleWindows.length - 1; i >= 0; i--)
        consoleWindows[i].draw();
}

function windowResized() {
    const pWidth = width, pHeight = height;
    resizeCanvas(windowWidth, windowHeight);

    const xRatio = width / pWidth;
    const yRatio = height / pHeight;
    for (const cw of consoleWindows) {
        cw.x *= xRatio;
        cw.y *= yRatio;

        cw.width *= xRatio;
        cw.height *= yRatio;
    }
}

function mouseDragged() {
    const gW = grabbedWindow;

    if (gW) {
        const dX = (mouseX - pmouseX), dY = (mouseY - pmouseY);
        if (dragging.mode == DragMode.MOVE) {
            gW.x += dX;
            gW.y += dY;
        }
        else {
            if (dragging.edges[Edges.TOP]) {
                gW.height -= dY;
                gW.y += dY;
            }
            if (dragging.edges[Edges.BOTTOM])
                gW.height += dY;

            if (dragging.edges[Edges.LEFT]) {
                gW.width -= dX;
                gW.x += dX;
            }
            if (dragging.edges[Edges.RIGHT])
                gW.width += dX;

            // Убеждаемся, что параметры окна в норме
            if (gW.width < TBH + 20) gW.width = TBH + 20;
            if (gW.height < TBH + 20) gW.height = TBH + 20;
            if (gW.x < 0) gW.x = 0;
            if (gW.y < 0) gW.y = 0;
        }
    }
}

function mouseReleased() {
    if (grabbedWindow != null) {
        grabbedWindow.stroke = color(255);
        grabbedWindow = null;
    }
}

function keyTyped() {
    let char;
    if (selectedWindow) {
        /* Key - строка; a, b, c, Enter, Shift... */

        // Если это не обычные клавиши или Enter/Backspace - игнорируем
        if (key.length > 0 && key != 'Enter' && key != 'Backspace') return;

        if (key == 'Enter') char = '\n';
        else char = key;

        if (key != 'Backspace') selectedWindow.content += char;
        else selectedWindow.content =
            selectedWindow.content.substr(0, selectedWindow.content.length - 1);
    }
}