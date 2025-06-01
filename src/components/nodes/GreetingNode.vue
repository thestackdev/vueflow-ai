<template>
  <ActionNode :id="id" type="greeting" :data="nodeData">
    <template #config>
      <div class="greeting-config">
        <div class="form-group">
          <label>Welcome Message</label>
          <textarea
            v-model="nodeData.message"
            class="message-input"
            rows="3"
            placeholder="Enter welcome message..."
          ></textarea>
        </div>
      </div>
    </template>
    <template #preview>
      <div class="greeting-preview">
        <div class="preview-label">Welcome Message:</div>
        <div class="preview-content">
          {{ nodeData.message || "No message set" }}
        </div>
      </div>
    </template>
  </ActionNode>
</template>

<script setup>
import { ref } from "vue";
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
  message: props.data.message || "",
});
</script>

<style scoped>
.greeting-config {
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

.message-input {
  width: 100%;
  padding: 8px;
  border: 1px solid #2196f3;
  border-radius: 4px;
  resize: vertical;
  font-size: 12px;
}

.message-input:focus {
  outline: none;
  border-color: #1976d2;
  box-shadow: 0 0 0 2px rgba(33, 150, 243, 0.2);
}

.greeting-preview {
  display: flex;
  flex-direction: column;
  gap: 5px;
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
</style> 