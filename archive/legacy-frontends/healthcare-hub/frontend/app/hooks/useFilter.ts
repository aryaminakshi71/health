import { useState } from 'react';

export function useFilter() {
  const [filterStatus, setFilterStatus] = useState('all');

  return {
    filterStatus,
    setFilterStatus
  };
} 