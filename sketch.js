const GRID_WIDTH = 18;
const GRID_HEIGHT = 12;

const SIZE_RATIO = 0.95;


let grid;

let topBarHeight;

let inMenu = true;

let realWidth;

function setup() {
    topBarHeight = windowHeight * 0.07;
    createCanvas(windowWidth * SIZE_RATIO, windowHeight * SIZE_RATIO);

    realWidth = ((windowHeight * SIZE_RATIO) * 1.5);

    grid = new SquareGrid(realWidth / GRID_WIDTH, (height-topBarHeight) / GRID_HEIGHT, GRID_WIDTH, GRID_HEIGHT, 2);
}


function draw() {
    if (inMenu) {
        drawMenu();
        return;
    }


    background(0);
    grid.draw((width - realWidth) / 2, topBarHeight);
    
    // Draw top bar
    fill(50);
    rect((width - realWidth) / 2, 0, realWidth, topBarHeight);

    // Draw number of players
    fill(255);
    textSize(30);
    strokeWeight(0);
    textAlign(CENTER, CENTER);
    text(grid.nplayers + " Players", realWidth / 2 + (width - realWidth) / 2, topBarHeight / 2);

    // Draw add player button
    fill(50);
    stroke(255);
    strokeWeight(5);
    rect(realWidth - topBarHeight*0.8 + (width - realWidth) / 2, topBarHeight * 0.2, topBarHeight * 0.6, topBarHeight * 0.6);
    fill(255);
    textSize(30);
    strokeWeight(0);
    textAlign(CENTER, CENTER);
    text("+", realWidth - topBarHeight*0.5 + (width - realWidth) / 2, topBarHeight * 0.52);

    // Draw back button (if there is a previous grid)
    fill(50);
    stroke(255);
    strokeWeight(5);
    rect(topBarHeight*0.2 + (width - realWidth) / 2, topBarHeight * 0.2, topBarHeight * 0.6, topBarHeight * 0.6);
    fill(255);
    textSize(30);
    strokeWeight(0);
    textAlign(CENTER, CENTER);
    text("<", topBarHeight*0.5 + (width - realWidth) / 2, topBarHeight * 0.52);
    



    // Update
    grid.update();
}

function drawMenu() {
    background(0);
    fill(255);
    textSize(50);
    strokeWeight(0);
    textAlign(CENTER, CENTER);
    text("Press any key to start", width / 2, height / 2);
}


function mousePressed() {
    if (inMenu) {
        inMenu = false;
        return;
    }
    // Check if mouse is in grid
    if (mouseX > (width - realWidth) / 2 && mouseX < width - (width - realWidth) / 2 && mouseY > 100 && mouseY < height) {
        grid.click(mouseX - (width - realWidth) / 2, mouseY - topBarHeight);
    }
    else {
        // If the mouse is on the add player button, add a player
        if (mouseX > realWidth - topBarHeight*0.8 + (width - realWidth) / 2 && mouseX < realWidth - topBarHeight*0.2 + (width - realWidth) / 2 && mouseY > topBarHeight * 0.2 && mouseY < topBarHeight * 0.8) {
            if (grid.nplayers < 8) {
                grid.nplayers++;
                // Add a new player to playerStates list
                grid.playerStates.push(true);
            }
        }

        // If the mouse is on the back button, restore the previous grid
        if (mouseX > topBarHeight*0.2 + (width - realWidth) / 2 && mouseX < topBarHeight*0.8 + (width - realWidth) / 2 && mouseY > topBarHeight * 0.2 && mouseY < topBarHeight * 0.8) {
            grid.restore();
        }
    }
}

function restart() {
    grid = new SquareGrid(realWidth / GRID_WIDTH, (height-topBarHeight) / GRID_HEIGHT, GRID_WIDTH, GRID_HEIGHT, 2);
    inMenu = true;
}