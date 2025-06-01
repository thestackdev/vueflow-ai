<template>
  <div class="home-page">
    <h1>Flow Editor</h1>
    <div class="flow-list">
      <div
        v-for="flow in flows"
        :key="flow.title"
        class="flow-item"
        @click="navigateToFlow(flow.id)"
      >
        <div class="flow-content">
          <h2>{{ flow.title }}</h2>
          <p>{{ flow.description }}</p>
        </div>
        <div class="flow-arrow">→</div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useRouter } from "vue-router";

const router = useRouter();

const flows = [
  {
    id: "ha-investments-campaign",
    title: "HA Investments Campaign",
    description: "Flow configuration for the HA Investments campaign",
  },
];

const navigateToFlow = (flowId) => {
  router.push(`/flow/${flowId}`);
};
</script>

<style scoped>
.home-page {
  padding: 2rem;
  max-width: 800px;
  margin: 0 auto;
}

h1 {
  text-align: center;
  color: #2c3e50;
  margin-bottom: 2rem;
}

.flow-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  padding: 1rem;
}

.flow-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: white;
  border-radius: 8px;
  padding: 1.5rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;
}

.flow-item:hover {
  transform: translateX(4px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.flow-content {
  flex: 1;
}

.flow-arrow {
  color: #2c3e50;
  font-size: 1.5rem;
  margin-left: 1rem;
}

.flow-item h2 {
  color: #2c3e50;
  margin-bottom: 0.5rem;
}

.flow-item p {
  color: #666;
  margin: 0;
}
</style>