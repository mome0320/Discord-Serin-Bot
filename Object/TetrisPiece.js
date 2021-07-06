const shapeList = require("./shapeList.json");
class TetrisPiece {
  constructor(board) {
    this.x = 0;
    this.y = 0;
    this.shape = shapeList[Math.floor(Math.random() * shapeList.length)];
    this.board = board;
  }

  place() {
    this.shape.forEach((row, y) =>
      row.forEach((value, x) => {
        const PosY = this.y + y;
        const PosX = this.x + x;
        if (value > 0) {
          this.board.grid[PosY][PosX] = value;
        }
      })
    );
  }

  remove() {
    this.shape.forEach((row, dy) =>
      row.forEach((value, dx) => {
        const PosX = this.x + dx;
        const PosY = this.y + dy;
        if (value > 0) this.board.grid[PosY][PosX] = 0;
      })
    );
  }
  move({ dx = 0, dy = 0 }) {
    const xSuccess = this.moveX(dx);
    const ySuccess = this.moveY(dy);
    return xSuccess && ySuccess;
  }
  moveX(dx = 0, { vaildCheck = true } = {}) {
    this.x += dx;
    if (vaildCheck && !this.board.isVaild(this)) {
      this.x -= dx;
      return false;
    } else return true;
  }
  moveY(dy = 0, { vaildCheck = true } = {}) {
    this.y += dy;
    if (vaildCheck && !this.board.isVaild(this)) {
      this.y -= dy;
      return false;
    } else return true;
  }
  toJSON() {
    return { x: this.x, y: this.y, shape: this.shape };
  }
  setJSON(data) {
    this.x = data.x;
    this.y = data.y;
    this.shape = data.shape;
  }
}

module.exports = TetrisPiece;
