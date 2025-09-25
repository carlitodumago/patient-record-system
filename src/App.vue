<script setup>
import MainLayout from "./layouts/MainLayout.vue";
import { onMounted, computed } from "vue";
import { useRoute } from "vue-router";
import { generateAnimationCSS } from "./utils/animationUtils";
import NotifyManager from "./components/NotifyManager.vue";
import ErrorBoundary from "./components/ErrorBoundary.vue";
import { useAuth } from "./composables/useAuth";

const route = useRoute();

// Initialize authentication
const { user, isAuthenticated, loading } = useAuth();

// Check if current route should use layout
const useLayout = computed(() => {
  return route.path !== "/login" && route.path !== "/register";
});
</script>

<template>
  <ErrorBoundary>
    <NotifyManager />
    <MainLayout v-if="useLayout">
      <router-view />
    </MainLayout>
    <router-view v-else />
  </ErrorBoundary>
</template>

<style>
:root {
  /* Base variables */
  --primary-gradient-start: #4361ee;
  --primary-gradient-end: #3f37c9;
  --secondary-gradient-start: #4cc9f0;
  --secondary-gradient-end: #4895ef;
  --accent-color: #f72585;
  --text-color: #212529;
  --background-color: #f8f9fa;
  --light-color: #f8f9fa;
  --dark-color: #212529;
  --success-color: #4caf50;
  --warning-color: #ff9800;
  --danger-color: #f44336;

  /* Additional theme variables */
  --muted-color: #6c757d;
  --card-bg: #ffffff;
  --input-bg: #ffffff;
  --input-color: #212529;
  --border-color: #ced4da;
  
  /* Font size variables */
  --base-font-size: 18px;
  --font-scale: 1;
  --font-size-sm: calc(var(--base-font-size) * 0.875);
  --font-size-lg: calc(var(--base-font-size) * 1.25);
  --font-size-xl: calc(var(--base-font-size) * 1.5);
  --heading-font-weight: 600;
  --text-line-height: 1.5;
}

/* Dark mode overrides */
.dark-mode {
  --text-color: #e0e0e0;
  --background-color: #121212;
  --light-color: #1e1e1e;
  --dark-color: #f8f9fa;
  --muted-color: #a0a0a0;
  --card-bg: #2a2a2a;
  --input-bg: #333333;
  --input-color: #e0e0e0;
  --border-color: #444444;
}

body {
  background-color: var(--background-color);
  font-family: "Poppins", sans-serif;
  color: var(--text-color);
  font-size: var(--base-font-size);
  line-height: var(--text-line-height);
  transition: background-color 0.3s ease, color 0.3s ease, font-size 0.3s ease;
}

/* Card style enhancements */
.card {
  border-radius: 10px;
  border: none;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
  transition: transform 0.3s, box-shadow 0.3s, background-color 0.3s;
  background-color: var(--card-bg);
}

.card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 15px rgba(0, 0, 0, 0.1);
}

.card-header {
  background: linear-gradient(
    135deg,
    var(--secondary-gradient-start),
    var(--secondary-gradient-end)
  );
  color: white;
  border-radius: 10px 10px 0 0 !important;
  border-bottom: none;
}

.card-body {
  color: var(--text-color);
}

/* Button enhancements */
.btn-primary {
  background: linear-gradient(
    135deg,
    var(--primary-gradient-start),
    var(--primary-gradient-end)
  );
  border: none;
}

.btn-primary:hover {
  background: linear-gradient(
    135deg,
    var(--primary-gradient-end),
    var(--primary-gradient-start)
  );
}

.btn-success {
  background: linear-gradient(135deg, var(--success-color), #2e7d32);
  border: none;
}

.btn-danger {
  background: linear-gradient(135deg, var(--danger-color), #c62828);
  border: none;
}

/* Button outline styles */
.btn-outline-primary,
.btn-outline-secondary,
.btn-outline-danger {
  transition: all 0.2s ease;
}

.btn-outline-primary:focus,
.btn-outline-secondary:focus,
.btn-outline-danger:focus {
  box-shadow: 0 0 0 0.25rem rgba(var(--accent-color), 0.25);
}

/* Button group styles */
.btn-group {
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  border-radius: 0.25rem;
}

/* Form control enhancements */
.form-control,
.form-select {
  font-size: var(--base-font-size);
  background-color: var(--input-bg);
  color: var(--input-color);
  border-color: var(--border-color);
  transition: background-color 0.3s, color 0.3s;
}

.form-control:focus,
.form-select:focus {
  border-color: var(--primary-gradient-start);
  box-shadow: 0 0 0 0.25rem rgba(67, 97, 238, 0.25);
  background-color: var(--input-bg);
  color: var(--input-color);
}

.form-label {
  font-size: var(--base-font-size);
  color: var(--text-color);
}

.bg-gradient-light {
  background: linear-gradient(
    135deg,
    var(--light-color),
    var(--background-color)
  );
}

/* Badge styles */
.badge.bg-info {
  background: linear-gradient(
    135deg,
    var(--secondary-gradient-start),
    var(--secondary-gradient-end)
  ) !important;
}

.badge.bg-warning {
  background: linear-gradient(135deg, var(--warning-color), #fb8c00) !important;
}

/* Alert styles */
.alert-success {
  background: linear-gradient(
    135deg,
    rgba(76, 175, 80, 0.1),
    rgba(46, 125, 50, 0.1)
  );
  border-left: 3px solid var(--success-color);
  color: var(--success-color);
}

.alert-danger {
  background: linear-gradient(
    135deg,
    rgba(244, 67, 54, 0.1),
    rgba(198, 40, 40, 0.1)
  );
  border-left: 3px solid var(--danger-color);
  color: var(--danger-color);
}

/* Override text-muted class */
.text-muted {
  color: var(--muted-color) !important;
}

/* Placeholder text styling */
::placeholder {
  color: rgba(155, 155, 155, 0.8) !important;
  opacity: 1;
}

.dark-mode ::placeholder {
  color: rgba(200, 200, 200, 0.7) !important;
}

/* Notes and textarea specific styling */
.dark-mode textarea,
.dark-mode [aria-label="notes"],
.dark-mode .notes-field {
  background-color: rgba(255, 255, 255, 0.05) !important;
  color: rgba(255, 255, 255, 0.9) !important;
  border-color: rgba(255, 255, 255, 0.2) !important;
}

.dark-mode textarea:focus,
.dark-mode [aria-label="notes"]:focus,
.dark-mode .notes-field:focus {
  background-color: rgba(255, 255, 255, 0.1) !important;
  color: white !important;
  border-color: var(--primary-gradient-start) !important;
}

/* Animation */
@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

.router-view-transition {
  animation: fadeIn 0.5s ease-in-out;
}

/* Font Size Adjustments */
h1, .h1 { font-size: calc(2.5rem * var(--font-scale)); }
h2, .h2 { font-size: calc(2rem * var(--font-scale)); }
h3, .h3 { font-size: calc(1.75rem * var(--font-scale)); }
h4, .h4 { font-size: calc(1.5rem * var(--font-scale)); }
h5, .h5 { font-size: calc(1.25rem * var(--font-scale)); }
h6, .h6 { font-size: calc(1rem * var(--font-scale)); }

.btn {
  font-size: var(--base-font-size);
}

.btn-sm {
  font-size: var(--font-size-sm);
}

.btn-lg {
  font-size: var(--font-size-lg);
}

/* Animation styles using spline curves */
@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translate3d(0, 20px, 0);
  }
  to {
    opacity: 1;
    transform: translate3d(0, 0, 0);
  }
}

@keyframes fadeInDown {
  from {
    opacity: 0;
    transform: translate3d(0, -20px, 0);
  }
  to {
    opacity: 1;
    transform: translate3d(0, 0, 0);
  }
}

@keyframes fadeInLeft {
  from {
    opacity: 0;
    transform: translate3d(-20px, 0, 0);
  }
  to {
    opacity: 1;
    transform: translate3d(0, 0, 0);
  }
}

@keyframes fadeInRight {
  from {
    opacity: 0;
    transform: translate3d(20px, 0, 0);
  }
  to {
    opacity: 1;
    transform: translate3d(0, 0, 0);
  }
}

@keyframes pulse {
  0% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.05);
  }
  100% {
    transform: scale(1);
  }
}

@keyframes breathe {
  0% {
    box-shadow: 0 0 0 0 rgba(76, 175, 80, 0.4);
  }
  70% {
    box-shadow: 0 0 0 10px rgba(76, 175, 80, 0);
  }
  100% {
    box-shadow: 0 0 0 0 rgba(76, 175, 80, 0);
  }
}

@keyframes floatUp {
  0% {
    transform: translateY(0px);
  }
  50% {
    transform: translateY(-10px);
  }
  100% {
    transform: translateY(0px);
  }
}

@keyframes slideInUp {
  from {
    transform: translate3d(0, 100%, 0);
    visibility: visible;
  }
  to {
    transform: translate3d(0, 0, 0);
  }
}

/* Animation utility classes */
.animate-fade-in {
  animation: fadeIn 0.5s cubic-bezier(0.645, 0.045, 0.355, 1) both;
}

.animate-fade-in-up {
  animation: fadeInUp 0.5s cubic-bezier(0, 0, 0.58, 1) both;
}

.animate-fade-in-down {
  animation: fadeInDown 0.5s cubic-bezier(0, 0, 0.58, 1) both;
}

.animate-fade-in-left {
  animation: fadeInLeft 0.5s cubic-bezier(0.175, 0.885, 0.32, 1) both;
}

.animate-fade-in-right {
  animation: fadeInRight 0.5s cubic-bezier(0.175, 0.885, 0.32, 1) both;
}

.animate-pulse {
  animation: pulse 2s cubic-bezier(0.25, 0.46, 0.45, 0.94) infinite;
}

.animate-breathe {
  animation: breathe 2s cubic-bezier(0.645, 0.045, 0.355, 1) infinite;
}

.animate-float {
  animation: floatUp 3s cubic-bezier(0.645, 0.045, 0.355, 1) infinite;
}

.animate-slide-in-up {
  animation: slideInUp 0.5s cubic-bezier(0.68, -0.55, 0.265, 1.55) both;
}

/* Animation delay classes */
.animation-delay-100 {
  animation-delay: 0.1s;
}
.animation-delay-200 {
  animation-delay: 0.2s;
}
.animation-delay-300 {
  animation-delay: 0.3s;
}
.animation-delay-400 {
  animation-delay: 0.4s;
}
.animation-delay-500 {
  animation-delay: 0.5s;
}

/* Page transition animations */
.page-enter-active,
.page-leave-active {
  transition: opacity 0.3s cubic-bezier(0.645, 0.045, 0.355, 1),
    transform 0.3s cubic-bezier(0.175, 0.885, 0.32, 1);
}

.page-enter-from {
  opacity: 0;
  transform: translateY(20px);
}

.page-leave-to {
  opacity: 0;
  transform: translateY(-20px);
}
</style>