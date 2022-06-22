const pieces = ['r', 'n', 'b', 'q', 'k', 'p', 
                'R', 'N', 'B', 'Q', 'K', 'P'];

let testFen = '1KRBQ3/8/8/8/8/8/4n3/4krbq w - - 0 1';
let selectedSquare = '-';
let selectedPiece = '-';
let mainBoard = new Chess();
let mouseDown = false;
let dragging = false;
let backward;
let forward;
let backToMainButton;
let history = [Array.from(mainBoard.board)];
let currentMove = 1;
let end = false;

function preload() {
    loadPieces();
}

function setup() {
    black = color(0, 0, 0);
    frameRate(60);
    //noLoop()
    createCanvas(480, 480);
    backward = createButton('<-');
    backward.size(40, 30)
    backward.position(510,445);
    backward.mousePressed(posBack);

    forward = createButton('->');
    forward.size(40, 30)
    forward.position(570,445);
    forward.mousePressed(posGo);

    backToMainButton = createButton('Back to current position');
    backToMainButton.size(100, 60)
    backToMainButton.position(510, 375);
    backToMainButton.mousePressed(posCurrent);
}

function posBack() {
    if (currentMove != 1) currentMove--;
}

function posGo() {
    let mainMove = mainBoard.moves*2;
    if (mainBoard.toMove != 'b') mainMove-- ;
    if (currentMove != mainMove) currentMove++;
}

function posCurrent() {
    let mainMove = mainBoard.moves*2;
    if (mainBoard.toMove != 'b') mainMove-- ;
    currentMove = mainMove;
}

function draw() {
    background(100);
    //fill(255);
    noStroke();
    rect(0, 0, 100, 100);
    drawBoard();
    drawRects();
    drawPieces(history[currentMove - 1]);
    if (selectedPiece != '-') legalMoveHighlighter(mainBoard.legalMoves[selectedSquare]);
    showDraggingPiece();
}

function keyPressed() {
    if (keyCode === LEFT_ARROW) {
        posBack();
    } else if (keyCode === RIGHT_ARROW) {
        posGo();
    }
    else if (keyCode === DOWN_ARROW) {
        currentMove = 1;
    } else if (keyCode === UP_ARROW) {
        posCurrent();
    }
  }

function mousePressed() {
    if (mouseSquare() == -1) return;
    let mainMove = mainBoard.moves*2;
    if (mainBoard.toMove != 'b') mainMove--;
    if (currentMove == mainMove) {
        mouseDown = true;
        if (mainBoard.board[mouseSquare()] == '-') {

        }           
        else {
            if (selectedSquare == '-' && mouseSquare() != -1) {
            if ((mainBoard.toMove == 'w' && mainBoard.board[mouseSquare()].toUpperCase() == mainBoard.board[mouseSquare()]) || (mainBoard.toMove == 'b' && mainBoard.board[mouseSquare()].toUpperCase() != mainBoard.board[mouseSquare()])) {
                selectSquare();
                dragging = true;
            }}
            else {
                if (mouseSquare() == selectedSquare) dragging = true;
                if (sameColor(mainBoard.board[mouseSquare()], selectedPiece)) {
                    selectSquare();
                    dragging = true;
                }
            }
        }
    }
}

function mouseReleased() {
    if (mouseSquare() == -1) return;
    let mainMove = mainBoard.moves*2;
    if (mainBoard.toMove != 'b') mainMove--;
    if (currentMove == mainMove) {
        if (selectedSquare != '-') {
            let des = mouseSquare();
            if (mainBoard.isLegalMove(selectedSquare, des) != undefined) {
                mainBoard.makeMove(mainBoard.isLegalMove(selectedSquare, des));
                currentMove++;
                history.push(Array.from(mainBoard.board));
                deselectSquare();
            }
            else {
                if (!dragging) deselectSquare();
            }
        }
        mouseDown = false;
        dragging = false;
    }
    
}

function selectSquare() {
    selectedSquare = mouseSquare();
    selectedPiece = mainBoard.board[mouseSquare()];
}

function deselectSquare() {
    selectedSquare = '-';
    selectedPiece = '-';
}

function speed(n) {
    var t0 = performance.now();
    let move = new Move('R', 1, 2, 'n')
    for (let i = 0; i < n; i++) {
        legalMoveGenerator(mainBoard);
    }  // <---- The function you're measuring time for 

    var t1 = performance.now();
    console.log("Call to doSomething took " + (t1 - t0) + " milliseconds.");
}

function countPos(chess, depth) {
    if (depth == 0) {
        return 1;
    }
    let num = 0;
    for (squ of chess.legalMoves) {
        for (move of squ) {
            chess.makeMove(move);
            num += countPos(chess, depth - 1);
            chess.unMakeMove();
        }
    }
    return num;
}

function search(target, a, offset = 0) {
    mid = int(a.length / 2);
    if (a[mid] == target) return mid + offset;
    else {
        if (a.length <= 1) return -1;
        else if (a[mid] > target) return search(target, a.slice(0, mid), offset);
        else return search(target, a.slice(mid + 1, a.length), mid + offset + 1);
    }
}