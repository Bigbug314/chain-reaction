// This will save the grid every time it is asked to do so, and will keep the last n grids saved. Then by calling the restore function, the grid can be restored to a previous state.
class GridSaver {
    constructor(n) {
        this.n = n;
        this.grids = [];
        this.turns = [];
        this.playerStates = [];
    }


    save(grid, turn, playerStates) {
        // If there are more than n grids saved, remove the oldest one
        if (this.grids.length >= this.n) {
            this.grids.shift();
            this.turns.shift();
            this.playerStates.shift();
        }
        // Save the grid (copy it)

        let newGrid = [];
        for (let i = 0; i < grid.length; i++) {
            newGrid[i] = [];
            for (let j = 0; j < grid[0].length; j++) {
                newGrid[i][j] = [grid[i][j][0], grid[i][j][1]];
            }
        }
        this.grids.push(newGrid);
        
        this.turns.push(turn);

        let newPlayerStates = [];
        for (let i = 0; i < playerStates.length; i++) {
            newPlayerStates.push(playerStates[i]);
        }
        this.playerStates.push(newPlayerStates);
    }

    restore() {
        // If there are no grids saved, return false
        if (this.grids.length == 0) {
            return undefined;
        }
        // Restore the grid
        let grid = this.grids.pop();
        let turn = this.turns.pop();
        let playerStates = this.playerStates.pop();
        return [grid, turn, playerStates];
    }
}