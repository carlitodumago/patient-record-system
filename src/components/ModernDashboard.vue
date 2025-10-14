<template>
  <div class="modern-dashboard">
    <!-- Enhanced Header -->
    <div class="dashboard-header admin-glass-primary">
      <div class="header-content">
        <div class="header-left">
          <h1 class="dashboard-title">
            <i class="bi bi-speedometer2"></i>
            {{ title }}
          </h1>
          <p class="dashboard-subtitle">{{ subtitle }}</p>
        </div>
        <div class="header-actions">
          <button
            v-for="action in headerActions"
            :key="action.label"
            @click="action.handler"
            class="header-action-btn"
            :class="`action-${action.type}`"
          >
            <i :class="action.icon"></i>
            {{ action.label }}
          </button>
        </div>
      </div>
      <div class="header-decoration">
        <div class="floating-elements">
          <div
            v-for="i in 5"
            :key="i"
            class="floating-element"
            :class="`element-${i}`"
          ></div>
        </div>
      </div>
    </div>

    <!-- Stats Grid -->
    <div class="stats-grid">
      <div
        v-for="(stat, index) in stats"
        :key="stat.label"
        class="stat-card admin-card-floating admin-animate-fade-in-bounce"
        :class="{ 'admin-glass': stat.glassmorphism }"
        :style="{ animationDelay: `${index * 0.1}s` }"
        @click="stat.click"
      >
        <div class="stat-icon-container">
          <div class="stat-icon" :class="`icon-${stat.type}`">
            <i :class="stat.icon" :style="{ color: stat.color }"></i>
          </div>
          <div
            class="stat-pulse"
            :style="{ backgroundColor: stat.color }"
          ></div>
        </div>

        <div class="stat-content">
          <div class="stat-number" :style="{ color: stat.color }">
            {{ stat.value }}
          </div>
          <div class="stat-label">{{ stat.label }}</div>
          <div class="stat-trend" v-if="stat.trend">
            <i
              :class="stat.trend.icon"
              :style="{ color: stat.trend.color }"
            ></i>
            {{ stat.trend.value }}
          </div>
        </div>

        <div class="stat-background">
          <div
            class="stat-pattern"
            :style="{ backgroundColor: stat.color + '08' }"
          ></div>
        </div>
      </div>
    </div>

    <!-- Main Content Grid -->
    <div class="content-grid">
      <!-- Chart Section -->
      <div class="chart-section admin-card-glass">
        <div class="section-header">
          <h3 class="section-title">
            <i class="bi bi-graph-up"></i>
            Analytics Overview
          </h3>
          <div class="section-actions">
            <button class="section-action active">Live</button>
            <button class="section-action">7D</button>
            <button class="section-action">30D</button>
          </div>
        </div>

        <div class="charts-container">
          <div class="chart-item">
            <EnhancedChart
              type="line"
              title="Patient Registrations"
              :data="chartData.registrations"
              color="#2563eb"
              :loading="loading"
            />
          </div>
          <div class="chart-item">
            <EnhancedChart
              type="bar"
              title="Appointments by Day"
              :data="chartData.appointments"
              color="#059669"
              :loading="loading"
            />
          </div>
        </div>
      </div>

      <!-- Activity Feed -->
      <div class="activity-section admin-card-gradient">
        <div class="section-header">
          <h3 class="section-title">
            <i class="bi bi-activity"></i>
            Recent Activity
          </h3>
          <button class="view-all-btn">View All</button>
        </div>

        <div class="activity-feed">
          <div
            v-for="(activity, index) in activities"
            :key="activity.id"
            class="activity-item admin-animate-slide-in-scale"
            :style="{ animationDelay: `${index * 0.1}s` }"
          >
            <div class="activity-icon" :class="`activity-${activity.type}`">
              <i :class="activity.icon"></i>
            </div>
            <div class="activity-content">
              <div class="activity-text">{{ activity.description }}</div>
              <div class="activity-time">{{ activity.time }}</div>
            </div>
            <div class="activity-status" :class="`status-${activity.status}`">
              <i :class="activity.statusIcon"></i>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Quick Actions -->
    <div class="quick-actions admin-card-interactive">
      <h3 class="actions-title">
        <i class="bi bi-lightning-charge"></i>
        Quick Actions
      </h3>

      <div class="actions-grid">
        <button
          v-for="action in quickActions"
          :key="action.label"
          class="action-card admin-btn-floating"
          @click="action.handler"
        >
          <div class="action-icon" :style="{ backgroundColor: action.color }">
            <i :class="action.icon"></i>
          </div>
          <div class="action-content">
            <div class="action-title">{{ action.label }}</div>
            <div class="action-desc">{{ action.description }}</div>
          </div>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import EnhancedChart from "./EnhancedChart.vue";

const props = defineProps({
  title: {
    type: String,
    default: "Modern Dashboard",
  },
  subtitle: {
    type: String,
    default: "Real-time healthcare analytics and insights",
  },
});

const loading = ref(true);
const stats = ref([
  {
    label: "Total Patients",
    value: "2,847",
    icon: "bi-people",
    color: "#2563eb",
    type: "patients",
    trend: { value: "+12%", icon: "bi-arrow-up", color: "#059669" },
    glassmorphism: true,
  },
  {
    label: "Active Staff",
    value: "127",
    icon: "bi-person-badge",
    color: "#059669",
    type: "staff",
    trend: { value: "+8%", icon: "bi-arrow-up", color: "#059669" },
  },
  {
    label: "Appointments",
    value: "1,429",
    icon: "bi-calendar-check",
    color: "#dc2626",
    type: "appointments",
    trend: { value: "+23%", icon: "bi-arrow-up", color: "#059669" },
  },
  {
    label: "System Health",
    value: "98.5%",
    icon: "bi-shield-check",
    color: "#059669",
    type: "health",
    trend: { value: "Optimal", icon: "bi-check-circle", color: "#059669" },
  },
]);

const chartData = ref({
  registrations: [
    { label: "Mon", value: 45 },
    { label: "Tue", value: 52 },
    { label: "Wed", value: 38 },
    { label: "Thu", value: 61 },
    { label: "Fri", value: 55 },
    { label: "Sat", value: 42 },
    { label: "Sun", value: 31 },
  ],
  appointments: [
    { label: "Mon", value: 85 },
    { label: "Tue", value: 92 },
    { label: "Wed", value: 78 },
    { label: "Thu", value: 96 },
    { label: "Fri", value: 88 },
    { label: "Sat", value: 45 },
    { label: "Sun", value: 23 },
  ],
});

const activities = ref([
  {
    id: 1,
    type: "patient",
    description: "New patient registered: John Smith",
    time: "2 minutes ago",
    status: "success",
    icon: "bi-person-plus",
    statusIcon: "bi-check-circle-fill",
  },
  {
    id: 2,
    type: "appointment",
    description: "Appointment scheduled: Dr. Johnson - Room 301",
    time: "5 minutes ago",
    status: "info",
    icon: "bi-calendar-plus",
    statusIcon: "bi-info-circle-fill",
  },
  {
    id: 3,
    type: "record",
    description: "Medical record updated: Patient ID 2847",
    time: "8 minutes ago",
    status: "warning",
    icon: "bi-file-earmark-medical",
    statusIcon: "bi-exclamation-triangle-fill",
  },
]);

const headerActions = [
  {
    label: "Refresh",
    icon: "bi-arrow-repeat",
    type: "primary",
    handler: () => refreshData(),
  },
  {
    label: "Export",
    icon: "bi-download",
    type: "secondary",
    handler: () => exportData(),
  },
];

const quickActions = [
  {
    label: "Add Patient",
    description: "Register new patient",
    icon: "bi-person-plus",
    color: "#2563eb",
    handler: () => console.log("Add patient"),
  },
  {
    label: "Schedule",
    description: "Book appointment",
    icon: "bi-calendar-plus",
    color: "#059669",
    handler: () => console.log("Schedule appointment"),
  },
  {
    label: "Reports",
    description: "View analytics",
    icon: "bi-graph-up",
    color: "#dc2626",
    handler: () => console.log("View reports"),
  },
  {
    label: "Settings",
    description: "System configuration",
    icon: "bi-gear",
    color: "#6b7280",
    handler: () => console.log("Open settings"),
  },
];

const refreshData = async () => {
  loading.value = true;
  // Simulate API call
  setTimeout(() => {
    loading.value = false;
  }, 1500);
};

const exportData = () => {
  console.log("Exporting dashboard data...");
};

onMounted(() => {
  // Simulate initial loading
  setTimeout(() => {
    loading.value = false;
  }, 1000);
});
</script>

<style scoped>
.modern-dashboard {
  padding: var(--admin-space-6);
  background: var(--admin-bg-secondary);
  min-height: 100vh;
}

/* Enhanced Header */
.dashboard-header {
  border-radius: var(--admin-radius-2xl);
  padding: var(--admin-space-8);
  margin-bottom: var(--admin-space-8);
  position: relative;
  overflow: hidden;
  background: linear-gradient(
    135deg,
    rgba(37, 99, 235, 0.1) 0%,
    rgba(5, 150, 105, 0.05) 100%
  );
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  position: relative;
  z-index: 2;
}

.dashboard-title {
  font-size: var(--admin-font-size-4xl);
  font-weight: var(--admin-font-weight-bold);
  background: linear-gradient(
    135deg,
    var(--admin-primary),
    var(--admin-secondary)
  );
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
  margin: 0 0 var(--admin-space-2) 0;
  display: flex;
  align-items: center;
  gap: var(--admin-space-3);
}

.dashboard-title i {
  font-size: 1.2em;
  color: var(--admin-primary);
}

.dashboard-subtitle {
  color: var(--admin-text-secondary);
  font-size: var(--admin-font-size-lg);
  margin: 0;
}

.header-actions {
  display: flex;
  gap: var(--admin-space-3);
}

.header-action-btn {
  padding: var(--admin-space-3) var(--admin-space-5);
  border-radius: var(--admin-radius-lg);
  font-weight: var(--admin-font-weight-medium);
  display: flex;
  align-items: center;
  gap: var(--admin-space-2);
  transition: all var(--admin-transition-base);
  border: 1px solid transparent;
}

.header-action-btn.action-primary {
  background: var(--admin-primary);
  color: white;
  box-shadow: 0 4px 15px rgba(37, 99, 235, 0.3);
}

.header-action-btn.action-secondary {
  background: transparent;
  color: var(--admin-primary);
  border-color: var(--admin-primary);
}

.header-action-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
}

.header-decoration {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  pointer-events: none;
}

.floating-elements {
  position: absolute;
  width: 100%;
  height: 100%;
}

.floating-element {
  position: absolute;
  border-radius: 50%;
  background: linear-gradient(
    45deg,
    rgba(37, 99, 235, 0.1),
    rgba(5, 150, 105, 0.1)
  );
  animation: admin-float 6s ease-in-out infinite;
}

.element-1 {
  width: 60px;
  height: 60px;
  top: 20%;
  right: 10%;
  animation-delay: 0s;
}
.element-2 {
  width: 40px;
  height: 40px;
  top: 60%;
  right: 20%;
  animation-delay: 2s;
}
.element-3 {
  width: 80px;
  height: 80px;
  top: 10%;
  right: 30%;
  animation-delay: 4s;
}
.element-4 {
  width: 30px;
  height: 30px;
  bottom: 20%;
  right: 15%;
  animation-delay: 1s;
}
.element-5 {
  width: 50px;
  height: 50px;
  bottom: 40%;
  right: 35%;
  animation-delay: 3s;
}

/* Stats Grid */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: var(--admin-space-6);
  margin-bottom: var(--admin-space-8);
}

.stat-card {
  padding: var(--admin-space-6);
  border-radius: var(--admin-radius-xl);
  position: relative;
  cursor: pointer;
  overflow: hidden;
  transition: all var(--admin-transition-base);
}

.stat-icon-container {
  position: relative;
  display: flex;
  align-items: center;
  margin-bottom: var(--admin-space-4);
}

.stat-icon {
  width: 60px;
  height: 60px;
  border-radius: var(--admin-radius-xl);
  background: rgba(255, 255, 255, 0.1);
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  z-index: 2;
}

.stat-icon i {
  font-size: 1.5rem;
}

.stat-pulse {
  position: absolute;
  width: 100%;
  height: 100%;
  border-radius: 50%;
  animation: admin-pulse-glow 2s infinite;
  opacity: 0.3;
}

.stat-content {
  position: relative;
  z-index: 2;
}

.stat-number {
  font-size: var(--admin-font-size-4xl);
  font-weight: var(--admin-font-weight-bold);
  line-height: 1;
  margin-bottom: var(--admin-space-2);
}

.stat-label {
  font-size: var(--admin-font-size-base);
  color: var(--admin-text-secondary);
  font-weight: var(--admin-font-weight-medium);
  margin-bottom: var(--admin-space-2);
}

.stat-trend {
  display: flex;
  align-items: center;
  gap: var(--admin-space-1);
  font-size: var(--admin-font-size-sm);
  font-weight: var(--admin-font-weight-semibold);
}

.stat-background {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  opacity: 0.02;
  z-index: 1;
}

.stat-pattern {
  width: 100%;
  height: 100%;
  background-image: radial-gradient(
      circle at 25% 25%,
      currentColor 2px,
      transparent 2px
    ),
    radial-gradient(circle at 75% 75%, currentColor 2px, transparent 2px);
  background-size: 50px 50px;
}

/* Content Grid */
.content-grid {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: var(--admin-space-6);
  margin-bottom: var(--admin-space-8);
}

.chart-section,
.activity-section {
  padding: var(--admin-space-6);
  border-radius: var(--admin-radius-xl);
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--admin-space-6);
}

.section-title {
  font-size: var(--admin-font-size-xl);
  font-weight: var(--admin-font-weight-semibold);
  color: var(--admin-text-primary);
  margin: 0;
  display: flex;
  align-items: center;
  gap: var(--admin-space-2);
}

.section-actions {
  display: flex;
  gap: var(--admin-space-2);
}

.section-action {
  padding: var(--admin-space-2) var(--admin-space-3);
  border: 1px solid var(--admin-border-light);
  background: transparent;
  color: var(--admin-text-secondary);
  border-radius: var(--admin-radius-md);
  font-size: var(--admin-font-size-sm);
  cursor: pointer;
  transition: all var(--admin-transition-base);
}

.section-action.active,
.section-action:hover {
  background: var(--admin-primary);
  color: white;
  border-color: var(--admin-primary);
}

.charts-container {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--admin-space-6);
}

.chart-item {
  background: rgba(255, 255, 255, 0.05);
  border-radius: var(--admin-radius-lg);
  padding: var(--admin-space-4);
}

/* Activity Feed */
.activity-feed {
  display: flex;
  flex-direction: column;
  gap: var(--admin-space-4);
}

.activity-item {
  display: flex;
  align-items: center;
  gap: var(--admin-space-4);
  padding: var(--admin-space-4);
  background: rgba(255, 255, 255, 0.05);
  border-radius: var(--admin-radius-lg);
  border: 1px solid rgba(255, 255, 255, 0.1);
  transition: all var(--admin-transition-base);
}

.activity-item:hover {
  background: rgba(255, 255, 255, 0.1);
  transform: translateX(4px);
}

.activity-icon {
  width: 40px;
  height: 40px;
  border-radius: var(--admin-radius-lg);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.activity-patient {
  background: rgba(37, 99, 235, 0.1);
}
.activity-appointment {
  background: rgba(5, 150, 105, 0.1);
}
.activity-record {
  background: rgba(220, 38, 38, 0.1);
}

.activity-icon i {
  font-size: 1.2rem;
}

.activity-patient i {
  color: var(--admin-primary);
}
.activity-appointment i {
  color: var(--admin-secondary);
}
.activity-record i {
  color: var(--admin-accent);
}

.activity-content {
  flex: 1;
}

.activity-text {
  font-weight: var(--admin-font-weight-medium);
  color: var(--admin-text-primary);
  margin-bottom: var(--admin-space-1);
}

.activity-time {
  font-size: var(--admin-font-size-sm);
  color: var(--admin-text-muted);
}

.activity-status {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.status-success {
  background: rgba(5, 150, 105, 0.1);
}
.status-info {
  background: rgba(37, 99, 235, 0.1);
}
.status-warning {
  background: rgba(220, 38, 38, 0.1);
}

/* Quick Actions */
.quick-actions {
  padding: var(--admin-space-6);
  border-radius: var(--admin-radius-xl);
  position: relative;
  overflow: hidden;
}

.actions-title {
  font-size: var(--admin-font-size-xl);
  font-weight: var(--admin-font-weight-semibold);
  color: var(--admin-text-primary);
  margin: 0 0 var(--admin-space-6) 0;
  display: flex;
  align-items: center;
  gap: var(--admin-space-2);
}

.actions-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: var(--admin-space-4);
}

.action-card {
  display: flex;
  align-items: center;
  gap: var(--admin-space-4);
  padding: var(--admin-space-5);
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: var(--admin-radius-lg);
  text-align: left;
  transition: all var(--admin-transition-base);
  position: relative;
  overflow: hidden;
}

.action-card::before {
  content: "";
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(
    90deg,
    transparent,
    rgba(255, 255, 255, 0.1),
    transparent
  );
  transition: left 0.5s ease;
}

.action-card:hover::before {
  left: 100%;
}

.action-card:hover {
  background: rgba(255, 255, 255, 0.1);
  transform: translateY(-2px);
}

.action-icon {
  width: 50px;
  height: 50px;
  border-radius: var(--admin-radius-lg);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.action-icon i {
  font-size: 1.3rem;
  color: white;
}

.action-content {
  flex: 1;
}

.action-title {
  font-weight: var(--admin-font-weight-semibold);
  color: var(--admin-text-primary);
  margin-bottom: var(--admin-space-1);
}

.action-desc {
  font-size: var(--admin-font-size-sm);
  color: var(--admin-text-muted);
}

/* Responsive Design */
@media (max-width: 1024px) {
  .content-grid {
    grid-template-columns: 1fr;
  }

  .charts-container {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 768px) {
  .modern-dashboard {
    padding: var(--admin-space-4);
  }

  .header-content {
    flex-direction: column;
    text-align: center;
    gap: var(--admin-space-4);
  }

  .stats-grid {
    grid-template-columns: 1fr;
  }

  .actions-grid {
    grid-template-columns: 1fr;
  }
}
</style>
