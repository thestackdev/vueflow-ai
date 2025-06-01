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
        :node-types="nodeTypesWithUpdate"
        @drop="onDrop"
        @dragover="onDragOver"
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

    <ConfigModal
      :show="showConfigModal"
      :data="currentNodeData"
      @close="closeConfigModal"
      @save="handleSaveConfig"
    />

    <!-- Add JSON Display Modal -->
    <div v-if="showJsonModal" class="json-modal">
      <div class="json-modal-content">
        <div class="json-modal-header">
          <h3>Flow JSON</h3>
          <button @click="closeJsonModal" class="close-btn">&times;</button>
        </div>
        <div class="json-modal-body">
          <pre>{{ formattedJson }}</pre>
        </div>
        <div class="json-modal-footer">
          <button @click="copyJson" class="copy-btn">Copy JSON</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, h } from "vue";
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
import ConfigModal from "./modals/ConfigModal.vue";

const LOCAL_STORAGE_KEY = "vueFlow_ha-investments-campaign";

const nodeTypes = {
  start: StartNode,
  end: EndNode,
  end_interested: EndInterestedNode,
  end_unsure: EndUnsureNode,
  end_not_interested: EndNotInterestedNode,
};

// Wrap node components to listen for update:data and update elements
const elements = ref([]);
const updateNodeData = (id, newData) => {
  const idx = elements.value.findIndex((el) => el.id === id && !el.source);
  if (idx !== -1) {
    elements.value[idx] = {
      ...elements.value[idx],
      data: { ...newData },
    };
  }
};
const nodeTypesWithUpdate = {};
Object.entries(nodeTypes).forEach(([type, Comp]) => {
  nodeTypesWithUpdate[type] = (nodeProps) =>
    h(Comp, {
      ...nodeProps,
      data: nodeProps.data,
      "onUpdate:data": (newData) => updateNodeData(nodeProps.id, newData),
      "onOpen-settings": (data) => openConfigModal({ id: nodeProps.id, data }),
    });
});

const isSaving = ref(false);
const route = useRoute();
const { project } = useVueFlow();

const showConfigModal = ref(false);
const currentNodeData = ref(null);
const currentNodeId = ref(null);

const openConfigModal = (node) => {
  currentNodeData.value = node.data;
  currentNodeId.value = node.id;
  showConfigModal.value = true;
};

const closeConfigModal = () => {
  showConfigModal.value = false;
  currentNodeData.value = null;
  currentNodeId.value = null;
};

const handleSaveConfig = (updatedData) => {
  if (currentNodeId.value) {
    updateNodeData(currentNodeId.value, updatedData);
    saveElementsToLocalStorage(); // Persist changes after node config update
  }
  closeConfigModal();
};

const saveElementsToLocalStorage = () => {
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(elements.value));
  } catch (error) {
    console.error("Error saving flow to localStorage:", error);
    // Optionally, notify the user that saving to localStorage failed
  }
};

// Initialize with ha-investments flow
onMounted(async () => {
  try {
    const savedElementsString = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (savedElementsString) {
      const savedElements = JSON.parse(savedElementsString);
      if (Array.isArray(savedElements)) {
        elements.value = savedElements;
        console.log("Flow loaded from localStorage.");
        return; // Exit if loaded from localStorage
      }
    }
  } catch (error) {
    console.error("Error loading flow from localStorage:", error);
    // Proceed to load from file if localStorage fails
  }

  console.log("Loading flow from file as localStorage is empty or invalid.");
  // Convert ha-investments flow to Vue Flow elements
  const initialNodes = [];
  const initialEdges = [];

  Object.entries(haInvestments.nodes).forEach(([nodeId, nodeData]) => {
    // Find a unique position for each node - simple stagger for now
    const position = {
      x: (initialNodes.length % 5) * 250, // Arrange in rows of 5
      y: Math.floor(initialNodes.length / 5) * 200,
    };

    initialNodes.push({
      id: nodeId, // Use the ID from the JSON
      type: nodeData.type || nodeId.split("_NODE")[0], // Infer type from ID if not present, or use a default
      position,
      data: {
        // Ensure data is structured as expected by nodes
        role_messages: nodeData.role_messages || [],
        task_messages: nodeData.task_messages || [],
        functions: nodeData.functions || [], // Keep original functions for now, saveFlow will rebuild based on edges
        post_actions: nodeData.post_actions || [],
        // Add any other specific fields your nodes expect from the JSON
      },
    });

    if (nodeData.functions) {
      nodeData.functions.forEach((func) => {
        if (func.function && func.function.transition_to) {
          initialEdges.push({
            id: `edge-${nodeId}-${func.function.transition_to}`,
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

  elements.value = [...initialNodes, ...initialEdges];
});

// Drag and drop handlers
const onDragStart = (event, node) => {
  event.dataTransfer.setData("application/vueflow", node.type);
  event.dataTransfer.effectAllowed = "move";
};

const onDragOver = (event) => {
  event.preventDefault();
  event.dataTransfer.dropEffect = "move";
};

const onDrop = (event) => {
  const type = event.dataTransfer.getData("application/vueflow");
  const position = project({ x: event.clientX, y: event.clientY });

  // Create a new node with default data based on type
  const defaultData = {
    role_messages: [],
    task_messages: [],
    functions: [],
    post_actions: [],
  };

  const newNode = {
    id: `${type}-${Date.now()}`,
    type,
    position,
    data: defaultData,
  };

  elements.value = [...elements.value, newNode];
};

// Add connection validation
const isValidConnection = (connection) => {
  const sourceNode = elements.value.find((el) => el.id === connection.source);
  const targetNode = elements.value.find((el) => el.id === connection.target);

  if (!sourceNode || !targetNode) return false;

  // Prevent connecting a node to itself
  if (sourceNode.id === targetNode.id) return false;

  // Allow any connection between nodes
  return true;
};

// Add connection handler
const onConnect = (connection) => {
  if (isValidConnection(connection)) {
    const newEdge = {
      id: `edge-${connection.source}-${connection.target}-${Date.now()}`,
      source: connection.source,
      target: connection.target,
      type: "smoothstep",
      animated: true,
      style: { stroke: "#555" },
    };
    elements.value = [...elements.value, newEdge];
  }
};

const showJsonModal = ref(false);
const formattedJson = ref("");

const closeJsonModal = () => {
  showJsonModal.value = false;
};

const copyJson = () => {
  navigator.clipboard.writeText(formattedJson.value);
  alert("JSON copied to clipboard!");
};

const saveFlow = async () => {
  isSaving.value = true;

  try {
    // Get all nodes and their content
    const nodes = elements.value.filter((el) => !el.source);
    const edges = elements.value.filter((el) => el.source);

    // Create a structured object from the nodes
    const flowData = {
      initial_node: "start",
      nodes: {},
    };

    // Process each node
    nodes.forEach((node) => {
      const nodeData = {
        role_messages: node.data.role_messages || [],
        task_messages: node.data.task_messages || [],
        functions: [],
        post_actions: node.data.post_actions || [],
      };

      // Add functions based on outgoing edges
      const outgoingEdges = edges.filter((edge) => edge.source === node.id);
      outgoingEdges.forEach((edge) => {
        const targetNode = nodes.find((n) => n.id === edge.target);
        if (targetNode) {
          nodeData.functions.push({
            type: "function",
            function: {
              name: edge.label || `transition_to_${targetNode.id}`,
              description: `Transition to ${targetNode.id}`,
              parameters: { type: "object", properties: {} },
              transition_to: targetNode.id,
            },
          });
        }
      });

      flowData.nodes[node.id] = nodeData;
    });

    // Format the JSON for display
    formattedJson.value = JSON.stringify(flowData, null, 2);
    showJsonModal.value = true;
    saveElementsToLocalStorage(); // Also save the current elements state to localStorage
  } catch (error) {
    console.error("Error saving flow:", error);
    alert("Failed to save the flow. Please try again.");
  } finally {
    isSaving.value = false;
  }
};
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
  display: flex;
}

.node-palette {
  width: 200px;
  background: white;
  border-right: 1px solid #ddd;
  padding: 20px;
  overflow-y: auto;
}

.palette-title {
  font-size: 16px;
  font-weight: bold;
  color: #333;
  margin-bottom: 15px;
}

.palette-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px;
  margin-bottom: 8px;
  background: #f8f9fa;
  border: 1px solid #ddd;
  border-radius: 4px;
  cursor: grab;
  transition: all 0.2s;
}

.palette-item:hover {
  background: #e9ecef;
  transform: translateY(-1px);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.node-icon {
  width: 24px;
  height: 24px;
  border-radius: 4px;
}

.node-icon--start {
  background: #2196f3;
}

.node-icon--end {
  background: #f44336;
}

.node-icon--end_interested {
  background: #4caf50;
}

.node-icon--end_unsure {
  background: #ff9800;
}

.node-icon--end_not_interested {
  background: #9c27b0;
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

/* Add JSON Modal Styles */
.json-modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.json-modal-content {
  background-color: white;
  padding: 20px;
  border-radius: 8px;
  width: 80%;
  max-width: 800px;
  max-height: 80vh;
  display: flex;
  flex-direction: column;
}

.json-modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
}

.json-modal-header h3 {
  margin: 0;
  color: #333;
}

.close-btn {
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  color: #666;
}

.json-modal-body {
  flex: 1;
  overflow-y: auto;
  background-color: #f5f5f5;
  padding: 15px;
  border-radius: 4px;
  margin-bottom: 15px;
}

.json-modal-body pre {
  margin: 0;
  white-space: pre-wrap;
  word-wrap: break-word;
  font-family: monospace;
  font-size: 14px;
  line-height: 1.5;
  text-align: left;
}

.json-modal-footer {
  display: flex;
  justify-content: flex-end;
}

.copy-btn {
  padding: 8px 16px;
  background-color: #4caf50;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  transition: background-color 0.2s;
}

.copy-btn:hover {
  background-color: #45a049;
}
</style>