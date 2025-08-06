<template>
  <div v-if="hasError" class="error-boundary">
    <div class="error-content">
      <h3>Something went wrong</h3>
      <p>{{ errorMessage }}</p>
      <button @click="resetError" class="btn btn-primary">
        Try Again
      </button>
    </div>
  </div>
  <slot v-else />
</template>

<script setup>
import { ref, onErrorCaptured } from 'vue';

const hasError = ref(false);
const errorMessage = ref('');

onErrorCaptured((error, instance, info) => {
  console.error('Error captured by boundary:', error);
  console.error('Component instance:', instance);
  console.error('Error info:', info);
  
  hasError.value = true;
  errorMessage.value = error.message || 'An unexpected error occurred';
  
  // Return false to prevent the error from propagating
  return false;
});

const resetError = () => {
  hasError.value = false;
  errorMessage.value = '';
};
</script>

<style scoped>
.error-boundary {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 200px;
  padding: 20px;
}

.error-content {
  text-align: center;
  max-width: 400px;
  padding: 20px;
  border-radius: 8px;
  background-color: #f8d7da;
  border: 1px solid #f5c6cb;
  color: #721c24;
}

.error-content h3 {
  margin-bottom: 10px;
  color: #721c24;
}

.error-content p {
  margin-bottom: 15px;
  color: #721c24;
}

.btn {
  padding: 8px 16px;
  border-radius: 4px;
  cursor: pointer;
  border: none;
  font-size: 14px;
}

.btn-primary {
  background-color: #007bff;
  color: white;
}

.btn-primary:hover {
  background-color: #0056b3;
}
</style> 