export interface Point {
  x: number;
  y: number;
}
export type Direction = "w" | "a" | "s" | "d";

const directions: { [key in Direction]: Point } = {
  w: { x: 0, y: -1 },
  a: { x: -1, y: 0 },
  s: { x: 0, y: 1 },
  d: { x: 1, y: 0 },
};

export enum Cell {
  Empty,
  Snake,
  Apple,
}

export class Snake {
  height: number;
  width: number;
  snake: Point[]
  apple: Point

  constructor(
    width: number,
    height: number,
  ) {
    this.width = width
    this.height = height
    this.snake = [
      { x: 1, y: 1 },
      { x: 2, y: 1 },
    ];
    this.apple = { x: width / 2, y: height / 2 };
  }



  render(): Cell[][] {
    const board = new Array(this.height)
      .fill(0)
      .map(() => new Array(this.width).fill(Cell.Empty));
    for (const item of this.snake) {
      board[item.y][item.x] = Cell.Snake;
    }
    board[this.apple.y][this.apple.x] = Cell.Apple;
    return board
  }


  step(
    dir: Direction
  ) {
    this.snake.splice(0, 1);
    const direction = directions[dir];
    const head = {
      x: this.snake[this.snake.length - 1].x + direction.x,
      y: this.snake[this.snake.length - 1].y + direction.y,
    };
    if (
      this.snake.find((e) => e.x === head.x && e.y === head.y) ||
      (head.x < 0 || this.width <= head.x) ||
      (head.y < 0 || this.height <= head.y)
    ) {
      return true;
    }
    this.snake.push(head);
    if (head.x === this.apple.x && head.y === this.apple.y) {
      this.snake.unshift({ ...this.snake[0] });
      do {
        this.apple = {
          x: Math.floor(Math.random() * this.width),
          y: Math.floor(Math.random() * this.height),
        };
      } while (this.snake.find((e) => e.x === this.apple.x && e.y === this.apple.y));
    }
    return false
  }

}


export class SnakeAI {
  game: Snake
  availableDirections?: Point[][];
  constructor(game: Snake) {
    this.game = game
  }
  bestStep(): Direction {
    return "w"
  }
  render(): Point[][] {
    if (this.availableDirections) return this.availableDirections
    const result = new Array(this.game.height)
      .fill(0)
      .map(() => new Array(this.game.width).fill({ x: 0, y: 0 }).map(e => ({ ...e })));

    for (let y = 0; y < this.game.height; y++) {
      for (let x = 0; x < this.game.width; x++) {
        if (x % 2 === 0) {
          result[y][x].y = 1
        } else {
          result[y][x].y = -1
        }
        if (y % 2 === 0) {
          result[y][x].x = -1
        } else {
          result[y][x].x = 1
        }
        if (x === 0 && result[y][x].x === -1) result[y][x].x = 0
        if (x === this.game.width - 1 && result[y][x].x === 1) result[y][x].x = 0
        if (y === 0 && result[y][x].y === -1) result[y][x].y = 0
        if (y === this.game.height - 1 && result[y][x].y === 1) result[y][x].y = 0
      }
    }
    console.table(result)
    this.availableDirections = result
    return result
  }
}