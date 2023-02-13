const canvas = document.querySelector('#canvas');
const ctx = canvas.getContext('2d');
let board; // later initialized with cutImgIntoPieces() function
const tileImgs = [];
const tileIds = [];
const shuffledIds = [];

const img = new Image();
img.addEventListener('DOMContentLoaded', cutImgIntoPieces)
img.src = './imgtest.jpg';

function cutImgIntoPieces() {
    // set up board
    board = new Board(this.naturalWidth, this.naturalHeight, 4)
    canvas.width = board.width;
    canvas.height = board.height;
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
    shuffledIds()
    // Draw all tiles
    drawAllTiles()
}

function shuffledIds() {

}

function drawAllTiles() {

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