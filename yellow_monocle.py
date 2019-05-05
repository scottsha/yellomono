# from typing import Any, Tuple, Union

import numpy as np
import warnings
# import tkinter as tk

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


def rref(m):
    aa = m.copy()
    row_count = aa.shape[0]
    column_count = aa.shape[1]
    pivotsfound = 0
    for col in range(column_count):
        for r in range(pivotsfound, row_count):
            a = aa[r, col]
            if a != 0:
                b = aa[r, :] / a
                aa[r, :] = aa[pivotsfound, :]
                aa[pivotsfound, :] = b
                for row in range(row_count):
                    a = aa[row, col]
                    if a != 0 and row != pivotsfound:
                        aa[row, :] = aa[row, :] - a * b
                pivotsfound += 1
                break
    return aa


def rref_mod(matrix, modulus):
    n = modulus
    aa = matrix.copy()
    row_count = aa.shape[0]
    column_count = aa.shape[1]
    pivotsfound = 0
    for col in range(column_count):
        for r in range(pivotsfound, row_count):
            a = aa[r, col]
            if gcd(a, n) == 1:
                b = (aa[r, :] * mod_inv(a, n)) % n
                aa[r, :] = aa[pivotsfound, :]
                aa[pivotsfound, :] = b
                for row in range(row_count):
                    a = aa[row, col]
                    if gcd(a, n) == 1 and row != pivotsfound:
                        aa[row, :] = (aa[row, :] - a * b) % n
                pivotsfound += 1
                break
    return aa


class PuzzleBoard:
    """
    This is a yellow monocle puzzle board!
    Solver included.
    """
    def __init__(self, board = None, modulus = 4):
        """
        :type board: Numpy array of symbols
        """
        self.board = board
        self.modulus = modulus
        self.pluses = ()
        self.exes = ()
        self.oos = ()
        # ['o', '+', 'x', '-']
        self.toggles = ()
        self.walls = ()
        self.state = ()
        self.shape = ()
        self.solution = ()
        if board is not None:
            self.read_board()

    # def read_board(self):
    def read_board(self, symbol_order = None):
        # {'w': 0, 'y': 1, 'r': 2, 'g': 3}
        if symbol_order is not None:
            aa = [(symbol_order[foo], foo) for foo in range(len(symbol_order))]\
                 + [(foo,foo) for foo in specials]
            symbol_dict = dict(aa)
            symbol_changer = np.vectorize(lambda x: symbol_dict[x])
            board = symbol_changer(self.board)
        else:
            board = self.board
        self.shape = board.shape
        pluses = []
        oos = []
        walls = []
        exes = []
        special_count = 0
        for foo in range(board.shape[0]):
            for bar in range(board.shape[1]):
                ent = board[foo][bar]
                if ent == '+':
                    pluses.append((foo, bar))
                    special_count += 1
                if ent == 'x':
                    exes.append((foo, bar))
                    special_count += 1
                if ent == 'o':
                    oos.append((foo, bar))
                    special_count += 1
                if ent == '-':
                    walls.append((foo, bar))
                    # special_count += 1
        self.pluses = pluses
        self.exes = exes
        self.oos = oos
        # ['o', '+', 'x', '-']
        self.toggles = oos + pluses + exes
        self.walls = walls
        self.state = numberify_vec(board)

    def action_effects(self, x, y):
        board = self.board
        actor = board[x, y]
        acton = []
        if actor == '+':
            for direct in [(1, 0), (0, 1), (-1, 0), (0, -1)]:
                at0 = x + direct[0]
                at1 = y + direct[1]
                while (at0 >= 0 and at0 < board.shape[0]) \
                        and (at1 >= 0 and at1 < board.shape[1]) and board[at0][at1] not in specials:
                    acton.append((at0, at1))
                    at0 = at0 + direct[0]
                    at1 = at1 + direct[1]
        if actor == 'x':
            for direct in [(1, 1), (-1, 1), (1, -1), (-1, -1)]:
                at0 = x + direct[0]
                at1 = y + direct[1]
                while (at0 >= 0 and at0 < board.shape[0]) \
                        and (at1 >= 0 and at1 < board.shape[1]) and board[at0][at1] not in specials:
                    acton.append((at0, at1))
                    at0 = at0 + direct[0]
                    at1 = at1 + direct[1]
        if actor == 'o':
            for direct in [(1, 0), (0, 1), (-1, 0), (0, -1), (1, 1), (-1, 1), (-1, -1), (1, -1)]:
                at0 = x + direct[0]
                at1 = y + direct[1]
                if (at0 >= 0 and at0 < board.shape[0]) and (at1 >= 0 and at1 < board.shape[1]) and board[at0][
                    at1] not in specials:
                    acton.append((at0, at1))
        return acton

    def make_action_matrix(self):
        board = self.board
        ll = board.shape[0] * board.shape[1]
        mat = np.zeros((ll, len(self.toggles)), dtype=int)
        count = 0
        for ent in self.toggles:
            b = np.zeros(board.shape).astype(int)
            for acton in self.action_effects(ent[0], ent[1]):
                b[acton[0]][acton[1]] = 1
            mat[:, count] = b.reshape(ll)
            count += 1
        self.action_matrix = mat

    def generator_act(self, x, y, effects = None):
        if effects is None:
            effects = self.action_effects(x,y)
        for acton in effects:
            self.state[acton[0], acton[1]] = (self.state[acton[0], acton[1]] + 1) % self.modulus

    def make_random_board(self, x_dim, y_dim, density=1 / 5, offset=0, annulus_radius=(0, 0), solved=False):
        bd = (np.zeros((x_dim, y_dim), dtype=int) + offset) % self.modulus
        bd = bd.astype(str)
        nspec = int(x_dim * y_dim * density)
        for foo in range(nspec):
            a = np.random.randint(x_dim)
            b = np.random.randint(y_dim)
            c = np.random.randint(3)
            bd[a, b] = specials[c]
        if annulus_radius[0] > 0:
            cx = (x_dim - 1) / 2
            cy = (y_dim - 1) / 2
            r = annulus_radius[0]
            ats = [(foo, bar) for foo in range(x_dim) for bar in range(y_dim) if
                   (foo - cx) ** 2 + (bar - cy) ** 2 <= r ** 2]
            for at in ats:
                bd[at[0], at[1]] = '-'
        if annulus_radius[1] > 0:
            cx = (x_dim - 1) / 2
            cy = (y_dim - 1) / 2
            r = annulus_radius[1]
            ats = [(foo, bar) for foo in range(x_dim) for bar in range(y_dim) if
                   (foo - cx) ** 2 + (bar - cy) ** 2 >= r ** 2]
            for at in ats:
                bd[at[0], at[1]] = '-'
        self.board = bd
        self.read_board()
        if not solved:
            self.random_act()

    def random_act(self, verbose=False):
        try:
            mat = self.action_matrix
        except AttributeError:
            self.make_action_matrix()
            mat = self.action_matrix
        act_times = np.random.randint(self.modulus, size=(mat.shape[1]))
        if verbose:
            print('Toggling', self.toggles, ' with ', act_times)
        act_was = (mat @ act_times).reshape(self.shape)
        self.state = (self.state + act_was) % self.modulus

    def offset(self):
        try:
            mat = self.action_matrix
        except AttributeError:
            self.make_action_matrix()
            mat = self.action_matrix
        a = mat.sum(axis=1).reshape(self.shape)
        unshakable = []
        offset = np.zeros(self.shape, dtype=int)
        for foo in range(self.shape[0]):
            for bar in range(self.shape[1]):
                ent = self.board[foo, bar]
                hits = a[foo, bar]
                if (ent not in specials):
                    offset[foo, bar] = 1
                    if (hits == 0):
                        unshakable.append(self.state[foo,bar])
        cantshake = set(unshakable)
        if len(cantshake) > 1:
            warnings.warn("Unsolvable! Multiple values occur outside of the toggle-able area.", RuntimeWarning)
        elif len(cantshake) == 0:
            return offset
        else:
            unshake_val = cantshake.pop()
            offset = unshake_val * offset
            return offset

    def solve(self):
        if self.board is None:
            print('The board is null.')
        else:
            offset = self.offset()
            mat = self.action_matrix
            state_offset = (self.state - offset) % self.modulus
            state_v = state_offset.reshape((mat.shape[0], 1))
            aa = np.hstack([mat, state_v])
            bb = rref_mod(aa, self.modulus)
            self.solution = (-bb[0:mat.shape[1], -1]) % self.modulus
            residue = (self.state.reshape(mat.shape[0]) + mat @ self.solution) % self.modulus
            if not (residue.reshape(self.shape) == offset).all():
                warnings.warn("Unsolved. Solution may not exist. Check board. Solution is only a simplification.",
                              RuntimeWarning)


if __name__ == "__main__":
    # lil = np.array([['+',0,0,'x'],[0,0,0,0],[0,0,'o',0],[0,0,0,0]])
    lil = np.array([['2', 'o', '2', '2', '2'],
                    ['2', '2', '2', '2', '2'],
                    ['2', '2', '2', '2', 'o'],
                    ['2', '2', '2', '2', 'x'],
                    ['2', '2', '2', '2', '2']])
    # lil = np.array([['0','o','0','0','0'],
    #  ['0','0','0','0','0'],
    #  ['0','0','0','0','o'],
    #  ['0','0','0','0','x'],
    #  ['0','0','0','0','0']])
    # lil = np.array([[3,3,3],[3,'+',3],[3,3,3]])
    puz = PuzzleBoard(board=lil)
    print(puz.board)
    print()
    print(puz.toggles)
    print()
    print(puz.state)
    puz.random_act(verbose=True)
    # print(puz.board)
    print()
    print(puz.state)
    print()
    print((puz.state - puz.offset()) % puz.modulus)
    # puz = PuzzleBoard()
    # puz.make_random_board( 5, 5, offset=2, annulus_radius = (0,4), solved=False)
    # puz.random_act()
    # print(puz.board)
    # print(puz.state)
    # print(puz.unshakables())
    puz.solve()
    # print(puz.solution)
