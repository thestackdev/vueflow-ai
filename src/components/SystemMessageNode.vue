<template>
  <div class="system-message-node">
    <Handle type="target" position="top" :style="{ background: '#555' }" />
    <div class="node-content">
      <div class="node-header">
        <input
          v-model="nodeLabel"
          class="node-title"
          @blur="updateNodeLabel"
          placeholder="Node Label"
        />
        <button @click="toggleEdit" class="edit-btn">
          {{ isEditing ? "Save" : "Edit" }}
        </button>
      </div>
      <div v-if="isEditing" class="node-body">
        <textarea
          v-model="nodeContent"
          class="message-content"
          rows="6"
          placeholder="Enter node content..."
          @blur="updateNodeContent"
        ></textarea>
      </div>
      <div v-else class="node-preview">
        {{ previewContent }}
      </div>
    </div>
    <Handle type="source" position="bottom" :style="{ background: '#555' }" />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { Handle, useVueFlow } from "@vue-flow/core";

const props = defineProps({
  id: {
    type: String,
    required: true,
  },
  data: {
    type: Object,
    required: true,
  },
  label: {
    type: String,
    required: true,
  },
});

const { updateNode } = useVueFlow();

const isEditing = ref(false);
const nodeLabel = ref(props.label);
const nodeContent = ref(props.data.content);

const previewContent = computed(() => {
  const content = nodeContent.value || "";
  return content.length > 100 ? content.substring(0, 100) + "..." : content;
});

const toggleEdit = () => {
  isEditing.value = !isEditing.value;
  if (!isEditing.value) {
    updateNodeContent();
    updateNodeLabel();
  }
};

const updateNodeContent = () => {
  updateNode(props.id, {
    data: {
      ...props.data,
      content: nodeContent.value,
    },
  });
};

const updateNodeLabel = () => {
  updateNode(props.id, {
    label: nodeLabel.value,
  });
};

onMounted(() => {
  nodeLabel.value = props.label;
  nodeContent.value = props.data.content;
});
</script>

<style scoped>
.system-message-node {
  padding: 10px;
  border-radius: 8px;
  background: #e9e7fd;
  border: 1px solid #a094e0;
  min-width: 200px;
  max-width: 300px;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
}

.node-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.node-title {
  font-weight: bold;
  border: none;
  background: transparent;
  font-size: 14px;
  width: 70%;
  padding: 4px;
  border-radius: 4px;
}

.node-title:focus {
  outline: none;
  background: rgba(255, 255, 255, 0.8);
  box-shadow: 0 0 0 2px #a094e0;
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

.message-content {
  width: 100%;
  padding: 8px;
  border: 1px solid #a094e0;
  border-radius: 4px;
  resize: vertical;
  font-size: 12px;
  line-height: 1.4;
}

.message-content:focus {
  outline: none;
  border-color: #4caf50;
  box-shadow: 0 0 0 2px rgba(76, 175, 80, 0.2);
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