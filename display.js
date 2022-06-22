

function drawBoard() {
    for (let rank = 0; rank < 8; rank++) {
        for (let file = 0; file < 8; file++) {
            if (rank*8 + file == selectedSquare) {
                fill(204, 51, 0);
            }
            else if ((file + rank) % 2 === 0) {
                fill(255, 166, 77);
            }
            else {
                fill(204, 102, 0);
            }
            rect(file*60, rank*60, 60, 60);
        }
    }
}

let img = {};

function loadPieces() {
    for (piece of pieces) {
        let path = 'assets/pieces/';
        if (piece.toUpperCase() === piece) {
            path += 'white/';
        }
        else {
            path += 'black/'
        }
        path += piece + '.png';
        img[piece] = loadImage(path);
    }
}

function drawPieces(board) {
    for (let rank = 0; rank < 8; rank++) {
        for (let file = 0; file < 8; file++) {
            let piece = board[rank*8 + file];
            if (piece === '-' || (mouseDown && selectedSquare == rank*8 + file && dragging)) continue;
            image(img[piece], file*60, rank*60, 60, 60);
        }
    }
}

function showDraggingPiece() {
    if (mouseDown && dragging) image(img[selectedPiece], mouseX - 30, mouseY - 30, 60, 60);
}

function legalMoveHighlighter(legalMoves) {
    for (move of legalMoves) {
        black.setAlpha(50);
        if(mainBoard.board[move.to] != '-') {
            stroke(black);
            strokeWeight(5);
            noFill();
            ellipse(move.to % 8 * 60 + 30, Math.floor(move.to / 8) * 60 + 30, 55, 55);
            continue;
        }
        noStroke();
        fill(black);
        ellipse(move.to % 8 * 60 + 30, Math.floor(move.to / 8) * 60 + 30, 20, 20);
    }
}

function drawRects() {
    noFill();
    strokeWeight(4);
    stroke(100);
    //rect(selectedSquare % 8 *60,floor(selectedSquare/8)*60, 60, 60);
    if (mouseDown && selectedSquare != "-") {
        rect(mouseFile() *60 + 2,mouseRank() *60 + 2, 56, 56);
    }
}

function mouseRank() {
    return floor(mouseY / 60);
} 

function mouseFile() {
    return floor(mouseX / 60);
} 

function mouseSquare() {
    if (mouseRank() > 7 || mouseFile() > 7) return -1;
    return mouseRank()*8 + mouseFile();
}