<template>
  <div class="container mx-auto flex flex-col items-center bg-gray-100 p-4">
    <!-- Loader -->
    <div
      v-if="showLoader"
      class="fixed w-100 h-100 opacity-80 bg-purple-800 inset-0 z-50 flex items-center justify-center"
    >
      <svg
        class="animate-spin -ml-1 mr-3 h-12 w-12 text-white"
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
      >
        <circle
          class="opacity-25"
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          stroke-width="4"
        ></circle>
        <path
          class="opacity-75"
          fill="currentColor"
          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
        ></path>
      </svg>
    </div>
    <div class="container">
      <add-ticker @addTicker="add" @onLoaded="handleLoaded" />
      <!-- Pagination -->
      <div class="mt-1 relative rounded-md shadow-md">
        <input
          v-model="filter"
          type="text"
          name="wallet"
          id="wallet"
          class="block w-full pr-10 p-2 border-gray-300 text-gray-900 focus:outline-none focus:ring-gray-500 focus:border-gray-500 sm:text-sm rounded-md"
          placeholder="e.g. DOGE"
        />
      </div>
      <button
        v-if="page > 1"
        @click="page -= 1"
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
        Back
      </button>
      <button
        v-if="hasNextPage"
        @click="page += 1"
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
        Forward
      </button>
      <!-- Pagination -->
      <template v-if="this.tickers.length">
        <hr class="w-full border-t border-gray-600 my-4" />
        <dl class="mt-5 grid grid-cols-1 gap-5 sm:grid-cols-3">
          <ticker-info
            @removeTicker="remove"
            @click="selectedTicker = tickerData"
            v-for="(tickerData, idx) of paginatedTickers"
            :key="idx"
            :tickerData="tickerData"
            :isSelected="selectedTicker === tickerData"
          />
        </dl>
        <hr class="w-full border-t border-gray-600 my-4" />
      </template>
      <tickers-chart />
    </div>
  </div>
</template>

<script>
import { subscribeToTicker, unsubscribeToTicker } from "./api";
import AddTicker from "./components/AddTicker.vue";
import TickerInfo from "./components/TickerInfo.vue";
import TickersChart from "./components/TickersChart.vue";
import { LocalStorageManager } from "./utils/LocalStorageManager.js";

const ELEMENTS_PER_PAGE = 6;
const LOCAL_STORAGE_KEY = "CRYPTONOMICON";
const localStorageManager = new LocalStorageManager(LOCAL_STORAGE_KEY);

export default {
  name: "App",
  components: {
    AddTicker,
    TickerInfo,
    TickersChart,
  },
  data() {
    return {
      tickers: [],

      page: 1,
      filter: "",

      showLoader: true,
      selectedTicker: null,
    };
  },
  mounted() {
    const savedTickers = localStorageManager.read();
    if (savedTickers) {
      this.tickers = savedTickers;
      this.tickers.forEach((ticker) => {
        this.subscribeToTickerUpdate(ticker);
      });
    }
  },
  computed: {
    // #   Q    P
    // 1 - 6 * (1 - 1) = 0
    // 2 - 6 * (2 - 1) = 6
    // 3 - 6 * (3 - 1) = 12
    startIndex() {
      return ELEMENTS_PER_PAGE * (this.page - 1);
    },
    // #   Q   P
    // 1 - 6 * 1 = 5
    // 2 - 6 * 2 = 11
    // 3 - 6 * 3 = 17
    endIndex() {
      return ELEMENTS_PER_PAGE * this.page;
    },
    filteredTickers() {
      return this.tickers.filter((ticker) =>
        ticker.name.includes(this.formattedFilter)
      );
    },
    paginatedTickers() {
      return this.filteredTickers.slice(this.startIndex, this.endIndex);
    },
    formattedFilter() {
      return this.filter.trim().toUpperCase();
    },
    hasNextPage() {
      return this.filteredTickers.length > this.endIndex;
    },
  },
  methods: {
    // TODO:
    // Unify tickerName contract
    //  - Remove strange toLowerCase, toUpperaCase
    updateTicker(tickerName, newPrice) {
      const tickers = this.tickers.filter(
        (ticker) => ticker.name === tickerName.toUpperCase()
      );

      tickers.forEach((ticker) => (ticker.price = newPrice));
    },
    subscribeToTickerUpdate(ticker) {
      const tickerName = ticker.name.toLowerCase();
      subscribeToTicker(tickerName, (newPrice) => {
        this.updateTicker(tickerName, newPrice);
      });
    },
    add(tickerToAdd) {
      this.tickers.push(tickerToAdd);
      this.subscribeToTickerUpdate(tickerToAdd);

      localStorageManager.update(this.tickers);
    },
    remove(tickerToRemove) {
      const tickerName = tickerToRemove.name.toLowerCase();
      unsubscribeToTicker(tickerName);

      this.tickers = this.tickers.filter((ticker) => ticker !== tickerToRemove);

      localStorageManager.update(this.tickers);
    },
    setSelectedTicker(ticker) {
      this.selectedTicker = ticker;
    },
    setTickersFromServer(tickersFromserver) {
      this.tickersFromServer = tickersFromserver;
    },
    handleLoaded() {
      this.showLoader = false;
    },
  },
};
</script>

<style></style>
