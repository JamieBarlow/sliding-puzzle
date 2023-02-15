let canvas = document.querySelector('#canvas');
let ctx = canvas.getContext('2d');
let board; // later initialized with cutImgIntoPieces() function
let tileImgs = [];
let tileIds = [];
let shuffledIds = [];

const img = new Image();
img.onload = cutImgIntoPieces;
img.src = 'ampersand.jpeg';

function cutImgIntoPieces() {
    // set up board
    board = new Board(this.naturalWidth, this.naturalHeight, 3);
    canvas.width = board.width;
    canvas.height = board.height;
    canvas.style.position = 'absolute';
    canvas.style.top = '12%';
    canvas.style.left = "25%";
    canvas.addEventListener('click', move); // needed for movement function
    // canvas.style.border="2px solid red";
    ctx.fillStyle="#e6e4df";
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

function move(e) {
    e.preventDefault();
    let coords = getMouseCoords(e.clientX, e.clientY);
    let tileX = coords.x; // row number
    let tileY = coords.y; // column number
    let blankCoords = getRowColFromIndex(findBlankIndex());
    let blankX = blankCoords.x;
    let blankY = blankCoords.y;
    if(!hasBlankNeighbour(tileX, tileY, blankX, blankY)) {
        return;
        // store pixels of the tile with image into temp variable
    }
    const swapDataImage = ctx.getImageData(tileX*board.tileWidth, tileY*board.tileHeight, board.tileWidth, board.tileHeight); // returns image data from a given position. Not using .toDataURL() because we don't want the full canvas, just where the user has clicked
    ctx.fillRect(tileX*board.tileWidth, tileY*board.tileHeight, board.tileWidth, board.tileHeight);
    ctx.putImageData(swapDataImage, blankX*board.tileWidth, blankY*board.tileHeight);

    const imgIndex = getIndexFromCoords(tileX, tileY);
    const blankIndex = getIndexFromCoords(blankX, blankY);
    swapIndex(imgIndex, blankIndex);
    //todo: logic to check if the puzzle is solved or not
    if(isSolved()) {
        canvas.removeEventListener('click', move);
        drawLastTile();
        setTimeout(() => alert("Congratulations!!"), 50);   // ensure this appears after drawing last tile
    }
}

//Helper functions
function getMouseCoords(x, y) {
    let offset = canvas.getBoundingClientRect();
    let left = Math.floor(offset.left);
    let top = Math.floor(offset.top);
    let row = Math.floor((x - left)/board.tileWidth);
    let col = Math.floor((y - top)/board.tileHeight);
    return {x:row, y:col};
}

function findBlankIndex() {
    for (let i = 0; i < shuffledIds.length; i++) {
        if (shuffledIds[i] == -1) return i;
    }
}

function hasBlankNeighbour(tileX, tileY, blankX, blankY) {
    if(tileX != blankX && tileY != blankY) return false;    // if the tile isn't on the same row or column as the blank, then it can't be the blank's neighbour - rule out this possibility first
    if(Math.abs(tileX - blankX) == 1 || Math.abs(tileY - blankY) == 1) return true;  // if the difference in indexes is exactly 1, we can call them a neighbour
    return false;
}

function getIndexFromCoords(x, y) {
    return x+y * board.rowCols;
}

function swapIndex(imgIndex, blankIndex) {
    shuffledIds[blankIndex] = shuffledIds[imgIndex];
    shuffledIds[imgIndex] = -1;
}

function isSolved() {
    for (let i = 0; i < shuffledIds.length; i++) {
        if(shuffledIds[i] == -1) continue;               // if tile is blank, continue
        if(shuffledIds[i] != tileIds[i]) return false;   // if a tile doesn't match, puzzle isn't solved
    }
    return true; // if nothing above returns false, puzzle is solved
}

function drawLastTile() {
    let blank = findBlankIndex();
    let coords = getRowColFromIndex(blank);
    let x = coords.x;
    let y = coords.y;
    let imgUrl = tileImgs[tileIds[blank]];
    const imgObj = new Image();
    imgObj.onload = function() {
        ctx.drawImage(this, 0, 0, this.width, this.height, x*board.tileWidth, y*board.tileHeight, board.tileWidth, board.tileHeight)
    }
    imgObj.src = imgUrl;
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