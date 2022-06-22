const startingFen = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';
function Chess(fen = startingFen) {
    stat = fen.split(' ');
    this.board = fenToPos(stat[0]);
    this.toMove = stat[1];
    this.castling = stat[2].split('');
    this.enPassant = stat[3];
    this.moves = Number(stat[5]);
    this.legalMoves = legalMoveGenerator(this);
    this.previousPos = {};
    this.makeMove = function(move) {
        this.previousPos = JSON.parse(JSON.stringify(this));
        this.toMove = (this.toMove == 'w' ? 'b' : 'w');  
        this.board[move.from] = '-';
        this.board[move.to] = move.piece;
        //castling
        this.castling = castlingUpdate(this.castling, move);
        if (move.type == 'ck') {
            this.board[move.from + 3] = '-';
            this.board[move.from + 1] =  (this.toMove == 'w' ? 'r' : 'R');
        }
        if (move.type == 'cq') {
            this.board[move.from + -4] = '-';
            this.board[move.from + -1] =  (this.toMove == 'w' ? 'r' : 'R');
        }
        //promotion
        if (move.type == 'qp') this.board[move.to] = (this.toMove == 'w' ? 'q' : 'Q');
        if (move.type == 'rp') this.board[move.to] = (this.toMove == 'w' ? 'r' : 'R');
        if (move.type == 'bp') this.board[move.to] = (this.toMove == 'w' ? 'b' : 'B');
        if (move.type == 'np') this.board[move.to] = (this.toMove == 'w' ? 'n' : 'N');
        //enPassant
        if (move.type == 'dp') {
            if (move.piece.toUpperCase() != move.piece) this.enPassant = move.to - 8;
            else this.enPassant = move.to + 8;
        } else this.enPassant = '-';
        if (move.type == 'ep') {
            if (move.piece.toUpperCase() == move.piece) this.board[move.to + 8] = '-';
            else this.board[move.to - 8] = '-';
        }
        //moves
        this.moves += (this.toMove == 'w' ? 1 : 0);
        //legalMoves
        this.legalMoves = legalMoveGenerator(this);
    }
    this.unMakeMove = function() {
        this.board = this.previousPos.board.slice();
        this.toMove = this.previousPos.toMove;
        this.castling = this.previousPos.castling.slice();
        this.enPassant = this.previousPos.enPassant;
        this.moves = this.previousPos.moves;
        this.legalMoves = this.previousPos.legalMoves.slice();
        this.previousPos = JSON.parse(JSON.stringify(this.previousPos.previousPos));
    }
    this.isLegalMove = function(from, to) {
        for (move of this.legalMoves[from]) {
            if (move.to == to) return move;
        }
    }
}


function fenToPos(fen) {
    let board = [];
    for (rank of fen.split('/')) {
        for (val of rank.split('')) {
            if (isNaN(val)) {
                board.push(val);
            }
            else for (let i = 0; i < Number(val); i++) {
                board.push('-');
            }
        }
    }
    return board;
}

function posToFen(board) {
    let fen = '';
    for (let rank = 0; rank < 8; rank++) {
        let count = 0; 
        for (let file = 0; file < 8; file++) {
            if (board[rank* 8 + file] == '-') {
                count++;
            }
            else {
                if (count != 0) {
                fen += count; 
                count = 0;
                }
                fen += board[rank* 8 + file];
            } 
        }
        if (count != 0) fen += count;
        if (rank != 7) fen += '/';
    }
    return fen;
}

function castlingUpdate(cast, move) {
    if (move.from == 63 || move.to == 63) {
        removeFromArray(cast, 'k');
    }
    if (move.from == 56 || move.to == 56) {
        removeFromArray(cast, 'q');
    }
    if (move.from == 7 || move.to == 7) {
        removeFromArray(cast, 'K');
    }
    if (move.from == 0 || move.to == 0) {
        removeFromArray(cast, 'Q');
    }
    if (move.piece == 'k') {
        removeFromArray(cast, 'k');
        removeFromArray(cast, 'q');
    }
    if (move.piece == 'K') {
        removeFromArray(cast, 'K');
        removeFromArray(cast, 'Q');
    }
    return cast;
}



