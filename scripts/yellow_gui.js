htmlCanvas = document.getElementById('c'),
//graphics context for drawing.
ctx = htmlCanvas.getContext('2d');

outlinecolor = '#81726A';
spacecolor = '#5C6D6A'//'#50514F'; //'#5C6D6A'
whitecolor = '#F4E5D4';
// palette = 50514F 
basepalette = ['#AFD0D6', '#E1D89F', '#C49799', '#B6C4A2', '#697593','#68575C','#EFA48F','#ABA7BC','#9E8D78'];
// basepalette = [ '#247BA0',  '#FFE066', '#F25F5C', '#70C1B3'];


function getRandomColor() {
    var letters = '0123456789ABCDEF';
    var color = '#';
    for (var i = 0; i < 6; i++) {
      color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
}


class Puzzleboardgui extends Puzzleboard {
    constructor(board = null, modulus = 4, bricksize = null) {
        super(board, modulus);
        this.bricksize = bricksize;
        this.origx = null;
        this.origy = null;
        this.palette = basepalette;
        while( this.palette.length < modulus){
            this.palette.push(getRandomColor());
        }
    }
}

aa = [[0,1],[2,3],[4,5],[6,7],[8,9]];
puz = new Puzzleboardgui(aa, modulus = 9);

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
    resizeCanvas();
}

// ctx.fillRect(0, 0, 150, 75);

// Display custom canvas. In this case it's a blue, 5 pixel 
// border that resizes along with the browser window.
function redraw() {
    // xs = window.innerWidth;
    // ys = window.innerHeight;
    const rows = puz.shape[0];
    const cols = puz.shape[1];
    const brickx = Math.floor( htmlCanvas.width / cols);
    const bricky = Math.floor( htmlCanvas.height / rows);
    puz.bricksize = Math.min( brickx, bricky);
    puz.origx = (htmlCanvas.width - cols * puz.bricksize)/2;
    puz.origy = (htmlCanvas.height - rows * puz.bricksize)/2;
    for (var row=0; row<rows; row++){
        for(var col=0; col<cols; col++){
            const ent = puz.board[row][col];
            // palette[ent];
            const xat = puz.origx + col * puz.bricksize;
            const yat = puz.origy + row * puz.bricksize;
            ctx.beginPath();
            ctx.rect( xat, yat, puz.bricksize, puz.bricksize);
            ctx.strokeStyle = outlinecolor;
            ctx.stroke();
            ctx.fillStyle = puz.palette[ent];
            ctx.fill();
        }
    }
}

// Runs each time the DOM window resize event fires.
// Resets the canvas dimensions to match window,
// then draws the new borders accordingly.
function resizeCanvas() {
    htmlCanvas.width = window.innerWidth;
    htmlCanvas.height = window.innerHeight;
    ctx.rect( 0, 0,  htmlCanvas.width, htmlCanvas.height);
    ctx.fillStyle = spacecolor;
    ctx.fill();
    redraw();
}

// Listen and Draw
initialize();
