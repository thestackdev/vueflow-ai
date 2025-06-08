<template>
  <div class="function-config">
    <label>Function Name:</label>
    <input
      v-model="editableData.name"
      type="text"
      placeholder="Enter function name"
    />
    <label>Description:</label>
    <input
      v-model="editableData.description"
      type="text"
      placeholder="Enter description"
    />
    <label>Transition To:</label>
    <select v-model="editableData.transition_to">
      <option value="" disabled>Select a target node</option>
      <option v-for="node in nodes" :key="node.id" :value="node.id">
        {{ node.label || node.id }}
      </option>
    </select>
    <button @click="save" class="save-btn">Save</button>
  </div>
</template>

<script setup>
import { defineProps, defineEmits, ref, watch } from "vue";

const props = defineProps({
  data: Object,
  nodes: Array,
});

const emit = defineEmits(["update"]);

const editableData = ref({ ...props.data });

watch(
  () => props.data,
  (val) => {
    editableData.value = { ...val };
  }
);

const save = () => {
  emit("update", { ...editableData.value });
};
</script>

<style scoped>
.function-config {
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 16px;
}

input[type="text"],
select {
  padding: 6px 10px;
  border-radius: 4px;
  border: 1px solid #ccc;
  font-family: inherit;
  font-size: 1rem;
  box-sizing: border-box;
  background-color: #f8f9fa;
  color: #2c3e50;
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
}

input[type="text"]:focus,
select:focus {
  outline: none;
  border-color: #3498db;
  box-shadow: 0 0 0 3px rgba(52, 152, 219, 0.2);
  background-color: #fff;
}

.save-btn {
  margin-top: 10px;
  padding: 8px 16px;
  background: #4caf50;
  color: #fff;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.save-btn:hover {
  background: #388e3c;
}
</style>