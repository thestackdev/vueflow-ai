<template>
  <div class="end-unsure-node">
    <div class="node-header">End Unsure Node</div>
    <div class="node-content">
      <button @click="openSettings" class="configure-btn">Configure</button>
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";

const props = defineProps({
  data: {
    type: Object,
    required: true,
  },
});

const emit = defineEmits(["update:data", "open-settings"]);

const openSettings = () => {
  emit("open-settings", props.data);
};
</script>

<style scoped>
.end-unsure-node {
  background: white;
  border: 1px solid #ddd;
  border-radius: 8px;
  padding: 15px;
  min-width: 200px;
  text-align: center;
}

.node-header {
  font-weight: bold;
  margin-bottom: 15px;
  padding-bottom: 10px;
  border-bottom: 1px solid #eee;
}

.node-content {
  /* Removed styles for sections, message-item, action-item, post-actions, action-select, textarea */
}

.configure-btn {
  padding: 10px 20px;
  background: #007bff;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 1em;
}

.configure-btn:hover {
  background: #0056b3;
}

/* Removed styles for remove-btn, add-btn as they are no longer used */
</style> 