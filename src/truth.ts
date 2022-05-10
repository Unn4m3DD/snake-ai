import { reactive } from "vue";

export const gameSettings = reactive({
  width: 10,
  height: 10,
  stepDelay: 500
});

export const statusSettings = reactive({
  showCicles: true,
  showAverageDecisionTime: true,
  showStepCount: true,
  showHeadAverageDistanceFromApple: true,
});

export const AISettings: {
  player: "player" | "ai",
  cicle: "full" | "improved",
  heuristic: "random" | "euclidian" | "bfs" | "a-star"
} = reactive({
  player: "player",
  cicle: "full",
  heuristic: "euclidian",
})