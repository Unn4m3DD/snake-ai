<template>
  <q-layout view="hHh LpR fFf">
    <q-drawer
      show-if-above
      v-model="leftDrawerOpen"
      side="left"
      behavior="desktop"
      :overlay="true"
      elevated
      :width="400"
    >
      <AIOptions />
    </q-drawer>

    <q-page-container class="game-container">
      <table class="board" border="1">
        <tr v-for="(item, y) in board" class="row" :key="y">
          <td
            v-for="(cell, x) in item"
            class="cell"
            :key="x"
            :class="{ snake: cell === Cell.Snake, apple: cell === Cell.Apple }"
          >
            <div
              class="arrow"
              :class="{
                a: availableSteps[y][x].x < 0,
                d: availableSteps[y][x].x > 0,
              }"
            >
              <font-awesome-icon icon="arrow-circle-up" />
            </div>
            <div
              class="arrow"
              :class="{
                w: availableSteps[y][x].y < 0,
                s: availableSteps[y][x].y > 0,
              }"
            >
              <font-awesome-icon icon="arrow-circle-up" />
            </div>
          </td>
        </tr>
      </table>
      <div v-if="lost">Game lost!</div>
      <q-btn
        v-if="!running"
        @click="startGame"
        color="primary"
        label="Start Game"
      />
      <q-separator />
    </q-page-container>
  </q-layout>
</template>

<script lang="ts">
import { defineComponent, Ref, ref } from "vue";
import { Snake, Cell, Direction, SnakeAI, Point } from "./Snake";
import AIOptions from "./components/AIOptions.vue";
export default defineComponent({
  name: "App",
  components: { AIOptions },
  setup() {
    const settings = ref({
      height: 10,
      width: 10,
    });
    const leftDrawerOpen = ref(true);
    const running = ref(false);

    let gameLoop: ReturnType<typeof setInterval> | undefined;
    const lost = ref(false);
    let dir = "d" as Direction;
    const board: Ref<Cell[][]> = ref(
      Snake.getEmptyBoard(settings.value.width, settings.value.height)
    );
    const availableSteps: Ref<Point[][]> = ref(
      SnakeAI.getEmptyBoard(settings.value.width, settings.value.height)
    );

    const startGame = () => {
      running.value = true;
      const game = new Snake(settings.value.width, settings.value.height);
      const snakeAI = new SnakeAI(game);
      availableSteps.value = snakeAI.render();
      gameLoop = setInterval(() => {
        lost.value = game.step(dir);
        if (!lost.value) board.value = game.render();
        else {
          clearInterval(gameLoop);
          running.value = false;
        }
      }, 500);
    };
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
      availableSteps,
      leftDrawerOpen,
      toggleLeftDrawer() {
        leftDrawerOpen.value = !leftDrawerOpen.value;
      },
      running,
      startGame,
    };
  },
});
</script>

<style lang="scss">
#app {
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
.game-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}
</style>
