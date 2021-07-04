const TetrisPiece = require("./TetrisPiece");
const { MessageEmbed } = require("discord.js");
class Tetris {
  constructor(row, column) {
    this.row = row;
    this.column = column;
    this.grid = this.initGrid();
    this.nowPiece = new TetrisPiece(this);
    this.queue = { x: 0, y: 0, rotate: 0 };
  }
  initGrid() {
    return Array.from({ length: this.row }, () => Array(this.column).fill(0));
  }

  get viewGridHuman() {
    return this.grid.map((row) =>
      row.map((value) => (value > 0 ? "🟦" : "⬜")).join("")
    );
  }

  render() {
    new MessageEmbed().setDescription(this.viewGridHuman.join("\n"));
  }

  resetQueue() {
    this.queue = { x: 0, y: 0, rotate: 0 };
  }

  isVaild(piece) {
    return piece.shape.every((row, dy) => {
      return row.every((value, dx) => {
        let x = piece.x + dx;
        let y = piece.y + dy;
        return (
          value === 0 || (this.isInsideWalls(x, y) && this.notOccupied(x, y))
        );
      });
    });
  }

  isInsideWalls(x, y) {
    const value = x >= 0 && x < this.column && y <= this.row;
    // console.log('isinsideWalls?',x,y,value);
    return value;
  }

  notOccupied(x, y) {
    const value = Boolean(this.grid[y] && this.grid[y][x] === 0);
    // console.log('notOccupied?',x,y,value);
    return value;
  }

  rotateShape(piece) {
    const shape = piece.shape;
    for (let y = 0; y < shape.length; ++y) {
      for (let x = 0; x < y; ++x) {
        [shape[x][y], shape[y][x]] = [shape[y][x], shape[x][y]];
      }
    }
    shape.forEach((row) => row.reverse());
    return shape;
  }

  // hard coding..
  update() {
    const lastShape = JSON.parse(JSON.stringify(this.nowPiece.shape.slice()));
    this.nowPiece.remove();
    while (this.queue.rotate > 0) {
      this.nowPiece.shape = this.rotateShape(this.nowPiece);
      this.queue.rotate--;
    }
    if (!this.isVaild(this.nowPiece)) this.nowPiece.shape = lastShape;

    this.nowPiece.move({ dx: this.queue.x, dy: this.queue.y });
    const newTetrisBlock = this.drop();
    this.nowPiece.place();
    if (newTetrisBlock) this.nowPiece = newTetrisBlock;
    this.resetQueue();
  }
  drop() {
    this.nowPiece.moveY(1, { vaildCheck: false });
    if (!this.isVaild(this.nowPiece)) {
      this.nowPiece.moveY(-1);
      console.log(this.nowPiece.y);
      return new TetrisPiece(this);
    }
  }
}
module.exports = Tetris;
