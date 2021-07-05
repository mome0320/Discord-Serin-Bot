const TetrisPiece = require("./TetrisPiece");
const { MessageEmbed } = require("discord.js");
class Tetris {
  constructor(row, column) {
    this.row = row;
    this.column = column;
    this.grid = this.initGrid();
    this.nowPiece = null;
    this.queue = { x: 0, y: 0, rotate: 0 };
    this.message = null;
    this.isEnd = true;
  }
  initGrid() {
    return Array.from({ length: this.row }, () => Array(this.column).fill(0));
  }

  get viewGridHuman() {
    return this.grid.map((row) =>
      row.map((value) => (value > 0 ? "🟦" : "⬛")).join("")
    );
  }

  render() {
    const embed = new MessageEmbed()
      .setDescription(this.viewGridHuman.join("\n"))
      .setColor("#2f3136");
    if (this.isEnd) embed.setTitle("GAME OVER");
    return embed;
  }

  resetQueue() {
    this.queue = { x: 0, y: 0, rotate: 0 };
  }

  clearLines() {
    this.grid.forEach((line, y) => {
      if (line.every((value) => value > 0)) {
        this.grid.splice(y, 1);
        this.grid.unshift(Array(this.column).fill(0));
      }
    });
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
    return value;
  }

  notOccupied(x, y) {
    const value = Boolean(this.grid[y] && this.grid[y][x] === 0);
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
    if (!this.nowPiece || this.isEnd) return this.resetQueue();
    const lastShape = JSON.parse(JSON.stringify(this.nowPiece.shape.slice()));
    this.nowPiece.remove();
    this.clearLines();
    while (this.queue.rotate > 0) {
      this.nowPiece.shape = this.rotateShape(this.nowPiece);
      this.queue.rotate--;
    }
    if (!this.isVaild(this.nowPiece)) this.nowPiece.shape = lastShape;

    this.nowPiece.move({ dx: this.queue.x, dy: this.queue.y });
    const dropResult = this.drop();
    this.nowPiece.place();
    if (dropResult) {
      if (dropResult == "gameOver") this.isEnd = true;
      else if (dropResult == "newPiece") this.nowPiece = new TetrisPiece(this);
    }
    this.resetQueue();
  }
  drop() {
    this.nowPiece.moveY(1, { vaildCheck: false });
    if (!this.isVaild(this.nowPiece)) {
      this.nowPiece.moveY(-1);
      this.nowPiece.place();
      if (this.nowPiece.y == 0) return "gameOver";
      else return "newPiece";
    }
    return null;
  }
  async startWithDiscord(message) {
    if (!this.isEnd)
      return message.channel.send(
        "이미 해당 인스턴스가 게임을 진행 중에 있습니다. 수동 중단 요청!"
      );
    this.message = message;
    this.init();
    await message.edit({
      content: null,
      embeds: [this.render()],
    });
    this.interval = setInterval(() => {
      this.update();
      message.edit({ content: null, embeds: [this.render()] });
      if (this.isEnd) this.destroy();
    }, 1500);
  }
  init() {
    this.nowPiece = new TetrisPiece(this);
    this.grid = this.initGrid();
    this.nowPiece.place();
    this.isEnd = false;
    this.resetQueue();
  }
  destroy() {
    this.isEnd = true;
    if (this.interval) clearInterval(this.interval);
    this.message.client._tetris.delete(this.message.id);
  }
}
module.exports = Tetris;
