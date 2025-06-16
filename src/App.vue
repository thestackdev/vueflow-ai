<script setup>
import { ref, watch } from "vue";
import { VueFlow, useVueFlow } from "@vue-flow/core";
import { Background } from "@vue-flow/background";
import { Controls } from "@vue-flow/controls";
import { MiniMap } from "@vue-flow/minimap";
import { initialEdges, initialNodes } from "./data/ha-investments-elements";

const { onInit, onNodeDragStop, onConnect, addEdges, setViewport, toObject } =
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

  addEdges(connection);
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

function onNodeClick(event) {
  console.log("Node clicked event:", event);
  if (event.node) {
    // Ensure the node has all required data properties
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

    // Try to import and use the parser
    import("./utils/flowParser.js")
      .then(
        ({
          parseVueFlowToHAInvestments,
          exportHAInvestmentsConfig,
          validateFlowConfig,
        }) => {
          try {
            console.log("✅ Parser module loaded successfully");

            // Parse the VueFlow configuration to ha-investments format
            const parsedConfig = parseVueFlowToHAInvestments(config);
            console.log("✅ Parsed config:", parsedConfig);

            // Validate the configuration
            const validation = validateFlowConfig(parsedConfig);
            console.log("✅ Validation result:", validation);

            if (!validation.isValid) {
              console.error("❌ Validation failed:", validation.errors);
              alert(
                "Export validation failed:\n" + validation.errors.join("\n")
              );
              return;
            }

            // Export the configuration with proper formatting
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

        // Fallback to original export
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

    <!-- Function Node Configuration -->
    <div v-if="selectedNode.type === 'function'" class="function-config">
      <div class="config-group">
        <label>Function Name:</label>
        <input v-model="selectedNode.data.function_name" type="text" />
      </div>
      <div class="config-group">
        <label>Description:</label>
        <textarea v-model="selectedNode.data.function_description"></textarea>
      </div>
    </div>

    <!-- Non-Function Node Configuration -->
    <template v-else>
      <!-- Role Messages -->
      <div class="config-section">
        <h4>Role Messages</h4>
        <button @click="addRoleMessage(selectedNode)" class="add-btn">
          Add Message
        </button>
        <div
          v-for="(message, index) in selectedNode.data.role_messages"
          :key="index"
          class="message-group"
        >
          <input v-model="message.role" placeholder="Role" />
          <textarea v-model="message.content" placeholder="Content"></textarea>
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
          Add Message
        </button>
        <div
          v-for="(message, index) in selectedNode.data.task_messages"
          :key="index"
          class="message-group"
        >
          <input v-model="message.role" placeholder="Role" />
          <textarea v-model="message.content" placeholder="Content"></textarea>
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
</template>

<style scoped>
.controls-panel {
  position: absolute;
  top: 10px;
  left: 10px;
  z-index: 1000;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.specific-buttons {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.add-node-btn {
  color: white;
  border: none;
  padding: 8px 12px;
  text-align: center;
  text-decoration: none;
  display: inline-block;
  font-size: 12px;
  cursor: pointer;
  border-radius: 4px;
  transition: all 0.3s;
  min-width: 120px;
}

.normal-btn {
  background-color: #4caf50;
}

.normal-btn:hover {
  background-color: #45a049;
}

.input-btn {
  background-color: #ff9800;
}

.input-btn:hover {
  background-color: #f57c00;
}

.output-btn {
  background-color: #e91e63;
}

.output-btn:hover {
  background-color: #c2185b;
}

.function-btn {
  background-color: #9c27b0;
}

.function-btn:hover {
  background-color: #8e24aa;
}

.export-btn {
  background-color: #2196f3;
}

.export-btn:hover {
  background-color: #1976d2;
}

.config-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.close-btn {
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  color: #666;
  padding: 0;
  line-height: 1;
}

.close-btn:hover {
  color: #333;
}

.config-panel {
  position: absolute;
  top: 10px;
  right: 10px;
  width: 300px;
  background: white;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  z-index: 1000;
  max-height: 90vh;
  overflow-y: auto;
}

.config-section {
  margin-bottom: 20px;
}

.config-group {
  margin-bottom: 15px;
}

.config-group label {
  display: block;
  margin-bottom: 5px;
  font-weight: bold;
}

.config-group input,
.config-group textarea {
  width: 100%;
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
}

.config-group textarea {
  height: 80px;
  resize: vertical;
}

.message-group {
  margin-bottom: 10px;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
}

.add-btn {
  background-color: #4caf50;
  color: white;
  border: none;
  padding: 5px 10px;
  border-radius: 4px;
  cursor: pointer;
  margin-bottom: 10px;
}

.remove-btn {
  background-color: #f44336;
  color: white;
  border: none;
  padding: 5px 10px;
  border-radius: 4px;
  cursor: pointer;
  margin-top: 5px;
}

.action-group {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.action-group label {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
}

h3 {
  margin-top: 0;
  margin-bottom: 20px;
  color: #333;
}

h4 {
  margin: 0 0 10px 0;
  color: #666;
}

.function-config {
  margin-bottom: 20px;
}

.function-config .config-group {
  margin-bottom: 15px;
}

.function-config label {
  display: block;
  margin-bottom: 5px;
  font-weight: bold;
}

.function-config input,
.function-config textarea {
  width: 100%;
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
}

.function-config textarea {
  height: 100px;
  resize: vertical;
}
</style>