<template>
  <div class="start-node">
    <div class="node-header">Start Node</div>
    <div class="node-content">
      <div class="section">
        <h4>Role Messages</h4>
        <div
          v-for="(msg, index) in data.role_messages"
          :key="index"
          class="message-item"
        >
          <textarea
            v-model="msg.content"
            placeholder="Enter role message content"
          ></textarea>
          <button @click="removeRoleMessage(index)" class="remove-btn">
            Remove
          </button>
        </div>
        <button @click="addRoleMessage" class="add-btn">
          Add Role Message
        </button>
      </div>

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
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from "vue";

const props = defineProps({
  data: {
    type: Object,
    required: true,
  },
});

const emit = defineEmits(["update:data"]);

const addRoleMessage = () => {
  const newMessages = [
    ...(props.data.role_messages || []),
    {
      role: "system",
      content: "",
    },
  ];
  emit("update:data", { ...props.data, role_messages: newMessages });
};

const removeRoleMessage = (index) => {
  const newMessages = [...props.data.role_messages];
  newMessages.splice(index, 1);
  emit("update:data", { ...props.data, role_messages: newMessages });
};

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
</script>

<style scoped>
.start-node {
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
  width: 100%;
  margin-top: 10px;
}

.remove-btn:hover {
  background: #cc0000;
}

.add-btn:hover {
  background: #45a049;
}
</style> 