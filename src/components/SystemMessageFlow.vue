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
      :nodes="allNodes"
      @close="closeConfigModal"
      @save="handleSaveConfig"
    />

    <!-- Node Type Selection Modal -->
    <div v-if="showNodeTypeModal" class="node-type-modal-overlay">
      <div class="node-type-modal">
        <h3>Select Node Type</h3>
        <div class="node-type-list">
          <button
            v-for="type in availableNodeTypes"
            :key="type.value"
            @click="selectNodeType(type.value)"
          >
            {{ type.label }}
          </button>
        </div>
        <button class="close-btn" @click="closeNodeTypeModal">Cancel</button>
      </div>
    </div>

    <!-- JSON Display Modal -->
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
import { ref, onMounted, h, nextTick, computed } from "vue";
import { VueFlow, useVueFlow, ConnectionMode } from "@vue-flow/core";
import { Background } from "@vue-flow/background";
import { Controls } from "@vue-flow/controls";
import { MiniMap } from "@vue-flow/minimap";
import "@vue-flow/core/dist/style.css";
import "@vue-flow/core/dist/theme-default.css";
import "@vue-flow/minimap/dist/style.css";
import "@vue-flow/controls/dist/style.css";
import BaseNode from "./BaseNode.vue";
import { useRoute } from "vue-router";
import haInvestments from "../data/flows/ha-investments-campaign.json";
import ConfigModal from "./modals/ConfigModal.vue";

const LOCAL_STORAGE_KEY = "vueFlow_ha-investments-campaign";

const nodeTypeLabels = {
  start: "Start Node",
  function: "Function Node",
  end: "End Node",
  end_interested: "End Interested Node",
  end_unsure: "End Unsure Node",
  end_not_interested: "End Not Interested Node",
};

const nodeTypes = {};
const nodeTypesWithUpdate = {};
Object.keys(nodeTypeLabels).forEach((type) => {
  nodeTypes[type] = BaseNode;
});
Object.entries(nodeTypes).forEach(([type, Comp]) => {
  nodeTypesWithUpdate[type] = (nodeProps) =>
    h(Comp, {
      ...nodeProps,
      type,
      label: nodeTypeLabels[type] || type,
      data: nodeProps.data,
      "onUpdate:data": (newData) => updateNodeData(nodeProps.id, newData),
      "onOpen-settings": (data) => openConfigModal({ id: nodeProps.id, data }),
      "onAdd-node": () => openNodeTypeModal(nodeProps.id),
      "onDelete-node": () => deleteNodeAndEdges(nodeProps.id),
    });
});

const isSaving = ref(false);
const route = useRoute();
const { project } = useVueFlow();

const showConfigModal = ref(false);
const currentNodeData = ref(null);
const currentNodeId = ref(null);

const elements = ref([]);

// Compute all nodes for passing to ConfigModal
const allNodes = computed(() => {
  return elements.value.filter((el) => !el.source);
});

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
    updateEdgesForNode(currentNodeId.value, updatedData);
    saveElementsToLocalStorage();
  }
  closeConfigModal();
};

const updateEdgesForNode = (nodeId, updatedData) => {
  // Remove existing edges for this node
  const oldEdges = elements.value.filter(
    (el) => el.source === nodeId && el.id.startsWith(`edge-${nodeId}-`)
  );
  elements.value = elements.value.filter((el) => !oldEdges.includes(el));

  // Add new edges based on updated functions
  const newEdges = [];
  if (updatedData.functions && Array.isArray(updatedData.functions)) {
    updatedData.functions.forEach((func) => {
      if (func.function && func.function.transition_to) {
        const targetNodeId = func.function.transition_to;
        const edgeId = `edge-${nodeId}-${targetNodeId}-${Date.now()}`;
        newEdges.push({
          id: edgeId,
          source: nodeId,
          target: targetNodeId,
          type: "smoothstep",
          animated: true,
          label: func.function.name,
          style: { stroke: "#555" },
        });
      }
    });
  }
  elements.value = [...elements.value, ...newEdges];
};

const saveElementsToLocalStorage = () => {
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(elements.value));
  } catch (error) {
    console.error("Error saving flow to localStorage:", error);
  }
};

onMounted(async () => {
  try {
    const savedElementsString = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (savedElementsString) {
      const savedElements = JSON.parse(savedElementsString);
      if (Array.isArray(savedElements)) {
        elements.value = savedElements;
        console.log("Flow loaded from localStorage.");
        return;
      }
    }
  } catch (error) {
    console.error("Error loading flow from localStorage:", error);
  }

  console.log("Loading flow from file as localStorage is empty or invalid.");
  const initialNodes = [];
  const initialEdges = [];

  Object.entries(haInvestments.nodes).forEach(([nodeId, nodeData]) => {
    const position = {
      x: (initialNodes.length % 5) * 250,
      y: Math.floor(initialNodes.length / 5) * 200,
    };

    initialNodes.push({
      id: nodeId,
      type: nodeData.type || nodeId.split("_NODE")[0],
      position,
      data: {
        role_messages: nodeData.role_messages || [],
        task_messages: nodeData.task_messages || [],
        functions: nodeData.functions || [],
        post_actions: nodeData.post_actions || [],
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

const isValidConnection = (connection) => {
  const sourceNode = elements.value.find((el) => el.id === connection.source);
  const targetNode = elements.value.find((el) => el.id === connection.target);

  if (!sourceNode || !targetNode) return false;
  if (sourceNode.id === targetNode.id) return false;
  return true;
};

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
    const nodes = elements.value.filter((el) => !el.source);
    const edges = elements.value.filter((el) => el.source);

    const flowData = {
      initial_node: "start",
      nodes: {},
    };

    nodes.forEach((node) => {
      const nodeData = {
        role_messages: node.data.role_messages || [],
        task_messages: node.data.task_messages || [],
        functions: node.data.functions || [],
        post_actions: node.data.post_actions || [],
      };

      flowData.nodes[node.id] = nodeData;
    });

    formattedJson.value = JSON.stringify(flowData, null, 2);
    showJsonModal.value = true;
    saveElementsToLocalStorage();
  } catch (error) {
    console.error("Error saving flow:", error);
    alert("Failed to save the flow. Please try again.");
  } finally {
    isSaving.value = false;
  }
};

const showNodeTypeModal = ref(false);
const nodeToAttachFrom = ref(null);
const availableNodeTypes = [
  { value: "function", label: "Function Node" },
  { value: "end", label: "End Node" },
  { value: "end_interested", label: "End Interested Node" },
  { value: "end_unsure", label: "End Unsure Node" },
  { value: "end_not_interested", label: "End Not Interested Node" },
];

function openNodeTypeModal(fromNodeId) {
  nodeToAttachFrom.value = fromNodeId;
  showNodeTypeModal.value = true;
}

function closeNodeTypeModal() {
  showNodeTypeModal.value = false;
  nodeToAttachFrom.value = null;
}

async function selectNodeType(type) {
  const fromNodeId = nodeToAttachFrom.value;
  const fromNode = elements.value.find((el) => el.id === fromNodeId);
  if (!fromNode) return;
  const position = {
    x: fromNode.position.x + 250,
    y: fromNode.position.y + 50,
  };
  const newNodeId = `${type}-${Date.now()}`;
  const defaultData = {
    role_messages: [],
    task_messages: [],
    functions: [],
    post_actions: [],
  };
  const newNode = {
    id: newNodeId,
    type,
    position,
    data: defaultData,
  };
  elements.value = [
    ...elements.value,
    newNode,
    {
      id: `edge-${fromNodeId}-${newNodeId}-${Date.now()}`,
      source: fromNodeId,
      target: newNodeId,
      type: "smoothstep",
      animated: true,
      style: { stroke: "#555" },
    },
  ];
  closeNodeTypeModal();
  await nextTick();
  openConfigModal({ id: newNodeId, data: defaultData });
}

function deleteNodeAndEdges(nodeId) {
  elements.value = elements.value.filter(
    (el) => el.id !== nodeId && el.source !== nodeId && el.target !== nodeId
  );
}

function updateNodeData(nodeId, newData) {
  const node = elements.value.find((el) => el.id === nodeId);
  if (node) {
    node.data = newData;
  }
}
</script>

<style scoped>
.system-message-flow {
  width: 100%;
  height: 100vh;
  background-color: #f0f0f0;
  position: relative;
  display: flex;
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

.node-type-modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(0, 0, 0, 0.3);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
}

.node-type-modal {
  background: #fff;
  border-radius: 10px;
  padding: 32px 24px 24px 24px;
  min-width: 320px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.18);
  display: flex;
  flex-direction: column;
  align-items: center;
}

.node-type-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin: 18px 0 12px 0;
  width: 100%;
}

.node-type-list button {
  padding: 12px 18px;
  border-radius: 6px;
  border: none;
  background: #f0f4f8;
  color: #222;
  font-size: 1em;
  cursor: pointer;
  transition: background 0.2s;
}

.node-type-list button:hover {
  background: #21d4fd;
  color: #fff;
}

.node-type-modal .close-btn {
  margin-top: 10px;
  background: #eee;
  color: #333;
  border: none;
  border-radius: 6px;
  padding: 8px 16px;
  cursor: pointer;
  font-size: 1em;
}

.node-type-modal .close-btn:hover {
  background: #ccc;
}
</style>