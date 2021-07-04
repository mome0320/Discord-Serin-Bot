const tetris = require("./Tetris");
const newGame = new tetris(19, 9);
setInterval(() => {
  newGame.queue.rotate = 1;
  newGame.queue.x = 1;
  newGame.update();
  console.table(newGame.viewGridHuman);
}, 500);
