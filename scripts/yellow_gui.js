
htmlCanvas = document.getElementById('c'),
//graphics context for drawing.
ctx = htmlCanvas.getContext('2d');

aa = [[0,1][1,2]];

outlinecolor = '#81726A'
spacecolor = '#5C6D6A'
whitecolor = '#F4E5D4'
palette = ['#AFD0D6', '#E1D89F', '#C49799', '#B6C4A2'];

function getRandomColor() {
    var letters = '0123456789ABCDEF';
    var color = '#';
    for (var i = 0; i < 6; i++) {
      color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
}


class Puzzleboardgui extends Puzzleboard {
    constructor(board = null, modulus = 4, canvasx = null, canvasy = null) {
        super(board, modulus);
        this.canvasx = canvasx;
        this.canvasy = canvasy;
    }
}
// Puzzleboard.prototype.canvswidth = function();
// var a=[['+',2,2,'x'],[2,0,0,0],[2,0,'o',0],[2,0,0,0]];
// console.log(a);
// puz = new Puzzleboard(a);
// puz.solve();
// console.log(puz.offset());
// console.log(puz.board);
// console.log(puz.toggles);
// console.log(puz.solution);


function initialize() {
    // Register an event listener to call the resizeCanvas() function 
    // each time the window is resized.
    window.addEventListener('resize', resizeCanvas, false);
    // Draw canvas border for the first time.
    resizeCanvas();
}

// ctx.fillRect(0, 0, 150, 75);

// Display custom canvas. In this case it's a blue, 5 pixel 
// border that resizes along with the browser window.
function redraw() {
    xs = window.innerWidth;
    ys = window.innerHeight;
    ctx.strokeStyle = outlinecolor;
    ctx.fillStyle = palette[0];
    ctx.fillRect(0, 0, 150, 75);
}

// Runs each time the DOM window resize event fires.
// Resets the canvas dimensions to match window,
// then draws the new borders accordingly.
function resizeCanvas() {
    htmlCanvas.width = Math.floor(window.innerWidth);
    htmlCanvas.height = Math.floor(window.innerHeight);
    redraw();
}

// Listen and Draw
initialize();
