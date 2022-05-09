<template>
  <div class="app">
    <table class="board" border="1">
      <tr v-for="(item, y) in board" class="row" :key="y">
        <td
          v-for="(cell, x) in item"
          class="cell"
          :key="x"
          :class="{ snake: cell === Cell.Snake, apple: cell === Cell.Apple }"
        >
          <div class="arrow" :class="{
            a: availableSteps[y][x].x < 0,
            d: availableSteps[y][x].x > 0,
          }">
            <font-awesome-icon icon="arrow-circle-up" />
          </div>
          <div class="arrow" :class="{
            w: availableSteps[y][x].y < 0,
            s: availableSteps[y][x].y > 0,
          }">
            <font-awesome-icon icon="arrow-circle-up" />
          </div>
        </td>
      </tr>
    </table>
    <div v-if="lost">Lost!</div>
  </div>
</template>

<script lang="ts">
import { defineComponent, Ref, ref } from "vue";
import { Snake, Cell, Direction, SnakeAI, Point } from "./Snake";
export default defineComponent({
  name: "App",
  components: {},
  setup() {
    let gameLoop: ReturnType<typeof setInterval>;
    const lost = ref(false);
    let dir = "d" as Direction;
    const game = new Snake(10, 10);

    const board: Ref<Cell[][]> = ref(game.render());
    const snakeAI = new SnakeAI(game);
    const availableSteps: Ref<Point[][]> = ref(snakeAI.render());

    gameLoop = setInterval(() => {
      lost.value = game.step(dir);
      if (!lost.value) board.value = game.render();
      else clearInterval(gameLoop);
    }, 500);

    window.addEventListener("keydown", function (e) {
      if (["w", "a", "s", "d"].includes(e.key)) {
        if (
          (dir === "a" && e.key !== "d") ||
          (dir === "d" && e.key !== "a") ||
          (dir === "w" && e.key !== "s") ||
          (dir === "s" && e.key !== "w")
        )
          dir = e.key as Direction;
      }
    });

    return {
      board,
      Cell,
      lost,
      availableSteps
    };
  },
});
</script>

<style lang="scss">
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}
.board {
  border-collapse: collapse;
  border: 1 solid black;
}
.row {
  display: flex;
  align-items: center;
  justify-content: center;
}
.cell {
  width: 50px;
  height: 50px;
  position: relative;
}
.snake {
  background-color: green;
}
.apple {
  background-color: crimson;
}
.arrow {
  position: absolute;
  top: 50%;
  left: 50%;
  height: 50px;
  width: 20px;
  transform: scale(0);
  &.w {
    transform: translate(-50%, -50%) rotate(0deg);
  }
  &.a {
    transform: translate(-50%, -50%) rotate(-90deg);
  }
  &.s {
    transform: translate(-50%, -50%) rotate(180deg);
  }
  &.d {
    transform: translate(-50%, -50%) rotate(90deg);
  }
}
</style>
