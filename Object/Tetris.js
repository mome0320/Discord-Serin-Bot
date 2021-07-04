const TetrisPiece = require("./TetrisPiece");
const { MessageEmbed } = require("discord.js");
class Tetris {
  constructor(row, column) {
    this.row = row;
    this.column = column;
    this.grid = initGrid({ row: this.row, column: this.column });
    this.nowPiece = new TetrisPiece(this);
    this.queue = { x: 0, y: 0, rotate: 0 };
  }
  render() {
    new MessageEmbed().setDescription(this.viewGridHuman.join("\n"));
  }
  get viewGridHuman() {
    return this.grid.map((row) =>
      row.map((value) => (value > 0 ? "🟦" : "⬜")).join("")
    );
  }
  update() {
    if (this.queuerotate > 0)
      this.nowPiece.rotate({ repeat: this.queue.rotate });
    const dx = this.queue.x;
    const dy = this.queue.y + 1;
    this.nowPiece.move({ dx, dy });
  }
}

function initGrid({ row, column }) {
  return Array.from({ length: row }, () => Array(column).fill(0));
}
module.exports = Tetris;
