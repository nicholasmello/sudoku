// Defining a Sodoku board
let board = {
	// Stores the state of the board
	state: [[],[],[],[],[],[],[],[],[]],

	// Variable for solver to use
	possibilities: [[],[],[],[],[],[],[],[],[]],

	// Counter for solving process
	solveCounter: [[],[],[],[],[],[],[],[],[]],

	// Displays as a table with 'X' so it looks better
	display: function() {
		displayCopy = this.copyof()
		for (var i = 9 - 1; i >= 0; i--) {
			for (var j = 9 - 1; j >= 0; j--) {
				if (displayCopy[i][j] === undefined) {
					displayCopy[i][j] = 'X';
				}
			}
		}
		console.table(displayCopy);
	},

	// Clears board to all spots as undefined
	clear: function() {
		for (var i = 9 - 1; i >= 0; i--) {
			for (var j = 9 - 1; j >= 0; j--) {
				board.state[i][j] = undefined;
			}
		}
	},

	// Checks if the board state is valid
	check: function(selectedBoardState) {
		if (selectedBoardState == undefined) {
			selectedBoardState = this.state;
		}

		// Horizontal Check
		for (var i = selectedBoardState.length - 1; i >= 0; i--) {
			valuesSoFar = [];
			for (var j = selectedBoardState[i].length - 1; j >= 0; j--) {
				if (selectedBoardState[i][j] !== undefined) {
					if (valuesSoFar.includes(selectedBoardState[i][j])) {
						return false;
					} 
					valuesSoFar.push(selectedBoardState[i][j]);
				}
			}
		}

		// Vertical Check
		for (var i = selectedBoardState.length - 1; i >= 0; i--) {
			valuesSoFar = [];
			for (var j = selectedBoardState[i].length - 1; j >= 0; j--) {
				if (selectedBoardState[j][i] !== undefined) {
					if (valuesSoFar.includes(selectedBoardState[j][i])) {
						return false;
					}
					valuesSoFar.push(selectedBoardState[j][i]);
				}
			}
		}

		// Defining the boxes for check
		boxCheckOffsetX = [0, 3, 6, 0, 3, 6, 0, 3, 6];
		boxCheckOffsetY = [0, 0, 0, 3, 3, 3, 6, 6, 6];
		for (var k = 8; k >= 0; k--) {
			boxCheck = [];
			for (var i = 2+boxCheckOffsetX[k]; i >= boxCheckOffsetX[k]; i--) {
				for (var j = 2+boxCheckOffsetY[k]; j >= boxCheckOffsetY[k]; j--) {
					if (selectedBoardState[i][j] !== undefined && boxCheck.includes(selectedBoardState[i][j])) {
						return false;
					}
					boxCheck.push(selectedBoardState[i][j])
				}
			}
		}
		return true;
	},

	// Solves the game
	solve: function() {
		// Make sure the given board is valid
		if (!this.check()) {
			return {
				error: true,
				message: 'Invalid board'
			}
		}

		// Already solved squares have 1 possiblity
		this.possibilities = this.copyof();

		// Loop through each square, skipping already solved squares
		for (var i = this.state.length - 1; i >= 0; i--) {
			for (var j = this.state[i].length - 1; j >= 0; j--) {
				if (this.state[i][j] == undefined) {
				// Check for possibilities on the row
				this.possibilities[i][j] = [];

				nonPossibilities = [];
				for (var L =  8; L >= 0; L--) {
					if (this.state[i][L] !== undefined && this.state[i][L] !== this.state[i][j]) {
						nonPossibilities.push(this.state[i][L]);
					}
				}
				for (var L =  8; L >= 0; L--) {
					if (!nonPossibilities.includes(L+1)) {
						this.possibilities[i][j].push(L+1);
					}
				}

					// Check for possibilities on the column
					//    Get column
					colPossibilities = [];
					for (var L = 8; L >= 0; L--) {
						colPossibilities.push(this.state[L][j]);
					}
					//    Pull non-possibilities from column
					nonPossibilities = [];
					for (var L =  8; L >= 0; L--) {
						if (colPossibilities[L] !== undefined && colPossibilities[L] !== this.state[i][j]) {
							nonPossibilities.push(colPossibilities[L]);
						}
					}
					//    Invert to get possibilities from column
					localPossibilities = []
					for (var L =  9; L >= 1; L--) {
						if (!nonPossibilities.includes(L)) {
							localPossibilities.push(L);
						}
					}
					//    Compare to current possibilities to eliminate options
					for (var L = 9; L >= 1; L--) {
						if (this.possibilities[i][j].includes(L) && !localPossibilities.includes(L)) {
							this.possibilities[i][j].splice(this.possibilities[i][j].indexOf(L),1);
						}
					}

					// Check for possibilities in the box
					//    Get box
					boxPossibilities = [];
					boxPossibilitiesOffset = [0, 0, 0, 3, 3, 3, 6, 6, 6];
					for (var L = 2+boxPossibilitiesOffset[i]; L >= boxPossibilitiesOffset[i]; L--) {
						for (var P = 2+boxPossibilitiesOffset[j]; P >= boxPossibilitiesOffset[j]; P--) {
							boxPossibilities.push(this.state[L][P]);
						}
					}
					//    Pull non-possibilities from box
					nonPossibilities = [];
					for (var L =  8; L >= 0; L--) {
						if (boxPossibilities[L] !== undefined && boxPossibilities[L] !== this.state[i][j]) {
							nonPossibilities.push(boxPossibilities[L]);
						}
					}
					//    Invert to get possibilities from box
					localPossibilities = []
					for (var L =  9; L >= 1; L--) {
						if (!nonPossibilities.includes(L)) {
							localPossibilities.push(L);
						}
					}
					//    Compare to current possibilities to eliminate options
					for (var L = 9; L >= 1; L--) {
						if (this.possibilities[i][j].includes(L) && !localPossibilities.includes(L)) {
							this.possibilities[i][j].splice(this.possibilities[i][j].indexOf(L),1);
						}
					}
					// Make sure undefined is not left in the beginning
					if (this.possibilities[i][j][0] === undefined) {
						this.possibilities[i][j].splice(0,1);
					}
				}
			}
		}

		// Check if any squares have only 1 possibility
		newboard = this.copyof();
		for (var i = this.state.length - 1; i >= 0; i--) {
			for (var j = this.state[i].length - 1; j >= 0; j--) {
				if (Array.isArray(this.possibilities[i][j]) && this.possibilities[i][j].length === 1) {
					newboard[i][j] = this.possibilities[i][j][0];
				}
			}
		}

		// Make sure it is a valid board before passing it through
		if (this.check(newboard)) {
			for (var i = 8; i >= 0; i--) {
				for (var j = 8; j >= 0; j--) {
					this.state[i][j] = newboard[i][j];
				}
			}
		}

		// Get unsolved X and Y and set solve counter
		undefX = [];
		undefY = [];
		for (var i = 8; i >= 0; i--) {
			for (var j = 8; j >= 0; j--) {
				if (this.state[i][j] == undefined) {
					undefX.push(i);
					undefY.push(j);
					this.solveCounter[i][j] = 0;
				}
			}
		}

		// Loop solving
		i = undefX.length - 1;
		while (i >= 0) {
			if (this.possibilities[undefX[i]][undefY[i]][this.solveCounter[undefX[i]][undefY[i]]] == undefined) {
				this.solveCounter[undefX[i]][undefY[i]] = 0;
				if (i < undefX.length - 1) {
					this.solveCounter[undefX[i+1]][undefY[i+1]]++;
				}
				i++;
			} else {
				newboard[undefX[i]][undefY[i]] = this.possibilities[undefX[i]][undefY[i]][this.solveCounter[undefX[i]][undefY[i]]];
				if (this.check(newboard)) {
					i--;
				} else {
					newboard[undefX[i]][undefY[i]] = undefined;
					this.solveCounter[undefX[i]][undefY[i]]++;
				}
			}
		}
		for (var i = 8; i >= 0; i--) {
			for (var j = 8; j >= 0; j--) {
				this.state[i][j] = newboard[i][j];
			}
		}
	},
	copyof: function() {
		copyboard = [[],[],[],[],[],[],[],[],[]];
		for (var i = 8; i >= 0; i--) {
			for (var j = 8; j >= 0; j--) {
				copyboard[i][j] = this.state[i][j];
			}
		}
		return copyboard;
	}
}

// Clear the board
board.clear();

// Adding in board from internet
presetboard1 = [[],[],[],[],[],[],[],[],[]];
presetboard1[0][0] = 5;
presetboard1[0][1] = 3;
presetboard1[0][4] = 7;
presetboard1[1][0] = 6;
presetboard1[1][3] = 1;
presetboard1[1][4] = 9;
presetboard1[1][5] = 5;
presetboard1[2][1] = 9;
presetboard1[2][2] = 8;
presetboard1[2][7] = 6;
presetboard1[3][0] = 8;
presetboard1[3][4] = 6;
presetboard1[3][8] = 3;
presetboard1[4][0] = 4;
presetboard1[4][3] = 8;
presetboard1[4][5] = 3;
presetboard1[4][8] = 1;
presetboard1[5][0] = 7;
presetboard1[5][4] = 2;
presetboard1[5][8] = 6;
presetboard1[6][1] = 6;
presetboard1[6][6] = 2;
presetboard1[6][7] = 8;
presetboard1[7][3] = 4;
presetboard1[7][4] = 1;
presetboard1[7][5] = 9;
presetboard1[7][8] = 5;
presetboard1[8][4] = 8;
presetboard1[8][7] = 7;
presetboard1[8][8] = 9;

// Another board from the internet
presetboard2 = [[],[],[],[],[],[],[],[],[]];
presetboard2[0][0] = 5;
presetboard2[0][1] = 3;
presetboard2[0][4] = 7;
presetboard2[1][0] = 6;
presetboard2[1][3] = 1;
presetboard2[1][4] = 9;
presetboard2[1][5] = 5;
presetboard2[2][1] = 9;
presetboard2[2][2] = 8;
presetboard2[2][7] = 6;
presetboard2[3][0] = 8;
presetboard2[3][4] = 6;
presetboard2[3][8] = 3;
presetboard2[4][0] = 4;
presetboard2[4][3] = 8;
presetboard2[4][5] = 3;
presetboard2[4][8] = 1;
presetboard2[5][0] = 7;
presetboard2[5][4] = 2;
presetboard2[5][8] = 6;
presetboard2[6][1] = 6;
presetboard2[6][6] = 2;
presetboard2[6][7] = 8;
presetboard2[7][3] = 4;
presetboard2[7][4] = 1;
presetboard2[7][5] = 9;
presetboard2[7][8] = 5;
presetboard2[8][4] = 8;
presetboard2[8][7] = 7;
presetboard2[8][8] = 9;

// Yet another board from the internet
presetboard3 = [[],[],[],[],[],[],[],[],[]];
presetboard3[0][0] = 5;
presetboard3[0][1] = 3;
presetboard3[0][2] = 9;
presetboard3[0][6] = 4;
presetboard3[1][0] = 7;
presetboard3[1][1] = 2;
presetboard3[1][2] = 8;
presetboard3[1][3] = 3;
presetboard3[1][5] = 4;
presetboard3[1][6] = 9;
presetboard3[2][0] = 6;
presetboard3[2][1] = 4;
presetboard3[2][2] = 1;
presetboard3[2][6] = 7;
presetboard3[2][7] = 3;
presetboard3[3][0] = 4;
presetboard3[3][1] = 6;
presetboard3[3][2] = 2;
presetboard3[3][3] = 5;
presetboard3[3][4] = 3;
presetboard3[3][5] = 9;
presetboard3[3][6] = 8;
presetboard3[3][7] = 7;
presetboard3[3][8] = 1;
presetboard3[4][0] = 3;
presetboard3[4][1] = 8;
presetboard3[4][2] = 5;
presetboard3[4][3] = 7;
presetboard3[4][4] = 2;
presetboard3[4][5] = 1;
presetboard3[4][6] = 6;
presetboard3[4][7] = 4;
presetboard3[4][8] = 9;
presetboard3[5][0] = 1;
presetboard3[5][1] = 9;
presetboard3[5][2] = 7;
presetboard3[5][3] = 4;
presetboard3[5][4] = 6;
presetboard3[5][5] = 8;
presetboard3[5][6] = 2;
presetboard3[5][7] = 5;
presetboard3[5][8] = 3;
presetboard3[6][0] = 2;
presetboard3[6][1] = 5;
presetboard3[6][2] = 6;
presetboard3[6][3] = 1;
presetboard3[6][4] = 8;
presetboard3[6][5] = 7;
presetboard3[6][6] = 3;
presetboard3[6][7] = 9;
presetboard3[6][8] = 4;
presetboard3[7][0] = 9;
presetboard3[7][1] = 1;
presetboard3[7][2] = 3;
presetboard3[7][4] = 4;
presetboard3[7][6] = 5;
presetboard3[7][7] = 8;
presetboard3[7][8] = 7;
presetboard3[8][0] = 8;
presetboard3[8][1] = 7;
presetboard3[8][2] = 4;
presetboard3[8][3] = 9;
presetboard3[8][4] = 5;
presetboard3[8][5] = 3;
presetboard3[8][6] = 1;
presetboard3[8][7] = 2;
presetboard3[8][8] = 6;



for (var i = 8; i >= 0; i--) {
	for (var j = 8; j >= 0; j--) {
		board.state[i][j] = presetboard3[i][j];
	}
}

board.display();

// Solving the board
board.solve();
board.display();