/**
 * Google Drive service interface
 * Implementations: LocalDriveService (direct API calls from browser)
 */

import { DriveFile, DriveFolder } from '@/types';

export interface DriveService {
  /**
   * Get folder ID from share link
   */
  extractFolderIdFromShareLink(shareLink: string): string;

  /**
   * Initialize folder structure (create organized/ subfolder if needed)
   */
  initializeFolderStructure(rootFolderId: string): Promise<{
    organizedFolderId: string;
  }>;

  /**
   * List files in a folder
   */
  listFiles(
    folderId: string,
    options?: ListFilesOptions
  ): Promise<DriveFile[]>;

  /**
   * List folders in a folder
   */
  listFolders(folderId: string): Promise<DriveFolder[]>;

  /**
   * Upload file
   */
  uploadFile(
    folderId: string,
    file: File,
    name?: string
  ): Promise<DriveFile>;

  /**
   * Move file to different folder
   */
  moveFile(
    fileId: string,
    targetFolderId: string,
    sourceFolderId: string
  ): Promise<DriveFile>;

  /**
   * Rename file
   */
  renameFile(fileId: string, newName: string): Promise<DriveFile>;

  /**
   * Create folder
   */
  createFolder(
    parentFolderId: string,
    folderName: string
  ): Promise<DriveFolder>;

  /**
   * Get file by ID
   */
  getFile(fileId: string): Promise<DriveFile>;

  /**
   * Delete file
   */
  deleteFile(fileId: string): Promise<void>;

  /**
   * Get download URL for file
   */
  getDownloadUrl(fileId: string): Promise<string>;
}

export interface ListFilesOptions {
  mimeType?: string; // e.g., 'image/jpeg'
  excludeFolders?: string[]; // Folder IDs to exclude
  query?: string; // Additional query parameters
}
