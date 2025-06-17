<script setup>
import { ref } from "vue";
import { VueFlow, useVueFlow } from "@vue-flow/core";
import { Background } from "@vue-flow/background";
import { Controls } from "@vue-flow/controls";
import { MiniMap } from "@vue-flow/minimap";
import { initialEdges, initialNodes } from "./data/ha-investments-elements";

const { onInit, onNodeDragStop, onConnect, setViewport, toObject, onNodesChange } =
  useVueFlow();
const nodes = ref(initialNodes);
const edges = ref(initialEdges);
const dark = ref(false);
const nodeTypeIndex = ref(0);
const selectedNode = ref(null);

const nodeTypes = [
  { type: undefined, label: "Normal" },
  { type: "input", label: "Input" },
  { type: "output", label: "Output" },
  { type: "function", label: "Function" },
];

const actionOptions = [
  { id: "transfer_call", label: "Transfer Call" },
  { id: "end_conversation", label: "End Conversation" },
  { id: "make_api_call", label: "Make API Call" },
];

onInit((instance) => instance.fitView());

onNodeDragStop(({ event, nodes, node }) => {
  console.log("Node Drag Stop", { event, nodes, node });
});

// Sync node changes (e.g., position updates) back to the nodes ref
onNodesChange((changes) => {
  changes.forEach((change) => {
    // Check if the change is a node removal
    if (change.type === 'remove') {
      // If the removed node was the selected node, close the panel
      if (selectedNode.value && selectedNode.value.id === change.id) {
        selectedNode.value = null;
      }
      return;
    }

    const node = nodes.value.find((n) => n.id === change.id);
    if (node) {
      if (change.type === "position" && change.position) {
        node.position = { ...change.position };
      }
      // Add handling for other change types (e.g., 'dimensions') if needed
    }
  });
});

onConnect((connection) => {
  const sourceNode = nodes.value.find((n) => n.id === connection.source);
  const targetNode = nodes.value.find((n) => n.id === connection.target);

  const isSourceFunction = sourceNode?.type === "function";
  const isTargetFunction = targetNode?.type === "function";

  // Prevent function-to-function connections
  if (isSourceFunction && isTargetFunction) {
    console.log("Cannot connect function to function");
    return;
  }

  // Add the new edge directly to the edges ref
  const newEdge = {
    id: `e${connection.source}-${connection.target}`,
    source: connection.source,
    target: connection.target,
    // Add additional edge properties if needed (e.g., type, label)
  };
  edges.value.push(newEdge);
});

function updatePos() {
  nodes.value = nodes.value.map((node) => ({
    ...node,
    position: {
      x: Math.random() * 400,
      y: Math.random() * 400,
    },
  }));
}

function addNewNode() {
  const newNodeId = (nodes.value.length + 1).toString();
  const currentNodeType = nodeTypes[nodeTypeIndex.value];

  const newNode = {
    id: newNodeId,
    data: {
      label: `${currentNodeType.label} Node ${newNodeId}`,
      role_messages: [],
      task_messages: [],
      pre_actions: [],
      post_actions: [],
      function_name: "",
      function_description: "",
    },
    position: {
      x: Math.random() * 400,
      y: Math.random() * 400,
    },
    class: "light",
  };

  if (currentNodeType.type) {
    newNode.type = currentNodeType.type;
  }

  nodes.value.push(newNode);
  nodeTypeIndex.value = (nodeTypeIndex.value + 1) % nodeTypes.length;
}

function addSpecificNode(typeIndex) {
  const newNodeId = (nodes.value.length + 1).toString();
  const nodeType = nodeTypes[typeIndex];

  const newNode = {
    id: newNodeId,
    data: {
      label: `${nodeType.label} Node ${newNodeId}`,
      role_messages: [],
      task_messages: [],
      pre_actions: [],
      post_actions: [],
      function_name: "",
      function_description: "",
    },
    position: {
      x: Math.random() * 400,
      y: Math.random() * 400,
    },
    class: "light",
  };

  if (nodeType.type) {
    newNode.type = nodeType.type;
  }

  if (nodeType.type === "function") {
    newNode.style = {
      background: "#6a1b9a",
      color: "white",
      border: "2px solid #4a148c",
      borderRadius: "8px",
    };
  }

  nodes.value.push(newNode);
}

// Remaining functions (onNodeClick, closeConfigPanel, etc.) remain unchanged
function onNodeClick(event) {
  console.log("Node clicked event:", event);
  if (event.node) {
    if (!event.node.data.role_messages) event.node.data.role_messages = [];
    if (!event.node.data.task_messages) event.node.data.task_messages = [];
    if (!event.node.data.pre_actions) event.node.data.pre_actions = [];
    if (!event.node.data.post_actions) event.node.data.post_actions = [];
    if (!event.node.data.function_name) event.node.data.function_name = "";
    if (!event.node.data.function_description)
      event.node.data.function_description = "";

    selectedNode.value = event.node;
  }
}

function closeConfigPanel() {
  selectedNode.value = null;
}

function addRoleMessage(node) {
  if (!node.data.role_messages) {
    node.data.role_messages = [];
  }
  node.data.role_messages.push({ role: "", content: "" });
}

function addTaskMessage(node) {
  if (!node.data.task_messages) {
    node.data.task_messages = [];
  }
  node.data.task_messages.push({ role: "", content: "" });
}

function removeRoleMessage(node, index) {
  node.data.role_messages.splice(index, 1);
}

function removeTaskMessage(node, index) {
  node.data.task_messages.splice(index, 1);
}

function toggleAction(node, action, type) {
  const actions =
    type === "pre" ? node.data.pre_actions : node.data.post_actions;
  const index = actions.indexOf(action);
  if (index === -1) {
    actions.push(action);
  } else {
    actions.splice(index, 1);
  }
}

function logToObject() {
  console.log(toObject());
}

function exportConfiguration() {
  try {
    const config = toObject();
    console.log("📄 VueFlow config:", config);

    import("./utils/flowParser.js")
      .then(
        ({
          parseVueFlowToHAInvestments,
          exportHAInvestmentsConfig,
          validateFlowConfig,
        }) => {
          try {
            console.log("✅ Parser module loaded successfully");
            const parsedConfig = parseVueFlowToHAInvestments(config);
            console.log("✅ Parsed config:", parsedConfig);
            const validation = validateFlowConfig(parsedConfig);
            console.log("✅ Validation result:", validation);

            if (!validation.isValid) {
              console.error("❌ Validation failed:", validation.errors);
              alert(
                "Export validation failed:\n" + validation.errors.join("\n")
              );
              return;
            }

            const success = exportHAInvestmentsConfig(
              parsedConfig,
              "ha-investments-campaign"
            );

            if (success) {
              console.log("✅ Configuration exported successfully!");
              alert("✅ Configuration exported successfully!");
            }
          } catch (parseError) {
            console.error("❌ Parse error:", parseError);
            alert("Parse failed: " + parseError.message);
          }
        }
      )
      .catch((importError) => {
        console.error("❌ Failed to load parser:", importError);
        console.log("📄 Using fallback export method");
        const blob = new Blob([JSON.stringify(config, null, 2)], {
          type: "application/json",
        });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "flow-configuration.json";
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        alert(
          "⚠️ Used fallback export. Check console for details.\nError: " +
            importError.message
        );
      });
  } catch (error) {
    console.error("❌ Export configuration failed:", error);
    alert("Export failed: " + error.message);
  }
}

function resetTransform() {
  setViewport({ x: 0, y: 0, zoom: 1 });
}

function toggleDarkMode() {
  dark.value = !dark.value;
}
</script>

<template>
  <VueFlow
    :nodes="nodes"
    :edges="edges"
    :class="{ dark }"
    class="basic-flow"
    :default-viewport="{ zoom: 1.5 }"
    :min-zoom="0.2"
    :max-zoom="4"
    @nodeClick="onNodeClick"
  >
    <Background pattern-color="#aaa" :gap="16" />
    <MiniMap />
    <Controls />
  </VueFlow>

  <div class="controls-panel">
    <div class="specific-buttons">
      <button @click="addSpecificNode(0)" class="add-node-btn normal-btn">
        Add Normal Node
      </button>
      <button @click="addSpecificNode(1)" class="add-node-btn input-btn">
        Add Input Node
      </button>
      <button @click="addSpecificNode(2)" class="add-node-btn output-btn">
        Add Output Node
      </button>
      <button @click="addSpecificNode(3)" class="add-node-btn function-btn">
        Add Function Node
      </button>
      <button @click="exportConfiguration" class="add-node-btn export-btn">
        Export Configuration
      </button>
    </div>
  </div>

  <div v-if="selectedNode" class="config-panel">
    <div class="config-header">
      <h3>Node Configuration</h3>
      <button @click="closeConfigPanel" class="close-btn">×</button>
    </div>

    <div class="config-content">
      <!-- Node Name Configuration -->
      <div class="config-section">
        <div class="config-group horizontal">
          <label>Node Name:</label>
          <input v-model="selectedNode.data.label" type="text" placeholder="Enter node name" />
        </div>
      </div>

      <!-- Function Node Configuration -->
      <div v-if="selectedNode.type === 'function'" class="function-config">
        <div class="config-group horizontal">
          <label>Function Name:</label>
          <input v-model="selectedNode.data.function_name" type="text" placeholder="Enter function name" />
        </div>
        <div class="config-group horizontal">
          <label>Description:</label>
          <textarea v-model="selectedNode.data.function_description" placeholder="Enter function description"></textarea>
        </div>
      </div>

      <!-- Non-Function Node Configuration -->
      <template v-else>
        <!-- Role Messages -->
        <div class="config-section">
          <h4>Role Messages</h4>
          <button @click="addRoleMessage(selectedNode)" class="add-btn">
            + Add Message
          </button>
          <div
            v-for="(message, index) in selectedNode.data.role_messages"
            :key="index"
            class="message-group"
          >
            <div class="config-group horizontal">
              <label>Role:</label>
              <input v-model="message.role" placeholder="system, user, assistant" />
            </div>
            <div class="config-group horizontal">
              <label>Content:</label>
              <textarea v-model="message.content" placeholder="Enter message content"></textarea>
            </div>
            <button
              @click="removeRoleMessage(selectedNode, index)"
              class="remove-btn"
            >
              Remove
            </button>
          </div>
        </div>

        <!-- Task Messages -->
        <div class="config-section">
          <h4>Task Messages</h4>
          <button @click="addTaskMessage(selectedNode)" class="add-btn">
            + Add Message
          </button>
          <div
            v-for="(message, index) in selectedNode.data.task_messages"
            :key="index"
            class="message-group"
          >
            <div class="config-group horizontal">
              <label>Role:</label>
              <input v-model="message.role" placeholder="system, user, assistant" />
            </div>
            <div class="config-group horizontal">
              <label>Content:</label>
              <textarea v-model="message.content" placeholder="Enter message content"></textarea>
            </div>
            <button
              @click="removeTaskMessage(selectedNode, index)"
              class="remove-btn"
            >
              Remove
            </button>
          </div>
        </div>

        <!-- Pre Actions -->
        <div class="config-section">
          <h4>Pre Actions</h4>
          <div class="action-group">
            <label v-for="action in actionOptions" :key="action.id">
              <input
                type="checkbox"
                :checked="selectedNode.data.pre_actions?.includes(action.id)"
                @change="toggleAction(selectedNode, action.id, 'pre')"
              />
              {{ action.label }}
            </label>
          </div>
        </div>

        <!-- Post Actions -->
        <div class="config-section">
          <h4>Post Actions</h4>
          <div class="action-group">
            <label v-for="action in actionOptions" :key="action.id">
              <input
                type="checkbox"
                :checked="selectedNode.data.post_actions?.includes(action.id)"
                @change="toggleAction(selectedNode, action.id, 'post')"
              />
              {{ action.label }}
            </label>
          </div>
        </div>
      </template>
    </div>
  </div>
</template>

<style scoped>
/* Import Inter font from Google Fonts */
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');

body {
  font-family: 'Inter', sans-serif;
  margin: 0;
  padding: 0;
}

/* Controls Panel */
.controls-panel {
  position: absolute;
  top: 16px;
  left: 16px;
  z-index: 1000;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.specific-buttons {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.add-node-btn {
  background-color: #007bff; /* Halsell's primary blue */
  color: white;
  border: none;
  padding: 10px 16px;
  text-align: center;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  border-radius: 6px;
  transition: background-color 0.3s ease;
     min-width: 160px;
   box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
 }

.add-node-btn:hover {
  background-color: #0056b3; /* Darker blue for hover effect */
}

.normal-btn {
  background-color: #4caf50; /* Green for normal nodes */
}

.normal-btn:hover {
  background-color: #45a049;
}

.input-btn {
  background-color: #ff9800; /* Orange for input nodes */
}

.input-btn:hover {
  background-color: #f57c00;
}

.output-btn {
  background-color: #e91e63; /* Pink for output nodes */
}

.output-btn:hover {
  background-color: #c2185b;
}

.function-btn {
  background-color: #9c27b0; /* Purple for function nodes */
}

.function-btn:hover {
  background-color: #8e24aa;
}

.export-btn {
  background-color: #2196f3; /* Light blue for export */
}

.export-btn:hover {
  background-color: #1976d2;
}

/* Config Panel */
.config-panel {
  position: absolute;
  top: 16px;
  right: 16px;
  width: 420px;
  background: white;
  padding: 0;
  border-radius: 8px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.12), 0 2px 8px rgba(0, 0, 0, 0.08);
  z-index: 1000;
  max-height: 85vh;
  overflow: hidden;
  border: 1px solid #e1e5e9;
}

.config-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  background: #f8f9fa;
  border-bottom: 1px solid #e9ecef;
  position: sticky;
  top: 0;
  z-index: 10;
}

.config-header h3 {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: #2d3748;
  letter-spacing: -0.01em;
}

.close-btn {
  background: none;
  border: none;
  font-size: 18px;
  cursor: pointer;
  color: #718096;
  padding: 4px;
  line-height: 1;
  border-radius: 4px;
  transition: all 0.15s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
}

.close-btn:hover {
  background: #e2e8f0;
  color: #4a5568;
}

.config-content {
  padding: 20px;
  max-height: calc(85vh - 60px);
  overflow-y: auto;
  overflow-x: hidden;
}

.config-section {
  margin-bottom: 24px;
}

.config-section:last-child {
  margin-bottom: 0;
}

.config-group {
  margin-bottom: 16px;
}

.config-group.horizontal {
  display: grid;
  grid-template-columns: 120px 1fr;
  gap: 12px;
  align-items: start;
}

.config-group label {
  display: block;
  margin-bottom: 6px;
  font-weight: 500;
  color: #4a5568;
  font-size: 13px;
  line-height: 1.4;
  padding-top: 6px;
}

.config-group.horizontal label {
  margin-bottom: 0;
  text-align: right;
  padding-top: 8px;
}

.config-group input,
.config-group textarea {
  width: 100%;
  padding: 8px 12px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 13px;
  font-family: 'Inter', sans-serif;
  transition: all 0.15s ease;
  background: #ffffff;
  color: #374151;
  line-height: 1.4;
}

.config-group input:focus,
.config-group textarea:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.1);
}

.config-group textarea {
  height: 60px;
  resize: vertical;
  min-height: 40px;
}

.message-group {
  margin-bottom: 12px;
  padding: 12px;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  background: #fafbfc;
}

.message-group .config-group {
  margin-bottom: 8px;
}

.message-group .config-group:last-child {
  margin-bottom: 0;
}

.add-btn {
  background: #3b82f6;
  color: white;
  border: none;
  padding: 6px 12px;
  border-radius: 5px;
  cursor: pointer;
  font-size: 12px;
  font-weight: 500;
  margin-bottom: 12px;
  transition: all 0.15s ease;
  letter-spacing: -0.01em;
}

.add-btn:hover {
  background: #2563eb;
}

.remove-btn {
  background: #ef4444;
  color: white;
  border: none;
  padding: 4px 8px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 11px;
  font-weight: 500;
  margin-top: 6px;
  transition: all 0.15s ease;
  letter-spacing: -0.01em;
}

.remove-btn:hover {
  background: #dc2626;
}

.action-group {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 8px;
  padding: 12px;
  background: #f7fafc;
  border-radius: 6px;
  border: 1px solid #e2e8f0;
}

.action-group label {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  font-size: 12px;
  color: #4a5568;
  padding: 6px 8px;
  border-radius: 4px;
  transition: all 0.15s ease;
  font-weight: 500;
  margin-bottom: 0;
  text-align: left;
  padding-top: 6px;
}

.action-group label:hover {
  background: rgba(59, 130, 246, 0.05);
  color: #2563eb;
}

.action-group input[type="checkbox"] {
  width: 14px;
  height: 14px;
  cursor: pointer;
  accent-color: #3b82f6;
}

h4 {
  margin: 0 0 12px 0;
  font-size: 14px;
  font-weight: 600;
  color: #374151;
  letter-spacing: -0.01em;
  padding-bottom: 6px;
  border-bottom: 1px solid #e5e7eb;
}

.function-config .config-group {
  margin-bottom: 16px;
}

/* Enhanced scrollbar styling */
.config-content::-webkit-scrollbar {
  width: 5px;
}

.config-content::-webkit-scrollbar-track {
  background: #f1f5f9;
  border-radius: 2px;
}

.config-content::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 2px;
}

.config-content::-webkit-scrollbar-thumb:hover {
  background: #94a3b8;
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .config-panel {
    width: 100%;
    top: 0;
    right: 0;
    height: 100%;
    max-height: none;
    border-radius: 0;
  }

  .config-group.horizontal {
    grid-template-columns: 1fr;
    gap: 6px;
  }

  .config-group.horizontal label {
    text-align: left;
    padding-top: 0;
    margin-bottom: 4px;
  }

  .action-group {
    grid-template-columns: 1fr;
  }
}
</style>