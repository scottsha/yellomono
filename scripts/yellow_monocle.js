//Require math to run in node
// const math = require('mathjs')

String.prototype.format = function() {
  var formatted = this;
  for (var i = 0; i < arguments.length; i++) {
    var regexp = new RegExp('\\{'+i+'\\}', 'gi');
    formatted = formatted.replace(regexp, arguments[i]);
  }
  return formatted;
};

const getMax = (numbers) => numbers.reduce((a, b) => Math.max(a, b));

function gcd(a,b){
  if (a==0){
    return b;
  } else {
    return gcd( b%a, a);
  }
}

function egcd(a,b){
  if (a==0){
    return [b,0,1];
  } else{
    var t = egcd(b % a, a);
    return [t[0], t[2] - Math.floor(b / a) * t[1], t[1]];
  }
}

function mod_inv(a,n){
  var t = egcd(a,n);
  if (t[0]!=1){
    console.warn('Error!  I do not think {0} is invertible modulo {1} '.format(a,n));
  }else{
    return t[1] % n;
  }
}

function rref_mod( amatrix, modulus){
  const n = modulus;
  var aa = amatrix.slice();
  const row_count = aa.length;
  const col_count = aa[0].length;
  var pivotsfound = 0;
  for(var col=0; col<col_count; col++){
    for (var r=pivotsfound; r<row_count; r++){
      var ent = aa[r][col];
      if (gcd(ent,n)==1){
        var entinv = mod_inv(ent, n);
        var rower = math.mod( math.multiply( entinv,  aa[r] ), n).slice();
        aa[ r ] = aa[ pivotsfound ].slice();
        aa[ pivotsfound ] = rower.slice();
        for (row=0; row<row_count; row++){
          var ent = aa[row][col];
          if(row != pivotsfound && ent!=0){
            aa[row] = math.mod( math.add(aa[row], math.multiply(-ent, rower)), n);
          }
        }
        pivotsfound += 1;
        break;
      }
    }
  }
  return aa;
}

function readrref( mat ){
  const rows = mat.length;
  const cols = mat[0].length;
  var sol = math.zeros([cols-1]);
  var row = 0;
  var col = 0;
  while ((row<rows)&&(col<cols)){
    var ent = mat[row][col];
    if (ent == 1){
      sol[col] = mat[row][cols-1];
      row++;
    }
    col++;
  }
  return sol;  
}

const togglesyms = ['o', '+', 'x', '-'];

function numberify(x){
  if (togglesyms.includes(x)){
    return 0;
  } else {
    return parseInt(x);
  }
}

function action_generators( board ){
  const rows = board.length;
  const cols = board[0].length;
  const vol = rows * cols;
  var toggle_actions = [];
  for(var row=0; row<rows; row++){
    for(var col=0;col<cols;col++){
      var ent = board[row][col];
      if (ent=='+'){
        var b = math.zeros(rows, cols);
        var dirs = [[1, 0], [0, 1], [-1, 0], [0, -1]];
        dirs.forEach( function(dir){
          var at0 = row + dir[0];
          var at1 = col + dir[1];
          while(0<=at0 && at0<rows && 0<=at1 &&at1<cols&& !(togglesyms.includes(board[at0][at1]))){
            b.subset( math.index(at0,at1), 1);
            at0 = at0 + dir[0];
            at1 = at1 + dir[1];
          }
        });
        toggle_actions.push(b.reshape([vol]));
      }else if(ent == 'x'){
        var b = math.zeros(rows, cols);
        var dirs = [[1, 1], [-1, 1], [-1, -1], [1, -1]];
        dirs.forEach( function(dir){
          var at0 = row + dir[0];
          var at1 = col + dir[1];
          while(0<=at0 && at0<rows && 0<=at1 &&at1<cols&& !(togglesyms.includes( board[at0][at1]))){
            b.subset( math.index(at0,at1), 1);
            at0 = at0 + dir[0];
            at1 = at1 + dir[1];
          }
        });
        toggle_actions.push(b.reshape([vol]));
      }else if(ent == 'o'){
        var b = math.zeros(rows, cols);
        var dirs = [[1,0],[1, 1],[0,1],[-1,1],[-1,0], [-1, -1], [0, -1], [1,-1]];
        dirs.forEach( function(dir){
          var at0 = row + dir[0];
          var at1 = col + dir[1];
          if(0<=at0 && at0<rows && 0<=at1 &&at1<cols&& !(togglesyms.includes(board[at0][at1]))){
            b.subset( math.index(at0,at1), 1);
          }
        });
        toggle_actions.push(b.reshape([vol]));
      }
    }
  }
  toggle_actions = math.matrix(toggle_actions);
  toggle_actions = math.transpose(toggle_actions);
  return toggle_actions;
}

function random_board( x_dim, y_dim, annulus_radius = [0,0], solved=false, density=1/7, offset=-1, modulus=4 ){
  var bd = math.zeros(y_dim, x_dim)._data;
  // Add toggles in random locations
  const nspec = math.floor(x_dim * y_dim * density);
  for (var foo=0; foo<nspec; foo++){
    var a = math.floor(math.random() * x_dim);
    var b = math.floor(math.random() * y_dim);
    var c = math.floor(math.random()* 3);
    bd[b][a] = togglesyms[c];
  }
  // Turn all squares outside the annulus to walls
  if(annulus_radius[0]>0){
    var cx = (x_dim-1)/2;
    var cy = (y_dim-1)/2;
    var r = annulus_radius[0];
    for(var row=0;row<y_dim;row++){
      for(var col=0;col<x_dim; col++){
        if( (col-cx)**2 + (row-cy)**2 <= r**2 ){
          bd[row][col] = '-';
        }
      }
    }
  }
  if(annulus_radius[1]>0){
    var cx = (x_dim-1)/2;
    var cy = (y_dim-1)/2;
    var r = annulus_radius[1];
    for(var row=0;row<y_dim;row++){
      for(var col=0;col<x_dim; col++){
        if( (col-cx)**2 + (row-cy)**2 >= r**2 ){
          bd[row][col] = '-';
        }
      }
    }
  }
  if(!solved){
    var actgen = action_generators( bd );
    const num_toggles = actgen._size[1];
    const randsol = math.floor( math.multiply(math.random([num_toggles, 1]),modulus) );
    var state = math.mod( math.multiply(actgen, randsol), modulus).reshape([y_dim, x_dim]);
    if(offset == -1){
      offset = math.floor(math.random()*modulus);
    }
    state = math.mod( math.add(state, offset), modulus);
    for(var row=0;row<y_dim;row++){
      for(var col=0;col<x_dim; col++){
        const ent = bd[row][col];
        if( !togglesyms.includes(ent) ){
          bd[row][col] = state._data[row][col];
        }
      }
    }
  }
  return bd
}



class Puzzleboard {
  constructor(board = null, modulus = 4){
    // var that = this;
    this.board = board;
    this.modulus = modulus;
    this.shape = null;
    this.volume = null;
    this.pluses = null;
    this.exes = null;
    this.oos = null;
    this.toggles = null;
    this.walls = null;
    this.state = null;
    this.solution = null;
    this.solution_warning = null;
    this.action_matrix = null;
    this.nontoggles = null;
    if( this.board != null){
      this.read_board();
      this.make_action_matrix();
    }
  }
}

Puzzleboard.prototype.read_board = function( symbol_order = null){
  this.solution = null;
  this.solution_warning = null;
  this.action_matrix = null;
  if(symbol_order!=null){
  } else {
    board = this.board;
  }
  const rows =board.length;
  const cols = board[0].length;
  this.shape = [ rows, cols];
  var pluses = [];
  var oos = [];
  var exes = [];
  var walls = [];
  var nontog = math.zeros( rows, cols);
  for (var row=0; row<rows; row++){
    for(var col=0; col<cols; col++){
      const ent = board[row][col];
      if( ent == '+' ){
        pluses.push([row,col]);
      } else if( ent == 'o' ){
        oos.push([row,col]);
      } else if( ent == 'x' ){
        exes.push([row,col]);
      } else if( ent == '-' ){
        walls.push([row,col]);
      } else {
        nontog._data[row][col]=1;
      }
    }
  }
  this.nontoggles = nontog._data;
  this.pluses = pluses;
  this.exes = exes;
  this.oos = oos;
  this.toggles = oos.concat(pluses.concat(exes));
  this.walls = walls;
  this.state = board.map( x => x.map(numberify) );
  this.volume = rows * cols;
}

Puzzleboard.prototype.action_effects = function( row, col){
  const bd = this.board;
  const ent = bd[row][col];
  const rows = this.shape[0];
  const cols = this.shape[1];
  var acton = [];
  if (ent=='+'){
    var dirs = [[1, 0], [0, 1], [-1, 0], [0, -1]];
    dirs.forEach( function(dir){
      var at0 = row + dir[0];
      var at1 = col + dir[1];
      while(0<=at0 && at0<rows && 0<=at1 &&at1<cols&& !(togglesyms.includes(board[at0][at1]))){
        acton.push([at0,at1]);
        at0 = at0 + dir[0];
        at1 = at1 + dir[1];
      }
    });
  }else if(ent == 'x'){
    var dirs = [[1, 1], [-1, 1], [-1, -1], [1, -1]];
    dirs.forEach( function(dir){
      var at0 = row + dir[0];
      var at1 = col + dir[1];
      while(0<=at0 && at0<rows && 0<=at1 &&at1<cols&& !(togglesyms.includes( board[at0][at1]))){
        acton.push([at0,at1]);
        at0 = at0 + dir[0];
        at1 = at1 + dir[1];
      }
    });
  }else if(ent == 'o'){
    var dirs = [[1,0],[1, 1],[0,1],[-1,1],[-1,0], [-1, -1], [0, -1], [1,-1]];
    dirs.forEach( function(dir){
      var at0 = row + dir[0];
      var at1 = col + dir[1];
      if(0<=at0 && at0<rows && 0<=at1 &&at1<cols&& !(togglesyms.includes(board[at0][at1]))){
        acton.push([at0,at1]);
      }
    });
  }
  return acton;
}

Puzzleboard.prototype.make_action_matrix = function(){
  const rows = this.shape[0];
  const cols = this.shape[1];
  const volume = this.volume;
  togs = this.toggles;
  var tognum = 0;
  var mat = math.zeros( this.volume, togs.length);
  var self = this;
  togs.forEach( function(tog){
    var b = math.zeros(rows, cols);
    const acton = self.action_effects(tog[0],tog[1]);
    acton.forEach( function(actor){
      b.subset( math.index(actor[0],actor[1]), 1);
    });
    b.reshape([volume,1]);
    mat.subset( math.index(math.range(0,volume), tognum), b);
    tognum++;
  });
  this.action_matrix = mat;
}

Puzzleboard.prototype.toggle_act = function(row, col, effects=null){
  if(effects==null){
    effects = this.action_effects(row,col);
  };
  s = this.state;
  modulus = this.modulus;
  effects.forEach(function(actor){
    ent = s[actor[0]][actor[1]];
    ent2 = (ent+1) % modulus; 
    s[actor[0]][actor[1]]= ent2;
  });
}

Puzzleboard.prototype.new_random_board = function( x_dim, y_dim, annulus_radius = [0,0], solved=false, density=1/7, offset=-1, modulus=4 ){
  bd = random_board(x_dim, y_dim, annulus_radius, solved, density, offset, modulus);
  this.board = bd;
  this.modulus = modulus;
  this.read_board();
}

Puzzleboard.prototype.random_toggle = function(offset = -1){
  rows = this.shape[0];
  cols = this.shape[1];
  modulus = this.modulus;
  actgen = this.action_matrix;
  if (actgen==null){
    this.make_action_matrix();
    actgen = this.action_matrix;
  }
  bd = this.board;
  const num_toggles = actgen._size[1];
  const randsol = math.floor( math.multiply(math.random([num_toggles, 1]),modulus) );
  var state = math.mod( math.multiply(actgen, randsol), modulus).reshape([rows, cols]);
  if(offset == -1){
    offset = math.floor(math.random()*modulus);
  }
  state = math.mod( math.add(state, offset), modulus);
  for(var row=0;row<rows;row++){
    for(var col=0;col<cols; col++){
      const ent = bd[row][col];
      if( !togglesyms.includes(ent) ){
        bd[row][col] = state._data[row][col];
      }
    }
  }
  this.read_board();
}

Puzzleboard.prototype.offset = function(){
  mat = this.action_matrix;
  if (mat ==null){
    this.make_action_matrix();
    mat = this.action_matrix;
  }
  rows = this.shape[0];
  cols = this.shape[1];
  tognum = this.toggles.length;
  bd = this.board;
  state = this.state;
  const colsummer = math.ones(tognum, 1);
  var colsum = math.multiply(mat, colsummer);
  colsum.reshape([rows,cols]);
  var unshakable = [];
  var offset = math.zeros(rows, cols);
  for(var row=0;row<rows;row++){
    for(var col=0;col<cols;col++){
      ent = bd[row][col];
      hits = colsum._data[row][col]; 
      if (!togglesyms.includes(ent)){
        offset._data[row][col] = 1;
        if(hits==0){
          unshakable.push(state[row][col]);
        }
      }
    }  
  }
  cantshake = new Set(unshakable);
  if( cantshake.size > 1){
    console.warn("Unsolvable! Multiple values occur outside of the toggle affectable area.");
    return offset;
  } else if (cantshake.size == 0){
   return offset; 
  } else {
    offset = math.multiply(unshakable[0], offset);
    return offset._data;
  }
}

Puzzleboard.prototype.solve = function(){
  if (this.board == null){
    this.solution = null;
  } else {
    var vol = this.volume;
    // var offset = this.offset();
    var mat = this.action_matrix;
    if (mat == null){
      this.make_action_matrix();
      mat = this.action_matrix;
    }
    var modulus = this.modulus;
    var num_toggles = this.toggles.length;
    var state = this.state;
    var state_vec = math.reshape(state, [vol, 1]);
    var nontog = this.nontoggles;
    var nontog_vec = math.reshape(nontog, [vol, 1]);
    var aa = math.concat(mat, nontog_vec, state_vec);
    var bb = rref_mod(aa._data, modulus);
    refsol = readrref(bb);
    offset = refsol.pop();
    if (num_toggles==1){
      refsol = [refsol];
    }
    var sol = math.mod( math.multiply(refsol, -1), modulus);
    this.solution = math.reshape(sol, [sol.length]);
    //This rest of this nonsense is just double checking. Could just check rref...
    var act = math.reshape(math.multiply(mat,sol),[vol,1]);
    var residue = math.mod( math.add(act, state_vec), modulus);
    var shouldsee = math.multiply(offset, nontog_vec);
    var errin = getMax(math.abs(math.subtract(residue, shouldsee))._data);
    if(errin>0){
      this.solution_warning=true;
      console.warn("Solution may not exist. Check board. Solution is only a simplification.");
    }
  }
}

Puzzleboard.prototype.generator_act = function( row, col, effects = null){
  if (effects == null){
    effects = this.action_effects(row,col);
  }
  var self = this;
  effects.forEach(function(acton){
    was = (self.state[acton[0]][acton[1]] + 1) % self.modulus;
    self.state[acton[0]][acton[1]] = was;
  });
}

Puzzleboard.prototype.string_read_board = function( board_string, symbol_order){
  var bd;
  var sym;
  if (board_string.includes(',')){
    sym = symbol_order.split(',');
    bd = board_string.split('\n').map( x=>x.split(','));
  } else {
    sym = symbol_order.split('');
    bd = board_string.split('\n').map( x=>x.split(''));
  }
  this.modulus = sym.length;
  var dict = {};
  for(var foo = 0; foo<sym.length; foo++){
    dict[ sym[foo] ] = foo;
  }
  for(var foo = 0; foo<togglesyms.length; foo++){
    dict[ togglesyms[foo] ] = togglesyms[foo];
  }
  var bd2 = bd.map(x=>x.map(x=>dict[x]))
  this.board = bd2;
  this.read_board();
  this.make_action_matrix();
}

Puzzleboard.prototype.string_write_board = function(symbol_order){
  var aa = "";
  var rows = this.shape[0];
  var cols = this.shape[1];
  var bd = this.board;
  var st = this.state;
  for (var row=0; row<rows; row++){
    for (var col=0; col<cols; col++){
      var ent = bd[row][col];
      if (togglesyms.includes(ent)){
        aa+=ent;
      } else {
        aa+=symbol_order[st[row][col]];
      }
    }
    aa+='\n'
  }
  return aa;
}

stringifymat = function(mat){
  var aa = "";
  var rows = mat.length;
  var cols = mat[0].length;
  for (var row=0; row<rows; row++){
    for (var col=0; col<cols; col++){
      var ent = mat[row][col];
      if (togglesyms.includes(ent)){
        aa+=ent;
      } else {
        aa+=ent.toString();
      }
    }
    aa+='\n'
  }
  return aa;
}

//Example Usage
// var a=[['+',2,2,'x'],[2,0,0,0],[2,0,'o',0],[2,0,0,0]];
// // console.log(a);
// puz = new Puzzleboard(a);
// console.log(puz.state);
// puz.generator_act(0,3);
// console.log(puz.action_effects(0,3));
// console.log(puz.state);
// puz.solve();




//----------WHATS GOING WRONG-------------//
// // a = "---------wwwwwx+wwwwwww---------\n--------+wwxwwwwwxx+wwww--------\n-------owwwwwwwwwwwwww+ww-------\n------wwwwowwwwowxww+oo+ww------\n-----wwwwwwwwwwxo+wwwowwwww-----\n----wxwwwwww+wwwww+wwwwwwwww----\n---wxxwxwwwwwwxw+wwxwwwwowxw+---\n--+oxxwowwwwwwwwwwwowwwwwwwwww--\n-+xwwwwwwwwwwwwwwwwwwwwww+w+wwx-\n+wwwwwwwwwwww+wwwwwwwwwwwwwwwwww\nwww++owww+wwww+wwwxww+wwwwwwwwww\nwwwwwwwwwww+w------wwwwxww+xwwo+\nwwwwwwwowwww--------wwww+wwwwwww\nwwwwwwww+ww----------wwowwwwxwww\nxww+wwwwwww----------wwwwwww+wxw\nwowwwwwwwxw----------wwwwwwwwwx+\nw+wwww++www----------wxw+wwwwwww\nwwwwwwwwwww----------wwxxxww+www\nwwwowwwwwww----------wwwwo+www+w\nww+wxowwowww--------wwwwwwwxwwww\nwwwwwwoww+oww------xwwwwwwwwwwww\nwxwxwwoxwxwwx++ww+wwwwwwwwwowwww\nxwwwx+wwwwwowwwwwwowwwwwwwww+www\n-xwwowwwwwwwww+wwwwwwwoowxwwwww-\n--+wwwwwowwwow+wwowwwwxwwwwwx+--\n---wwwww+wxwwwwxwwwwwwwwwwwoo---\n----wwwww+wwwwwwwwwwwwwwwwww----\n-----ww+wwwwwwwww+wwww+wwww-----\n------ow+wwwwwwowwwwwwwwow------\n-------xww+wwwwwowwxwwwww-------\n--------wwwwwowww+wwxwww--------\n---------www+xwwwwwwxww---------";

// // // a = "yrrrry\nxgorry\nobgg+r\nowwg+r"
// puz = new Puzzleboard();
// // // puz.string_read_board(a,'byrgw');
// puz.new_random_board(18,20,[0,12],false,.15,-1,13);
// console.log( puz.modulus );
// console.log( puz.volume );
// console.log( puz.shape );
// puz.make_action_matrix();
// // console.log( puz.action_matrix );
// puz.random_toggle();
// puz.solve();
// console.log(puz.solution);

// math.reshape(math.multiply(mat,sol),[vol,1])
// puz.solve();
// console.log(puz.solution);
// puz.random_toggle();



// b = puz.string_write_board('wgry');
// // seethis = math.concat( math.mod(math.multiply(-1,puz.truetoggle),7), math.transpose([puz.solution]));
// // console.log(seethis);

// // // console.log(seethis)
// // // console.log(puz.string_write_board('0123'))
// // // console.log(puz.rrefresult);
// // // console.log(puz.state);
// // // console.log(seethis);

// const fs = require('fs');
// fs.writeFile('C:\\Users\\ScotSh03\\Documents\\sandbox\\yellomono\\test0.txt', b, function(err) { //+'\n'+stringifymat(math.transpose(puz.truetoggle))
//     if(err) {
//         return console.log(err);
//     }

//     console.log("The file was saved!");
// }); 

// fs.writeFile('C:\\Users\\ScotSh03\\Documents\\sandbox\\yellomono\\test.txt', stringifymat(puz.rrefresult), function(err) { //+'\n'+stringifymat(math.transpose(puz.truetoggle))
//     if(err) {
//         return console.log(err);
//     }

//     console.log("The file was saved!");
// }); 

// // const fs = require('fs');
// fs.writeFile('C:\\Users\\ScotSh03\\Documents\\sandbox\\yellomono\\test2.txt', stringifymat(seethis), function(err) { //+'\n'+stringifymat(math.transpose(puz.truetoggle))
//     if(err) {
//         return console.log(err);
//     }

//     console.log("The file was saved!");
// }); 