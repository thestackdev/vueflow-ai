<template>
  <div class="action-node" :class="[`action-node--${type}`]">
    <Handle type="target" position="top" :style="{ background: '#555' }" />
    <div class="node-content">
      <div class="node-header">
        <div class="node-type">{{ typeLabel }}</div>
        <button @click="toggleEdit" class="edit-btn">
          {{ isEditing ? "Save" : "Edit" }}
        </button>
      </div>
      <div v-if="isEditing" class="node-body">
        <div class="action-config">
          <slot name="config"></slot>
        </div>
      </div>
      <div v-else class="node-preview">
        <slot name="preview"></slot>
      </div>
    </div>
    <Handle type="source" position="bottom" :style="{ background: '#555' }" />
  </div>
</template>

<script setup>
import { ref, computed } from "vue";
import { Handle, useVueFlow } from "@vue-flow/core";

const props = defineProps({
  id: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    required: true,
  },
  data: {
    type: Object,
    required: true,
  },
});

const { updateNode } = useVueFlow();
const isEditing = ref(false);

const typeLabel = computed(() => {
  return props.type
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
});

const toggleEdit = () => {
  isEditing.value = !isEditing.value;
  if (!isEditing.value) {
    // Emit update event for parent components to handle
    updateNode(props.id, {
      data: props.data,
    });
  }
};
</script>

<style scoped>
.action-node {
  padding: 15px;
  border-radius: 8px;
  min-width: 250px;
  max-width: 350px;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
}

.action-node--greeting {
  background: #e3f2fd;
  border: 1px solid #2196f3;
}

.action-node--transfer {
  background: #e8f5e9;
  border: 1px solid #4caf50;
}

.action-node--condition {
  background: #fff3e0;
  border: 1px solid #ff9800;
}

.action-node--message {
  background: #f3e5f5;
  border: 1px solid #9c27b0;
}

.node-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.node-type {
  font-weight: bold;
  font-size: 14px;
  color: #333;
}

.edit-btn {
  padding: 4px 8px;
  background-color: #4caf50;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 12px;
}

.edit-btn:hover {
  background-color: #45a049;
}

.node-body {
  margin-top: 10px;
}

.action-config {
  background: rgba(255, 255, 255, 0.8);
  border-radius: 4px;
  padding: 10px;
}

.node-preview {
  padding: 8px;
  background: rgba(255, 255, 255, 0.5);
  border-radius: 4px;
  font-size: 12px;
  color: #333;
  line-height: 1.4;
  min-height: 60px;
}
</style> 