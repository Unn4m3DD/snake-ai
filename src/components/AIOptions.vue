<template>
  <q-tabs
    v-model="tab"
    class="text-grey"
    active-color="primary"
    indicator-color="primary"
    align="justify"
  >
    <q-tab name="game" label="Game Config" />
    <q-tab name="ai" label="AI Config" />
    <q-tab name="status" label="Status Display" />
  </q-tabs>
  <q-tab-panels v-model="tab" animated keep-alive class="tabs">
    <q-tab-panel name="game">
      <div class="column">
        <label class="self-start"> How long should the game step be? </label>
        <q-slider
          v-model="gameSettings.stepDelay"
          :min="0"
          :max="1000"
          :step="10"
          label-always
          switch-label-side
          :label-value="gameSettings.stepDelay + 'ms'"
        />
      </div>
      <q-separator class="q-ma-md q-mt-xl" />
      <div class="column">
        <label class="self-start">
          How long should the game dimensions be?
        </label>
        <label class="self-start q-mt-sm">Width:</label>
        <q-slider
          v-model="gameSettings.width"
          :min="2"
          :max="30"
          :step="2"
          label-always
          switch-label-side
        />
        <label class="self-start q-mt-xl">Height:</label>
        <q-slider
          v-model="gameSettings.height"
          :min="2"
          :max="16"
          :step="2"
          label-always
          switch-label-side
        />
      </div>
      <q-separator class="q-ma-md q-mt-xl" />
    </q-tab-panel>
    <q-tab-panel name="ai" class="test-left">
      <div class="column">
        <label class="self-start">Who will playing?</label>
        <q-radio v-model="AISettings.player" val="player" label="Let me play!" />
        <q-radio v-model="AISettings.player" val="ai" label="Let the AI play!" />
      </div>
      <q-separator class="q-ma-md" />
      <div class="column" :class="{ disabled: !selectionEnabled.cicle }">
        <label class="self-start">
          What kind of hamiltonian cicle will the AI use?
        </label>
        <q-radio v-model="AISettings.cicle" val="full" label="Full" />
        <q-radio v-model="AISettings.cicle" val="improved" label="Improved" />
      </div>
      <q-separator class="q-ma-md" />
      <div class="column" :class="{ disabled: !selectionEnabled.heuristic }">
        <label class="self-start">What heuristic will the AI use?</label>
        <q-radio
          v-model="AISettings.heuristic"
          val="random"
          label="Random Choice"
        />
        <q-radio
          v-model="AISettings.heuristic"
          val="euclidian"
          label="Euclidian Distance"
        />
        <q-radio
          v-model="AISettings.heuristic"
          val="bfs"
          label="BFS (Breadth First Search)"
        />
        <q-radio v-model="AISettings.heuristic" val="a-star" label="A* (A Star)" />
      </div>
      <q-separator class="q-ma-md" />
    </q-tab-panel>
    <q-tab-panel name="status">
      <div class="column items-start">
        <q-checkbox
          v-model="statusSettings.showCicles"
          label="Show Hamiltonian Cicles"
        />
        <q-checkbox
          v-model="statusSettings.showAverageDecisionTime"
          label="Show Average Decision Time"
        />
        <q-checkbox v-model="statusSettings.showStepCount" label="Show Step Count" />
        <q-checkbox
          v-model="statusSettings.showHeadAverageDistanceFromApple"
          label="Show Head Average Distance From Apple"
        />
      </div>
      <q-separator class="q-ma-md" />
    </q-tab-panel>
  </q-tab-panels>
</template>

<script>
import { ref, computed } from "@vue/reactivity";
import { gameSettings, statusSettings, AISettings } from "../truth.ts";

export default {
  name: "AIOptions",
  setup() {
    const selectionEnabled = computed(() => ({
      cicle: AISettings.player !== "player",
      heuristic: AISettings.player !== "player" && AISettings.cicle !== "full",
    }));
    const tab = ref("game");
    const slider = ref(500);
    function preventDisabledClick(e) {
      if (e.target.disabled) e.preventDefault();
    }
    return {
      slider,
      tab,
      selectionEnabled,
      preventDisabledClick,
      gameSettings,
      statusSettings,
      AISettings
    };
  },
};
</script>

<style lang="scss">
.tabs {
  height: calc(100% - 3rem);
}
</style>