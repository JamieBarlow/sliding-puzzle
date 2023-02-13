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
    board = new Board(this.naturalWidth, this.naturalHeight, 4)
}

class Board {
    constructor(imgNWidth, imgNHeight, rowCols) { //imgNWidth and imgNHeight refer to the naturalHeight and naturalWidth properties of the original image element
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