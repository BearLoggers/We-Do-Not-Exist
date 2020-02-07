function setup() {
    createCanvas(800, 600);
    fill(255);
    noStroke();
}

function draw() {
    background(0);
    textAlign(CENTER, CENTER);
    textSize(30);
    text("Hello World!", width / 2, 100);
    circle(mouseX, mouseY, 50);
}