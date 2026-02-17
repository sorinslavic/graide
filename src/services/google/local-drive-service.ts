/**
 * Local Google Drive Service Implementation
 * Makes direct API calls from browser using OAuth token
 */

import { DriveFile, DriveFolder } from '@/types';
import { DriveService, ListFilesOptions } from './drive-service';
import { googleAuthService, AuthExpiredError } from '../auth/google-auth-service';

const DRIVE_API_BASE = 'https://www.googleapis.com/drive/v3';
const ORGANIZED_FOLDER_NAME = 'organized';

export class LocalDriveService implements DriveService {
  /**
   * Get OAuth access token
   */
  private async getAccessToken(): Promise<string> {
    const token = await googleAuthService.getToken();
    if (!token) {
      throw new Error('No authentication token available. Please sign in.');
    }
    return token;
  }

  /**
   * Make authenticated API request
   */
  private async fetchAPI(
    url: string,
    options: RequestInit = {}
  ): Promise<Response> {
    const token = await this.getAccessToken();

    const response = await fetch(url, {
      ...options,
      headers: {
        Authorization: `Bearer ${token}`,
        ...options.headers,
      },
    });

    if (!response.ok) {
      if (response.status === 401) throw new AuthExpiredError();
      const error = await response.text();
      throw new Error(`Drive API error: ${response.status} - ${error}`);
    }

    return response;
  }

  /**
   * Extract folder ID from various share link formats
   */
  extractFolderIdFromShareLink(shareLink: string): string {
    // Handle direct folder ID
    if (!shareLink.includes('/') && shareLink.length > 20) {
      return shareLink;
    }

    // Extract from: https://drive.google.com/drive/folders/{ID}
    const folderMatch = shareLink.match(/folders\/([a-zA-Z0-9_-]+)/);
    if (folderMatch) {
      return folderMatch[1];
    }

    // Extract from: https://drive.google.com/drive/u/0/folders/{ID}
    const uFolderMatch = shareLink.match(/\/u\/\d+\/folders\/([a-zA-Z0-9_-]+)/);
    if (uFolderMatch) {
      return uFolderMatch[1];
    }

    // Extract from: ?id={ID}
    const idMatch = shareLink.match(/[?&]id=([a-zA-Z0-9_-]+)/);
    if (idMatch) {
      return idMatch[1];
    }

    throw new Error('Invalid Drive folder link format');
  }

  /**
   * Initialize folder structure (create organized/ subfolder if needed)
   */
  async initializeFolderStructure(
    rootFolderId: string
  ): Promise<{ organizedFolderId: string }> {
    try {
      // Check if organized/ folder already exists
      const folders = await this.listFolders(rootFolderId);
      const organizedFolder = folders.find(
        (f) => f.name === ORGANIZED_FOLDER_NAME
      );

      if (organizedFolder) {
        console.log('✅ Found existing organized/ folder:', organizedFolder.id);
        return { organizedFolderId: organizedFolder.id };
      }

      // Create organized/ folder
      console.log('📁 Creating organized/ folder...');
      const newFolder = await this.createFolder(
        rootFolderId,
        ORGANIZED_FOLDER_NAME
      );
      console.log('✅ Created organized/ folder:', newFolder.id);

      return { organizedFolderId: newFolder.id };
    } catch (error) {
      console.error('❌ Failed to initialize folder structure:', error);
      throw error;
    }
  }

  /**
   * List files in a folder
   */
  async listFiles(
    folderId: string,
    options?: ListFilesOptions
  ): Promise<DriveFile[]> {
    try {
      // Build query
      let query = `'${folderId}' in parents and trashed=false`;

      // Exclude folders from file listings
      query += ` and mimeType!='application/vnd.google-apps.folder'`;

      if (options?.mimeType) {
        query += ` and mimeType='${options.mimeType}'`;
      }

      if (options?.excludeFolders && options.excludeFolders.length > 0) {
        const excludeQuery = options.excludeFolders
          .map((id) => `'${id}' in parents`)
          .join(' or ');
        query += ` and not (${excludeQuery})`;
      }

      if (options?.query) {
        query += ` and ${options.query}`;
      }

      const fields =
        'files(id,name,mimeType,webViewLink,webContentLink,thumbnailLink,createdTime,modifiedTime,parents)';

      const response = await this.fetchAPI(
        `${DRIVE_API_BASE}/files?q=${encodeURIComponent(query)}&fields=${fields}&pageSize=1000`
      );

      const data = await response.json();
      return data.files || [];
    } catch (error) {
      console.error('❌ Failed to list files:', error);
      throw error;
    }
  }

  /**
   * List folders in a folder
   */
  async listFolders(folderId: string): Promise<DriveFolder[]> {
    try {
      const query = `'${folderId}' in parents and mimeType='application/vnd.google-apps.folder' and trashed=false`;
      const fields = 'files(id,name,webViewLink,createdTime,parents)';

      const response = await this.fetchAPI(
        `${DRIVE_API_BASE}/files?q=${encodeURIComponent(query)}&fields=${fields}`
      );

      const data = await response.json();
      return data.files || [];
    } catch (error) {
      console.error('❌ Failed to list folders:', error);
      throw error;
    }
  }

  /**
   * Upload file
   */
  async uploadFile(
    folderId: string,
    file: File,
    name?: string
  ): Promise<DriveFile> {
    try {
      const token = await this.getAccessToken();
      const fileName = name || file.name;

      // Multipart upload
      const metadata = {
        name: fileName,
        parents: [folderId],
      };

      const form = new FormData();
      form.append(
        'metadata',
        new Blob([JSON.stringify(metadata)], { type: 'application/json' })
      );
      form.append('file', file);

      const response = await fetch(
        `${DRIVE_API_BASE}/files?uploadType=multipart&fields=id,name,mimeType,webViewLink,webContentLink,thumbnailLink,createdTime,modifiedTime,parents`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: form,
        }
      );

      if (!response.ok) {
        const error = await response.text();
        throw new Error(`Upload failed: ${response.status} - ${error}`);
      }

      const driveFile = await response.json();
      console.log('✅ Uploaded file:', driveFile.name);
      return driveFile;
    } catch (error) {
      console.error('❌ Failed to upload file:', error);
      throw error;
    }
  }

  /**
   * Move file to different folder
   */
  async moveFile(
    fileId: string,
    targetFolderId: string,
    sourceFolderId: string
  ): Promise<DriveFile> {
    try {
      const response = await this.fetchAPI(
        `${DRIVE_API_BASE}/files/${fileId}?addParents=${targetFolderId}&removeParents=${sourceFolderId}&fields=id,name,mimeType,webViewLink,webContentLink,thumbnailLink,createdTime,modifiedTime,parents`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      const driveFile = await response.json();
      console.log('✅ Moved file:', driveFile.name);
      return driveFile;
    } catch (error) {
      console.error('❌ Failed to move file:', error);
      throw error;
    }
  }

  /**
   * Rename file
   */
  async renameFile(fileId: string, newName: string): Promise<DriveFile> {
    try {
      const response = await this.fetchAPI(
        `${DRIVE_API_BASE}/files/${fileId}?fields=id,name,mimeType,webViewLink,webContentLink,thumbnailLink,createdTime,modifiedTime,parents`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ name: newName }),
        }
      );

      const driveFile = await response.json();
      console.log('✅ Renamed file:', driveFile.name);
      return driveFile;
    } catch (error) {
      console.error('❌ Failed to rename file:', error);
      throw error;
    }
  }

  /**
   * Create folder
   */
  async createFolder(
    parentFolderId: string,
    folderName: string
  ): Promise<DriveFolder> {
    try {
      const response = await this.fetchAPI(
        `${DRIVE_API_BASE}/files?fields=id,name,webViewLink,createdTime,parents`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            name: folderName,
            mimeType: 'application/vnd.google-apps.folder',
            parents: [parentFolderId],
          }),
        }
      );

      const folder = await response.json();
      console.log('✅ Created folder:', folder.name);
      return folder;
    } catch (error) {
      console.error('❌ Failed to create folder:', error);
      throw error;
    }
  }

  /**
   * Check if a file/folder is trashed or inaccessible.
   * Returns true if the file is in trash or cannot be found.
   */
  async isFileTrashed(fileId: string): Promise<boolean> {
    try {
      const response = await this.fetchAPI(
        `${DRIVE_API_BASE}/files/${fileId}?fields=trashed`
      );
      const data = await response.json();
      return data.trashed === true;
    } catch (err) {
      if (err instanceof AuthExpiredError) throw err; // propagate — don't treat as "file gone"
      // Any other error (404, 403, network) — treat as gone
      return true;
    }
  }

  /**
   * Get file by ID
   */
  async getFile(fileId: string): Promise<DriveFile> {
    try {
      const fields =
        'id,name,mimeType,webViewLink,webContentLink,thumbnailLink,createdTime,modifiedTime,parents';

      const response = await this.fetchAPI(
        `${DRIVE_API_BASE}/files/${fileId}?fields=${fields}`
      );

      return await response.json();
    } catch (error) {
      console.error('❌ Failed to get file:', error);
      throw error;
    }
  }

  /**
   * Delete file
   */
  async deleteFile(fileId: string): Promise<void> {
    try {
      await this.fetchAPI(`${DRIVE_API_BASE}/files/${fileId}`, {
        method: 'DELETE',
      });

      console.log('✅ Deleted file:', fileId);
    } catch (error) {
      console.error('❌ Failed to delete file:', error);
      throw error;
    }
  }

  /**
   * Get download URL for file
   */
  async getDownloadUrl(fileId: string): Promise<string> {
    const token = await this.getAccessToken();
    return `${DRIVE_API_BASE}/files/${fileId}?alt=media&access_token=${token}`;
  }
}

// Export singleton instance
export const localDriveService = new LocalDriveService();
