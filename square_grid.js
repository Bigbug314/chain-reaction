const STROKE_COLORS = [[128, 0, 0], [0, 128, 0], [0, 0, 128], [128, 128, 0], [128, 0, 128], [0, 128, 128], [128, 64, 0], [128, 128, 128]];
const COLORS = [[255, 0, 0], [0, 255, 0], [0, 0, 255], [255, 255, 0], [255, 0, 255], [0, 255, 255], [255, 128, 0], [255, 255, 255]];

const PLAYER_NAMES = ["Red", "Green", "Blue", "Yellow", "Magenta", "Cyan", "Orange", "White"];

const CIRCLE_RADIUS = 0.4;
const CIRLCE_DISTANCE = 0.15;

// 1 or 2 depending on screen size
const STROKE_WEIGHT = 2;

const ANIMATION_DURATION = 20;


class SquareGrid {
    constructor(cellWidth, cellHeight, width, height, nplayers) {
        this.cellWidth = cellWidth;
        this.cellHeight = cellHeight;
        this.width = width;
        this.height = height;
        this.grid = [];
        this.initGrid();
        this.timer = 0;

        this.nplayers = nplayers;
        this.turn = 0;
        this.playerStates = [];
        for (let i = 0; i < nplayers; i++) {
            this.playerStates[i] = true;
        }

        this.needToSpreadList = [];

        this.winMenuActive = false;
        this.revertAllActive = false;


        // Saver
        this.saver = new GridSaver(1000);

        // Save the empty grid
        this.saver.save(this.grid, this.turn, this.playerStates);
    }

    initGrid() {
        for (let i = 0; i < this.height; i++) {
            this.grid[i] = [];
            for (let j = 0; j < this.width; j++) {
                this.grid[i][j] = [0, 0];
            }
        }
    }


    draw(xOffset, yOffset) {
        push();
        translate(xOffset, yOffset);
        // Draw grid
        stroke([STROKE_COLORS[this.turn][0] * 0.7, STROKE_COLORS[this.turn][1] * 0.7, STROKE_COLORS[this.turn][2] * 0.7]);
        strokeWeight(STROKE_WEIGHT);
        for (let i = 0; i < this.height+1; i++) {
            line(0, i * this.cellHeight, this.width * this.cellWidth, i * this.cellHeight);
        }
        for (let j = 0; j < this.width+1; j++) {
            line(j * this.cellWidth, 0, j * this.cellWidth, this.height * this.cellHeight);
        }



        // Draw cells
        for (let i = 0; i < this.height; i++) {
            for (let j = 0; j < this.width; j++) {
                fill(COLORS[this.grid[i][j][0]]);
                stroke(STROKE_COLORS[this.grid[i][j][0]]);
                strokeWeight(STROKE_WEIGHT * 2);
                
                
                

                // If the cell is in the needToSpreadList, draw it with an animation
                let animated = false;
                for (let k = 0; k < this.needToSpreadList.length; k++) {
                    if (this.needToSpreadList[k][0] == i && this.needToSpreadList[k][1] == j) {
                        this.animate(i, j);
                        animated = true;
                        break;
                    }
                }

                if (animated) continue;

                // If there is no round pass
                if (this.grid[i][j][1] == 0) continue;

                // If there only one round
                if (this.grid[i][j][1] == 1) {
                    circle(j * this.cellWidth + this.cellWidth * 0.5, i * this.cellHeight + this.cellHeight * 0.5, this.cellWidth * CIRCLE_RADIUS);
                }
                else {
                    // If there are more than one, draw them around the center
                    for (let k = 0; k < this.grid[i][j][1]; k++) {
                        let alpha = (2 * PI) / this.grid[i][j][1] * k;
                        alpha += this.xorShift32(i + j) % (2 * PI);
                        alpha += (this.timer * 0.015) * this.grid[i][j][1] * (this.xorShift32(i + j) % 2 == 0 ? 1 : -1);

                        circle((j * this.cellWidth) + (this.cellWidth * 0.5) + (Math.cos(alpha) * CIRLCE_DISTANCE * this.cellWidth), (i * this.cellHeight) + (this.cellHeight * 0.5) + (Math.sin(alpha) * CIRLCE_DISTANCE * this.cellHeight), this.cellWidth * CIRCLE_RADIUS);
                    }
                }
            }
        }

        // Draw win menu
        if (this.winMenuActive) {
            let width = this.width * this.cellWidth;
            fill(30);
            stroke(STROKE_COLORS[this.turn]);
            strokeWeight(STROKE_WEIGHT * 10);
            rect(width*0.35, height*0.25, width*0.3, height*0.3);

            fill(COLORS[this.turn]);
            strokeWeight(STROKE_WEIGHT * 2);
            textSize(32);
            textAlign(CENTER, CENTER);
            text(PLAYER_NAMES[this.turn] + " player won!", width / 2, height * 0.35);

            // Draw OK button
            fill(0, 0, 0, 0);
            strokeWeight(STROKE_WEIGHT * 2);
            circle(width*0.45, height*0.47, width*0.05);
            fill(COLORS[this.turn]);
            strokeWeight(STROKE_WEIGHT * 2);
            textSize(32);
            textAlign(CENTER, CENTER);
            text("OK", width*0.45, height * 0.47);

            // Draw revertAll button (RA)
            fill(0, 0, 0, 0);
            strokeWeight(STROKE_WEIGHT * 2);
            circle(width*0.55, height*0.47, width*0.05);
            fill(COLORS[this.turn]);
            strokeWeight(STROKE_WEIGHT * 2);
            textSize(32);
            textAlign(CENTER, CENTER);
            text("RA", width*0.55, height * 0.47);
        }

        translate(-xOffset, -yOffset);
        pop();
    }
        

    update() {
        // Increment timer
        this.timer++;
        if (this.revertAllActive) {
            if (this.timer % 10 == 0) {
                let restored = this.restore();
                // If there are no more grids to restore, stop reverting
                if (restored == false) {
                    restart();
                }
            }
            return;
        }
        
        if (this.needToSpreadList.length > 0 && this.timer % ANIMATION_DURATION == 0) {
            // Spread (move needToSPreadList to tmp list)
            let tmpList = [];
            for (let i = 0; i < this.needToSpreadList.length; i++) {
                tmpList[i] = [this.needToSpreadList[i][0], this.needToSpreadList[i][1]];
            }
            this.needToSpreadList = [];

            // Spread
            for (let i = 0; i < tmpList.length; i++) {
                this.spread(tmpList[i][0], tmpList[i][1]);
            }


            // If ther aren't any more cells to spread, next turn
            if (this.needToSpreadList.length == 0) {
                this.nextTurn();
            }


            // Check if a player is dead
            for (let i = 0; i < this.nplayers; i++) {
                let playerAlive = false;
                for (let j = 0; j < this.height; j++) {
                    for (let k = 0; k < this.width; k++) {
                        if (this.grid[j][k][0] == i && this.grid[j][k][1] > 0) {
                            playerAlive = true;
                            break;
                        }
                    }
                }
                if (!playerAlive) this.playerStates[i] = false;
            }
            // If it's the turn of a dead player, skip it
            if (!this.playerStates[this.turn]) this.nextTurn();

            // If there is only one player left, end the game
            let alivePlayers = 0;
            for (let i = 0; i < this.nplayers; i++) {
                if (this.playerStates[i]) alivePlayers++;
            }
            if (alivePlayers == 1 && !this.gameEnded) {
                // End game
                this.winMenuActive = true;
            }
        }
    }


    animate(i, j) {
        let neighbors = this.getNeighbors(i, j);

        // For all neighbors, draw a round timer/ANIMATION_DURATION of the way to the neighbor
        for (let neigh of neighbors) {
            let x = (j * this.cellWidth) + (this.cellWidth * 0.5) + ((neigh[1] - j) * this.cellWidth * ((this.timer%ANIMATION_DURATION) / ANIMATION_DURATION));
            let y = (i * this.cellHeight) + (this.cellHeight * 0.5) + ((neigh[0] - i) * this.cellHeight * ((this.timer%ANIMATION_DURATION) / ANIMATION_DURATION));

            circle(x, y, this.cellWidth * CIRCLE_RADIUS)
        }
    }


    click(x, y) {
        // If win menu is active, check if the player clicked on the OK button
        if (this.winMenuActive) {
            let width = this.width * this.cellWidth;
            if (dist(x, y, width*0.45, height*0.47) < width*0.025) {
                restart();
            }
            if (dist(x, y, width*0.55, height*0.47) < width*0.025) {
                this.winMenuActive = false;
                this.revertAllActive = true;
            }
            return;
        }
        // If spread is in progress, do nothing
        if (this.needToSpreadList.length > 0) return;

        let i = floor(y / this.cellHeight);
        let j = floor(x / this.cellWidth);

        if (this.grid[i][j][0] == this.turn) {
            this.grid[i][j][1] = this.grid[i][j][1] + 1;

            if (this.needToSpread(i, j)) {
                this.needToSpreadList.push([i, j]);
                this.timer = 0;
            }
            else {
                this.nextTurn();
            }
        }
        else if (this.grid[i][j][1] == 0) {
            this.grid[i][j][0] = this.turn;
            this.grid[i][j][1] = 1;
            this.nextTurn();
        }
    
    }

    nextTurn() {
        this.turn = (this.turn + 1) % this.nplayers;
        if (!this.playerStates[this.turn]) this.nextTurn();
        // Save the grid
        this.saver.save(this.grid, this.turn, this.playerStates);
    }


    needToSpread(i, j) {
        // If the amount of rounds is greater or equal to the amount of neighbors, spread
        if (this.grid[i][j][1] >= this.getNeighbors(i, j).length) return true;

        return false;
    }


    getNeighbors(i, j) {
        let neighbors = [];
        if (i > 0) neighbors.push([i - 1, j]);
        if (i < this.height - 1) neighbors.push([i + 1, j]);
        if (j > 0) neighbors.push([i, j - 1]);
        if (j < this.width - 1) neighbors.push([i, j + 1]);
        return neighbors;
    }


    spread(i, j) {
        // Spread to all possible sides
        let neighbors = this.getNeighbors(i, j);

        for (let k = 0; k < neighbors.length; k++) {
            let i2 = neighbors[k][0];
            let j2 = neighbors[k][1];

            this.grid[i2][j2][0] = this.grid[i][j][0];
            this.grid[i2][j2][1] += 1;
            // Add to needToSpreadList if needed and if not already in the list
            if (this.needToSpread(i2, j2)) {
                let alreadyInList = false;
                for (let l = 0; l < this.needToSpreadList.length; l++) {
                    if (this.needToSpreadList[l][0] == i2 && this.needToSpreadList[l][1] == j2) {
                        alreadyInList = true;
                        break;
                    }
                }
                if (!alreadyInList) this.needToSpreadList.push([i2, j2]);
            }
        }

        this.grid[i][j][1] = this.grid[i][j][1] - neighbors.length;
    }
    

    restore() {
        // Remove the last saved grid (the current one)
        this.saver.restore();

        let restored = this.saver.restore();
        if (restored == undefined) return false;

        // Copy the restored grid
        this.grid = [];
        for (let i = 0; i < restored[0].length; i++) {
            this.grid[i] = [];
            for (let j = 0; j < restored[0][0].length; j++) {
                this.grid[i][j] = [restored[0][i][j][0], restored[0][i][j][1]];
            }
        }

        this.turn = restored[1];

        // Copy the restored player states
        for (let i = 0; i < restored[2].length; i++) {
            this.playerStates[i] = restored[2][i];
        }

        // Save
        this.saver.save(this.grid, this.turn, this.playerStates);

        this.gameEnded = false;

        return true;
    }


    xorShift32(seed) {
        let x = seed;
        x ^= x << 13;
        x ^= x >> 17;
        x ^= x << 5;
        return x;
    }
}