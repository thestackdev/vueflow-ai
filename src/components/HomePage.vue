<template>
  <div class="home-page">
    <h1>Flow Editor</h1>
    <div class="flow-options">
      <div
        v-for="flow in flows"
        :key="flow.title"
        class="flow-card"
        @click="navigateToFlow(flow.type)"
      >
        <h2>{{ flow.title }}</h2>
        <p>{{ flow.description }}</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useRouter } from "vue-router";

const router = useRouter();

const flows = [
  {
    title: "Halsell Incoming Call Handler",
    description: "System message configuration for Halsell AI assistant",
    type: "incoming",
  },
  {
    title: "Halsell Outgoing Call Handler",
    description: "System message configuration for Helio AI assistant",
    type: "outgoing",
  },
];

const navigateToFlow = (flowType) => {
  router.push(`/flow/${flowType}`);
};
</script>

<style scoped>
.home-page {
  padding: 2rem;
  max-width: 1200px;
  margin: 0 auto;
}

h1 {
  text-align: center;
  color: #2c3e50;
  margin-bottom: 2rem;
}

.flow-options {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 2rem;
  padding: 1rem;
}

.flow-card {
  background: white;
  border-radius: 8px;
  padding: 1.5rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;
}

.flow-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.flow-card h2 {
  color: #2c3e50;
  margin-bottom: 0.5rem;
}

.flow-card p {
  color: #666;
  margin: 0;
}
</style>