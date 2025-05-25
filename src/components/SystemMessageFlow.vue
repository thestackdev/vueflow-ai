<template>
  <div class="system-message-flow">
    <div class="controls">
      <button @click="saveFlow" class="save-btn" :disabled="isSaving">
        {{ isSaving ? "Saving..." : "Save Flow" }}
      </button>
    </div>
    <VueFlow
      v-model="elements"
      class="flow-container"
      :default-zoom="1.0"
      :min-zoom="0.1"
      :max-zoom="4"
      :node-types="nodeTypes"
      fit-view-on-init
    >
      <Background pattern-color="#aaa" gap="8" />
      <Controls />
      <MiniMap />
    </VueFlow>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from "vue";
import { VueFlow } from "@vue-flow/core";
import { Background } from "@vue-flow/background";
import { Controls } from "@vue-flow/controls";
import { MiniMap } from "@vue-flow/minimap";
import "@vue-flow/core/dist/style.css";
import "@vue-flow/core/dist/theme-default.css";
import "@vue-flow/minimap/dist/style.css";
import "@vue-flow/controls/dist/style.css";
import SystemMessageNode from "./SystemMessageNode.vue";
import { useRoute } from "vue-router";
import { useMessageStore } from "../stores/messageStore";

const nodeTypes = {
  "system-message": SystemMessageNode,
};

const elements = ref([]);
const isSaving = ref(false);
const route = useRoute();
const { messageData, fetchMessages, saveMessages } = useMessageStore();

// Generate edges to connect nodes sequentially
const generateEdges = (nodes) => {
  return nodes.slice(1).map((node, index) => ({
    id: `edge-${index + 1}`,
    source: nodes[index].id,
    target: node.id,
    type: "smoothstep",
    label: "↓",
    style: { stroke: "#a094e0" },
  }));
};

const getFlowConfig = () => {
  if (route.path.includes("incoming")) {
    return {
      nodes: Object.entries(messageData.value.incoming || {}).map(
        ([key, content], index) => ({
          id: `node-${index + 1}`,
          type: "system-message",
          position: { x: 250, y: 100 + index * 250 },
          label: key
            .split("_")
            .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
            .join(" "),
          data: {
            content: content.trim(),
          },
        })
      ),
      title: "Incoming Call Handler",
    };
  } else if (route.path.includes("outgoing")) {
    return {
      nodes: Object.entries(messageData.value.outgoing || {}).map(
        ([key, content], index) => ({
          id: `node-${index + 1}`,
          type: "system-message",
          position: { x: 250, y: 100 + index * 250 },
          label: key
            .split("_")
            .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
            .join(" "),
          data: {
            content: content.trim(),
          },
        })
      ),
      title: "Outgoing Call Handler",
    };
  }

  return {
    nodes: [],
    title: "System Message Flow",
  };
};

// Watch for changes in messageData and update flow when data is available
watch(
  messageData,
  async (newData) => {
    if (newData && (newData.incoming || newData.outgoing)) {
      const flowConfig = getFlowConfig();
      elements.value = [
        ...flowConfig.nodes,
        ...generateEdges(flowConfig.nodes),
      ];
    }
  },
  { immediate: true }
);

// Save function to update the system messages via API
const saveFlow = async () => {
  isSaving.value = true;

  try {
    // Get all nodes and their content
    const nodes = elements.value.filter((el) => el.type === "system-message");

    // Create a structured object from the nodes
    const structuredMessage = nodes.reduce((acc, node) => {
      // Convert the label back to snake_case for the key
      const key = node.label.toLowerCase().split(" ").join("_");
      acc[key] = node.data.content;
      return acc;
    }, {});

    // Determine the message type based on the route
    const messageType = route.path.includes("incoming")
      ? "incoming"
      : "outgoing";

    // Save the messages using the store
    const success = await saveMessages(messageType, structuredMessage);

    if (success) {
      alert("Flow saved successfully!");
    } else {
      throw new Error("Failed to save the flow");
    }
  } catch (error) {
    console.error("Error saving flow:", error);
    alert("Failed to save the flow. Please try again.");
  } finally {
    isSaving.value = false;
  }
};

onMounted(async () => {
  // Always fetch messages on mount to ensure we have the latest data
  await fetchMessages();
});
</script>

<style scoped>
.system-message-flow {
  width: 100%;
  height: 100vh;
  background-color: #f0f0f0;
  position: relative;
}

.controls {
  position: absolute;
  top: 20px;
  right: 20px;
  z-index: 5;
}

.save-btn {
  padding: 8px 16px;
  background-color: #4caf50;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  transition: background-color 0.2s;
}

.save-btn:hover:not(:disabled) {
  background-color: #45a049;
}

.save-btn:disabled {
  background-color: #cccccc;
  cursor: not-allowed;
}

.flow-container {
  width: 100%;
  height: 100%;
}

/* Styles for nodes of type "system-message" */
:deep(.vue-flow__node-system-message) {
  background: #e9e7fd;
  border: 1px solid #a094e0;
  border-radius: 8px;
  padding: 15px;
  font-size: 12px;
  text-align: left;
  min-width: 200px;
  max-width: 300px;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
}

:deep(.vue-flow__node-system-message .vue-flow__node-label),
:deep(.vue-flow__node-default .vue-flow__node-label) {
  font-weight: bold;
  margin-bottom: 8px;
  display: block;
  color: #333;
  font-size: 14px;
}

:deep(.vue-flow__edge-text) {
  font-size: 10px;
  fill: #2c3e50;
  background: rgba(245, 245, 245, 0.8);
  padding: 2px 4px;
  border-radius: 3px;
}
</style>