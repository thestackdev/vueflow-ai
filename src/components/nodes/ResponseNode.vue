<template>
  <ActionNode :id="id" type="response" :data="nodeData">
    <template #config>
      <div class="response-config">
        <div class="form-group">
          <label>Response Type</label>
          <select v-model="nodeData.responseType" class="response-select">
            <option value="text">Text Input</option>
            <option value="choice">Multiple Choice</option>
            <option value="yesno">Yes/No</option>
          </select>
        </div>

        <div v-if="nodeData.responseType === 'choice'" class="form-group">
          <label>Response Options</label>
          <div class="options-list">
            <div
              v-for="(option, index) in nodeData.options"
              :key="index"
              class="option-item"
            >
              <input
                v-model="nodeData.options[index].text"
                type="text"
                class="option-input"
                :placeholder="`Option ${index + 1}`"
              />
              <button @click="removeOption(index)" class="remove-btn">×</button>
            </div>
            <button @click="addOption" class="add-btn">Add Option</button>
          </div>
        </div>

        <div class="form-group">
          <label>Validation</label>
          <div class="validation-options">
            <label class="checkbox-label">
              <input type="checkbox" v-model="nodeData.validation.required" />
              Required
            </label>
            <label class="checkbox-label">
              <input type="checkbox" v-model="nodeData.validation.retry" />
              Allow Retry
            </label>
          </div>
        </div>

        <div v-if="nodeData.validation.retry" class="form-group">
          <label>Max Retries</label>
          <input
            v-model.number="nodeData.validation.maxRetries"
            type="number"
            min="1"
            max="5"
            class="number-input"
          />
        </div>
      </div>
    </template>
    <template #preview>
      <div class="response-preview">
        <div class="preview-row">
          <span class="preview-label">Type:</span>
          <span class="preview-content">{{ getResponseTypeLabel }}</span>
        </div>
        <div v-if="nodeData.responseType === 'choice'" class="preview-row">
          <span class="preview-label">Options:</span>
          <div class="preview-options">
            <span
              v-for="(option, index) in nodeData.options"
              :key="index"
              class="option-tag"
            >
              {{ option.text }}
            </span>
          </div>
        </div>
        <div class="preview-row">
          <span class="preview-label">Validation:</span>
          <span class="preview-content">
            {{ getValidationPreview }}
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
  responseType: props.data.responseType || "text",
  options: props.data.options || [],
  validation: {
    required: props.data.validation?.required || false,
    retry: props.data.validation?.retry || false,
    maxRetries: props.data.validation?.maxRetries || 3,
  },
});

const getResponseTypeLabel = computed(() => {
  const types = {
    text: "Text Input",
    choice: "Multiple Choice",
    yesno: "Yes/No Response",
  };
  return types[nodeData.value.responseType] || "Response";
});

const getValidationPreview = computed(() => {
  const validations = [];
  if (nodeData.value.validation.required) {
    validations.push("Required");
  }
  if (nodeData.value.validation.retry) {
    validations.push(`Max ${nodeData.value.validation.maxRetries} retries`);
  }
  return validations.length ? validations.join(", ") : "No validation";
});

const addOption = () => {
  nodeData.value.options.push({ text: "" });
};

const removeOption = (index) => {
  nodeData.value.options.splice(index, 1);
};
</script>

<style scoped>
.response-config {
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

.response-select,
.number-input {
  width: 100%;
  padding: 8px;
  border: 1px solid #673ab7;
  border-radius: 4px;
  font-size: 12px;
}

.response-select:focus,
.number-input:focus {
  outline: none;
  border-color: #512da8;
  box-shadow: 0 0 0 2px rgba(103, 58, 183, 0.2);
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
  border: 1px solid #673ab7;
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
  background: #673ab7;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 12px;
  align-self: flex-start;
}

.validation-options {
  display: flex;
  gap: 16px;
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  color: #666;
  cursor: pointer;
}

.response-preview {
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
  background: rgba(103, 58, 183, 0.1);
  color: #512da8;
  padding: 2px 8px;
  border-radius: 12px;
  font-size: 11px;
}
</style> 