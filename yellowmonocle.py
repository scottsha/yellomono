import numpy as np
import warnings
import tkinter as tk

specials = ['o', '+', 'x', '-']


def numberify(x):
    if x in specials:
        return 0
    else:
        try:
            return int(x)
        except ValueError:
            return int(float(x))


numberify_vec = np.vectorize(numberify)


def gcd(a, b):
    if a == 0:
        return b
    else:
        return gcd(b % a, a)


def egcd(a, b):
    if a == 0:
        return b, 0, 1
    else:
        g, y, x = egcd(b % a, a)
        return g, x - (b // a) * y, y


def mod_inv(a, n):
    g, x, y = egcd(a, n)
    if g != 1:
        raise Exception('modular inverse does not exist')
    else:
        return x % n


def rref(M):
    A = M.copy()
    rowCount = A.shape[0]
    columnCount = A.shape[1]
    pivotsfound =0
    for col in range(columnCount):
        for r in range(pivotsfound, rowCount):
            a = A[r,col]
            if a !=0:
                b = A[r,:] / a
                A[r,:] = A[pivotsfound, :]
                A[pivotsfound, :] = b
                for row in range(rowCount):
                    a = A[row,col]
                    if a != 0 and row != pivotsfound:
                        A[row,:] = A[row,:] - a * b
                pivotsfound += 1
                break
    return A


def rref_mod(matrix, modulus):
    n=modulus
    A = matrix.copy()
    rowCount = A.shape[0]
    columnCount = A.shape[1]
    pivotsfound =0
    for col in range(columnCount):
        for r in range(pivotsfound, rowCount):
            a = A[r,col]
            if gcd(a,n) ==1:
                b = A[r,:] * mod_inv(a,n)
                A[r,:] = A[pivotsfound, :]
                A[pivotsfound, :] = b
                for row in range(rowCount):
                    a = A[row,col]
                    if gcd(a,n) == 1 and row != pivotsfound:
                        A[row,:] = (A[row,:] - a * b) % n
                pivotsfound += 1
                break
    return A


class PuzzleBoard:
    '''
    This is a yellow monocle puzzle board!
    Solver included.
    '''
    def generate_generators(self):
        board = self.board
        special_entries = {}
        special_action = []
        special_count = 0
        for foo in range(board.shape[0]):
            for bar in range(board.shape[1]):
                ent = board[foo][bar]
                if ent == '+':
                    special_entries[(foo, bar)] = special_count
                    special_count+=1
                    b = np.zeros(board.shape).astype(int)
                    for dir in [(1, 0), (0, 1), (-1, 0), (0, -1)]:
                        at0 = foo + dir[0]
                        at1 = bar + dir[1]
                        while (at0 >= 0 and at0 < board.shape[0]) and (at1 >= 0 and at1 < board.shape[1]) and board[at0][at1] not in specials:
                            b[at0][at1] = 1
                            at0 = at0 + dir[0]
                            at1 = at1 + dir[1]
                    special_action.append(b)
                if ent == 'x':
                    special_entries[(foo, bar)] = special_count
                    special_count+=1
                    b = np.zeros(board.shape).astype(int)
                    for dir in [(1, 1), (-1, 1), (-1, -1), (1, -1)]:
                        at0 = foo + dir[0]
                        at1 = bar + dir[1]
                        while (at0 >= 0 and at0 < board.shape[0]) and (at1 >= 0 and at1 < board.shape[1]) and board[at0][at1] not in specials:
                            b[at0][at1] = 1
                            at0 = at0 + dir[0]
                            at1 = at1 + dir[1]
                    special_action.append(b)
                if ent == 'o':
                    special_entries[(foo, bar)] = special_count
                    special_count+=1
                    b = np.zeros(board.shape).astype(int)
                    for dir in [(1, 0), (0, 1), (-1, 0), (0, -1), (1, 1), (-1, 1), (-1, -1), (1, -1)]:
                        at0 = foo + dir[0]
                        at1 = bar + dir[1]
                        if (at0 >= 0 and at0 < board.shape[0]) and (at1 >= 0 and at1 < board.shape[1]) and board[at0][at1] not in specials:
                            b[at0][at1] = 1
                    special_action.append(b)
                if ent == '-':
                    special_entries[(foo, bar)] = special_count
                    special_count += 1
                    b = np.zeros(board.shape).astype(int)
                    special_action.append(b)
        return special_entries, special_action


    def __init__(self, board = np.array([[]]), modulus=4, ordered_symbols=['r','g','w','y']):
        self.board = board
        self.modulus = modulus
        if board.size>0:
            self.newboard()


    def newboard(self):
        self.shape = self.board.shape
        long_board = self.board.reshape(self.shape[0] * self.shape[1])
        self.state = numberify_vec(self.board)
        self.generator_entries, self.generator_actions = self.generate_generators()
        self.generator_matrix = np.column_stack([foo.reshape(self.shape[0] * self.shape[1]) for foo in self.generator_actions] + [self.state.reshape(self.shape[0] * self.shape[1])])
        self.num_generators = len(self.generator_entries)
        self.solution = []
        # self.final_state = self.state


    def solve(self):
        B = rref_mod(self.generator_matrix, self.modulus)
        self.solution = B[0:self.num_generators, self.num_generators]
        residue = self.state - self.generator_matrix[:, 0:-1] @ self.solution
        self.final_state = residue % self.modulus
        fboard = self.final_state.reshape(self.shape).astype('str')
        for at, act in zip(self.generator_entries.keys(), self.solution):
            fboard[at[0],at[1]] = self.board[at[0],at[1]] + str(act)
        self.final_board = fboard
        if not all([foo==0 for foo in self.final_state]):
            warnings.warn("Unsolved. Solution may not exist. Check board. Solution is only a simplification.", RuntimeWarning)



    def print_instructions(self):
        for at, act in zip(self.generator_entries.keys(), self.solution):
            print('At', at, 'do', act)


    def make_random_board(self, x_dim, y_dim, density=.15, offset=0, annulus_radius = (0,0), solved=False):
        bd = (np.zeros((x_dim, y_dim))+offset)%self.modulus
        bd = bd.astype(str)
        nspec = int(x_dim * y_dim * density)
        for foo in range(nspec):
            a = np.random.randint(x_dim)
            b = np.random.randint(y_dim)
            c = np.random.randint(3)
            bd[a,b] = specials[c]
        if annulus_radius[0]>0:
            cx = (x_dim-1) / 2
            cy = (y_dim-1) / 2
            r = annulus_radius[0]
            ats = [(foo,bar) for foo in range(x_dim) for bar in range(y_dim) if (foo-cx)**2+(bar-cy)**2 <= r**2]
            for at in ats:
                bd[at[0],at[1]] = '-'
        if annulus_radius[1]>0:
            cx = (x_dim-1) / 2
            cy = (y_dim-1) / 2
            r = annulus_radius[1]
            ats = [(foo,bar) for foo in range(x_dim) for bar in range(y_dim) if (foo-cx)**2+(bar-cy)**2 >= r**2]
            for at in ats:
                bd[at[0],at[1]] = '-'
        self.board = bd
        ents, acts = self.generate_generators()
        tot_act = np.zeros((x_dim, y_dim))
        for act in acts:
            tot_act = (tot_act + np.random.randint(self.modulus)*act)%self.modulus
        nboard = ( numberify_vec(self.board) + tot_act) % self.modulus
        nboard = nboard.astype(int).astype(str)
        for foo in ents.keys():
            nboard[foo[0],foo[1]] = self.board[foo[0],foo[1]]
        self.board = nboard
        self.newboard()


    def generator_act(self, entry):
        entrth = self.generator_entries[entry]
        action = self.generator_actions[entrth]
        newboard = ( numberify_vec(self.board) + action ) % self.modulus
        self.state = newboard
        nboard = newboard.astype('str')
        for foo in self.generator_entries.keys():
            nboard[foo[0],foo[1]] = self.board[foo[0],foo[1]]
        self.board = nboard


if __name__ == "__main__":
    # aa=np.array([['+',1,1,'x'],[1,3,2,3],[1,0,'o',3],[2,3,3,3]])
    # aa=np.array(aa)
    # print(aa)
    # print()
    # puz = PuzzleBoard(aa)
    # print(puz.board)
    # print()
    # puz.generator_act((0,0))
    # print(puz.board)
    puz = PuzzleBoard()
    puz.make_random_board(6,6,annulus_radius=(1,3))
    print(puz.board)
    print(puz.state)
    print(puz.generator_matrix)
    # print(puz.generator_entries)
    # print(puz.generator_actions)
    # puz.solve()
    # puz.print_instructions()

