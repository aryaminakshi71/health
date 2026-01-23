import { useState } from 'react';

export function useTabs(defaultTab: string = 'dashboard') {
  const [activeTab, setActiveTab] = useState(defaultTab);

  return {
    activeTab,
    setActiveTab
  };
}
