<template>
  <div class="text-sm text-red-600">{{ errorMessage }}</div>
</template>

<script>
export default {
  props: {
    errorMessage: String,
  },
};
</script>

<style></style>
