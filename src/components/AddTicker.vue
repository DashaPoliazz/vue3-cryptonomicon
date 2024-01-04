<template>
  <section>
    <div class="flex">
      <div class="max-w-xs">
        <label for="wallet" class="block text-sm font-medium text-gray-700"
          >Ticker</label
        >
        <div class="mt-1 relative rounded-md shadow-md">
          <input
            v-model="tickerName"
            @keydown.enter="handleClick"
            type="text"
            name="wallet"
            id="wallet"
            class="block w-full pr-10 p-2 border-gray-300 text-gray-900 focus:outline-none focus:ring-gray-500 focus:border-gray-500 sm:text-sm rounded-md"
            placeholder="Например DOGE"
          />
        </div>
        <!-- Why i can't catch onLoaded in App.vue on <add-ticker /> ? -->
        <ticker-hints
          :filter="tickerName"
          @onHintClick="handleTickerAdd"
          @onLoaded="$emit('onLoaded', true)"
        />
        <ticker-error />
      </div>
    </div>
    <button
      @click="handleTickerAdd"
      type="button"
      class="my-4 inline-flex items-center py-2 px-4 border border-transparent shadow-sm text-sm leading-4 font-medium rounded-full text-white bg-gray-600 hover:bg-gray-700 transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
    >
      <!-- Heroicon name: solid/mail -->
      <svg
        class="-ml-0.5 mr-2 h-6 w-6"
        xmlns="http://www.w3.org/2000/svg"
        width="30"
        height="30"
        viewBox="0 0 24 24"
        fill="#ffffff"
      >
        <path
          d="M13 7h-2v4H7v2h4v4h2v-4h4v-2h-4V7zm-1-5C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z"
        ></path>
      </svg>
      Add
    </button>
  </section>
</template>

<script>
import TickerHints from "./TickerHints.vue";
import TickerError from "./TickerError.vue";

export default {
  components: {
    TickerHints,
    TickerError,
  },
  data() {
    return {
      tickerName: "",
    };
  },
  computed: {
    formattedTickerName() {
      return this.tickerName.trim().toUpperCase();
    },
  },
  methods: {
    handleTickerAdd(tickerToAdd) {
      const TICKER_INFO = {
        baseAsset: "-",
        quoteAsset: "-",
        name: "-",
      };

      const newTicker = tickerToAdd.name
        ? Object.assign(tickerToAdd, { price: null })
        : Object.assign(TICKER_INFO, {
            name: this.formattedTickerName,
            price: null,
          });

      this.$emit("addTicker", newTicker);
    },
  },
};
</script>

<style></style>
