<template>
  <q-layout view="hHh LpR fFf">
    <q-drawer
      show-if-above
      v-model="leftDrawerOpen"
      side="left"
      behavior="desktop"
      elevated
      :width="400"
    >
      <AIOptions />
    </q-drawer>

    <q-page-container class="game-container">
      <div
        class="board"
        :style="`width: ${50 * gameSettings.width + 1}px`"
        border="1"
      >
        <div v-for="(item, y) in board" class="row" :key="y">
          <div
            v-for="(cell, x) in item"
            class="cell"
            :key="x"
            :class="{
              snake: cell === Cell.Snake,
              head: cell === Cell.Head,
              apple: cell === Cell.Apple,
            }"
          >
            <div
              v-if="statusSettings.showCicles"
              class="arrow"
              :class="{
                a: availableSteps[y][x].x < 0,
                d: availableSteps[y][x].x > 0,
              }"
            >
              <font-awesome-icon icon="arrow-circle-up" />
            </div>
            <div
              v-if="statusSettings.showCicles"
              class="arrow"
              :class="{
                w: availableSteps[y][x].y < 0,
                s: availableSteps[y][x].y > 0,
              }"
            >
              <font-awesome-icon icon="arrow-circle-up" />
            </div>
          </div>
        </div>
      </div>
      <h3 class="q-ma-md" v-if="gameStatus !== '' && gameStatus !== 'paused'">
        Game {{ gameStatus }}!
      </h3>
      <h3 class="q-ma-md" v-else>&nbsp;</h3>

      <div class="row">
        <q-btn
          class="q-ma-md"
          v-if="gameStatus === 'paused'"
          @click="resumeGame"
          color="positive"
          label="Resume Game"
        />
        <q-btn
          class="q-ma-md"
          v-if="running"
          @click="stopGame"
          color="negative"
          label="Stop Game"
        />
        <q-btn
          class="q-ma-md"
          v-if="!running"
          @click="startGame"
          color="primary"
          label="Start Game"
        />
      </div>

      <div class="row">
        <transition-group
          enter-active-class="animated widthOut"
          enter-to-class="animated widthIn"
          leave-active-class="animated widthOut"
        >
          <q-card
            dark
            bordered
            class="bg-grey-9 status-card q-ma-lg"
            v-show="statusSettings.showAverageDecisionTime"
            key="showAverageDecisionTime"
          >
            <q-card-section>
              <div class="text-h6 ellipsis">Average Decision Time</div>
            </q-card-section>

            <q-separator dark inset />

            <q-card-section>
              <div class="text-h6 ellipsis">
                {{ averageDecisionTime.toFixed(3) }} ms
              </div>
            </q-card-section>
          </q-card>
          <q-card
            dark
            bordered
            class="bg-grey-9 status-card q-ma-lg"
            v-show="statusSettings.showStepCount"
            key="showStepCount"
          >
            <q-card-section>
              <div class="text-h6 ellipsis">Steps Taken</div>
            </q-card-section>

            <q-separator dark inset />

            <q-card-section>
              <div class="text-h6 ellipsis">{{ stepCount }}</div>
            </q-card-section>
          </q-card>
          <q-card
            dark
            bordered
            class="bg-grey-9 status-card q-ma-lg"
            v-show="statusSettings.showHeadAverageDistanceFromApple"
            key="showHeadAverageDistanceFromApple"
          >
            <q-card-section>
              <div class="text-h6 ellipsis">Average Distance</div>
            </q-card-section>

            <q-separator dark inset />

            <q-card-section>
              <div class="text-h6 ellipsis">
                {{ averageDistanceToApple.toFixed(3) }} units
              </div>
            </q-card-section>
          </q-card>
        </transition-group>
      </div>
    </q-page-container>
  </q-layout>
</template>

<script lang="ts">
import { defineComponent, Ref, ref, watch } from "vue";
import { Snake, Cell, Direction, SnakeAI, Point } from "./Snake";
import AIOptions from "./components/AIOptions.vue";
import { gameSettings, statusSettings, AISettings } from "./truth";
export default defineComponent({
  name: "App",
  components: { AIOptions },
  setup() {
    const leftDrawerOpen = ref(true);

    let gameLoop: ReturnType<typeof setInterval> | undefined;
    const gameStatus = ref("");
    const stepCount = ref(0);
    const averageDistanceToApple = ref(0);
    const averageDecisionTime = ref(0);
    let dir = "s" as Direction;
    let game: Snake = new Snake(gameSettings.width, gameSettings.height);
    let snakeAI: SnakeAI = new SnakeAI(game);
    const running = ref(false);
    const board: Ref<Cell[][]> = ref(game.render());
    const availableSteps: Ref<Point[][]> = ref(
      snakeAI.render(AISettings.cicle)
    );

    watch(statusSettings, () => {
      board.value = game.render();
      availableSteps.value = snakeAI.render(AISettings.cicle);
    });

    const updateGameLoop = () => {
      clearInterval(gameLoop);
      gameLoop = setInterval(() => {
        game.step(AISettings.player === "ai" ? snakeAI.bestStep(AISettings.cicle, AISettings.heuristic) : dir);
        stepCount.value = game.steps;
        averageDistanceToApple.value = game.totalDistanceToApple / game.steps;
        averageDecisionTime.value = snakeAI.totalDecisionTime / game.steps;
        board.value = game.render();
        if (game.status !== "running") {
          stopGame();
        }
        gameStatus.value = game.status;
      }, gameSettings.stepDelay);
    };

    const resumeGame = () => {
      running.value = true;
      gameStatus.value = game.status;
      updateGameLoop();
    };

    const startGame = () => {
      running.value = true;
      game = new Snake(gameSettings.width, gameSettings.height);
      snakeAI = new SnakeAI(game);
      gameStatus.value = game.status;
      updateGameLoop();
    };
    const stopGame = () => {
      gameStatus.value = "paused";
      clearInterval(gameLoop);
      running.value = false;
    };
    watch(gameSettings, () => {
      if (!running.value) {
        game = new Snake(gameSettings.width, gameSettings.height);
        snakeAI = new SnakeAI(game);
        board.value = game.render();
        availableSteps.value = snakeAI.render(AISettings.cicle);
      }

      if (running.value) {
        updateGameLoop();
      }
    });
    watch(AISettings, () => {
      availableSteps.value = snakeAI.render(AISettings.cicle);
    });
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
      gameStatus,
      availableSteps,
      leftDrawerOpen,
      toggleLeftDrawer() {
        leftDrawerOpen.value = !leftDrawerOpen.value;
      },
      running,
      resumeGame,
      stopGame,
      startGame,
      gameSettings,
      statusSettings,
      AISettings,
      stepCount,
      averageDistanceToApple,
      averageDecisionTime,
    };
  },
});
</script>

<style lang="scss">
.board {
  border: 1px solid black;
  border-left: none;
  border-top: none;
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
  border: 1px solid black;
  border-right: none;
  border-bottom: none;
}
.snake {
  background-color: $positive;
}
.head {
  background-color: $positive;
  filter: grayscale(90%);
}
.apple {
  background-color: $negative;
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
  height: 100vh;
}
.status-card {
  width: 250px;
  transition: width 0.5s;
}
.animated {
  &.widthOut {
    width: 0;
  }
  &.widthIn {
    width: 250px;
  }
}
</style>
