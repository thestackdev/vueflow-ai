<template>
  <div class="system-message-flow">
    <div class="controls">
      <button @click="saveFlow" class="save-btn" :disabled="isSaving">
        {{ isSaving ? "Saving..." : "Save Flow" }}
      </button>
    </div>

    <div class="flow-container">
      <VueFlow
        v-model="elements"
        class="flow"
        :default-zoom="1.0"
        :min-zoom="0.1"
        :max-zoom="4"
        :node-types="nodeTypes"
        @connect="onConnect"
        :connection-mode="ConnectionMode.Loose"
        :snap-to-grid="true"
        :snap-grid="[15, 15]"
        fit-view-on-init
      >
        <Background pattern-color="#aaa" gap="8" />
        <Controls />
        <MiniMap />
      </VueFlow>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { VueFlow, useVueFlow, ConnectionMode } from "@vue-flow/core";
import { Background } from "@vue-flow/background";
import { Controls } from "@vue-flow/controls";
import { MiniMap } from "@vue-flow/minimap";
import "@vue-flow/core/dist/style.css";
import "@vue-flow/core/dist/theme-default.css";
import "@vue-flow/minimap/dist/style.css";
import "@vue-flow/controls/dist/style.css";
import StartNode from "./nodes/StartNode.vue";
import EndNode from "./nodes/EndNode.vue";
import EndInterestedNode from "./nodes/EndInterestedNode.vue";
import EndUnsureNode from "./nodes/EndUnsureNode.vue";
import EndNotInterestedNode from "./nodes/EndNotInterestedNode.vue";
import { useRoute } from "vue-router";
import haInvestments from "../data/flows/ha-investments-campaign.json";

const nodeTypes = {
  start: StartNode,
  end: EndNode,
  end_interested: EndInterestedNode,
  end_unsure: EndUnsureNode,
  end_not_interested: EndNotInterestedNode,
};

const elements = ref([]);
const isSaving = ref(false);
const route = useRoute();
const { project } = useVueFlow();

// Initialize with ha-investments flow
onMounted(async () => {
  const nodes = Object.entries(haInvestments.nodes).map(
    ([type, data], index) => ({
      id: type,
      type,
      position: { x: index * 300, y: 100 },
      data,
    })
  );

  // Add edges based on functions
  const edges = [];
  Object.entries(haInvestments.nodes).forEach(([nodeId, nodeData]) => {
    if (nodeData.functions) {
      nodeData.functions.forEach((func) => {
        if (func.function.transition_to) {
          edges.push({
            id: `${nodeId}-${func.function.transition_to}`,
            source: nodeId,
            target: func.function.transition_to,
            type: "smoothstep",
            animated: true,
            label: func.function.name,
          });
        }
      });
    }
  });

  elements.value = [...nodes, ...edges];
});

// Add connection validation
const isValidConnection = (connection) => {
  const sourceNode = elements.value.find((el) => el.id === connection.source);
  const targetNode = elements.value.find((el) => el.id === connection.target);

  if (!sourceNode || !targetNode) return false;

  // Prevent connecting a node to itself
  if (sourceNode.id === targetNode.id) return false;

  // Check if the connection is valid based on ha-investments flow
  const sourceData = haInvestments.nodes[sourceNode.id];
  if (!sourceData.functions) return false;

  return sourceData.functions.some(
    (func) => func.function.transition_to === targetNode.id
  );
};

// Add connection handler
const onConnect = (connection) => {
  if (isValidConnection(connection)) {
    const newEdge = {
      id: `edge-${Date.now()}`,
      source: connection.source,
      target: connection.target,
      type: "smoothstep",
      animated: true,
      style: { stroke: "#555" },
    };
    elements.value = [...elements.value, newEdge];
  }
};

// Save function to update the flow
const saveFlow = async () => {};
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

.flow {
  flex: 1;
  height: 100%;
}

:deep(.vue-flow__node) {
  padding: 0;
  border-radius: 8px;
  width: auto;
  font-size: 12px;
  text-align: left;
  border-width: 1px;
  border-style: solid;
}

:deep(.vue-flow__edge-text) {
  font-size: 10px;
  fill: #2c3e50;
  background: rgba(245, 245, 245, 0.8);
  padding: 2px 4px;
  border-radius: 3px;
}
</style>