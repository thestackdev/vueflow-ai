<template>
  <div class="start-node">
    <div class="node-header">Start Node</div>
    <div class="node-content">
      <button @click="openSettings" class="configure-btn">Configure</button>
    </div>
  </div>
</template>

<script setup>
import { defineProps, defineEmits } from "vue";

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
.start-node {
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
</style> 