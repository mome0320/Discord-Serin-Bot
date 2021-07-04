class TetrisPiece {

    constructor(board){
        this.x = 0;
        this.y = 0;
        this.shape = [];
        this.ctx = board;
        this.spawn();
    }
    spawn(){
    this.shape = [
        [0,0,1],
        [1,1,1],
        [0,0,0],
    ];
    this.y = 0;
    this.x = 0;
    this.set();
    }
    
    set(){
        this.shape.forEach((row,y) =>
            row.forEach((value,x) => {
                const PosY = this.y+y;
                const PosX = this.x+x;
                if(value > 0){
                    if(PosY < 0) return;
                    this.ctx.grid[PosY][PosX] = 1;}
            }))
    }
    remove(){
        this.shape.forEach((row,y) =>
            row.forEach((value,x) => {
                const PosY = this.y+y;
                const PosX = this.x+x;
                if(value > 0){
                if(y < 0) return;
                    this.ctx.grid[PosY][PosX] = 0;
                }
            })
        )
    }
    move({dx=0,dy=0}){
        this.remove();
        this.x += dx;
        this.y += dy;
        this.set();
    }

    rotate(){
        this.remove();
        // 문송합니다. 연산 결과를 사용함. 결과: x = -y; y = x
        // https://gamedev.stackexchange.com/questions/17974/how-to-rotate-blocks-in-tetris
        
        // x = y , y = x;
        for (let y = 0; y < this.shape.length; ++y){
            for(let x = 0; x < y; ++x){
                [this.shape[x][y],this.shape[y][x]] = [this.shape[y][x],this.shape[x][y]]
            }
        }

        // x = -y 이므로 리버스.
        this.shape.forEach(row => row.reverse());
        this.set();
        return this.shape;
    }

}

module.exports = TetrisPiece;