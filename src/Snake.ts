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
  Head,
  Apple,
}

function distance(a: Point, b: Point): number {
  return Math.sqrt(Math.pow(a.x - b.x, 2) + Math.pow(a.y - b.y, 2));
}

export class Snake {
  height: number;
  width: number;
  snake: Point[]
  apple: Point
  status: "running" | "won" | "lost" = "running"
  steps = 0
  totalDistanceToApple = 0
  constructor(
    width: number,
    height: number,
  ) {
    this.width = width
    this.height = height
    this.snake = [
      { x: 1, y: 0 },
      { x: 0, y: 0 },
    ];
    this.apple = { x: Math.floor(width / 2), y: Math.floor(height / 2) };
  }

  static getEmptyBoard(width: number, height: number) {
    return new Array(height)
      .fill(0)
      .map(() => new Array(width).fill(Cell.Empty))
  }

  render(): Cell[][] {
    const board = Snake.getEmptyBoard(this.width, this.height);
    for (const item of this.snake) {
      board[item.y][item.x] = Cell.Snake;
    }
    const head = this.snake[this.snake.length - 1]
    board[head.y][head.x] = Cell.Head;
    board[this.apple.y][this.apple.x] = Cell.Apple;
    return board
  }


  step(
    dir: Direction
  ) {
    const direction = directions[dir];
    const head = {
      x: this.snake[this.snake.length - 1].x + direction.x,
      y: this.snake[this.snake.length - 1].y + direction.y,
    };
    this.steps++
    this.totalDistanceToApple += distance(head, this.apple);
    this.snake.splice(0, 1);

    if (
      this.snake.find((e) => e.x === head.x && e.y === head.y) ||
      (head.x < 0 || this.width <= head.x) ||
      (head.y < 0 || this.height <= head.y)
    ) {
      this.status = "lost";
      return
    }
    this.snake.push(head);
    if (this.snake.length === this.width * this.height) {
      this.status = "won"
      return
    }

    if (head.x === this.apple.x && head.y === this.apple.y) {
      this.snake.unshift({ ...this.snake[0] });
      do {
        this.apple = {
          x: Math.floor(Math.random() * this.width),
          y: Math.floor(Math.random() * this.height),
        };
      } while (this.snake.find((e) => e.x === this.apple.x && e.y === this.apple.y));
    }
    return
  }

}


export class SnakeAI {
  game: Snake
  availableDirections: { [key in "full" | "improved"]: Point[][] | undefined }
  totalDecisionTime = 0
  constructor(game: Snake) {
    this.game = game
    this.availableDirections = { full: undefined, improved: undefined }
  }
  bestStep(mode: "full" | "improved", heuristic: "random" | "euclidian" | "bfs" | "a-star"): Direction {
    const startTime = performance.now()
    let result = "w" as Direction
    const head = this.game.snake[this.game.snake.length - 1]
    const newSnake = this.game.snake.slice(1, -1)
    const availableDirection = this.getAllowedDirections(head.x, head.y, mode)
    let bestDirecion: Point = { x: 0, y: 0 }
    if (availableDirection.x === 0 || availableDirection.y === 0) {
      bestDirecion = availableDirection
    } else {
      const newHead1 = { x: head.x + availableDirection.x, y: head.y }
      const newHead2 = { x: head.x, y: head.y + availableDirection.y }
      if (newSnake.find((e) => e.x === newHead1.x && e.y === newHead1.y)) bestDirecion = { x: 0, y: availableDirection.y }
      else if (newSnake.find((e) => e.x === newHead2.x && e.y === newHead2.y)) bestDirecion = { x: availableDirection.x, y: 0 }
      else if (heuristic === "random") {
        bestDirecion = Math.random() > .5 ? { x: availableDirection.x, y: 0 } : { x: 0, y: availableDirection.y }
      }
      else if (heuristic === "euclidian") {
        const newHead1Distance = distance(newHead1, this.game.apple)
        const newHead2Distance = distance(newHead2, this.game.apple)
        if (newHead1Distance < newHead2Distance) {
          bestDirecion = { x: availableDirection.x, y: 0 }
        } else if (newHead1Distance > newHead2Distance) {
          bestDirecion = { x: 0, y: availableDirection.y }
        } else {
          bestDirecion = Math.random() > .5 ? { x: availableDirection.x, y: 0 } : { x: 0, y: availableDirection.y }
        }
        console.log({ head, bestDirecion, newHead1Distance, newHead1, newHead2Distance, newHead2 })
      } else if (heuristic === "bfs") {
        const bfs = (newHead: Point, apple: Point) => {
          const visited = new Set()
          const queue: [Point, number][] = [[newHead, 0]]
          while (queue.length > 0) {
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            const [current, dist] = queue.shift()!
            if (current.x === apple.x && current.y === apple.y) return dist
            const allowedDirection = this.getAllowedDirections(current.x, current.y, mode)
            const allowedDirections = []
            if (allowedDirection.x !== 0)
              allowedDirections.push({ x: allowedDirection.x, y: 0 })
            if (allowedDirection.y !== 0)
              allowedDirections.push({ x: 0, y: allowedDirection.y })
            const futureSnake = newSnake.slice(dist, -1)
            for (const d of allowedDirections) {
              const newItem = { x: current.x + d.x, y: current.y + d.y }
              if (!visited.has(JSON.stringify(newItem)) && !futureSnake.find((e) => e.x === newItem.x && e.y === newItem.y)) {
                visited.add(JSON.stringify(newItem))
                queue.push([newItem, dist + 1])
              }
            }
          }
          return Infinity
        }
        const newHead1Distance = bfs(newHead1, this.game.apple)
        const newHead2Distance = bfs(newHead2, this.game.apple)
        if (newHead1Distance < newHead2Distance) {
          bestDirecion = { x: availableDirection.x, y: 0 }
        } else if (newHead1Distance > newHead2Distance) {
          bestDirecion = { x: 0, y: availableDirection.y }
        } else {
          bestDirecion = Math.random() > .5 ? { x: availableDirection.x, y: 0 } : { x: 0, y: availableDirection.y }
        }
      }
    }
    if (bestDirecion.x < 0) result = "a"
    if (bestDirecion.x > 0) result = "d"
    if (bestDirecion.y < 0) result = "w"
    if (bestDirecion.y > 0) result = "s"

    const elapsedTime = performance.now() - startTime
    console.log(elapsedTime)
    this.totalDecisionTime += elapsedTime
    return result
  }
  static getEmptyBoard(width: number, height: number) {
    return new Array(height)
      .fill(0)
      .map(() => new Array(width).fill({ x: 0, y: 0 }).map(e => ({ ...e })));
  }

  getAllowedDirections(x: number, y: number, mode: "full" | "improved"): Point {
    const result = { x: 0, y: 0 }
    if (mode === "improved") {
      if (x % 2 === 0)
        result.y = 1
      else
        result.y = -1

      if (y % 2 === 0)
        result.x = -1
      else
        result.x = 1

      if (x === 0 && result.x === -1) result.x = 0
      if (x === this.game.width - 1 && result.x === 1) result.x = 0
      if (y === 0 && result.y === -1) result.y = 0
      if (y === this.game.height - 1 && result.y === 1) result.y = 0
    } else {
      if (y % 2 === 1)
        result.x = 1
      else
        result.x = -1

      if (x === 0) {
        result.y = 1
        result.x = 0
      }
      if (x === this.game.width - 1) {
        if (y % 2 === 1) {
          result.x = 0
          result.y = -1
        }
      }
      if (x === 1 && y !== 0) {
        if (y % 2 === 0) {
          result.x = 0
          result.y = -1
        }
      }
      if (x === 0 && y === this.game.height - 1) {
        result.y = 0
        result.x = 1
      }
    }
    return result
  }

  render(mode: "full" | "improved"): Point[][] {
    if (this.availableDirections[mode]) return this.availableDirections[mode] ?? [[]]
    const result = SnakeAI.getEmptyBoard(this.game.width, this.game.height);

    for (let y = 0; y < this.game.height; y++) {
      for (let x = 0; x < this.game.width; x++) {
        result[y][x] = this.getAllowedDirections(x, y, mode);
      }
    }
    this.availableDirections[mode] = result
    return result
  }
}