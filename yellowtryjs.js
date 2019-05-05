const math = require('mathjs')

String.prototype.format = function() {
  var formatted = this;
  for (var i = 0; i < arguments.length; i++) {
    var regexp = new RegExp('\\{'+i+'\\}', 'gi');
    formatted = formatted.replace(regexp, arguments[i]);
  }
  return formatted;
};

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
      var ent = aa[r][col]
      if (gcd(ent,n)==1){
        var entinv = mod_inv(ent, n);
        var rower = math.mod( math.multiply( entinv,  aa[r] ), n).slice();
        aa[ r ] = aa[ pivotsfound ].slice();
        aa[ pivotsfound ] = rower.slice();
        for (row=0; row<row_count; row++){
          var ent = aa[row][col];
          if(  gcd(ent,n)==1 && row != pivotsfound ){
            // console.log(42)
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

const toggles = ['o', '+', 'x', '-'];

function numberify(x){
  if (toggles.includes(x)){
    return 0;
  } else {
    return parseInt(x);
  }
}

function action_generators( board ){
  const rows = board.length;
  const cols = board[0].length;
  const vol = rows * cols;
  // toggle_entries = [];
  var toggle_actions = [];
  // toggle_counter = 0;
  for(var row=0; row<rows; row++){
    for(var col=0;col<cols;col++){
      var ent = board[row][col];
      if (ent=='+'){
        // console.log('+ entry at {0}{1}'.format(row,col));
        var b = math.zeros(rows, cols);
        var dirs = [[1, 0], [0, 1], [-1, 0], [0, -1]];
        dirs.forEach( function(dir){
          var at0 = row + dir[0];
          var at1 = row + dir[1];
          while(0<=at0 && at0<rows && 0<=at1 &&at1<cols&& !(toggles.includes(board[at0][at1]))){
            b.subset( math.index(at0,at1), 1);
            at0 = at0 + dir[0];
            at1 = at1 + dir[1];
          }
        });
        toggle_actions.push(b.reshape([vol]));
      }else if(ent == 'x'){
        // console.log('x entry at {0}{1}'.format(row,col));
        var b = math.zeros(rows, cols);
        var dirs = [[1, 1], [-1, 1], [-1, -1], [1, -1]];
        dirs.forEach( function(dir){
          var at0 = row + dir[0];
          var at1 = row + dir[1];
          while(0<=at0 && at0<rows && 0<=at1 &&at1<cols&& !(toggles.includes( board[at0][at1]))){
            b.subset( math.index(at0,at1), 1);
            at0 = at0 + dir[0];
            at1 = at1 + dir[1];
          }
        });
        toggle_actions.push(b.reshape([vol]));
      }else if(ent == 'o'){
        // console.log('o entry at {0}{1}'.format(row,col));
        var b = math.zeros(rows, cols);
        var dirs = [[1,0],[1, 1],[0,1],[-1,1],[-1,0], [-1, -1], [0, -1], [1,-1]];
        dirs.forEach( function(dir){
          var at0 = row + dir[0];
          var at1 = row + dir[1];
          var entat = board[at0][at1];
          if(0<=at0 && at0<rows && 0<=at1 &&at1<cols&& !(toggles.includes(entat))){
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

function random_board( x_dim, y_dim, density=1/7, offset=0, annulus_radius = (0,0), solved=false, modulus=4 ){
  var bd = math.zeros(y_dim, x_dim)._data;
  // Add toggles in random locations
  const nspec = math.round(x_dim * y_dim * density);
  for (var foo=0; foo<nspec; foo++){
    var a = math.floor(math.random() * x_dim);
    var b = math.floor(math.random() * y_dim);
    var c = math.floor(math.random()* 3);
    bd[b][a] = toggles[c];
  }
  if(annulus_radius[0]>0){
    var cx = (x_dim-1)/2;
    var cy = (y_dim-1)/2;
    var r = annulus_radius[0];
    for(var row=0;row<y_dim;row++){
      for(var col=0;col<x_dim; col++){
        if( (foo-cx)**2 + (bar-cy)**2 <= r**2 ){
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
        if( (foo-cx)**2 + (bar-cy)**2 >= r**2 ){
          bd[row][col] = '-';
        }
      }
    }
  }
  if(!solved){
    var actgen = action_generators( bd );
    const num_toggles = actgen[0].length;
    const randsol = math.multiply(math.random([num_toggles, 1]),modulus);
    const state = math.modulus( math.multiply(actgen, randsol), modulus).reshape([y_dim, x_dim]);
    for(var row=0;row<y_dim;row++){
      for(var col=0;col<x_dim; col++){
        const ent = bd[row][col];
        if( !toggles.includes(ent) ){
          bd[row][col] = state._data[row][col];
        }
      }
    }
  }
  return bd
}

// ents, acts = self.generate_generators()
// tot_act = np.zeros((x_dim, y_dim))
// for act in acts:
// tot_act = (tot_act + np.random.randint(self.modulus)*act)%self.modulus
// nboard = ( numberify_vec(self.board) + tot_act) % self.modulus
// nboard = nboard.astype(int).astype(str)
// for foo in ents.keys():
// nboard[foo[0],foo[1]] = self.board[foo[0],foo[1]]
// self.board = nboard
// self.newboard()
// class



// a=[[1, 0], [0, 1], [-1, 0], [0, -1]]

// a.forEach( function(foo){

//     console.log(foo)

// });


// ( x_dim, y_dim, density=1/7, offset=0, annulus_radius = (0,0), solved=False, modulus=4 )

// var a = random_board( 2, 3);//, density=1/7, offset=0, annulus_radius = (0,0), solved=False, modulus=4 )
// console.log(a);
// a[0,0]=1;
// console.log(a);
// a._data[0][2] =2;
// console.log(a);
//
var a=[['+',1,1,'x'],[1,3,2,3],[1,0,'o',3],[2,3,3,3]];
console.log(a);
var b = action_generators(a);
console.log(b);
