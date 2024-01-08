<template>
  <div class="flex bg-white shadow-md p-1 rounded-md shadow-md flex-wrap">
    <span
      v-for="(hint, idx) of filteredHints"
      :key="idx"
      @click="$emit('onHintClick', hint)"
      class="inline-flex items-center px-2 m-1 rounded-md text-xs font-medium bg-gray-300 text-gray-800 cursor-pointer"
    >
      {{ hint?.name }}
    </span>
  </div>
</template>

<script>
import { fetchAllTickers } from "@/api.js";

const AMOUNT_OF_HINTS_TO_SHOW = 4;

export default {
  props: {
    filter: String,
  },
  emits: ["onHintClick", "onLoaded"],
  mounted() {
    fetchAllTickers()
      .then((hints) => {
        this.hints = hints;
      })
      .finally(() => {
        this.isLoaded = true;
        this.$emit("onLoaded", true);
      });
  },
  data() {
    return {
      isLoaded: false,
      hints: [],
    };
  },
  computed: {
    formattedFilter() {
      return this.filter.trim().toUpperCase();
    },
    filteredHints() {
      return this.hints
        .filter((hint) => hint.name.includes(this.formattedFilter))
        .slice(0, AMOUNT_OF_HINTS_TO_SHOW);
    },
  },
};
</script>

<style></style>
