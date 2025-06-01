<template>
  <ActionNode :id="id" type="condition" :data="nodeData">
    <template #config>
      <div class="condition-config">
        <div class="form-group">
          <label>Condition Type</label>
          <select v-model="nodeData.conditionType" class="condition-select">
            <option value="keyword">Keyword Match</option>
            <option value="intent">Intent Match</option>
            <option value="custom">Custom Condition</option>
          </select>
        </div>

        <div v-if="nodeData.conditionType === 'keyword'" class="form-group">
          <label>Keywords (comma-separated)</label>
          <input
            v-model="nodeData.keywords"
            type="text"
            class="keyword-input"
            placeholder="e.g., support, help, issue"
          />
        </div>

        <div v-if="nodeData.conditionType === 'intent'" class="form-group">
          <label>Intent</label>
          <select v-model="nodeData.intent" class="intent-select">
            <option value="support">Support Request</option>
            <option value="sales">Sales Inquiry</option>
            <option value="complaint">Complaint</option>
            <option value="feedback">Feedback</option>
          </select>
        </div>

        <div v-if="nodeData.conditionType === 'custom'" class="form-group">
          <label>Custom Condition</label>
          <textarea
            v-model="nodeData.customCondition"
            class="custom-condition-input"
            rows="3"
            placeholder="Enter custom condition logic..."
          ></textarea>
        </div>
      </div>
    </template>
    <template #preview>
      <div class="condition-preview">
        <div class="preview-row">
          <span class="preview-label">Condition:</span>
          <span class="preview-content">
            {{ getConditionPreview }}
          </span>
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
  conditionType: props.data.conditionType || "keyword",
  keywords: props.data.keywords || "",
  intent: props.data.intent || "support",
  customCondition: props.data.customCondition || "",
});

const getConditionPreview = computed(() => {
  switch (nodeData.value.conditionType) {
    case "keyword":
      return `Match keywords: ${nodeData.value.keywords || "none"}`;
    case "intent":
      return `Match intent: ${nodeData.value.intent}`;
    case "custom":
      return nodeData.value.customCondition || "No condition set";
    default:
      return "Not set";
  }
});
</script>

<style scoped>
.condition-config {
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

.condition-select,
.intent-select,
.keyword-input,
.custom-condition-input {
  width: 100%;
  padding: 8px;
  border: 1px solid #ff9800;
  border-radius: 4px;
  font-size: 12px;
}

.condition-select:focus,
.intent-select:focus,
.keyword-input:focus,
.custom-condition-input:focus {
  outline: none;
  border-color: #f57c00;
  box-shadow: 0 0 0 2px rgba(255, 152, 0, 0.2);
}

.custom-condition-input {
  resize: vertical;
}

.condition-preview {
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
</style> 