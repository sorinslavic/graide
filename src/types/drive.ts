/**
 * Type definitions for Google Drive integration
 */

export interface DriveFile {
  id: string;
  name: string;
  mimeType: string;
  webViewLink?: string;
  webContentLink?: string;
  thumbnailLink?: string;
  createdTime: string;
  modifiedTime: string;
  parents?: string[];
}

export interface DriveFolder {
  id: string;
  name: string;
  webViewLink?: string;
  createdTime: string;
  parents?: string[];
}

export interface PhotoInboxItem {
  file: DriveFile;
  assigned: boolean;
  studentId?: string;
  testId?: string;
}

export interface FolderStructure {
  rootFolderId: string;
  spreadsheetId?: string;
  organizedFolderId?: string;
}
