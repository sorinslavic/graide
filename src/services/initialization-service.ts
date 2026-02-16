/**
 * Initialization Service
 * Sets up Google Drive folder structure and Sheets spreadsheet on first use
 */

import { localDriveService } from './google/local-drive-service';
import { localSheetsService } from './google/local-sheets-service';

export interface InitializationStatus {
  isInitialized: boolean;
  folderId?: string;
  spreadsheetId?: string;
  organizedFolderId?: string;
  error?: string;
}

export class InitializationService {
  /**
   * Check if the app is initialized
   */
  checkInitialization(): InitializationStatus {
    const folderId = localStorage.getItem('graide_folder_id');
    const spreadsheetId = localStorage.getItem('graide_spreadsheet_id');
    const organizedFolderId = localStorage.getItem('graide_organized_folder_id');

    if (!folderId) {
      return {
        isInitialized: false,
        error: 'No Drive folder configured',
      };
    }

    return {
      isInitialized: !!spreadsheetId,
      folderId,
      spreadsheetId: spreadsheetId || undefined,
      organizedFolderId: organizedFolderId || undefined,
    };
  }

  /**
   * Initialize app with folder ID
   * - Creates organized/ subfolder if needed
   * - Creates graide-data spreadsheet if needed
   */
  async initialize(folderId: string): Promise<InitializationStatus> {
    try {
      console.log('🚀 Starting initialization...');

      // Store folder ID
      localStorage.setItem('graide_folder_id', folderId);

      // Step 1: Initialize folder structure (create organized/ subfolder)
      console.log('📁 Initializing folder structure...');
      const { organizedFolderId } = await localDriveService.initializeFolderStructure(folderId);
      localStorage.setItem('graide_organized_folder_id', organizedFolderId);

      // Step 2: Initialize spreadsheet
      console.log('📊 Initializing spreadsheet...');
      const spreadsheetId = await localSheetsService.initializeSpreadsheet(folderId);

      console.log('✅ Initialization complete!');
      console.log('  - Folder ID:', folderId);
      console.log('  - Organized Folder ID:', organizedFolderId);
      console.log('  - Spreadsheet ID:', spreadsheetId);

      return {
        isInitialized: true,
        folderId,
        spreadsheetId,
        organizedFolderId,
      };
    } catch (error) {
      console.error('❌ Initialization failed:', error);
      return {
        isInitialized: false,
        folderId,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Re-initialize (useful if spreadsheet or folder was deleted)
   */
  async reinitialize(): Promise<InitializationStatus> {
    const folderId = localStorage.getItem('graide_folder_id');
    if (!folderId) {
      throw new Error('No folder ID found. Please configure a Drive folder first.');
    }

    // Clear cached IDs to force recreation
    localStorage.removeItem('graide_spreadsheet_id');
    localStorage.removeItem('graide_organized_folder_id');

    return this.initialize(folderId);
  }

  /**
   * Reset all stored data (for testing or switching folders)
   */
  reset(): void {
    localStorage.removeItem('graide_folder_id');
    localStorage.removeItem('graide_spreadsheet_id');
    localStorage.removeItem('graide_organized_folder_id');
    console.log('🔄 Initialization data cleared');
  }
}

// Export singleton instance
export const initializationService = new InitializationService();
