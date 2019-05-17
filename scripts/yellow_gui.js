var htmlCanvas = document.getElementById('c');
var buttonrandboard = document.getElementById('randomboardbutton');
var inputmodulus = document.getElementById('colorsinput');
var inputrows = document.getElementById('rowsinput');
var inputcols = document.getElementById('colsinput');
var inputdensity = document.getElementById('densityinput');
var inputinrad = document.getElementById('inradinput');
var inputoutrad = document.getElementById('outradinput');

//graphics context for drawing.
var ctx = htmlCanvas.getContext('2d');
var outlinecolor = '#81726A';
var spacecolor = '#5C6D6A'//'#50514F'; //'#5C6D6A'
var whitecolor = '#F4E5D4';
// palette = 50514F
var basepalette = ['#AFD0D6', '#E1D89F', '#C49799', '#B6C4A2', '#697593','#68575C','#EFA48F','#ABA7BC','#9E8D78'];
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
        this.strokesize = null;
        this.origx = null;
        this.origy = null;
        this.palette = basepalette;
        while( this.palette.length < modulus){
            this.palette.push(getRandomColor());
        }
    }
}

Puzzleboardgui.prototype.paint_brick =function( row, col){
    const c = puz.state[row][col]
    const xat = puz.origx + col * puz.bricksize;
    const yat = puz.origy + row * puz.bricksize;
    ctx.beginPath();
    ctx.rect( xat, yat, puz.bricksize, puz.bricksize);
    ctx.fillStyle = puz.palette[c];
    ctx.fill();
    ctx.lineWidth = puz.strokesize;
    ctx.strokeStyle = outlinecolor;
    ctx.stroke();
}

Puzzleboardgui.prototype.paint_wall = function( row, col){
    const xat = puz.origx + col * puz.bricksize;
    const yat = puz.origy + row * puz.bricksize;
    ctx.beginPath();
    ctx.rect( xat, yat, puz.bricksize, puz.bricksize);
    ctx.fillStyle = spacecolor;
    ctx.fill();
    ctx.lineWidth = puz.strokesize;
    ctx.strokeStyle = outlinecolor;
    ctx.stroke();
}

Puzzleboardgui.prototype.paint_plus = function( row, col){
    this.paint_wall(row,col);
    const x0 = puz.origx + col * puz.bricksize;
    const y0 = puz.origy + row * puz.bricksize;
    const x1 = x0 + puz.bricksize;
    const y1 = y0 + puz.bricksize;
    const t = .75;
    ctx.beginPath();
    ctx.moveTo((x0 + x1) / 2, t * y0 + (1 - t) * y1);
    ctx.lineTo((x0 + x1) / 2, (1 - t) * y0 + t * y1);
    ctx.strokeStyle = whitecolor;
    ctx.lineWidth = 2*puz.strokesize;
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(t * x0 + (1 - t) * x1, (y0 + y1) / 2);
    ctx.lineTo((1 - t) * x0 + t * x1, (y0 + y1) / 2);
    ctx.strokeStyle = whitecolor;
    ctx.lineWidth = 2*puz.strokesize;
    ctx.stroke();
}

Puzzleboardgui.prototype.paint_ex = function( row, col){
    this.paint_wall(row,col);
    const x0 = puz.origx + col * puz.bricksize;
    const y0 = puz.origy + row * puz.bricksize;
    const x1 = x0 + puz.bricksize;
    const y1 = y0 + puz.bricksize;
    const t = .75;
    ctx.beginPath();
    ctx.moveTo(t * x0 + (1 - t) * x1, t * y0 + (1 - t) * y1);
    ctx.lineTo((1 - t) * x0 + t * x1, (1 - t) * y0 + t * y1);
    ctx.strokeStyle = whitecolor;
    ctx.lineWidth = 2*puz.strokesize;
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(t * x0 + (1 - t) * x1, t * y1 + (1 - t) * y0);
    ctx.lineTo((1 - t) * x0 + t * x1, (1 - t) * y1 + t * y0);
    ctx.strokeStyle = whitecolor;
    ctx.lineWidth = 2*puz.strokesize;
    ctx.stroke();
}

Puzzleboardgui.prototype.paint_oo = function( row, col){
    this.paint_wall(row,col);
    const x0 = puz.origx + col * puz.bricksize;
    const y0 = puz.origy + row * puz.bricksize;
    const x1 = x0 + puz.bricksize;
    const y1 = y0 + puz.bricksize;
    const t = .75;
    ctx.beginPath();
    ctx.rect( t * x0 + (1 - t) * x1, t * y0 + (1 - t) * y1, (2*t-1)*puz.bricksize, (2*t-1)*puz.bricksize);
    ctx.strokeStyle = whitecolor;
    ctx.lineWidth = 2*puz.strokesize;
    ctx.stroke();
}

Puzzleboardgui.prototype.paint_board = function(){
    const rows = this.shape[0];
    const cols = this.shape[1];
    for (var row=0; row<rows; row++){
        for(var col=0; col<cols; col++){
            const ent = puz.board[row][col];
            // palette[ent];
            if (ent =='-'){
                this.paint_wall(row,col);
            } else if (ent =='+'){
                this.paint_plus(row,col);
            } else if (ent =='x'){
                this.paint_ex(row,col);
            } else if (ent =='o'){
                this.paint_oo(row,col);
            } else {
                this.paint_brick(row,col,ent);
            }
        }
    }
}

Puzzleboardgui.prototype.repaint = function(event){
    var self = this;
    bb = this.bricksize;
    ox = self.origx;
    oy = self.origy;
    rows = self.shape[0];
    cols = self.shape[1];
    atx = event.clientX - htmlCanvas.getBoundingClientRect().left;
    aty = event.clientY - htmlCanvas.getBoundingClientRect().top;
    bd = self.board
    col = Math.floor( (atx-ox) / bb );
    row = Math.floor(( aty-oy) / bb );
    console.log("origin: {0}, {1} clicked {2}, {3} hit {4}, {5} brick {6}".format(ox,oy,atx,aty,col,row,bb));
    inxrange = (0<=col)&&(col<=cols);
    inyrange = (0<=row)&&(row<=rows);
    if(inxrange&&inyrange){
        ent = bd[row][col];
        if(togglesyms.includes(ent)){
            to_retouch = self.action_effects(row,col);
            self.generator_act(row,col,to_retouch);
            to_retouch.forEach(function(at){
                self.paint_brick(at[0], at[1]);
            });
        }
    }
}

Puzzleboardgui.prototype.resize = function(canvasx, canvasy){
    ctx.beginPath();
    ctx.rect( 0, 0, canvasx, canvasy);
    ctx.fillStyle = spacecolor;
    ctx.fill();
    this.strokesize = Math.max(1,Math.floor(this.bricksize / 60));
    const rows = puz.shape[0];
    const cols = puz.shape[1];
    const brickx = Math.floor( htmlCanvas.width / cols);
    const bricky = Math.floor( htmlCanvas.height / rows);
    this.bricksize = Math.min( brickx, bricky);
    this.origx = Math.floor((canvasx - cols * this.bricksize)/2);
    this.origy = Math.floor((canvasy - rows * this.bricksize)/2);
    var self = this;
}

aa = [[0,0,0,0,0,0],[0,0,'x',0,0,0],[0,0,0,'+',0,0],[0,0,0,0,0,'o'],[0,0,0,0,0,0]];
puz = new Puzzleboardgui(aa);

function initialize() {
    window.addEventListener('resize', resizeCanvas, false);
    htmlCanvas.addEventListener('click', e => puz.repaint(e), false);
    buttonrandboard.addEventListener('click', randomBoardClick, false);
    // buttonrandomboard.addEventListener('click', function(){console.log(424242)}, false);
    resizeCanvas();
}

function resizeCanvas() {
    htmlCanvas.width = window.innerWidth;
    htmlCanvas.height = window.innerHeight;
    puz.resize(htmlCanvas.width, htmlCanvas.height);
    puz.paint_board();
}

function randomBoardClick() {
  puz.new_random_board( x_dim = parseInt(inputcols.value,10),
    y_dim = parseInt(inputrows.value,10),
    annulus_radius = [parseInt(inputinrad.value,10), parseInt(inputoutrad.value,10)],
    solved = false,
    density = parseFloat(inputdensity.value),
    offset = -1,
    modulus = parseInt(inputmodulus.value,10)
  );
  resizeCanvas();
    // , y_dim, annulus_radius = [0,0], solved=false, density=1/7, offset=-1, modulus=4 )
}

// Listen and Draw
initialize();
resizeCanvas();
