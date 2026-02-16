/**
 * Hook for app initialization
 * Automatically initializes Drive folder structure and Sheets spreadsheet
 */

import { useState, useEffect } from 'react';
import { initializationService, InitializationStatus } from '@/services/initialization-service';

export function useInitialization() {
  const [status, setStatus] = useState<InitializationStatus | null>(null);
  const [isInitializing, setIsInitializing] = useState(false);

  /**
   * Check initialization status on mount
   */
  useEffect(() => {
    const checkStatus = () => {
      const currentStatus = initializationService.checkInitialization();
      setStatus(currentStatus);

      // Auto-initialize if folder is configured but not fully initialized
      if (currentStatus.folderId && !currentStatus.isInitialized && !isInitializing) {
        initialize(currentStatus.folderId);
      }
    };

    checkStatus();
  }, []);

  /**
   * Initialize with folder ID
   */
  const initialize = async (folderId: string) => {
    setIsInitializing(true);
    try {
      const result = await initializationService.initialize(folderId);
      setStatus(result);
      return result;
    } finally {
      setIsInitializing(false);
    }
  };

  /**
   * Re-initialize (force recreation)
   */
  const reinitialize = async () => {
    setIsInitializing(true);
    try {
      const result = await initializationService.reinitialize();
      setStatus(result);
      return result;
    } finally {
      setIsInitializing(false);
    }
  };

  /**
   * Reset all data
   */
  const reset = () => {
    initializationService.reset();
    setStatus(initializationService.checkInitialization());
  };

  return {
    status,
    isInitializing,
    initialize,
    reinitialize,
    reset,
  };
}
