import tkinter as tk
import numpy as np
import yellow_monocle as ym

outlinecolor = '#81726A'
spacecolor = '#5C6D6A'
whitecolor = '#F4E5D4'
colordict = {0:'#AFD0D6', 1:'#E1D89F', 2:'#C49799', 3:'#B6C4A2'}



class PuzzleBoardGui:
    def __init__(self, board = None, canvas_approx_size = 1000, modulus = 4):
        self.puzzle = ym.PuzzleBoard(board, modulus)
        self.canvas = None
        self.brick_size = 1
        self.canvas_approx_size = canvas_approx_size


    def paint_brick(self, x, y, c):
        canvas = self.canvas
        bb = self.brick_size
        canvas.create_rectangle(x * bb, y * bb, (x + 1) * bb, (y + 1) * bb,
                            fill=colordict[c], outline=outlinecolor)


    def paint_wall(self, x, y):
        canvas = self.canvas
        bb = self.brick_size
        canvas.create_rectangle(x * bb, y * bb, (x + 1) * bb, (y + 1) * bb,
                                fill=spacecolor, outline=outlinecolor)


    def paint_plus(self, x, y):
        canvas = self.canvas
        bb = self.brick_size
        x0 = x * bb
        y0 = y * bb
        x1 = (x + 1) * bb
        y1 = (y + 1) * bb
        canvas.create_rectangle(x0, y0, x1, y1,
                                fill=spacecolor, outline=outlinecolor)
        t = .8
        canvas.create_line((x0 + x1) / 2, t * y0 + (1 - t) * y1, (x0 + x1) / 2, (1 - t) * y0 + t * y1,
                           fill=whitecolor, width=max(bb // 50, 1))
        canvas.create_line(t * x0 + (1 - t) * x1, (y0 + y1) / 2, (1 - t) * x0 + t * x1, (y0 + y1) / 2,
                           fill=whitecolor, width=max(bb // 50, 1))


    def paint_ex(self, x, y):
        canvas = self.canvas
        bb = self.brick_size
        x0 = x * bb
        y0 = y * bb
        x1 = (x + 1) * bb
        y1 = (y + 1) * bb
        canvas.create_rectangle(x0, y0, x1, y1,
                                fill=spacecolor, outline=outlinecolor)
        t = .8
        canvas.create_line(t * x0 + (1 - t) * x1, t * y0 + (1 - t) * y1, (1 - t) * x0 + t * x1,
                           (1 - t) * y0 + t * y1,
                           fill=whitecolor, width=max(bb // 50, 1))
        canvas.create_line(t * x0 + (1 - t) * x1, t * y1 + (1 - t) * y0, (1 - t) * x0 + t * x1,
                           (1 - t) * y1 + t * y0,
                           fill=whitecolor, width=max(bb // 50, 1))


    def paint_oo(self, x, y):
        canvas = self.canvas
        bb = self.brick_size
        x0 = x * bb
        y0 = y * bb
        x1 = (x + 1) * bb
        y1 = (y + 1) * bb
        t = .75
        canvas.create_rectangle(x0, y0, x1, y1,
                                fill=spacecolor, outline=outlinecolor)
        canvas.create_rectangle(t * x0 + (1 - t) * x1, t * y0 + (1 - t) * y1, (1 - t) * x0 + t * x1,
                                (1 - t) * y0 + t * y1,
                                outline=whitecolor, width=max(bb // 50, 1))


    def paint_board(self):
        bd = self.puzzle.board
        for foo in range(bd.shape[0]):
            for bar in range(bd.shape[1]):
                mv = bd[foo, bar]
                if mv == '-':
                    self.paint_wall(foo, bar)
                elif mv == '+':
                    self.paint_plus(foo,bar)
                elif mv == 'x':
                    self.paint_ex(foo,bar)
                elif mv == 'o':
                    self.paint_oo(foo,bar)
                else:
                    ent = self.puzzle.state[foo,bar]
                    self.paint_brick(foo, bar, ent)


    def repainter(self, event):
        bb = self.brick_size
        x, y = event.x, event.y
        xmost = self.puzzle.shape[0]
        ymost = self.puzzle.shape[1]
        print(x, y)
        if 0 <= x and x <= xmost * bb and 0 <= y and y <= ymost * bb:
            matx = int(np.floor(x / bb))
            maty = int(np.floor(y / bb))
            if self.puzzle.board[matx, maty] in ym.specials:
                to_retouch = self.puzzle.action_effects(matx, maty)
                self.puzzle.generator_act(matx, maty, to_retouch)
                for ent in to_retouch:
                    self.paint_brick(ent[0], ent[1], self.puzzle.state[ent[0], ent[1]])
            else:
                print()


    def run(self):
        root = tk.Tk()
        mr_shape = max(self.puzzle.shape)
        self.brick_size = np.floor(self.canvas_approx_size / mr_shape)
        canvasize = mr_shape * self.brick_size
        self.canvas = tk.Canvas(root, width=canvasize, height=canvasize)
        self.paint_board()
        self.canvas.bind("<ButtonRelease-1>", self.repainter)
        self.canvas.pack()
        root.mainloop()


if __name__ == "__main__":
    # lil = np.array([['+',0,0,'x'],[0,0,0,0],[0,0,'o',0],[0,0,0,0]])
    lil = np.array([['2', 'o', '2', '2', '2'],
                    ['2', '2', '2', '2', '2'],
                    ['2', '2', '2', '2', 'o'],
                    ['2', '2', '2', '2', 'x'],
                    ['2', '2', '2', '2', '2']])
    a = PuzzleBoardGui(canvas_approx_size=700)
    # a.puzzle.make_random_board(24,24,annulus_radius=(2,12))
    a.puzzle.make_random_board(25,25,annulus_radius=(2,13),offset=np.random.randint(4))
    a.run()