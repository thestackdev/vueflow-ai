<template>
  <div class="system-message-flow">
    <div class="controls">
      <button @click="exportFlow" class="export-btn">Export Flow</button>
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
import { ref, onMounted } from "vue";
import { VueFlow } from "@vue-flow/core";
import { Background } from "@vue-flow/background";
import { Controls } from "@vue-flow/controls";
import { MiniMap } from "@vue-flow/minimap";
import "@vue-flow/core/dist/style.css";
import "@vue-flow/core/dist/theme-default.css";
import "@vue-flow/minimap/dist/style.css";
import "@vue-flow/controls/dist/style.css";
import SystemMessageNode from "./SystemMessageNode.vue";

const SYSTEM_MESSAGE_PIECES = {
  introduction: `
You are Halsell AI, a powerful, male and professional voice assistant for Halsell CRM. Your job is to assist businesses with CRM onboarding, support, and operations.
`,
  tone_guidelines: `
Be clear, confident, and efficient.
Maintain a professional yet friendly tone.
Keep responses concise and helpful.
`,
  user_guidance: `
Guide users, answer questions, and connect calls when needed.
`,
  team_members: `
Available team members for call transfers:
- Technical Support: Shanmukh (+917995235525)
- Head of Sales: Amit Aggarwal (+918054012673)
`,
  transfer_logic: `
When a user requests to speak with any of these team members or roles (using phrases like "I want to speak to the manager", "transfer me to sales", "connect me with support", "call Shanmukh", etc.), respond with exactly:
"TRANSFER_REQUEST:[PHONE_NUMBER]" where [PHONE_NUMBER] is the complete phone number including country code.
`,
  transfer_example: `
For example, if they want the manager, "I'll connect you with our manager, right away."
`,
  welcome_message: `
Example Start:
"Welcome to Halsell AI! How can I assist you today?"
`,
  closing: `
Stay focused, stay sharp, and deliver value.
`,
};

const nodeTypes = {
  "system-message": SystemMessageNode,
};

const elements = ref([]);

const halsellAiPipecatNodes = Object.keys(SYSTEM_MESSAGE_PIECES).map(
  (key, index) => ({
    id: `node-${index + 1}`,
    type: "system-message",
    position: { x: 250, y: 100 + index * 250 }, // Increased vertical spacing
    label: key
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" "),
    data: {
      content: SYSTEM_MESSAGE_PIECES[key].trim(),
    },
  })
);

// Generate edges to connect nodes sequentially
const halsellAiPipecatEdges = halsellAiPipecatNodes
  .slice(1)
  .map((node, index) => ({
    id: `edge-${index + 1}`,
    source: halsellAiPipecatNodes[index].id,
    target: node.id,
    type: "smoothstep",
    label: "↓",
    style: { stroke: "#a094e0" },
  }));

// Export function to stitch pieces back into the full message
const exportFlow = () => {
  const fullMessage = Object.values(SYSTEM_MESSAGE_PIECES).join("\n").trim();
  const blob = new Blob([fullMessage], { type: "text/plain" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "system-message.txt";
  a.click();
  URL.revokeObjectURL(url);
};

onMounted(() => {
  elements.value = [...halsellAiPipecatNodes, ...halsellAiPipecatEdges];
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

.export-btn {
  padding: 8px 16px;
  background-color: #4caf50;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.export-btn:hover {
  background-color: #45a049;
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