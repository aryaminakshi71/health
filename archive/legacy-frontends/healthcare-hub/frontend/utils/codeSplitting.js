import dynamic from 'next/dynamic';

// Dynamic imports for better code splitting
export const DynamicChart = dynamic(() => import('../components/EnhancedCharts'), {
  loading: () => <div>Loading chart...</div>,
  ssr: false
});

export const DynamicTable = dynamic(() => import('../components/Table'), {
  loading: () => <div>Loading table...</div>
});

export const DynamicForm = dynamic(() => import('../components/Form'), {
  loading: () => <div>Loading form...</div>
});

export const DynamicModal = dynamic(() => import('../components/ui/Modal'), {
  loading: () => <div>Loading modal...</div>
});

// Lazy load heavy components
export const DynamicAnalytics = dynamic(() => import('../components/Analytics'), {
  loading: () => <div>Loading analytics...</div>,
  ssr: false
});

export const DynamicReports = dynamic(() => import('../components/Reports'), {
  loading: () => <div>Loading reports...</div>,
  ssr: false
});

// Preload critical components
export const preloadCriticalComponents = () => {
  // Preload components that are likely to be used
  const preloadComponents = [
    () => import('../components/Header'),
    () => import('../components/Footer'),
    () => import('../components/Sidebar')
  ];
  
  preloadComponents.forEach(preload => preload());
};
