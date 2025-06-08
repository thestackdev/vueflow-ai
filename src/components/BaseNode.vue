<template>
  <div class="base-node" :class="type">
    <div class="node-header">{{ label }}</div>
    <div class="node-content">
      <button @click="openSettings" class="configure-btn">Configure</button>
      <button @click="deleteNode" class="delete-node-btn" title="Delete Node">
        &times;
      </button>
    </div>
  </div>
</template>

<script setup>
import { defineProps, defineEmits } from "vue";

const props = defineProps({
  id: String,
  type: String,
  label: String,
  data: Object,
});

const emit = defineEmits([
  "update:data",
  "open-settings",
  "add-node",
  "delete-node",
]);

const openSettings = () => {
  emit("open-settings", props.data);
};

const addNode = () => {
  emit("add-node");
};

const deleteNode = () => {
  emit("delete-node");
};
</script>

<style scoped>
.base-node {
  background: white;
  border: 1px solid #ddd;
  border-radius: 8px;
  padding: 15px;
  min-width: 200px;
  text-align: center;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
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
.add-node-btn {
  margin-left: 10px;
  padding: 8px 12px;
  background: #21d4fd;
  color: #fff;
  border: none;
  border-radius: 50%;
  font-size: 1.2em;
  cursor: pointer;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.08);
  transition: background 0.2s;
}
.add-node-btn:hover {
  background: #2196f3;
}
.delete-node-btn {
  margin-left: 10px;
  padding: 8px 12px;
  background: #f44336;
  color: #fff;
  border: none;
  border-radius: 50%;
  font-size: 1.2em;
  cursor: pointer;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.08);
  transition: background 0.2s;
}
.delete-node-btn:hover {
  background: #b71c1c;
}
</style> 