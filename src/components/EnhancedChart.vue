<template>
  <div class="enhanced-chart-container">
    <div class="chart-header">
      <h3 class="chart-title">{{ title }}</h3>
      <div class="chart-actions">
        <button
          v-for="action in actions"
          :key="action.label"
          @click="action.handler"
          class="chart-action-btn"
          :class="`chart-action-${action.type}`"
        >
          {{ action.label }}
        </button>
      </div>
    </div>

    <div class="chart-wrapper" :class="{ loading: loading }">
      <!-- Skeleton Loader -->
      <div v-if="loading" class="chart-skeleton">
        <div class="skeleton-bars">
          <div
            v-for="i in skeletonCount"
            :key="i"
            class="skeleton-bar"
            :style="{ height: Math.random() * 60 + 20 + '%' }"
          ></div>
        </div>
      </div>

      <!-- Chart Content -->
      <div v-else class="chart-content">
        <!-- Line Chart -->
        <div v-if="type === 'line'" class="line-chart">
          <svg :viewBox="`0 0 ${width} ${height}`" class="chart-svg">
            <!-- Grid lines -->
            <g class="grid" opacity="0.1">
              <line
                v-for="i in 5"
                :key="`h-${i}`"
                :x1="0"
                :y1="i * (height / 5)"
                :x2="width"
                :y2="i * (height / 5)"
                stroke="currentColor"
              />
              <line
                v-for="i in 5"
                :key="`v-${i}`"
                :x1="i * (width / 5)"
                :y1="0"
                :x2="i * (width / 5)"
                :y2="height"
                stroke="currentColor"
              />
            </g>

            <!-- Area fill -->
            <path
              :d="generateAreaPath()"
              class="chart-area"
              :style="{ fill: `url(#gradient-${_uid})` }"
            />

            <!-- Line -->
            <path
              :d="generateLinePath()"
              class="chart-line"
              :style="{ stroke: color }"
              stroke-width="3"
              fill="none"
            />

            <!-- Data points -->
            <g class="data-points">
              <circle
                v-for="(point, index) in dataPoints"
                :key="index"
                :cx="point.x"
                :cy="point.y"
                :r="point.value > 80 ? 6 : 4"
                class="data-point"
                :style="{ fill: color }"
                @mouseover="showTooltip($event, point)"
                @mouseleave="hideTooltip"
              />
            </g>

            <!-- Gradient Definition -->
            <defs>
              <linearGradient
                :id="`gradient-${_uid}`"
                x1="0%"
                y1="0%"
                x2="0%"
                y2="100%"
              >
                <stop offset="0%" :stop-color="color" stop-opacity="0.3" />
                <stop offset="100%" :stop-color="color" stop-opacity="0.05" />
              </linearGradient>
            </defs>
          </svg>
        </div>

        <!-- Bar Chart -->
        <div v-else-if="type === 'bar'" class="bar-chart">
          <div class="chart-bars">
            <div
              v-for="(bar, index) in dataPoints"
              :key="index"
              class="bar-item"
              @mouseover="showTooltip($event, bar)"
              @mouseleave="hideTooltip"
            >
              <div
                class="bar"
                :style="{
                  height: bar.y + 'px',
                  background: `linear-gradient(180deg, ${color} 0%, ${color}dd 100%)`,
                  boxShadow: `0 0 10px ${color}44`,
                }"
              ></div>
              <div class="bar-label">{{ bar.label }}</div>
            </div>
          </div>
        </div>

        <!-- Pie Chart -->
        <div v-else-if="type === 'pie'" class="pie-chart">
          <svg :viewBox="`0 0 ${width} ${height}`" class="chart-svg">
            <g class="pie-segments">
              <path
                v-for="(segment, index) in pieSegments"
                :key="index"
                :d="segment.path"
                :style="{ fill: segment.color }"
                class="pie-segment"
                @mouseover="showTooltip($event, segment)"
                @mouseleave="hideTooltip"
              />
            </g>
            <circle
              :cx="width / 2"
              :cy="height / 2"
              :r="Math.min(width, height) * 0.15"
              class="pie-center"
              :style="{ fill: color }"
            />
          </svg>
        </div>
      </div>
    </div>

    <!-- Tooltip -->
    <div v-if="tooltip.show" class="chart-tooltip" :style="tooltipStyle">
      <div class="tooltip-header">{{ tooltip.data.label }}</div>
      <div class="tooltip-value">{{ tooltip.data.value }}</div>
      <div class="tooltip-percentage" v-if="tooltip.data.percentage">
        {{ tooltip.data.percentage }}%
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";

const props = defineProps({
  title: {
    type: String,
    default: "Chart",
  },
  type: {
    type: String,
    default: "line",
    validator: (value) => ["line", "bar", "pie"].includes(value),
  },
  data: {
    type: Array,
    default: () => [],
  },
  color: {
    type: String,
    default: "#2563eb",
  },
  width: {
    type: Number,
    default: 400,
  },
  height: {
    type: Number,
    default: 200,
  },
  loading: {
    type: Boolean,
    default: false,
  },
  actions: {
    type: Array,
    default: () => [],
  },
});

const _uid = Math.random().toString(36).substr(2, 9);
const tooltip = ref({ show: false, data: {}, x: 0, y: 0 });

// Generate data points for visualization
const dataPoints = computed(() => {
  if (props.type === "line") {
    const maxVal = Math.max(...props.data.map((d) => d.value));
    return props.data.map((item, index) => ({
      x: (index / (props.data.length - 1)) * props.width,
      y:
        props.height -
        (item.value / maxVal) * props.height * 0.8 -
        props.height * 0.1,
      value: item.value,
      label: item.label,
    }));
  } else if (props.type === "bar") {
    const maxVal = Math.max(...props.data.map((d) => d.value));
    return props.data.map((item, index) => ({
      x: index * (props.width / props.data.length),
      y: (item.value / maxVal) * props.height * 0.8,
      value: item.value,
      label: item.label,
    }));
  }
  return props.data;
});

// Generate pie chart segments
const pieSegments = computed(() => {
  if (props.type !== "pie") return [];

  const total = props.data.reduce((sum, item) => sum + item.value, 0);
  let currentAngle = 0;

  return props.data.map((item, index) => {
    const percentage = (item.value / total) * 100;
    const angle = (item.value / total) * 360;
    const startAngle = currentAngle;
    const endAngle = currentAngle + angle;

    const x1 =
      props.width / 2 +
      Math.cos((startAngle * Math.PI) / 180) *
        (Math.min(props.width, props.height) * 0.35);
    const y1 =
      props.height / 2 +
      Math.sin((startAngle * Math.PI) / 180) *
        (Math.min(props.width, props.height) * 0.35);
    const x2 =
      props.width / 2 +
      Math.cos((endAngle * Math.PI) / 180) *
        (Math.min(props.width, props.height) * 0.35);
    const y2 =
      props.height / 2 +
      Math.sin((endAngle * Math.PI) / 180) *
        (Math.min(props.width, props.height) * 0.35);

    const largeArcFlag = angle > 180 ? 1 : 0;
    const path = `M ${props.width / 2} ${props.height / 2} L ${x1} ${y1} A ${
      Math.min(props.width, props.height) * 0.35
    } ${
      Math.min(props.width, props.height) * 0.35
    } 0 ${largeArcFlag} 1 ${x2} ${y2} Z`;

    currentAngle += angle;

    return {
      path,
      color: item.color || `hsl(${index * 45}, 70%, 60%)`,
      value: item.value,
      label: item.label,
      percentage: percentage.toFixed(1),
    };
  });
});

// Generate SVG path for line chart
const generateLinePath = () => {
  if (!dataPoints.value.length) return "";

  let path = `M ${dataPoints.value[0].x} ${dataPoints.value[0].y}`;
  for (let i = 1; i < dataPoints.value.length; i++) {
    path += ` L ${dataPoints.value[i].x} ${dataPoints.value[i].y}`;
  }
  return path;
};

// Generate area path for line chart
const generateAreaPath = () => {
  if (!dataPoints.value.length) return "";

  let path = `M ${dataPoints.value[0].x} ${props.height * 0.9}`;
  path += ` L ${dataPoints.value[0].x} ${dataPoints.value[0].y}`;

  for (let i = 1; i < dataPoints.value.length; i++) {
    path += ` L ${dataPoints.value[i].x} ${dataPoints.value[i].y}`;
  }

  path += ` L ${dataPoints.value[dataPoints.value.length - 1].x} ${
    props.height * 0.9
  } Z`;
  return path;
};

// Tooltip functions
const showTooltip = (event, data) => {
  tooltip.value = {
    show: true,
    data,
    x: event.clientX,
    y: event.clientY,
  };
};

const hideTooltip = () => {
  tooltip.value.show = false;
};

const tooltipStyle = computed(() => ({
  position: "fixed",
  left: tooltip.value.x + 10 + "px",
  top: tooltip.value.y - 10 + "px",
  zIndex: 1000,
}));

const skeletonCount = computed(() => {
  return props.type === "bar" ? props.data.length : 5;
});
</script>

<style scoped>
.enhanced-chart-container {
  background: var(--admin-bg-primary);
  border-radius: var(--admin-radius-xl);
  padding: var(--admin-space-6);
  box-shadow: var(--admin-shadow-modern);
  position: relative;
  overflow: hidden;
}

.chart-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--admin-space-4);
}

.chart-title {
  font-size: var(--admin-font-size-lg);
  font-weight: var(--admin-font-weight-semibold);
  color: var(--admin-text-primary);
  margin: 0;
}

.chart-actions {
  display: flex;
  gap: var(--admin-space-2);
}

.chart-action-btn {
  padding: var(--admin-space-2) var(--admin-space-3);
  border: 1px solid var(--admin-border-light);
  background: transparent;
  color: var(--admin-text-secondary);
  border-radius: var(--admin-radius-md);
  font-size: var(--admin-font-size-sm);
  cursor: pointer;
  transition: all var(--admin-transition-base);
}

.chart-action-btn:hover {
  background: var(--admin-bg-secondary);
  border-color: var(--admin-primary);
  color: var(--admin-primary);
}

.chart-wrapper {
  position: relative;
  min-height: 200px;
}

.chart-wrapper.loading {
  opacity: 0.7;
}

.chart-skeleton {
  display: flex;
  align-items: end;
  justify-content: center;
  height: 200px;
  gap: var(--admin-space-3);
}

.skeleton-bars {
  display: flex;
  align-items: end;
  gap: var(--admin-space-2);
  width: 100%;
}

.skeleton-bar {
  background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
  background-size: 200% 100%;
  animation: admin-shimmer 1.5s infinite;
  border-radius: var(--admin-radius-sm);
  flex: 1;
  min-height: 20px;
}

.chart-content {
  position: relative;
}

.chart-svg {
  width: 100%;
  height: auto;
}

.chart-area {
  opacity: 0.6;
  transition: opacity var(--admin-transition-base);
}

.chart-line {
  filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.1));
  transition: stroke-width var(--admin-transition-base);
}

.data-point {
  cursor: pointer;
  transition: all var(--admin-transition-base);
}

.data-point:hover {
  r: 8;
  filter: drop-shadow(0 0 8px currentColor);
}

.bar-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  cursor: pointer;
  transition: all var(--admin-transition-base);
}

.bar-item:hover {
  transform: translateY(-2px);
}

.bar {
  width: 80%;
  min-height: 20px;
  border-radius: var(--admin-radius-sm) var(--admin-radius-sm) 0 0;
  transition: all var(--admin-transition-base);
  position: relative;
  overflow: hidden;
}

.bar::before {
  content: "";
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(
    90deg,
    transparent,
    rgba(255, 255, 255, 0.3),
    transparent
  );
  transition: left 0.5s ease;
}

.bar:hover::before {
  left: 100%;
}

.bar-label {
  margin-top: var(--admin-space-2);
  font-size: var(--admin-font-size-xs);
  color: var(--admin-text-muted);
  text-align: center;
}

.pie-segment {
  cursor: pointer;
  transition: all var(--admin-transition-base);
}

.pie-segment:hover {
  filter: brightness(1.1);
  transform-origin: center;
  transform: scale(1.02);
}

.pie-center {
  filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.1));
}

.chart-tooltip {
  background: var(--admin-bg-primary);
  border: 1px solid var(--admin-border-light);
  border-radius: var(--admin-radius-lg);
  padding: var(--admin-space-3);
  box-shadow: var(--admin-shadow-lg);
  pointer-events: none;
  z-index: 1000;
  min-width: 120px;
  animation: admin-fade-in-bounce 0.3s ease;
}

.tooltip-header {
  font-weight: var(--admin-font-weight-semibold);
  color: var(--admin-text-primary);
  margin-bottom: var(--admin-space-1);
}

.tooltip-value {
  font-size: var(--admin-font-size-lg);
  color: var(--admin-primary);
  font-weight: var(--admin-font-weight-bold);
}

.tooltip-percentage {
  font-size: var(--admin-font-size-sm);
  color: var(--admin-text-muted);
  margin-top: var(--admin-space-1);
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .enhanced-chart-container {
    padding: var(--admin-space-4);
  }

  .chart-header {
    flex-direction: column;
    align-items: flex-start;
    gap: var(--admin-space-3);
  }

  .chart-actions {
    width: 100%;
    justify-content: flex-end;
  }
}
</style>
