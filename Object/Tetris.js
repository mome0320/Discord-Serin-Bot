const moment = require("moment");
const momentDurationFormatSetup = require("moment-duration-format");
momentDurationFormatSetup(moment);
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
    this.score = 0;
    this.time = 0;
  }
  initGrid() {
    return Array.from({ length: this.row }, () => Array(this.column).fill(0));
  }

  get viewGridHuman() {
    const color = ["⬛", "🟧", "🟦", "🟥", "🟩", "🟫", "🟨", "🟪"];
    return this.grid.map((row) => row.map((value) => color[value]).join(""));
  }

  render() {
    const embed = new MessageEmbed()
      .setTitle("TETRIS")
      .setDescription(this.viewGridHuman.join("\n"))
      .setColor("#2f3136")
      .addField(
        "TIME",
        `${moment.duration(this.time, "seconds").format()}`,
        true
      )
      .addField("SCORE", `${this.score}`, true)
      .setFooter("여러 사람이 제어할 수 있습니다. 트롤링 주의!");
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
        this.score++;
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
    return x >= 0 && x < this.column && y <= this.row;
  }

  notOccupied(x, y) {
    return Boolean(this.grid[y] && this.grid[y][x] === 0);
  }

  rotateShape(piece, { reverse = false } = {}) {
    const shape = piece.shape;
    for (let y = 0; y < shape.length; ++y) {
      for (let x = 0; x < y; ++x) {
        [shape[x][y], shape[y][x]] = [shape[y][x], shape[x][y]];
      }
    }
    if (reverse) shape.reverse();
    else shape.forEach((row) => row.reverse());
    return shape;
  }

  // hard coding..
  update() {
    if (!this.nowPiece || this.isEnd) return this.resetQueue();
    this.nowPiece.remove();
    this.clearLines();

    const dropResult = this.drop();
    if (dropResult == "gameOver") {
      this.nowPiece.place();
      this.isEnd = true;
      return;
    } else if (dropResult == "newPiece" && this.queue.rotate === 0) {
      this.nowPiece.place();
      const newPiece = new TetrisPiece(this);
      if (!this.isVaild(newPiece)) {
        this.isEnd = true;
        return;
      } else {
        this.nowPiece = newPiece;
      }
    }
    if (dropResult) {
      this.queue.x = 0;
      this.queue.y = 0;
    }

    const lastPiece = JSON.parse(JSON.stringify(this.nowPiece));
    while (this.queue.rotate > 0 && this.isVaild(lastPiece)) {
      lastPiece.shape = this.rotateShape(lastPiece);
      this.queue.rotate--;
    }
    if (!this.isVaild(lastPiece))
      lastPiece.shape = this.rotateShape(lastPiece, { reverse: true });
    this.nowPiece.setJSON(lastPiece);
    this.nowPiece.move({ dx: this.queue.x, dy: this.queue.y });
    this.nowPiece.place();
    this.resetQueue();
  }

  drop() {
    this.nowPiece.moveY(1, { vaildCheck: false });
    if (!this.isVaild(this.nowPiece)) {
      this.nowPiece.moveY(-1);
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
      ++this.time;
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
    this.score = 0;
    this.start = 0;
  }

  destroy() {
    this.isEnd = true;
    if (this.interval) clearInterval(this.interval);
    this.message.client._tetris.delete(this.message.channel.id);
  }
}
module.exports = Tetris;
