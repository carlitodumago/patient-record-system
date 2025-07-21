<script setup>
import { ref, watch } from 'vue';

const props = defineProps({
  show: {
    type: Boolean,
    default: false
  },
  title: {
    type: String,
    default: 'Confirm Action'
  },
  message: {
    type: String,
    default: 'Are you sure you want to proceed with this action?'
  },
  confirmButtonText: {
    type: String,
    default: 'Confirm'
  },
  cancelButtonText: {
    type: String,
    default: 'Cancel'
  },
  confirmButtonType: {
    type: String,
    default: 'danger',
    validator: (value) => ['primary', 'secondary', 'success', 'danger', 'warning', 'info'].includes(value)
  },
  icon: {
    type: String,
    default: 'bi-exclamation-triangle'
  }
});

const emit = defineEmits(['confirm', 'cancel', 'update:show']);

const visible = ref(props.show);

watch(() => props.show, (newValue) => {
  visible.value = newValue;
});

watch(visible, (newValue) => {
  emit('update:show', newValue);
});

const confirm = () => {
  emit('confirm');
  closeDialog();
};

const cancel = () => {
  emit('cancel');
  closeDialog();
};

const closeDialog = () => {
  visible.value = false;
};
</script>

<template>
  <div v-if="visible" class="confirmation-dialog-overlay" @click="cancel">
    <div class="confirmation-dialog" @click.stop>
      <div class="confirmation-dialog-header">
        <i :class="['bi', icon, 'icon']"></i>
        <h5>{{ title }}</h5>
        <button class="close-btn" @click="cancel">
          <i class="bi bi-x"></i>
        </button>
      </div>
      <div class="confirmation-dialog-body">
        <p>{{ message }}</p>
      </div>
      <div class="confirmation-dialog-footer">
        <button @click="cancel" class="btn btn-outline-secondary">
          {{ cancelButtonText }}
        </button>
        <button @click="confirm" :class="`btn btn-${confirmButtonType}`">
          {{ confirmButtonText }}
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.confirmation-dialog-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  animation: fadeIn 0.2s ease;
}

.confirmation-dialog {
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
  width: 90%;
  max-width: 400px;
  animation: scaleIn 0.2s ease;
  overflow: hidden;
}

.confirmation-dialog-header {
  display: flex;
  align-items: center;
  padding: 1rem;
  border-bottom: 1px solid rgba(0, 0, 0, 0.1);
  position: relative;
}

.confirmation-dialog-header .icon {
  font-size: 1.25rem;
  margin-right: 0.75rem;
}

.confirmation-dialog-header h5 {
  margin: 0;
  font-weight: 600;
}

.confirmation-dialog-body {
  padding: 1.25rem;
}

.confirmation-dialog-body p {
  margin: 0;
}

.confirmation-dialog-footer {
  padding: 1rem;
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
  border-top: 1px solid rgba(0, 0, 0, 0.1);
}

.close-btn {
  position: absolute;
  right: 1rem;
  top: 1rem;
  background: none;
  border: none;
  font-size: 1.25rem;
  cursor: pointer;
  color: #6c757d;
  display: flex;
  align-items: center;
  justify-content: center;
}

.close-btn:hover {
  color: #343a40;
}

/* Animations */
@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes scaleIn {
  from { transform: scale(0.9); opacity: 0; }
  to { transform: scale(1); opacity: 1; }
}

/* Dark mode support */
:global(.dark-mode) .confirmation-dialog {
  background-color: #252525;
  color: white;
}

:global(.dark-mode) .confirmation-dialog-header,
:global(.dark-mode) .confirmation-dialog-footer {
  border-color: rgba(255, 255, 255, 0.1);
}

:global(.dark-mode) .close-btn {
  color: #adb5bd;
}

:global(.dark-mode) .close-btn:hover {
  color: #ced4da;
}
</style> 