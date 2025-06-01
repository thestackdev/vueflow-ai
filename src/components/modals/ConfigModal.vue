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

const props = defineProps({
  show: Boolean,
  data: Object,
});

const emit = defineEmits(["close", "save"]);

const editableNodeData = ref(null);
const selectedPostActionType = ref("none"); // Default to 'none'

watch(
  () => props.data,
  (newData) => {
    if (newData) {
      // Deep clone the data to avoid modifying the original prop
      editableNodeData.value = JSON.parse(JSON.stringify(newData));

      // Ensure role_messages and task_messages are initialized if not present
      // This is important if the parent component might send data without these keys
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

      // Ensure post_actions is an array
      if (
        !editableNodeData.value.post_actions ||
        !Array.isArray(editableNodeData.value.post_actions)
      ) {
        editableNodeData.value.post_actions = [];
      }
      // Set selectedPostActionType based on the first post_action
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
    // If post_actions is empty or the first action is different, update/create it
    if (
      !editableNodeData.value.post_actions[0] ||
      editableNodeData.value.post_actions[0].type !==
        selectedPostActionType.value
    ) {
      editableNodeData.value.post_actions = [
        { type: selectedPostActionType.value },
      ];
    }
    // If it's the same type, we don't need to do anything here,
    // as we are only managing the 'type' for now.
    // If other properties needed to be reset, this logic would expand.
  }
};

const addRoleMessage = () => {
  if (editableNodeData.value) {
    // Ensure role_messages array exists
    if (!Array.isArray(editableNodeData.value.role_messages)) {
      editableNodeData.value.role_messages = [];
    }
    // Add a new role message only if it's currently empty,
    // as the UI seems to support only one role message editor.
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
    // Ensure task_messages array exists
    if (!Array.isArray(editableNodeData.value.task_messages)) {
      editableNodeData.value.task_messages = [];
    }
    // Add a new task message only if it's currently empty.
    if (editableNodeData.value.task_messages.length === 0) {
      editableNodeData.value.task_messages.push({ role: "user", content: "" }); // Or 'assistant' depending on context
    }
  }
};

const closeModal = () => {
  emit("close");
};

const saveChanges = () => {
  if (editableNodeData.value) {
    // Ensure post_actions reflects the dropdown before saving
    updatePostAction(); // This makes sure the post_actions array is correctly set
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
  background-color: rgba(
    0,
    0,
    0,
    0.55
  ); /* Darker overlay for better contrast */
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 1rem; /* Add some padding for smaller screens */
}

.modal-content {
  background: #ffffff;
  padding: 24px; /* Increased padding */
  border-radius: 16px; /* More pronounced rounded corners */
  min-width: 320px; /* Responsive min-width */
  width: 100%; /* Responsive width */
  max-width: 550px; /* Slightly wider max-width */
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.15); /* Softer, more modern shadow */
  max-height: 90vh; /* Ensure it doesn't take full screen height */
  overflow-y: auto; /* Scroll for content overflow */
  display: flex;
  flex-direction: column;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-bottom: 12px;
  margin-bottom: 20px; /* Increased margin */
  border-bottom: 1px solid #e0e0e0; /* Subtle separator */
}

.modal-header h2 {
  margin: 0;
  font-size: 1.75rem; /* Adjusted heading size */
  font-weight: 600; /* Semi-bold */
  color: #2c3e50; /* Darker, more professional color */
}

.close-button {
  background: transparent;
  border: none;
  font-size: 1.8rem; /* Larger close icon */
  font-weight: 300; /* Lighter weight for 'x' */
  cursor: pointer;
  color: #7f8c8d; /* Softer gray */
  padding: 0.25rem 0.5rem; /* Make it easier to click */
  line-height: 1;
}
.close-button:hover {
  color: #34495e; /* Darken on hover */
}

.modal-body {
  margin-bottom: 20px; /* Increased margin */
  flex-grow: 1; /* Allow body to take available space if content is short */
}

.form-group {
  margin-bottom: 18px; /* Consistent spacing */
}

.form-group label {
  display: block;
  margin-bottom: 8px; /* More space below label */
  font-weight: 500; /* Medium weight */
  color: #34495e; /* Consistent dark gray */
  font-size: 0.95rem;
}

.form-group textarea,
.form-group select {
  width: 100%;
  padding: 12px 15px; /* More padding for better feel */
  border-radius: 8px; /* Softer corners */
  border: 1px solid #bdc3c7; /* Slightly darker border */
  font-family: inherit;
  font-size: 1rem; /* Standard text size */
  box-sizing: border-box;
  background-color: #f8f9fa; /* Very light gray background */
  color: #2c3e50;
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
}
.form-group textarea::placeholder,
.form-group select::placeholder {
  color: #95a5a6; /* Lighter placeholder text */
}

.form-group textarea:focus,
.form-group select:focus {
  outline: none;
  border-color: #3498db; /* Blue border on focus - matches screenshot accent */
  box-shadow: 0 0 0 3px rgba(52, 152, 219, 0.2); /* Subtle blue glow */
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
  /* General add button style */
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
  background: linear-gradient(
    to right,
    #1a42cc,
    #1ab8e6
  ); /* Darken gradient on hover */
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px; /* Increased gap */
  padding-top: 20px; /* More space above footer */
  border-top: 1px solid #e0e0e0; /* Subtle separator */
}

.save-btn,
.cancel-btn {
  padding: 12px 24px; /* Larger buttons */
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 1rem; /* Standard button text size */
  font-weight: 500; /* Medium weight */
  transition: opacity 0.2s ease, transform 0.2s ease;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.save-btn {
  background: linear-gradient(
    135deg,
    #2152ff 0%,
    #21d4fd 100%
  ); /* Blue gradient */
  color: white;
}

.cancel-btn {
  background-color: #ecf0f1; /* Light gray for cancel */
  color: #7f8c8d; /* Dark gray text */
  border: 1px solid #bdc3c7; /* Subtle border */
}
.cancel-btn:hover {
  background-color: #e0e6e8;
  border-color: #adb5bd;
}

.save-btn:hover {
  opacity: 0.9;
  transform: translateY(-1px); /* Slight lift on hover */
}

/* Responsive adjustments */
@media (max-width: 600px) {
  .modal-content {
    padding: 18px;
    max-width: calc(100% - 2rem); /* Ensure padding on small screens */
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
    flex-direction: column; /* Stack buttons on small screens */
    gap: 10px;
  }
  .save-btn,
  .cancel-btn {
    width: 100%; /* Full width buttons on small screens */
  }
}
</style>
