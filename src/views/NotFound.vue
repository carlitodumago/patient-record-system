<script setup>
import { useRouter } from 'vue-router';

const router = useRouter();

const goBack = () => {
  router.go(-1);
};
</script>

<template>
  <div class="not-found-container">
    <div class="error-content">
      <div class="error-code">404</div>
      <div class="error-icon">
        <i class="bi bi-exclamation-circle"></i>
      </div>
      <h1 class="error-title">404 Not Found</h1>
      <p class="error-message">
        Sorry, the page you are looking for doesn't exist or has been moved.
      </p>
      <div class="action-buttons">
        <button class="btn-action back" @click="goBack">
          <i class="bi bi-arrow-left me-2"></i>Go Back
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.not-found-container {
  min-height: 80vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.8), rgba(240, 242, 245, 0.8));
  border-radius: 16px;
  margin: 1rem;
}

.error-content {
  max-width: 550px;
  text-align: center;
  padding: 3rem;
  background-color: white;
  border-radius: 16px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
  position: relative;
  overflow: hidden;
}

.error-code {
  font-size: 10rem;
  font-weight: 800;
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  z-index: 0;
  opacity: 0.05;
  line-height: 1;
}

.error-icon {
  font-size: 4rem;
  color: var(--primary-gradient-start);
  margin-bottom: 1.5rem;
  position: relative;
  z-index: 1;
}

.error-title {
  font-size: 2.5rem;
  font-weight: 600;
  color: #333;
  margin-bottom: 1rem;
  position: relative;
  z-index: 1;
}

.error-message {
  font-size: 1.1rem;
  color: #6c757d;
  margin-bottom: 2rem;
  position: relative;
  z-index: 1;
}

.action-buttons {
  display: flex;
  gap: 1rem;
  justify-content: center;
  position: relative;
  z-index: 1;
}

.btn-action {
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  font-weight: 500;
  cursor: pointer;
  border: none;
  display: flex;
  align-items: center;
  transition: all 0.3s ease;
}

.btn-action.back {
  background-color: #f8f9fa;
  border: 1px solid #dee2e6;
  color: #495057;
}

.btn-action.back:hover {
  background-color: #e9ecef;
}

@media (max-width: 576px) {
  .error-content {
    padding: 2rem;
  }
  
  .error-code {
    font-size: 7rem;
  }
  
  .error-icon {
    font-size: 3rem;
  }
  
  .error-title {
    font-size: 2rem;
  }
  
  .action-buttons {
    flex-direction: column;
  }
}
</style> 