<template>
  <div class="system-message-flow">
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

// This constant represents the logic behind the Halsell AI, guiding node and edge creation.
const SYSTEM_MESSAGE = `
You are Halsell AI, a powerful, male and professional voice assistant for Halsell CRM. Your job is to assist businesses with CRM onboarding, support, and operations.

Be clear, confident, and efficient.
Maintain a professional yet friendly tone.
Keep responses concise and helpful.
Guide users, answer questions, and connect calls when needed.

Available team members for call transfers:
- Technical Support: Shanmukh (+917995235525)
- Head of Sales: Amit Aggarwal (+918054012673)

When a user requests to speak with any of these team members or roles (using phrases like "I want to speak to the manager", "transfer me to sales", "connect me with support", "call Shanmukh", etc.), respond with exactly:
"TRANSFER_REQUEST:[PHONE_NUMBER]" where [PHONE_NUMBER] is the complete phone number including country code.
"index.js" 786L, 25610B                                                                                                                                                                             44,1          Top
When a user requests to speak with any of these team members or roles (using phrases like "I want to speak to the manager", "transfer me to sales", "connect me with support", "call Shanmukh", etc.), respond with exactly:
"TRANSFER_REQUEST:[PHONE_NUMBER]" where [PHONE_NUMBER] is the complete phone number including country code.

For example, if they want the manager, "I'll connect you with our manager, right away."

Example Start:
"Welcome to Halsell AI! How can I assist you today?"

Stay focused, stay sharp, and deliver value.
`;

const nodeTypes = {
  "system-message": SystemMessageNode,
};

const elements = ref([]);

// Nodes based on the Pipecat flow for Halsell AI
const halsellAiPipecatNodes = [
  {
    id: "halsell_greeting",
    type: "system-message",
    label: "Halsell AI: Greeting & Intent",
    position: { x: 350, y: 50 },
    data: {
      content:
        "Role: System\nTask: Greet user ('Welcome to Halsell AI! How can I assist you today?'). Listen for intent (transfer, info, end).",
    },
  },
  {
    id: "halsell_answered_query",
    type: "system-message",
    label: "Halsell AI: Answered Query & Next Steps",
    position: { x: 50, y: 250 },
    data: {
      content:
        "Role: System\nTask: Provide answer from 'provide_information' function. Ask 'Is there anything else?'. Listen for intent.",
    },
  },
  {
    id: "halsell_confirm_transfer",
    type: "system-message",
    label: "Halsell AI: Confirm Call Transfer",
    position: { x: 350, y: 250 },
    data: {
      content:
        "Role: System\nTask: Use 'spoken_confirmation_message' from 'initiate_call_transfer' function (e.g., 'I'll connect you...'). System handles transfer post-message.",
    },
  },
  {
    id: "halsell_goodbye",
    type: "system-message",
    label: "Halsell AI: Polite Goodbye",
    position: { x: 650, y: 250 },
    data: {
      content:
        "Role: System\nTask: Thank user and say goodbye politely (e.g., 'Thank you for choosing Halsell AI...'). End conversation.",
    },
  },
  {
    id: "end_call_after_transfer",
    type: "system-message",
    label: "System: Call Transferred",
    position: { x: 350, y: 400 },
    data: {
      content: "Post-Action: end_conversation (AI part is done)",
    },
  },
  {
    id: "end_call_after_goodbye",
    type: "system-message",
    label: "System: Call Ended",
    position: { x: 650, y: 400 },
    data: {
      content: "Post-Action: end_conversation",
    },
  },
];

// Edges based on the Pipecat flow for Halsell AI
const halsellAiPipecatEdges = [
  {
    id: "e-greeting-to-answered_query",
    source: "halsell_greeting",
    target: "halsell_answered_query",
    animated: true,
    label: "User asks question (calls provide_information fn)",
  },
  {
    id: "e-greeting-to-confirm_transfer",
    source: "halsell_greeting",
    target: "halsell_confirm_transfer",
    animated: true,
    label: "User requests transfer (calls initiate_call_transfer fn)",
  },
  {
    id: "e-greeting-to-goodbye",
    source: "halsell_greeting",
    target: "halsell_goodbye",
    animated: true,
    label: "User wants to end (calls end_conversation_politely fn)",
  },
  {
    id: "e-answered_query-to-self_for_another_q",
    source: "halsell_answered_query",
    target: "halsell_answered_query",
    animated: true,
    label: "User asks another Q (calls provide_information fn again)",
    style: { strokeWidth: 1.5 },
    markerEnd: { type: "arrowclosed" },
  },
  {
    id: "e-answered_query-to-confirm_transfer",
    source: "halsell_answered_query",
    target: "halsell_confirm_transfer",
    animated: true,
    label: "User requests transfer (calls initiate_call_transfer fn)",
  },
  {
    id: "e-answered_query-to-goodbye",
    source: "halsell_answered_query",
    target: "halsell_goodbye",
    animated: true,
    label: "No more questions (calls end_conversation_politely fn)",
  },
  {
    id: "e-confirm_transfer-to-end",
    source: "halsell_confirm_transfer",
    target: "end_call_after_transfer",
    animated: true,
    label: "AI confirms, then system transfers",
  },
  {
    id: "e-goodbye-to-end",
    source: "halsell_goodbye",
    target: "end_call_after_goodbye",
    animated: true,
    label: "AI says goodbye",
  },
];

onMounted(() => {
  elements.value = [...halsellAiPipecatNodes, ...halsellAiPipecatEdges];
});
</script>

<style scoped>
.system-message-flow {
  width: 100%;
  height: 100vh;
  background-color: #f0f0f0;
}

.flow-container {
  width: 100%;
  height: 100%;
}

/* Styles for nodes of type "system-message" */
:deep(.vue-flow__node-system-message) {
  background: #e9e7fd; /* A light lavender */
  border: 1px solid #a094e0; /* A medium lavender */
  border-radius: 8px;
  padding: 15px;
  font-size: 12px;
  text-align: left; /* Changed to left for better readability of multi-line content */
  min-width: 200px; /* Increased min-width */
  max-width: 300px;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
}

:deep(.vue-flow__node-system-message .vue-flow__node-label), /* If you're using a label slot in SystemMessageNode */
:deep(.vue-flow__node-default .vue-flow__node-label) {
  /* If using default node with type for styling */
  font-weight: bold;
  margin-bottom: 8px;
  display: block;
  color: #333;
  font-size: 14px; /* Larger label font size */
}

:deep(.vue-flow__edge-text) {
  font-size: 10px;
  fill: #2c3e50;
  background: rgba(245, 245, 245, 0.8);
  padding: 2px 4px;
  border-radius: 3px;
}
</style>