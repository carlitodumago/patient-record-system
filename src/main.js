import "./assets/main.css";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";
import "bootstrap/dist/js/bootstrap.bundle.min.js";
import "@fortawesome/fontawesome-free/css/all.min.css";
import "./assets/css/styles.css";

// Vue and Pinia
import { createApp } from "vue";
import { createPinia } from "pinia";
import App from "./App.vue";
import router from "./router";

// Pinia stores
import { useAuthStore } from "./stores/auth";

// Apply animation CSS on app initialization
import { generateAnimationCSS } from "./utils/animationUtils";

// Create the app instance
const app = createApp(App);

// Create Pinia instance
const pinia = createPinia();

// Apply animation CSS
try {
  const animationCSS = generateAnimationCSS();
  const style = document.createElement("style");
  style.textContent = animationCSS;
  document.head.appendChild(style);
} catch (error) {
  console.error("Error applying animation CSS:", error);
}

// Register the notification system globally
app.config.globalProperties.$notify = (message, options = {}) => {
  try {
    // This function will be properly defined when the NotifyManager component is mounted
    console.log("Notification system not yet initialized");
    return { close: () => {} };
  } catch (error) {
    console.error("Error in notification system:", error);
    return { close: () => {} };
  }
};

// Store app instance globally for notifications to work
window.__VUE_APP_INSTANCE = app;

// Global error handler
window.addEventListener("error", (event) => {
  console.error("Global error:", event.error);
});

window.addEventListener("unhandledrejection", (event) => {
  console.error("Unhandled promise rejection:", event.reason);
});

// Use plugins
app.use(pinia);
app.use(router);

// Initialize auth store and check for existing authentication
const authStore = useAuthStore();
authStore.initializeAuth();

// Execute after app is mounted
try {
  app.mount("#app");
} catch (error) {
  console.error("Error mounting app:", error);
  // Fallback: try to show error message
  const appElement = document.getElementById("app");
  if (appElement) {
    appElement.innerHTML = `
      <div style="padding: 20px; text-align: center; color: #d9534f;">
        <h2>Application Error</h2>
        <p>There was an error loading the application. Please refresh the page.</p>
        <button onclick="location.reload()" style="padding: 10px 20px; background: #d9534f; color: white; border: none; border-radius: 4px; cursor: pointer;">
          Refresh Page
        </button>
      </div>
    `;
  }
}
