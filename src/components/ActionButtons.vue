<script setup>
defineProps({
  onView: {
    type: Function,
    required: false,
    default: () => {}
  },
  onEdit: {
    type: Function,
    required: false,
    default: () => {}
  },
  onDelete: {
    type: Function,
    required: false,
    default: () => {}
  },
  showView: {
    type: Boolean,
    default: true
  },
  showEdit: {
    type: Boolean,
    default: true
  },
  showDelete: {
    type: Boolean,
    default: true
  },
  size: {
    type: String,
    default: 'sm',
    validator: (value) => ['sm', 'md', 'lg'].includes(value)
  }
});
</script>

<template>
  <div class="action-buttons">
    <div class="btn-group" :class="`btn-group-${size}`">
      <button v-if="showView" @click="onView" class="btn btn-outline-primary action-btn view-btn">
        <i class="bi bi-eye"></i>
      </button>
      <button v-if="showEdit" @click="onEdit" class="btn btn-outline-secondary action-btn edit-btn">
        <i class="bi bi-pencil"></i>
      </button>
      <button v-if="showDelete" @click="onDelete" class="btn btn-outline-danger action-btn delete-btn">
        <i class="bi bi-trash"></i>
      </button>
    </div>
  </div>
</template>

<style scoped>
.action-buttons {
  display: inline-flex;
  position: absolute;
  right: 10px;
  top: 10px;
  z-index: 10;
}

/* In notification context, prevent overlapping */
.notification-item .action-buttons,
.notification-panel .action-buttons {
  display: none !important;
}

/* In normal context, apply regular styling */
:not(.notification-item):not(.notification-panel) > .action-buttons {
  position: relative;
  display: inline-flex;
  right: auto;
  top: auto;
}

.action-btn {
  position: relative;
  z-index: 1;
  padding: 0.25rem 0.5rem; /* Smaller padding */
  transition: all 0.2s ease-in-out;
  background-color: white;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  font-size: 0.8rem; /* Smaller font size */
}

/* When displayed in a container with position: relative */
:not(.position-relative) > .action-buttons {
  position: static;
  display: inline-flex;
}

.btn-group-sm .action-btn {
  padding: 0.2rem 0.4rem;
}

.btn-group-lg .action-btn {
  padding: 0.5rem 1rem;
}

.action-btn i {
  font-size: 0.9rem;
}

/* Hover effects */
.action-btn:hover {
  transform: translateY(-2px);
  z-index: 2;
}

/* Button styling */
.view-btn {
  border-color: #0d6efd;
  color: #0d6efd;
  border-width: 2px;
}

.view-btn:hover {
  background-color: rgba(13, 110, 253, 0.1);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
}

.edit-btn {
  border-color: #6c757d;
  color: #6c757d;
  border-width: 2px;
  background-color: rgba(108, 117, 125, 0.05);
}

.edit-btn:hover {
  background-color: rgba(108, 117, 125, 0.15);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
}

.edit-btn i {
  text-shadow: 0 0 8px rgba(108, 117, 125, 0.3);
}

.delete-btn {
  border-color: #dc3545;
  color: #dc3545;
  border-width: 2px;
}

.delete-btn:hover {
  background-color: rgba(220, 53, 69, 0.1);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
}

.action-btn i {
  text-shadow: 0 0 5px rgba(0, 0, 0, 0.1);
}

/* Highlighted focus state for keyboard navigation */
.action-btn:focus {
  box-shadow: 0 0 0 0.25rem rgba(13, 110, 253, 0.25);
  outline: none;
}
</style> 