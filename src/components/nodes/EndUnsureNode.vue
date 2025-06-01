<template>
  <div class="end-unsure-node">
    <div class="node-header">End Unsure Node</div>
    <div class="node-content">
      <div class="section">
        <h4>Task Messages</h4>
        <div
          v-for="(msg, index) in data.task_messages"
          :key="index"
          class="message-item"
        >
          <textarea
            v-model="msg.content"
            placeholder="Enter task message content"
          ></textarea>
          <button @click="removeTaskMessage(index)" class="remove-btn">
            Remove
          </button>
        </div>
        <button @click="addTaskMessage" class="add-btn">
          Add Task Message
        </button>
      </div>

      <div class="section">
        <h4>Post Actions</h4>
        <div class="post-actions">
          <select v-model="selectedAction" class="action-select">
            <option value="">Select Action</option>
            <option value="transfer_call">Transfer Call</option>
            <option value="end_conversation">End Conversation</option>
            <option value="make_api_call">Make API Call</option>
          </select>
          <button
            @click="addPostAction"
            class="add-btn"
            :disabled="!selectedAction"
          >
            Add Action
          </button>
        </div>
        <div
          v-for="(action, index) in data.post_actions"
          :key="index"
          class="action-item"
        >
          <span>{{ action.type }}</span>
          <button @click="removePostAction(index)" class="remove-btn">
            Remove
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";

const props = defineProps({
  data: {
    type: Object,
    required: true,
  },
});

const emit = defineEmits(["update:data"]);
const selectedAction = ref("");

const addTaskMessage = () => {
  const newMessages = [
    ...(props.data.task_messages || []),
    {
      role: "system",
      content: "",
    },
  ];
  emit("update:data", { ...props.data, task_messages: newMessages });
};

const removeTaskMessage = (index) => {
  const newMessages = [...props.data.task_messages];
  newMessages.splice(index, 1);
  emit("update:data", { ...props.data, task_messages: newMessages });
};

const addPostAction = () => {
  if (!selectedAction.value) return;

  const newActions = [
    ...(props.data.post_actions || []),
    {
      type: selectedAction.value,
    },
  ];
  emit("update:data", { ...props.data, post_actions: newActions });
  selectedAction.value = "";
};

const removePostAction = (index) => {
  const newActions = [...props.data.post_actions];
  newActions.splice(index, 1);
  emit("update:data", { ...props.data, post_actions: newActions });
};
</script>

<style scoped>
.end-unsure-node {
  background: white;
  border: 1px solid #ddd;
  border-radius: 8px;
  padding: 15px;
  min-width: 300px;
}

.node-header {
  font-weight: bold;
  margin-bottom: 15px;
  padding-bottom: 10px;
  border-bottom: 1px solid #eee;
}

.section {
  margin-bottom: 20px;
}

.section h4 {
  margin-bottom: 10px;
  color: #666;
}

.message-item {
  margin-bottom: 10px;
  display: flex;
  gap: 10px;
}

.action-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px;
  background: #f5f5f5;
  border-radius: 4px;
  margin-bottom: 8px;
}

.post-actions {
  display: flex;
  gap: 10px;
  margin-bottom: 10px;
}

.action-select {
  flex: 1;
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
}

textarea {
  flex: 1;
  min-height: 60px;
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
  resize: vertical;
}

.remove-btn {
  padding: 4px 8px;
  background: #ff4444;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.add-btn {
  padding: 8px 16px;
  background: #4caf50;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.add-btn:disabled {
  background: #cccccc;
  cursor: not-allowed;
}

.remove-btn:hover {
  background: #cc0000;
}

.add-btn:hover:not(:disabled) {
  background: #45a049;
}
</style> 