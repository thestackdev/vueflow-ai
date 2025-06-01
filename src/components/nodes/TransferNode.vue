<template>
  <ActionNode :id="id" type="transfer" :data="nodeData">
    <template #config>
      <div class="transfer-config">
        <div class="form-group">
          <label>Transfer Type</label>
          <select v-model="nodeData.transferType" class="transfer-select">
            <option value="support">Technical Support</option>
            <option value="sales">Sales</option>
            <option value="custom">Custom Number</option>
          </select>
        </div>

        <div v-if="nodeData.transferType === 'custom'" class="form-group">
          <label>Phone Number</label>
          <input
            v-model="nodeData.phoneNumber"
            type="tel"
            class="phone-input"
            placeholder="Enter phone number with country code"
          />
        </div>

        <div class="form-group">
          <label>Transfer Message</label>
          <textarea
            v-model="nodeData.message"
            class="message-input"
            rows="2"
            placeholder="Enter transfer message..."
          ></textarea>
        </div>
      </div>
    </template>
    <template #preview>
      <div class="transfer-preview">
        <div class="preview-row">
          <span class="preview-label">Transfer to:</span>
          <span class="preview-content">
            {{ getTransferTarget }}
          </span>
        </div>
        <div class="preview-row">
          <span class="preview-label">Message:</span>
          <span class="preview-content">
            {{ nodeData.message || "No message set" }}
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
  transferType: props.data.transferType || "support",
  phoneNumber: props.data.phoneNumber || "",
  message: props.data.message || "",
});

const getTransferTarget = computed(() => {
  switch (nodeData.value.transferType) {
    case "support":
      return "Technical Support (Shanmukh)";
    case "sales":
      return "Sales (Amit Aggarwal)";
    case "custom":
      return nodeData.value.phoneNumber || "No number set";
    default:
      return "Not set";
  }
});
</script>

<style scoped>
.transfer-config {
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

.transfer-select,
.phone-input,
.message-input {
  width: 100%;
  padding: 8px;
  border: 1px solid #4caf50;
  border-radius: 4px;
  font-size: 12px;
}

.transfer-select:focus,
.phone-input:focus,
.message-input:focus {
  outline: none;
  border-color: #388e3c;
  box-shadow: 0 0 0 2px rgba(76, 175, 80, 0.2);
}

.message-input {
  resize: vertical;
}

.transfer-preview {
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