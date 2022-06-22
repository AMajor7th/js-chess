
directions = {
    up: -8,
    down: +8,
    left: -1,
    right: 1,
    leftup: -9,
    leftdown: +7,
    rightup: -7,
    rightdown: +9
};

let toEdge = toEdgeCount();

function toEdgeCount() {
    cte = [];
    for (let i = 0; i < 64; i++) {
        te = {};
        te.up = Math.floor(i/8);
        te.down = 7 - Math.floor(i/8);
        te.left = i % 8;
        te.right = 7 - i % 8;
        te.leftup = Math.min(te.up, te.left);
        te.leftdown = Math.min(te.down, te.left);
        te.rightup = Math.min(te.up, te.right);
        te.rightdown = Math.min(te.down, te.right);
        cte.push(te);
    }   
    return cte;
}



function legalMoveGenerator(chess) {
    let legalMoves = [];
    let absPinned = []; // các ô có quân bị absolute pinned
    let pinnedLegal = [];
    let atkSquare = [];
    let checkingSquare = [];
    let checkBlockable = [];
    for (let i = 0; i < 64; i++) {
        let piece = chess.board[i];
        if (piece == '-' || (chess.toMove == 'w' && piece.toUpperCase() == piece) || (chess.toMove == 'b' && piece.toUpperCase() != piece)) {
            continue;
        }
        if (piece.toUpperCase() == 'R' || piece.toUpperCase() == 'Q' || piece.toUpperCase() == 'B') {
            let out = opSlidingPieceMove(chess.board, i);
            if (out.inCheck == true) {
                checkingSquare.push(i);
                checkBlockable = out.checkBlockable;
            }
            if (out.absPinned != undefined) {
                absPinned.push(out.absPinned);
                pinnedLegal.push(out.pinnedLegal);
            }
            atkSquare = atkSquare.concat(out.atk);
        }
        if (piece.toUpperCase() == 'N') {
            let out = opKnightMove(chess.board, i);
            atkSquare = atkSquare.concat(out.atk);
            if (out.inCheck == true) checkingSquare.push(i);     
        } 
        if (piece.toUpperCase() == 'P') {
            let out = opPawnMove(chess.board, i);
            atkSquare = atkSquare.concat(out.atk);
            if (out.inCheck == true) checkingSquare.push(i);  
        }
        if (piece.toUpperCase() == 'K') {
            atkSquare = atkSquare.concat(opKingMove(i));
        }
    }
    for (let i = 0; i < 64; i++) {
        let piece = chess.board[i];
        if (piece == '-' || (chess.toMove == 'w' && piece.toUpperCase() != piece) || (chess.toMove == 'b' && piece.toUpperCase() == piece)) {
            legalMoves.push([]);
            continue; // loc mau quan
        }
        let pseudo;
        if  (piece.toUpperCase() == 'K') {
            pseudo = kingMove(chess.board, i, chess.castling);
            for (let j = 0; j < pseudo.length; j++) {
                let move = pseudo[j]
                if (atkSquare.indexOf(move.to) != -1) {
                    pseudo.splice(j, 1);
                    j--;
                }
                if (move.type == 'ck') {
                    if (atkSquare.indexOf(i + 1) != -1 || atkSquare.indexOf(i + 1) != -1) {
                        pseudo.splice(j, 1);
                        j--;
                    }
                }
                if (move.type == 'cq') {
                    if (atkSquare.indexOf(i - 1) != -1 || atkSquare.indexOf(i - 1) != -1) {
                        pseudo.splice(j, 1);
                        j--;
                    }
                }
            }
            legalMoves.push(pseudo);
            continue;
        }
        if (checkingSquare.length == 2) {
            legalMoves.push([]);
            continue;
        }
        else {
            pseudo = pseudoLegal(chess, i);
            if (absPinned.indexOf(i) != -1) for (let j = 0; j < pseudo.length; j++) {
                let move = pseudo[j];
                if (pinnedLegal[absPinned.indexOf(i)].indexOf(move.to) == -1) {
                    pseudo.splice(pseudo.indexOf(move), 1);
                    j--;
                }
            }
            if (chess.board[i].toUpperCase() == 'P') {
                let count = 0;
                for (move of pseudo) {
                    if (move.type != 'ep') continue;
                    else {
                        for (step of [-1, 1]) {
                            let des = move.from;
                            if ((des + step) % 8 == move.to % 8) {
                                des += step;
                                for (let j = des % 8; j < 8 && j >= 0; j += step) {
                                    des += step;
                                    if (chess.board[des] == '-') continue;
                                    else if (sameColor(move.piece, chess.board[des])) break;
                                    else if (chess.board[des].toUpperCase() == 'Q' || chess.board[des].toUpperCase() == 'R') {
                                        count ++;
                                        break;
                                    }   
                                    else break;
                                    
                                }
                            }
                            else {
                                for (let j = des % 8 + step; j < 8 && j >= 0; j += step) {
                                    des += step;
                                    if (chess.board[des] == '-') continue;
                                    else if (sameColor(move.piece, chess.board[des]) && chess.board[des].toUpperCase() == 'K') {
                                        count ++;
                                        break;
                                    }
                                    else break; 
                                }
                            }
                        }
                        if (count == 2) {
                            removeFromArray(pseudo, move);
                            break;
                        }
                    }
                }
            }
            if (checkingSquare.length == 1) {
                for (let j = 0; j < pseudo.length; j++) {
                    let move = pseudo[j];
                    if (checkBlockable.indexOf(move.to) == -1 && checkingSquare.indexOf(move.to) == -1) {
                        pseudo.splice(j, 1);
                        j--;
                    }
                }
            }
            legalMoves.push(pseudo);
        } 
    }
    return legalMoves;
}   

/*
Các type: 
- n = normal (di chuyển, bắt)
- ck = castle ngắn
- cq = castle dài
- dp = double pawn push
- ep = en passant
- qp = promote lên queen
- rp = promote lên rook
- bp = promote lên bishop
- np = promote lên knight
*/

function pseudoLegal(chess, i) {
    piece = chess.board[i];
    if (piece.toUpperCase() == 'R' || piece.toUpperCase() == 'Q' || piece.toUpperCase() == 'B') {
        return slidingPieceMove(chess.board, i);
    }
    if (piece.toUpperCase() == 'N') {
        return knightMove(chess.board, i);
    }
    if (piece.toUpperCase() == 'P') {
        return pawnMove(chess.board, i, chess.enPassant);
    }
}

function Move(piece, from, to, type) {
    this.piece = piece;
    this.from = from;
    this.to = to;
    this.type = type;
}

function slidingPieceMove(board, square) {
    let piece = board[square];
    let out = [];
    let count = 0;
    for (dir in directions) {
        count++;
        if (piece.toUpperCase() == 'R' && count > 4) continue;
        if (piece.toUpperCase() == 'B' && count <= 4) continue;
        value = directions[dir];
        let des = square;
        for (let i = 0; i < toEdge[square][dir]; i++) {
            des += value;
            if (board[des] == '-') out.push(new Move(piece, square, des, 'n'));
            else {
                if (sameColor(board[des], piece)) break;
                else {
                    out.push(new Move(piece, square, des, 'n'));
                    break;
                }
            }
        }
    }
    return out;
}


function opSlidingPieceMove(board, square) {
    let piece = board[square];
    let atk = [];
    let count = 0;
    let inCheck = false;
    let checkBlockable = [];
    let absPinned;
    let pinnedLegal = [];
    for (dir in directions) {
        count++;
        if (piece.toUpperCase() == 'R' && count > 4) continue;
        if (piece.toUpperCase() == 'B' && count <= 4) continue;
        value = directions[dir];
        let des = square;
        for (let i = 0; i < toEdge[square][dir]; i++) {
            des += value;
            if (board[des] == '-') atk.push(des);
            else {
                if (sameColor(board[des], piece)) {
                    atk.push(des);
                    break;
                }
                else {
                    if (board[des].toUpperCase() == 'K') {
                        inCheck = true;
                        let x = des;
                        let y = square
                        for (let x_ray = 0; x_ray < toEdge[des][dir]; x_ray++){
                            x += directions[dir];
                            atk.push(x);
                        }
                        for (let blockable = 0; blockable < toEdge[square][dir] - toEdge[des][dir] - 1; blockable++) {
                            y += directions[dir];
                            checkBlockable.push(y);
                        }
                    break;
                    }
                    else {
                        let x = des;
                        let y = square;
                        for (let x_ray = 0; x_ray < toEdge[des][dir]; x_ray++) {
                            x += directions[dir]
                            if (board[x].toUpperCase() == "K" && !sameColor(board[square], board[x])) {
                                absPinned = des;
                                //vòng lặp tạo nước đi cho quân bị abs pinned, index của 2 mảng sẽ tương ứng
                                pinnedLegal.push(square);
                                for (let index = 0; index < toEdge[square][dir]; index++) {
                                    y += directions[dir];
                                    if (y == absPinned) continue;
                                    pinnedLegal.push(y);
                                }
                            }
                            else if (board[x] != "-") break;
                        }
                    break;
                    }
                }
            }
        }
    }
    checkBlockable.push(square);
    out = {
        atk: atk,
        inCheck: inCheck,
        absPinned: absPinned,
        pinnedLegal: pinnedLegal,
        checkBlockable: checkBlockable
    }
    return out;
}

function knightMove(board, square) {
    let out = [];
    let des = [-17, -15, -10, -6, 6, 10, 15, 17];
    te = toEdge[square];
    if (te.up < 1) {
        des.splice(0, 4);
    } 
    if (te.up < 2) {
        des.splice(0, 2);
    }
    if (te.down < 1) {
        des.splice(4, 4);
    } 
    if (te.down < 2) {
        des.splice(6, 2);
    }

    if (te.left < 1) {
        removeFromArray(des, -17);
        removeFromArray(des, -10);
        removeFromArray(des, 6);
        removeFromArray(des, 15);
    } 
    if (te.left < 2) {
        removeFromArray(des, -10);
        removeFromArray(des, 6);
    }
    if (te.right < 1) {
        removeFromArray(des, -15);
        removeFromArray(des, -6);
        removeFromArray(des, 10);
        removeFromArray(des, 17);
    } 
    if (te.right < 2) {
        removeFromArray(des, 10);
        removeFromArray(des, -6);
    }
    for (desSq of des) {
        desSq += square;
        if (board[desSq] != '-' && sameColor(board[desSq], board[square])) {
            continue;
        }
        else out.push(new Move(board[square], square, desSq, 'n'));
    }
    return out;
}

function opKnightMove(board, square) {
    let des = [-17, -15, -10, -6, 6, 10, 15, 17];
    let inCheck = false;
    te = toEdge[square];
    if (te.up < 1) {
        des.splice(0, 4);
    } 
    if (te.up < 2) {
        des.splice(0, 2);
    }
    if (te.down < 1) {
        des.splice(4, 4);
    } 
    if (te.down < 2) {
        des.splice(6, 2);
    }

    if (te.left < 1) {
        removeFromArray(des, -17);
        removeFromArray(des, -10);
        removeFromArray(des, 6);
        removeFromArray(des, 15);
    } 
    if (te.left < 2) {
        removeFromArray(des, -10);
        removeFromArray(des, 6);
    }
    if (te.right < 1) {
        removeFromArray(des, -15);
        removeFromArray(des, -6);
        removeFromArray(des, 10);
        removeFromArray(des, 17);
    } 
    if (te.right < 2) {
        removeFromArray(des, 10);
        removeFromArray(des, -6);
    }
    for (let j = 0; j < des.length; j++) {
        des[j] += square;
        if (board[des[j]].toUpperCase() == 'K' && !sameColor(board[des[j]], board[square])) inCheck = true;
    }
    return {
        atk: des,
        inCheck: inCheck
    };
}

function pawnMove(board, square, enPassant) {   
    let p;
    let out = [];
    let des = square;
    if (board[square].toUpperCase() == board[square]) p = -8;
    else p = 8;
    des += p;
    if (board[des] == '-') {
        out.push(new Move(board[square], square, des, 'n'));
        if (p == -8 && Math.floor(square/8) == 6 && board[des + p] == '-') out.push(new Move(board[square], square, des + p, 'dp'));
        if (p == 8 && Math.floor(square/8) == 1 && board[des + p] == '-') out.push(new Move(board[square], square, des + p, 'dp'));
    }
    for (p of [7, 9]) {
        if (board[square].toUpperCase() == board[square]) p = -p;
        if ((p == 7 || p == -9) && toEdge[square].left == 0) continue;
        if ((p == -7 || p == 9) && toEdge[square].right == 0) continue;
        des = square + p;
        if (board[des] != '-' && !sameColor(board[square], board[des])) out.push(new Move(board[square], square, des, 'n'));
        if (board[des] == '-' &&des == enPassant) out.push(new Move(board[square], square, des, 'ep'));
    }
    if ((p == -9 && Math.floor(square/8)) == 1 || (p == 9 && Math.floor(square/8) == 6)) {
        let pro = [];
        for (move of out) {
            for (type of ['qp', 'rp', 'bp', 'np']) {
                move.type = type;
                pro.push(Object.assign({}, move));
            }
        }
        out = pro;
    }
    return out;
}

function opPawnMove(board, square) {   
    let out = [];
    let inCheck = false;
    for (p of [7, 9]) {
        if (board[square].toUpperCase() == board[square]) p = -p;
        if ((p == 7 || p == -9) && toEdge[square].left == 0) continue;
        if ((p == -7 || p == 9) && toEdge[square].right == 0) continue;
        des = square + p;
        if (board[des].toUpperCase() == 'K' && !sameColor(board[des], board[square])) inCheck = true;
        out.push(des);
    }
    return {
        atk: out,
        inCheck: inCheck
    };
}

function kingMove(board, square, castling) {
    let out = [];
    for (dir in directions) {
        if (toEdge[square][dir] == 0) continue;
        else if (board[square + directions[dir]] == '-' || !sameColor(board[square + directions[dir]], board[square])) out.push(new Move(board[square], square, square + directions[dir], 'n'));
    }
    for (side of castling) {
        if (sameColor(board[square], side)) {
            if (side.toUpperCase() == 'K') {
                if (board[square + 1] == '-' && board[square + 2] == '-') out.push(new Move(board[square], square, square + 2, 'ck'));
            }
            if (side.toUpperCase() == 'K') {
                if (board[square - 1] == '-' && board[square - 2] == '-' && board[square - 3] == '-') out.push(new Move(board[square], square, square - 2, 'cq'));
            }
        }
    }
    return out;
}

function opKingMove(square) {
    let out = [];
    for (dir in directions) {
        if (toEdge[square][dir] == 0) continue;
        else out.push(square + directions[dir]);
    }
    return out;
}



function sameColor(p1, p2) {
    if (p1.toUpperCase() == p1) { // p1 la den
        if (p2.toUpperCase() == p2) return true;
        else return false;
    }
    else {
        if (p2.toUpperCase() == p2) return false;
        else return true;
    }
}

function removeFromArray(arr, val) {
    index = arr.indexOf(val);
    if (index != -1) arr.splice(index, 1);
}
