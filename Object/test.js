const tetris = require("./Tetris");
const newGame = new tetris(19, 9);
console.table(newGame.viewGridHuman);
newGame.nowPiece.rotate();
console.table(newGame.viewGridHuman);
newGame.nowPiece.move({ dy: 0, dx: -1 });
console.table(newGame.viewGridHuman);
