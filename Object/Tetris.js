const TetrisPiece = require('./TetrisPiece')
class tetris {

constructor(row,column){
this.row = row;
this.column = column;
this.grid = initGrid({row,column});
this.nowPiece = new TetrisPiece(this);
}
}

function initGrid({row,column}){
    return Array.from({length:row}, ()=> Array(column).fill(0))
    }
module.exports = tetris;