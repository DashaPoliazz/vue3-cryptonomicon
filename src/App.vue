<template>
  <div class="container mx-auto flex flex-col items-center bg-gray-100 p-4">
    <div
      v-if="isLoadingAvailableSymbols"
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
      <section>
        <div class="flex">
          <div class="max-w-xs">
            <label for="wallet" class="block text-sm font-medium text-gray-700"
              >Ticker</label
            >
            <div class="mt-1 relative rounded-md shadow-md">
              <input
                v-model="symbol"
                @keydown.enter="addSymbol"
                type="text"
                name="wallet"
                id="wallet"
                class="block w-full pr-10 border-gray-300 text-gray-900 focus:outline-none focus:ring-gray-500 focus:border-gray-500 sm:text-sm rounded-md"
                placeholder="e.g. DOGE"
              />
            </div>
            <div
              class="flex bg-white shadow-md p-1 rounded-md shadow-md flex-wrap"
            >
              <span
                v-for="(symbolInfo, idx) of matchedSymbols"
                :key="idx"
                @click="symbol = symbolInfo.symbol"
                class="inline-flex items-center px-2 m-1 rounded-md text-xs font-medium bg-gray-300 text-gray-800 cursor-pointer"
              >
                {{ symbolInfo.symbol }}
              </span>
            </div>
            <div v-if="hasTickerBeenAddedError" class="text-sm text-red-600">
              This ticker has already been added
            </div>
            <div v-if="!matchedSymbols.length" class="text-sm text-red-600">
              Symbol {{ symbol }} can not be added
            </div>
          </div>
        </div>
        <button
          @click="addSymbol"
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

      <template v-if="symbols.length">
        <input v-model="filter" placeholder="filter symbol" />
        <div>
          <button
            v-if="page > 1"
            @click="page -= 1"
            class="my-4 inline-flex items-center py-2 px-4 border border-transparent shadow-sm text-sm leading-4 font-medium rounded-full text-white bg-gray-600 hover:bg-gray-700 transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
          >
            Back
          </button>
          <button
            v-if="filteredSymbols.length > endIndex"
            @click="page += 1"
            class="my-4 inline-flex items-center py-2 px-4 border border-transparent shadow-sm text-sm leading-4 font-medium rounded-full text-white bg-gray-600 hover:bg-gray-700 transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
          >
            Forward
          </button>
        </div>
        <hr class="w-full border-t border-gray-600 my-4" />
        <dl class="mt-5 grid grid-cols-1 gap-5 sm:grid-cols-3">
          <div
            v-for="(symbol, idx) of paginatedSymbols"
            @click="handleSymbolClick(symbol)"
            :key="idx"
            :class="{
              'border-4': selectedSymbol === symbol,
            }"
            class="bg-white overflow-hidden shadow rounded-lg border-purple-800 border-solid cursor-pointer"
          >
            <div class="px-4 py-5 sm:p-6 text-center">
              <dt class="text-sm font-medium text-gray-500 truncate">
                {{ symbol.baseAsset }} - {{ symbol.quoteAsset }}
              </dt>
              <dd class="mt-1 text-3xl font-semibold text-gray-900">
                {{ formatPrice(symbol.price) }}
              </dd>
            </div>
            <div class="w-full border-t border-gray-200"></div>
            <button
              @click="removeSymbol(symbol.symbol)"
              class="flex items-center justify-center font-medium w-full bg-gray-100 px-4 py-4 sm:px-6 text-md text-gray-500 hover:text-gray-600 hover:bg-gray-200 hover:opacity-20 transition-all focus:outline-none"
            >
              <svg
                class="h-5 w-5"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="#718096"
                aria-hidden="true"
              >
                <path
                  fill-rule="evenodd"
                  d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
                  clip-rule="evenodd"
                ></path>
              </svg>
              >Remove
            </button>
          </div>
        </dl>
        <hr class="w-full border-t border-gray-600 my-4" />
      </template>
      <section v-if="selectedSymbol" ref="chart" class="relative">
        <h3 class="text-lg leading-6 font-medium text-gray-900 my-8">
          {{ selectedSymbol.baseAsset }} - {{ selectedSymbol.quoteAsset }}
        </h3>
        <div class="flex items-end border-gray-600 border-b border-l h-64">
          <div
            v-for="(percent, idx) of normalizedGraph"
            ref="chartElement"
            :key="{ idx }"
            :style="{ height: `${percent}%` }"
            class="bg-purple-800 border w-10"
          ></div>
        </div>
        <button
          @click.stop="selectedSymbol = null"
          type="button"
          class="absolute top-0 right-0"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            xmlns:xlink="http://www.w3.org/1999/xlink"
            xmlns:svgjs="http://svgjs.com/svgjs"
            version="1.1"
            width="30"
            height="30"
            x="0"
            y="0"
            viewBox="0 0 511.76 511.76"
            style="enable-background: new 0 0 512 512"
            xml:space="preserve"
          >
            <g>
              <path
                d="M436.896,74.869c-99.84-99.819-262.208-99.819-362.048,0c-99.797,99.819-99.797,262.229,0,362.048    c49.92,49.899,115.477,74.837,181.035,74.837s131.093-24.939,181.013-74.837C536.715,337.099,536.715,174.688,436.896,74.869z     M361.461,331.317c8.341,8.341,8.341,21.824,0,30.165c-4.16,4.16-9.621,6.251-15.083,6.251c-5.461,0-10.923-2.091-15.083-6.251    l-75.413-75.435l-75.392,75.413c-4.181,4.16-9.643,6.251-15.083,6.251c-5.461,0-10.923-2.091-15.083-6.251    c-8.341-8.341-8.341-21.845,0-30.165l75.392-75.413l-75.413-75.413c-8.341-8.341-8.341-21.845,0-30.165    c8.32-8.341,21.824-8.341,30.165,0l75.413,75.413l75.413-75.413c8.341-8.341,21.824-8.341,30.165,0    c8.341,8.32,8.341,21.824,0,30.165l-75.413,75.413L361.461,331.317z"
                fill="#718096"
                data-original="#000000"
              ></path>
            </g>
          </svg>
        </button>
      </section>
    </div>
  </div>
</template>

<script>
import {
  fetchSymbolsFromBinance,
  subscribeToSymbol,
  unsubscribeFromSymbol,
} from "./api.js";

const LOCALSTORAGE_KEY = "CRYPTONOMICON";
const SYMBOLS_PER_PAGE = 6;

export default {
  data() {
    return {
      symbol: "",
      symbols: [],
      availableSymbols: [],
      chart: [],
      isLoadingAvailableSymbols: true,
      isTickerExistError: false,
      hasTickerBeenAddedError: false,
      selectedSymbol: null,
      filter: "",
      page: 1,
      maxGraphElements: 500,
    };
  },
  async created() {
    const availableSymbols = await fetchSymbolsFromBinance();
    this.isLoadingAvailableSymbols = false;
    this.availableSymbols = availableSymbols;

    const savedSymbols = this.getFromLocalStorage(LOCALSTORAGE_KEY);
    if (savedSymbols.length) {
      this.symbols = savedSymbols;
      this.symbols.forEach((symbol) =>
        subscribeToSymbol(symbol.symbol.toLowerCase(), (newPrice) =>
          this.updateSymbolPrice(symbol.symbol, newPrice)
        )
      );
    }

    const currentURL = new URL(window.location);
    const { filter, page } = Object.fromEntries(currentURL.searchParams);
    if (filter) this.filter = filter;
    if (page) this.page = page;
  },
  computed: {
    matchedSymbols() {
      if (!this.symbol) return this.availableSymbols.slice(0, 4);

      const includeSymbolName = (symbolInfo) =>
        symbolInfo.symbol.includes(this.symbol.toUpperCase());

      return this.availableSymbols.filter(includeSymbolName).slice(0, 4);
    },
    filteredSymbols() {
      return this.symbols.filter((symbol) =>
        symbol.symbol.includes(this.filter.toUpperCase())
      );
    },
    startIndex() {
      return (this.page - 1) * SYMBOLS_PER_PAGE;
    },
    endIndex() {
      return this.page * SYMBOLS_PER_PAGE;
    },
    paginatedSymbols() {
      return this.filteredSymbols.slice(this.startIndex, this.endIndex);
    },
    normalizedGraph() {
      const maxValue = Math.max(...this.chart);
      const minValue = Math.min(...this.chart);

      if (maxValue === minValue) {
        return this.chart.map(() => 50);
      }

      return this.chart.map(
        (price) => 5 + ((price - minValue) * 95) / (maxValue - minValue)
      );
    },
  },
  watch: {
    matchedSymbols() {
      this.matchedSymbols.length
        ? (this.isTickerExistError = true)
        : (this.isTickerExistError = false);
    },
    symbol() {
      this.symbol = this.symbol.trim();
      this.hasTickerBeenAddedError = false;
    },
    filter() {
      this.filter = this.filter.trim();
      window.history.pushState(
        null,
        window.document,
        `${window.location.pathname}?filter=${this.filter}&page=${this.page}`
      );
    },
    page() {
      window.history.pushState(
        null,
        window.document,
        `${window.location.pathname}?filter=${this.filter}&page=${this.page}`
      );
    },
  },
  mounted() {
    window.addEventListener("resize", this.calculateMaxGraphElements);
  },
  beforeUnmount() {
    window.removeEventListener("resize", this.calculateMaxGraphElements);
  },
  methods: {
    calculateMaxGraphElements() {
      if (!this.selectedSymbol) return;

      this.maxGraphElements = this.$refs.chart.clientWidth / 38;
    },
    handleSymbolClick(symbol) {
      this.selectedSymbol = symbol;
      this.chart = [];
    },
    updateSymbolPrice(symbolName, newPrice) {
      this.symbols
        .filter((symbol) => symbol.symbol === symbolName)
        .forEach((symbol) => {
          if (symbol.symbol === this.selectedSymbol?.symbol) {
            this.chart.push(newPrice);

            while (this.chart.length > this.maxGraphElements) {
              this.chart.shift();
            }
          }

          symbol.price = newPrice;
        });
    },
    formatPrice(price) {
      if (price === "-") return price;

      return price > 1
        ? Number(price).toFixed(2)
        : Number(price).toPrecision(4);
    },
    addSymbol() {
      if (!this.symbol) return;
      if (!this.matchedSymbols.length) {
        this.isTickerExistError = false;
        return;
      }

      // If availableSymbols.length > 1 we can peek first
      const candidate = this.matchedSymbols[0];

      const hasSymbolAlreadyBeenAdded = this.symbols.find(
        (symbol) => symbol.symbol === candidate.symbol
      );

      if (hasSymbolAlreadyBeenAdded) {
        this.hasTickerBeenAddedError = true;
        return;
      }

      const newSymbol = {
        ...candidate,
        price: "-",
      };

      this.saveToLocalStorage(LOCALSTORAGE_KEY, [...this.symbols, newSymbol]);
      this.symbols = [...this.symbols, newSymbol];
      this.symbol = "";

      const symbolName = newSymbol.symbol;
      subscribeToSymbol(symbolName.toLowerCase(), (newPrice) =>
        this.updateSymbolPrice(symbolName, newPrice)
      );
    },
    removeSymbol(symbolToRemove) {
      this.symbols = this.symbols.filter(
        (symbol) => symbol.symbol !== symbolToRemove
      );
      unsubscribeFromSymbol(symbolToRemove.toLowerCase());
      this.saveToLocalStorage(LOCALSTORAGE_KEY, this.symbols);
    },
    saveToLocalStorage(key, itemsToSave) {
      const stringifiedItems = JSON.stringify(itemsToSave);

      localStorage.setItem(key, stringifiedItems);
    },
    getFromLocalStorage(key) {
      const items = JSON.parse(localStorage.getItem(key));

      return items ?? [];
    },
  },
};
</script>

<style></style>
