<script setup>
import { onMounted } from "vue";
import { useMessageStore } from "./stores/messageStore";

const { fetchMessages } = useMessageStore();

onMounted(() => {
  fetchMessages();
});
</script>

<template>
  <div class="app">
    <router-view />
  </div>
</template>

<style>
.app {
  width: 100vw;
  height: 100vh;
  margin: 0;
  padding: 0;
}
</style>
