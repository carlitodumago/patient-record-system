<template>
  <div class="navbar-demo">
    <div class="demo-section">
      <h2 class="demo-title">Enhanced Navigation System</h2>
      <p class="demo-description">
        Modern navbar with glassmorphism effects, improved proportions, and
        responsive design
      </p>

      <!-- Glassmorphism Navbar -->
      <div class="demo-navbar admin-navbar admin-navbar-enter">
        <div class="navbar-content">
          <div class="navbar-left">
            <button class="admin-nav-toggle">
              <i class="bi bi-list"></i>
            </button>
          </div>

          <div class="navbar-center">
            <a href="#" class="admin-navbar-brand">
              <i class="bi bi-hospital"></i>
              <span>Patient Record System</span>
            </a>
          </div>

          <div class="navbar-right">
            <nav class="admin-navbar-nav">
              <a href="#" class="admin-nav-link">
                <i class="bi bi-house"></i>
                Dashboard
              </a>
              <a href="#" class="admin-nav-link active">
                <i class="bi bi-people"></i>
                Patients
              </a>
              <a href="#" class="admin-nav-link">
                <i class="bi bi-calendar"></i>
                Appointments
              </a>
              <a href="#" class="admin-nav-link">
                <i class="bi bi-gear"></i>
                Settings
              </a>
            </nav>
          </div>
        </div>
      </div>

      <!-- Navbar Variants -->
      <div class="navbar-variants">
        <h3 class="variants-title">Navbar Variants</h3>
        <div class="variant-showcase">
          <div class="variant-item">
            <div class="variant-navbar admin-navbar admin-nav-glass">
              <div class="navbar-content">
                <div class="navbar-center">
                  <span class="admin-navbar-brand">Glassmorphism Style</span>
                </div>
              </div>
            </div>
            <code class="variant-code">admin-nav-glass</code>
          </div>

          <div class="variant-item">
            <div class="variant-navbar admin-navbar admin-nav-solid">
              <div class="navbar-content">
                <div class="navbar-center">
                  <span class="admin-navbar-brand">Solid Background</span>
                </div>
              </div>
            </div>
            <code class="variant-code">admin-nav-solid</code>
          </div>

          <div class="variant-item">
            <div class="variant-navbar admin-navbar admin-nav-transparent">
              <div class="navbar-content">
                <div class="navbar-center">
                  <span class="admin-navbar-brand">Transparent Style</span>
                </div>
              </div>
            </div>
            <code class="variant-code">admin-nav-transparent</code>
          </div>
        </div>
      </div>

      <!-- Usage Examples -->
      <div class="usage-examples">
        <h3 class="examples-title">Usage Examples</h3>
        <div class="code-blocks">
          <div class="code-block">
            <h4>Basic Navbar</h4>
            <pre><code><nav class="admin-navbar">
  <div class="navbar-content">
    <div class="navbar-left">
      <button class="admin-nav-toggle">
        <i class="bi bi-list"></i>
      </button>
    </div>

    <div class="navbar-center">
      <a href="#" class="admin-navbar-brand">
        <i class="bi bi-hospital"></i>
        Your App Name
      </a>
    </div>

    <div class="navbar-right">
      <nav class="admin-navbar-nav">
        <a href="#" class="admin-nav-link">
          <i class="bi bi-house"></i>
          Dashboard
        </a>
      </nav>
    </div>
  </div>
</nav></code></pre>
          </div>

          <div class="code-block">
            <h4>Responsive Navbar</h4>
            <pre><code><!-- Automatically adapts to screen size -->
<nav class="admin-navbar">
  <!-- Mobile: Smaller height and padding -->
  <!-- Tablet: Medium height and padding -->
  <!-- Desktop: Full height and padding -->
</nav></code></pre>
          </div>

          <div class="code-block">
            <h4>Navbar with Glassmorphism</h4>
            <pre><code><nav class="admin-navbar admin-nav-glass">
  <!-- Glassmorphism background -->
  <!-- backdrop-filter: blur(20px) -->
  <!-- Semi-transparent background -->
</nav></code></pre>
          </div>
        </div>
      </div>

      <!-- Features List -->
      <div class="features-list">
        <h3 class="features-title">Enhanced Features</h3>
        <div class="features-grid">
          <div class="feature-item">
            <div class="feature-icon">
              <i class="bi bi-aspect-ratio"></i>
            </div>
            <div class="feature-content">
              <h4>Improved Proportions</h4>
              <p>
                Enhanced height, padding, and font sizes using CSS variables
              </p>
            </div>
          </div>

          <div class="feature-item">
            <div class="feature-icon">
              <i class="bi bi-droplet"></i>
            </div>
            <div class="feature-content">
              <h4>Glassmorphism Effects</h4>
              <p>Modern backdrop-filter and transparency effects</p>
            </div>
          </div>

          <div class="feature-item">
            <div class="feature-icon">
              <i class="bi bi-phone"></i>
            </div>
            <div class="feature-content">
              <h4>Mobile Responsive</h4>
              <p>Adaptive sizing for mobile, tablet, and desktop</p>
            </div>
          </div>

          <div class="feature-item">
            <div class="feature-icon">
              <i class="bi bi-brush"></i>
            </div>
            <div class="feature-content">
              <h4>Modern Styling</h4>
              <p>Enhanced shadows, gradients, and animations</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
// Navbar demo component showcasing enhanced features
</script>

<style scoped>
.navbar-demo {
  padding: var(--admin-space-8);
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  min-height: 100vh;
}

.demo-section {
  max-width: 1200px;
  margin: 0 auto;
}

.demo-title {
  font-size: var(--admin-font-size-4xl);
  font-weight: var(--admin-font-weight-bold);
  color: white;
  text-align: center;
  margin: 0 0 var(--admin-space-4) 0;
}

.demo-description {
  font-size: var(--admin-font-size-lg);
  color: rgba(255, 255, 255, 0.9);
  text-align: center;
  margin: 0 0 var(--admin-space-8) 0;
}

/* Demo Navbar */
.demo-navbar {
  margin-bottom: var(--admin-space-8);
  animation: admin-fade-in-bounce 0.6s ease;
}

.navbar-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 100%;
}

.navbar-left,
.navbar-right {
  flex: 1;
}

.navbar-center {
  flex: 2;
  display: flex;
  justify-content: center;
}

/* Navbar Variants */
.navbar-variants {
  margin-bottom: var(--admin-space-8);
}

.variants-title {
  font-size: var(--admin-font-size-2xl);
  font-weight: var(--admin-font-weight-semibold);
  color: white;
  margin: 0 0 var(--admin-space-6) 0;
  text-align: center;
}

.variant-showcase {
  display: grid;
  gap: var(--admin-space-6);
}

.variant-item {
  text-align: center;
}

.variant-navbar {
  height: 60px;
  margin-bottom: var(--admin-space-3);
  animation: admin-slide-in-scale 0.4s ease;
}

.variant-code {
  background: rgba(0, 0, 0, 0.3);
  color: white;
  padding: var(--admin-space-2) var(--admin-space-4);
  border-radius: var(--admin-radius-md);
  font-family: "Courier New", monospace;
  font-size: var(--admin-font-size-sm);
}

/* Usage Examples */
.usage-examples {
  margin-bottom: var(--admin-space-8);
}

.examples-title {
  font-size: var(--admin-font-size-2xl);
  font-weight: var(--admin-font-weight-semibold);
  color: white;
  margin: 0 0 var(--admin-space-6) 0;
  text-align: center;
}

.code-blocks {
  display: grid;
  gap: var(--admin-space-6);
}

.code-block {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: var(--admin-radius-xl);
  padding: var(--admin-space-6);
}

.code-block h4 {
  color: white;
  margin: 0 0 var(--admin-space-4) 0;
  font-size: var(--admin-font-size-lg);
}

.code-block pre {
  background: rgba(0, 0, 0, 0.2);
  padding: var(--admin-space-4);
  border-radius: var(--admin-radius-md);
  overflow-x: auto;
  margin: 0;
}

.code-block code {
  color: #f8f9fa;
  font-family: "Courier New", monospace;
  font-size: var(--admin-font-size-sm);
  line-height: 1.5;
}

/* Features List */
.features-list {
  margin-bottom: var(--admin-space-8);
}

.features-title {
  font-size: var(--admin-font-size-2xl);
  font-weight: var(--admin-font-weight-semibold);
  color: white;
  margin: 0 0 var(--admin-space-6) 0;
  text-align: center;
}

.features-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: var(--admin-space-6);
}

.feature-item {
  display: flex;
  align-items: flex-start;
  gap: var(--admin-space-4);
  padding: var(--admin-space-6);
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: var(--admin-radius-xl);
}

.feature-icon {
  width: 50px;
  height: 50px;
  background: rgba(37, 99, 235, 0.2);
  border-radius: var(--admin-radius-lg);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.feature-icon i {
  font-size: 1.5rem;
  color: white;
}

.feature-content h4 {
  color: white;
  margin: 0 0 var(--admin-space-2) 0;
  font-size: var(--admin-font-size-lg);
}

.feature-content p {
  color: rgba(255, 255, 255, 0.8);
  margin: 0;
  font-size: var(--admin-font-size-base);
}

/* Responsive Design */
@media (max-width: 768px) {
  .navbar-demo {
    padding: var(--admin-space-4);
  }

  .demo-title {
    font-size: var(--admin-font-size-3xl);
  }

  .navbar-content {
    flex-direction: column;
    gap: var(--admin-space-4);
    text-align: center;
  }

  .navbar-left,
  .navbar-center,
  .navbar-right {
    flex: none;
  }

  .features-grid {
    grid-template-columns: 1fr;
  }

  .code-blocks {
    grid-template-columns: 1fr;
  }
}
</style>
