<template>
  <div class="modern-ui-demo">
    <div class="demo-container">
      <!-- Demo Header -->
      <div class="demo-header admin-glass-primary">
        <h1 class="demo-title">
          <i class="bi bi-brush"></i>
          Modern UI Components Demo
        </h1>
        <p class="demo-description">
          Showcasing enhanced UI components with glassmorphism, modern
          animations, and improved accessibility
        </p>
      </div>

      <!-- Component Showcase -->
      <div class="showcase-grid">
        <!-- Enhanced Cards Section -->
        <div class="showcase-section">
          <h2 class="section-title">Enhanced Card Variants</h2>
          <div class="cards-showcase">
            <div class="demo-card admin-card-glass">
              <div class="card-header">
                <i class="bi bi-star"></i>
                Glassmorphism Card
              </div>
              <div class="card-content">
                <p>
                  This card uses backdrop-filter and transparency effects for a
                  modern glass-like appearance.
                </p>
              </div>
            </div>

            <div class="demo-card admin-card-floating">
              <div class="card-header">
                <i class="bi bi-cloud"></i>
                Floating Card
              </div>
              <div class="card-content">
                <p>
                  Enhanced shadow effects and hover animations create a floating
                  appearance.
                </p>
              </div>
            </div>

            <div class="demo-card admin-card-gradient">
              <div class="card-header">
                <i class="bi bi-lightning"></i>
                Gradient Card
              </div>
              <div class="card-content">
                <p>
                  Modern gradient backgrounds with shimmer effects on hover.
                </p>
              </div>
            </div>
          </div>
        </div>

        <!-- Enhanced Buttons Section -->
        <div class="showcase-section">
          <h2 class="section-title">Enhanced Button Variants</h2>
          <div class="buttons-showcase">
            <button class="demo-btn admin-btn-gradient">
              <i class="bi bi-send"></i>
              Gradient Button
            </button>

            <button class="demo-btn admin-btn-glass">
              <i class="bi bi-eye"></i>
              Glass Button
            </button>

            <button class="demo-btn admin-btn-floating">
              <i class="bi bi-rocket"></i>
              Floating Button
            </button>
          </div>
        </div>

        <!-- Enhanced Inputs Section -->
        <div class="showcase-section">
          <h2 class="section-title">Enhanced Form Controls</h2>
          <div class="inputs-showcase">
            <div class="input-group">
              <input
                type="text"
                class="demo-input admin-input-modern"
                placeholder="Modern glass input"
              />
            </div>

            <div class="input-group">
              <input
                type="text"
                class="demo-input admin-input-floating"
                placeholder=" "
              />
              <label class="admin-input-floating-label"
                >Floating Label Input</label
              >
            </div>
          </div>
        </div>

        <!-- Enhanced Data Visualization -->
        <div class="showcase-section">
          <h2 class="section-title">Enhanced Data Visualization</h2>
          <div class="charts-showcase">
            <div class="chart-demo">
              <EnhancedChart
                type="line"
                title="Performance Metrics"
                :data="demoChartData"
                color="#2563eb"
              />
            </div>

            <div class="chart-demo">
              <EnhancedChart
                type="pie"
                title="Distribution"
                :data="pieChartData"
                color="#059669"
              />
            </div>
          </div>
        </div>

        <!-- Animation Showcase -->
        <div class="showcase-section">
          <h2 class="section-title">Animation Effects</h2>
          <div class="animations-showcase">
            <div class="animation-item admin-animate-fade-in-bounce">
              <i class="bi bi-stars"></i>
              <span>Fade In Bounce</span>
            </div>

            <div class="animation-item admin-animate-slide-in-scale">
              <i class="bi bi-arrow-right"></i>
              <span>Slide In Scale</span>
            </div>

            <div class="animation-item admin-animate-shimmer">
              <i class="bi bi-shimmer"></i>
              <span>Shimmer Effect</span>
            </div>

            <div class="animation-item admin-animate-glow">
              <i class="bi bi-lightbulb"></i>
              <span>Glow Animation</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Usage Examples -->
      <div class="usage-section admin-card">
        <h2 class="section-title">Usage Examples</h2>
        <div class="code-examples">
          <div class="example-item">
            <h4>Glassmorphism Card</h4>
            <pre><code><div class="admin-card-glass">
  <!-- Content -->
</div></code></pre>
          </div>

          <div class="example-item">
            <h4>Enhanced Button</h4>
            <pre><code><button class="admin-btn-gradient">
  <i class="bi bi-send"></i>
  Button Text
</button></code></pre>
          </div>

          <div class="example-item">
            <h4>Modern Input</h4>
            <pre><code><input class="admin-input-modern"
       placeholder="Modern input"></code></pre>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";
import EnhancedChart from "@/components/EnhancedChart.vue";

const demoChartData = ref([
  { label: "Jan", value: 65 },
  { label: "Feb", value: 78 },
  { label: "Mar", value: 82 },
  { label: "Apr", value: 75 },
  { label: "May", value: 88 },
  { label: "Jun", value: 95 },
]);

const pieChartData = ref([
  { label: "Desktop", value: 45, color: "#2563eb" },
  { label: "Mobile", value: 35, color: "#059669" },
  { label: "Tablet", value: 20, color: "#dc2626" },
]);
</script>

<style scoped>
.modern-ui-demo {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: var(--admin-space-8);
}

.demo-container {
  max-width: 1400px;
  margin: 0 auto;
}

.demo-header {
  text-align: center;
  padding: var(--admin-space-12);
  border-radius: var(--admin-radius-2xl);
  margin-bottom: var(--admin-space-12);
  position: relative;
  overflow: hidden;
}

.demo-title {
  font-size: var(--admin-font-size-5xl);
  font-weight: var(--admin-font-weight-bold);
  background: linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%);
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
  margin: 0 0 var(--admin-space-4) 0;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--admin-space-3);
}

.demo-description {
  font-size: var(--admin-font-size-xl);
  color: rgba(255, 255, 255, 0.9);
  margin: 0;
  max-width: 600px;
  margin: 0 auto;
}

.showcase-grid {
  display: grid;
  gap: var(--admin-space-8);
}

.showcase-section {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: var(--admin-radius-2xl);
  padding: var(--admin-space-8);
}

.section-title {
  font-size: var(--admin-font-size-2xl);
  font-weight: var(--admin-font-weight-semibold);
  color: white;
  margin: 0 0 var(--admin-space-6) 0;
  text-align: center;
}

/* Cards Showcase */
.cards-showcase {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: var(--admin-space-6);
}

.demo-card {
  padding: var(--admin-space-6);
  border-radius: var(--admin-radius-xl);
  height: 200px;
  display: flex;
  flex-direction: column;
  transition: all var(--admin-transition-base);
}

.demo-card:hover {
  transform: translateY(-8px);
}

.card-header {
  font-weight: var(--admin-font-weight-semibold);
  color: var(--admin-text-primary);
  margin-bottom: var(--admin-space-4);
  display: flex;
  align-items: center;
  gap: var(--admin-space-2);
}

.card-content {
  flex: 1;
  display: flex;
  align-items: center;
}

.card-content p {
  color: var(--admin-text-secondary);
  margin: 0;
  text-align: center;
}

/* Buttons Showcase */
.buttons-showcase {
  display: flex;
  gap: var(--admin-space-4);
  justify-content: center;
  flex-wrap: wrap;
}

.demo-btn {
  padding: var(--admin-space-4) var(--admin-space-6);
  border: none;
  border-radius: var(--admin-radius-lg);
  font-weight: var(--admin-font-weight-medium);
  color: white;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: var(--admin-space-2);
  transition: all var(--admin-transition-base);
}

.demo-btn:hover {
  transform: translateY(-2px);
}

/* Inputs Showcase */
.inputs-showcase {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: var(--admin-space-6);
}

.input-group {
  position: relative;
}

.demo-input {
  width: 100%;
  padding: var(--admin-space-4);
  border: none;
  border-radius: var(--admin-radius-lg);
  font-size: var(--admin-font-size-base);
  color: var(--admin-text-primary);
}

.demo-input:focus {
  outline: 2px solid var(--admin-primary);
  outline-offset: 2px;
}

/* Charts Showcase */
.charts-showcase {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
  gap: var(--admin-space-6);
}

.chart-demo {
  background: rgba(255, 255, 255, 0.05);
  border-radius: var(--admin-radius-xl);
  padding: var(--admin-space-4);
}

/* Animations Showcase */
.animations-showcase {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: var(--admin-space-6);
}

.animation-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--admin-space-3);
  padding: var(--admin-space-6);
  background: rgba(255, 255, 255, 0.05);
  border-radius: var(--admin-radius-xl);
  text-align: center;
}

.animation-item i {
  font-size: 2rem;
  color: white;
}

.animation-item span {
  color: white;
  font-weight: var(--admin-font-weight-medium);
}

/* Usage Examples */
.usage-section {
  padding: var(--admin-space-8);
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: var(--admin-radius-2xl);
}

.code-examples {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: var(--admin-space-6);
}

.example-item {
  background: rgba(0, 0, 0, 0.2);
  border-radius: var(--admin-radius-lg);
  padding: var(--admin-space-4);
}

.example-item h4 {
  color: white;
  margin: 0 0 var(--admin-space-3) 0;
  font-size: var(--admin-font-size-base);
}

.example-item pre {
  background: rgba(0, 0, 0, 0.3);
  padding: var(--admin-space-3);
  border-radius: var(--admin-radius-md);
  overflow-x: auto;
  margin: 0;
}

.example-item code {
  color: #f8f9fa;
  font-family: "Courier New", monospace;
  font-size: var(--admin-font-size-sm);
}

/* Responsive Design */
@media (max-width: 768px) {
  .modern-ui-demo {
    padding: var(--admin-space-4);
  }

  .demo-header {
    padding: var(--admin-space-8);
    margin-bottom: var(--admin-space-8);
  }

  .demo-title {
    font-size: var(--admin-font-size-3xl);
  }

  .cards-showcase,
  .charts-showcase {
    grid-template-columns: 1fr;
  }

  .buttons-showcase {
    flex-direction: column;
    align-items: center;
  }

  .inputs-showcase {
    grid-template-columns: 1fr;
  }

  .animations-showcase {
    grid-template-columns: repeat(2, 1fr);
  }

  .code-examples {
    grid-template-columns: 1fr;
  }
}
</style>
