/**
 * Animation utility functions using cubic bezier splines for smooth transitions
 */

// Predefined spline animation curves (cubic-bezier)
export const splines = {
  // Standard curves
  easeInOut: 'cubic-bezier(0.645, 0.045, 0.355, 1.000)',
  easeOut: 'cubic-bezier(0.000, 0.000, 0.580, 1.000)',
  easeIn: 'cubic-bezier(0.420, 0.000, 1.000, 1.000)',
  
  // Custom splines for unique motion
  bounceOut: 'cubic-bezier(0.175, 0.885, 0.320, 1.275)',
  snappy: 'cubic-bezier(0.175, 0.885, 0.320, 1.000)',
  gentle: 'cubic-bezier(0.250, 0.460, 0.450, 0.940)',
  anticipate: 'cubic-bezier(0.680, -0.550, 0.265, 1.550)',
};

// Apply animation classes to element
export function animateElement(element, animationType, duration = 0.5, delay = 0) {
  if (!element) return;
  
  // Reset any existing animations
  element.style.animation = 'none';
  element.offsetHeight; // Trigger reflow to reset animation
  
  // Set animation properties
  element.style.animation = `${animationType} ${duration}s ${splines.easeInOut} ${delay}s both`;
}

// Generate CSS with all animations
export function generateAnimationCSS() {
  return `
    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
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
    
    .animate-fade-in {
      animation: fadeIn 0.5s ${splines.easeInOut} both;
    }
    
    .animate-fade-in-up {
      animation: fadeInUp 0.5s ${splines.easeOut} both;
    }
    
    .animate-fade-in-down {
      animation: fadeInDown 0.5s ${splines.easeOut} both;
    }
    
    .animate-fade-in-left {
      animation: fadeInLeft 0.5s ${splines.snappy} both;
    }
    
    .animate-fade-in-right {
      animation: fadeInRight 0.5s ${splines.snappy} both;
    }
    
    .animate-pulse {
      animation: pulse 2s ${splines.gentle} infinite;
    }
    
    .animate-breathe {
      animation: breathe 2s ${splines.easeInOut} infinite;
    }
    
    .animate-float {
      animation: floatUp 3s ${splines.easeInOut} infinite;
    }
    
    .animate-slide-in-up {
      animation: slideInUp 0.5s ${splines.anticipate} both;
    }
    
    .animation-delay-100 { animation-delay: 0.1s; }
    .animation-delay-200 { animation-delay: 0.2s; }
    .animation-delay-300 { animation-delay: 0.3s; }
    .animation-delay-400 { animation-delay: 0.4s; }
    .animation-delay-500 { animation-delay: 0.5s; }
  `;
} 