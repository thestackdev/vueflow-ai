<template>
  <ActionNode :id="id" type="message" :data="nodeData">
    <template #config>
      <div class="message-config">
        <div class="form-group">
          <label>Message Type</label>
          <select v-model="nodeData.messageType" class="message-select">
            <option value="response">Response</option>
            <option value="question">Question</option>
            <option value="confirmation">Confirmation</option>
          </select>
        </div>

        <div class="form-group">
          <label>Message Content</label>
          <textarea
            v-model="nodeData.content"
            class="content-input"
            rows="4"
            :placeholder="getPlaceholder"
          ></textarea>
        </div>

        <div class="form-group">
          <label>Response Options</label>
          <div v-if="nodeData.messageType === 'question'" class="options-list">
            <div
              v-for="(option, index) in nodeData.options"
              :key="index"
              class="option-item"
            >
              <input
                v-model="nodeData.options[index]"
                type="text"
                class="option-input"
                :placeholder="`Option ${index + 1}`"
              />
              <button @click="removeOption(index)" class="remove-btn">×</button>
            </div>
            <button @click="addOption" class="add-btn">Add Option</button>
          </div>
        </div>
      </div>
    </template>
    <template #preview>
      <div class="message-preview">
        <div class="preview-row">
          <span class="preview-label">Type:</span>
          <span class="preview-content">{{ getMessageTypeLabel }}</span>
        </div>
        <div class="preview-row">
          <span class="preview-label">Content:</span>
          <span class="preview-content">{{
            nodeData.content || "No content set"
          }}</span>
        </div>
        <div
          v-if="
            nodeData.messageType === 'question' && nodeData.options.length > 0
          "
          class="preview-row"
        >
          <span class="preview-label">Options:</span>
          <div class="preview-options">
            <span
              v-for="(option, index) in nodeData.options"
              :key="index"
              class="option-tag"
            >
              {{ option }}
            </span>
          </div>
        </div>
      </div>
    </template>
  </ActionNode>
</template>

<script setup>
import { ref, computed } from "vue";
import ActionNode from "../ActionNode.vue";

const props = defineProps({
  id: {
    type: String,
    required: true,
  },
  data: {
    type: Object,
    default: () => ({}),
  },
});

const nodeData = ref({
  messageType: props.data.messageType || "response",
  content: props.data.content || "",
  options: props.data.options || [],
});

const getMessageTypeLabel = computed(() => {
  const types = {
    response: "Response Message",
    question: "Question",
    confirmation: "Confirmation",
  };
  return types[nodeData.value.messageType] || "Message";
});

const getPlaceholder = computed(() => {
  const placeholders = {
    response: "Enter your response message...",
    question: "Enter your question...",
    confirmation: "Enter confirmation message...",
  };
  return placeholders[nodeData.value.messageType] || "Enter message...";
});

const addOption = () => {
  nodeData.value.options.push("");
};

const removeOption = (index) => {
  nodeData.value.options.splice(index, 1);
};
</script>

<style scoped>
.message-config {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.form-group label {
  font-size: 12px;
  color: #666;
}

.message-select,
.content-input {
  width: 100%;
  padding: 8px;
  border: 1px solid #9c27b0;
  border-radius: 4px;
  font-size: 12px;
}

.message-select:focus,
.content-input:focus {
  outline: none;
  border-color: #7b1fa2;
  box-shadow: 0 0 0 2px rgba(156, 39, 176, 0.2);
}

.content-input {
  resize: vertical;
}

.options-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.option-item {
  display: flex;
  gap: 8px;
}

.option-input {
  flex: 1;
  padding: 6px;
  border: 1px solid #9c27b0;
  border-radius: 4px;
  font-size: 12px;
}

.remove-btn {
  padding: 0 8px;
  background: #f44336;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 16px;
}

.add-btn {
  padding: 6px 12px;
  background: #9c27b0;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 12px;
  align-self: flex-start;
}

.message-preview {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.preview-row {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.preview-label {
  font-size: 11px;
  color: #666;
  text-transform: uppercase;
}

.preview-content {
  font-size: 12px;
  color: #333;
  line-height: 1.4;
}

.preview-options {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
}

.option-tag {
  background: rgba(156, 39, 176, 0.1);
  color: #7b1fa2;
  padding: 2px 8px;
  border-radius: 12px;
  font-size: 11px;
}
</style> 