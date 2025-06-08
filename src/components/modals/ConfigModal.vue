<template>
  <div v-if="show" class="modal-overlay" @click.self="closeModal">
    <div class="modal-content">
      <div class="modal-header">
        <h2>Configure Node</h2>
        <button @click="closeModal" class="close-button">&times;</button>
      </div>
      <div class="modal-body">
        <div v-if="editableNodeData">
          <div class="form-group" v-if="'role_messages' in editableNodeData">
            <label for="role-message-content">Role Message Content:</label>
            <textarea
              id="role-message-content"
              v-if="
                editableNodeData.role_messages &&
                editableNodeData.role_messages.length > 0
              "
              v-model="editableNodeData.role_messages[0].content"
              rows="3"
              placeholder="Enter role message..."
            ></textarea>
            <div v-else class="empty-state-controls">
              <p>No role messages defined.</p>
              <button @click="addRoleMessage" class="add-btn">
                Add Role Message
              </button>
            </div>
          </div>

          <div class="form-group" v-if="'task_messages' in editableNodeData">
            <label for="task-message-content">Task Message Content:</label>
            <textarea
              id="task-message-content"
              v-if="
                editableNodeData.task_messages &&
                editableNodeData.task_messages.length > 0
              "
              v-model="editableNodeData.task_messages[0].content"
              rows="5"
              placeholder="Enter task message..."
            ></textarea>
            <div v-else class="empty-state-controls">
              <p>No task messages defined.</p>
              <button @click="addTaskMessage" class="add-btn">
                Add Task Message
              </button>
            </div>
          </div>

          <!-- Functions Section -->
          <div class="form-group" v-if="'functions' in editableNodeData">
            <label>Functions:</label>
            <div
              v-if="
                editableNodeData.functions &&
                editableNodeData.functions.length > 0
              "
            >
              <div
                v-for="(func, index) in editableNodeData.functions"
                :key="index"
                class="function-item"
              >
                <FunctionConfig
                  :data="func.function"
                  :nodes="nodes"
                  @update="updateFunction(index, $event)"
                />
                <button @click="deleteFunction(index)" class="delete-btn">
                  Delete Function
                </button>
              </div>
            </div>
            <div v-else class="empty-state-controls">
              <p>No functions defined.</p>
              <button @click="addFunction" class="add-btn">Add Function</button>
            </div>
          </div>

          <div class="form-group">
            <label for="post-action-type">Post Action Type:</label>
            <select
              id="post-action-type"
              v-model="selectedPostActionType"
              @change="updatePostAction"
            >
              <option value="none">None</option>
              <option value="end_conversation">End Conversation</option>
              <option value="transfer_call">Transfer Call</option>
              <option value="make_api_request">Make API Request</option>
            </select>
          </div>
        </div>
        <div v-else>
          <p>No data to configure for this node.</p>
        </div>
      </div>
      <div class="modal-footer">
        <button @click="saveChanges" class="save-btn">Save Changes</button>
        <button @click="closeModal" class="cancel-btn">Cancel</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from "vue";
import FunctionConfig from "../FunctionConfig.vue";

const props = defineProps({
  show: Boolean,
  data: Object,
  nodes: Array,
});

const emit = defineEmits(["close", "save"]);

const editableNodeData = ref(null);
const selectedPostActionType = ref("none");

watch(
  () => props.data,
  (newData) => {
    if (newData) {
      editableNodeData.value = JSON.parse(JSON.stringify(newData));

      if (
        editableNodeData.value &&
        typeof editableNodeData.value.role_messages === "undefined"
      ) {
        editableNodeData.value.role_messages = [];
      }
      if (
        editableNodeData.value &&
        typeof editableNodeData.value.task_messages === "undefined"
      ) {
        editableNodeData.value.task_messages = [];
      }
      if (
        editableNodeData.value &&
        typeof editableNodeData.value.functions === "undefined"
      ) {
        editableNodeData.value.functions = [];
      }
      if (
        !editableNodeData.value.post_actions ||
        !Array.isArray(editableNodeData.value.post_actions)
      ) {
        editableNodeData.value.post_actions = [];
      }
      selectedPostActionType.value =
        editableNodeData.value.post_actions[0]?.type || "none";
    } else {
      editableNodeData.value = null;
      selectedPostActionType.value = "none";
    }
  },
  { immediate: true, deep: true }
);

const updatePostAction = () => {
  if (!editableNodeData.value) return;

  if (selectedPostActionType.value === "none") {
    editableNodeData.value.post_actions = [];
  } else {
    if (
      !editableNodeData.value.post_actions[0] ||
      editableNodeData.value.post_actions[0].type !==
        selectedPostActionType.value
    ) {
      editableNodeData.value.post_actions = [
        { type: selectedPostActionType.value },
      ];
    }
  }
};

const addRoleMessage = () => {
  if (editableNodeData.value) {
    if (!Array.isArray(editableNodeData.value.role_messages)) {
      editableNodeData.value.role_messages = [];
    }
    if (editableNodeData.value.role_messages.length === 0) {
      editableNodeData.value.role_messages.push({
        role: "system",
        content: "",
      });
    }
  }
};

const addTaskMessage = () => {
  if (editableNodeData.value) {
    if (!Array.isArray(editableNodeData.value.task_messages)) {
      editableNodeData.value.task_messages = [];
    }
    if (editableNodeData.value.task_messages.length === 0) {
      editableNodeData.value.task_messages.push({ role: "user", content: "" });
    }
  }
};

const addFunction = () => {
  if (editableNodeData.value) {
    if (!Array.isArray(editableNodeData.value.functions)) {
      editableNodeData.value.functions = [];
    }
    editableNodeData.value.functions.push({
      type: "function",
      function: {
        name: "",
        description: "",
        parameters: { type: "object", properties: {} },
        transition_to: "",
      },
    });
  }
};

const updateFunction = (index, updatedFunction) => {
  if (editableNodeData.value && editableNodeData.value.functions[index]) {
    editableNodeData.value.functions[index].function = updatedFunction;
  }
};

const deleteFunction = (index) => {
  if (editableNodeData.value && editableNodeData.value.functions) {
    editableNodeData.value.functions.splice(index, 1);
  }
};

const closeModal = () => {
  emit("close");
};

const saveChanges = () => {
  if (editableNodeData.value) {
    updatePostAction();
    emit("save", JSON.parse(JSON.stringify(editableNodeData.value)));
  }
  closeModal();
};
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.55);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 1rem;
}

.modal-content {
  background: #ffffff;
  padding: 24px;
  border-radius: 16px;
  min-width: 320px;
  width: 100%;
  max-width: 550px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.15);
  max-height: 90vh;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-bottom: 12px;
  margin-bottom: 20px;
  border-bottom: 1px solid #e0e0e0;
}

.modal-header h2 {
  margin: 0;
  font-size: 1.75rem;
  font-weight: 600;
  color: #2c3e50;
}

.close-button {
  background: transparent;
  border: none;
  font-size: 1.8rem;
  font-weight: 300;
  cursor: pointer;
  color: #7f8c8d;
  padding: 0.25rem 0.5rem;
  line-height: 1;
}
.close-button:hover {
  color: #34495e;
}

.modal-body {
  margin-bottom: 20px;
  flex-grow: 1;
}

.form-group {
  margin-bottom: 18px;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  font-weight: 500;
  color: #34495e;
  font-size: 0.95rem;
}

.form-group textarea,
.form-group select {
  width: 100%;
  padding: 12px 15px;
  border-radius: 8px;
  border: 1px solid #bdc3c7;
  font-family: inherit;
  font-size: 1rem;
  box-sizing: border-box;
  background-color: #f8f9fa;
  color: #2c3e50;
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
}

.form-group textarea::placeholder,
.form-group select::placeholder {
  color: #95a5a6;
}

.form-group textarea:focus,
.form-group select:focus {
  outline: none;
  border-color: #3498db;
  box-shadow: 0 0 0 3px rgba(52, 152, 219, 0.2);
  background-color: #fff;
}

.empty-state-controls {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px;
  background-color: #f9f9f9;
  border-radius: 6px;
  border: 1px dashed #ddd;
}

.empty-state-controls p {
  margin: 0;
  color: #555;
  font-size: 0.9rem;
}

.add-btn {
  padding: 8px 16px;
  font-size: 0.9rem;
  font-weight: 500;
  background: linear-gradient(to right, #2152ff, #21d4fd);
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  transition: background 0.3s ease;
}

.add-btn:hover {
  background: linear-gradient(to right, #1a42cc, #1ab8e6);
}

.function-item {
  margin-bottom: 16px;
  padding: 12px;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  background-color: #f8f9fa;
}

.delete-btn {
  margin-top: 10px;
  padding: 8px 16px;
  background-color: #f44336;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.9rem;
  transition: background-color 0.2s ease;
}

.delete-btn:hover {
  background-color: #d32f2f;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding-top: 20px;
  border-top: 1px solid #e0e0e0;
}

.save-btn,
.cancel-btn {
  padding: 12px 24px;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 1rem;
  font-weight: 500;
  transition: opacity 0.2s ease, transform 0.2s ease;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.save-btn {
  background: linear-gradient(135deg, #2152ff 0%, #21d4fd 100%);
  color: white;
}

.cancel-btn {
  background-color: #ecf0f1;
  color: #7f8c8d;
  border: 1px solid #bdc3c7;
}

.cancel-btn:hover {
  background-color: #e0e6e8;
  border-color: #adb5bd;
}

.save-btn:hover {
  opacity: 0.9;
  transform: translateY(-1px);
}

@media (max-width: 600px) {
  .modal-content {
    padding: 18px;
    max-width: calc(100% - 2rem);
  }
  .modal-header h2 {
    font-size: 1.5rem;
  }
  .form-group textarea,
  .form-group select {
    padding: 10px 12px;
    font-size: 0.95rem;
  }
  .save-btn,
  .cancel-btn {
    padding: 10px 20px;
    font-size: 0.95rem;
  }
  .modal-footer {
    flex-direction: column;
    gap: 10px;
  }
  .save-btn,
  .cancel-btn {
    width: 100%;
  }
}
</style>