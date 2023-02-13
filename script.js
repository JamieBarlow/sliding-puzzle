let canvas = document.querySelector('#canvas');
let ctx = canvas.getContext('2d');
let board; // later initialized with cutImgIntoPieces() function
let tileImgs = [];
let tileIds = [];
let shuffledIds = [];

const img = new Image();
img.onload = cutImgIntoPieces;
img.src = 'imgtest-square.jpg';

function cutImgIntoPieces() {
    // set up board
    board = new Board(this.naturalWidth, this.naturalHeight, 4)
    canvas.width = board.width;
    canvas.height = board.height;
    canvas.style.border="2px solid red";
    ctx.fillStyle="gray";
    ctx.fillRect(0,0, canvas.width, canvas.height);
    
    // cut image into multiple pieces
    let tmpCanvas = document.createElement('canvas');
    tmpCanvas.width = board.tileWidth;
    tmpCanvas.height = board.tileHeight;
    let tmpCtx = tmpCanvas.getContext('2d');

    // Split original image into pieces with IDs
    for (let row = 0; row < board.rowCols; row++) {
        for (let col = 0; col < board.rowCols; col++) {
            tmpCtx.drawImage(this, row*board.widthIP, col*board.heightIP, board.widthIP, board.heightIP, 0, 0, tmpCanvas.width, tmpCanvas.height);   // 'this' refers to img, as the function is an event listener on this element. See also https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/drawImage
            tileImgs.push(tmpCanvas.toDataURL());   // converts temporary canvas to a 'data URL' object (https://developer.mozilla.org/en-US/docs/Web/API/HTMLCanvasElement/toDataURL#examples)
            // define unique ID for tile piece
            let id = row + col * board.rowCols;
            tileIds.push(id);
        }
    }
    // Shuffle the pieces to create the puzzle
    shuffle()
    // Draw all tiles
    drawAllTiles()
}

function shuffle() {
    shuffledIds = [...tileIds] // using spread operator to copy all tileIds to shuffleIds
    shuffledIds.sort(() => Math.random() -0.5)  // shuffles Ids
    // Choosing tile to make blank
    for (let i = 0; i < shuffledIds.length; i++) {
        if(shuffledIds[i] != tileIds[i]) { // making sure there is at least 1 tile where the shuffled tile id doesn't match the original tile id
            let blank = Math.round(Math.random()*(Math.pow(board.rowCols, 2) - 1)); // select random ID to make blank
            shuffledIds[blank] = -1;
            return;
        }
    }
    shuffle(); // if previous loop doesn't return any shuffled results, run the function again
}

function drawAllTiles() {
    for (let index = 0; index < shuffledIds.length; index++) {
        if(shuffledIds[index] == -1) continue; // skip this iteration if we encounter blank tile
        let coordinates = getRowColFromIndex(index);
        let x = coordinates.x; // row number
        let y = coordinates.y; // column number
        let imgURL = tileImgs[shuffledIds[index]];
        let imgObj = new Image();
        imgObj.onload = function() { // event listener needed for image to be drawn
            ctx.drawImage(this, 0, 0, this.width, this.height, x*board.tileWidth, y*board.tileHeight, board.tileWidth, board.tileHeight)
        }
        imgObj.src = imgURL;
    }
}

function getRowColFromIndex(i) {
    let col = Math.floor(i / board.rowCols); // not using Math.round() because this can return a row/columnwhich doesn't exist - we want the lowest integer
    let row = i % board.rowCols;
    return {x:row, y:col};
}

class Board {
    constructor(imgNWidth, imgNHeight, rowCols) { //imgNWidth and imgNHeight refer to the naturalHeight and naturalWidth properties of the original image element
        // creating a 'Singleton' to ensure only one instance of board puzzle
        if (Board._instance) {
            throw new Error('There can be only one board per puzzle')
        }
        Board._instance = this;

        this.rowCols = rowCols;
        // Size of each piece of the original image
        this.widthIP = Math.floor(imgNWidth / this.rowCols);
        this.heightIP = Math.floor(imgNHeight / this.rowCols);
        // Puzzle size
        this.width = 600;
        this.height = 600;
        // Size of each tile of the puzzle
        this.tileWidth = Math.floor(this.width / this.rowCols);
        this.tileHeight = Math.floor(this.height / this.rowCols);
    }
}