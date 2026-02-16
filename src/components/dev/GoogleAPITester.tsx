/**
 * Google API Tester Component
 * Tests Drive and Sheets API access with proper scopes
 */

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { localDriveService } from '@/services/google/local-drive-service';
import { localSheetsService } from '@/services/google/local-sheets-service';
import { initializationService } from '@/services/initialization-service';
import { CheckCircle, XCircle, Loader2, FolderOpen, Sheet } from 'lucide-react';

export default function GoogleAPITester() {
  const [folderUrl, setFolderUrl] = useState(
    'https://drive.google.com/drive/folders/1pFXzEUmDstdwuiTtnr6Rx7zTxcsT_PPL'
  );
  const [testing, setTesting] = useState(false);
  const [results, setResults] = useState<{
    folderAccess?: 'success' | 'error';
    folderDetails?: any;
    spreadsheetAccess?: 'success' | 'error';
    spreadsheetDetails?: any;
    initStatus?: any;
    error?: string;
  }>({});

  const runTest = async () => {
    try {
      setTesting(true);
      setResults({});

      console.log('🧪 Starting Google API test...');

      // Step 1: Extract folder ID
      const folderId = localDriveService.extractFolderIdFromShareLink(folderUrl);
      console.log('📁 Folder ID extracted:', folderId);

      // Step 2: Test Drive API access (list files in folder)
      console.log('📂 Testing Drive API access...');
      try {
        const files = await localDriveService.listFiles(folderId);
        const folders = await localDriveService.listFolders(folderId);

        setResults((prev) => ({
          ...prev,
          folderAccess: 'success',
          folderDetails: {
            folderId,
            filesCount: files.length,
            foldersCount: folders.length,
            files: files.map((f) => ({ name: f.name, id: f.id })),
            folders: folders.map((f) => ({ name: f.name, id: f.id })),
          },
        }));
        console.log('✅ Drive API test passed:', { filesCount: files.length, foldersCount: folders.length });
      } catch (error) {
        console.error('❌ Drive API test failed:', error);
        setResults((prev) => ({
          ...prev,
          folderAccess: 'error',
          error: error instanceof Error ? error.message : 'Failed to access Drive folder',
        }));
        return;
      }

      // Step 3: Test Sheets API access (initialize spreadsheet)
      console.log('📊 Testing Sheets API access...');
      try {
        const spreadsheetId = await localSheetsService.initializeSpreadsheet(folderId);
        console.log('✅ Sheets API test passed:', spreadsheetId);

        setResults((prev) => ({
          ...prev,
          spreadsheetAccess: 'success',
          spreadsheetDetails: {
            spreadsheetId,
            url: `https://docs.google.com/spreadsheets/d/${spreadsheetId}`,
          },
        }));
      } catch (error) {
        console.error('❌ Sheets API test failed:', error);
        setResults((prev) => ({
          ...prev,
          spreadsheetAccess: 'error',
          error: error instanceof Error ? error.message : 'Failed to access Sheets API',
        }));
        return;
      }

      // Step 4: Run full initialization
      console.log('🚀 Testing full initialization...');
      try {
        const initStatus = await initializationService.initialize(folderId);
        console.log('✅ Initialization test passed:', initStatus);

        setResults((prev) => ({
          ...prev,
          initStatus,
        }));
      } catch (error) {
        console.error('❌ Initialization test failed:', error);
        setResults((prev) => ({
          ...prev,
          error: error instanceof Error ? error.message : 'Initialization failed',
        }));
      }

      console.log('🎉 All tests completed!');
    } catch (error) {
      console.error('❌ Test suite failed:', error);
      setResults({
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    } finally {
      setTesting(false);
    }
  };

  return (
    <Card className="p-6">
      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-semibold mb-2">Google API Test</h3>
          <p className="text-sm text-gray-600">
            Test Drive and Sheets API access with your Google Drive folder
          </p>
        </div>

        <div>
          <Label htmlFor="folder-url">Google Drive Folder URL</Label>
          <div className="flex gap-2 mt-2">
            <Input
              id="folder-url"
              value={folderUrl}
              onChange={(e) => setFolderUrl(e.target.value)}
              placeholder="https://drive.google.com/drive/folders/..."
              className="flex-1"
            />
            <Button onClick={runTest} disabled={testing || !folderUrl}>
              {testing ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Testing...
                </>
              ) : (
                'Run Test'
              )}
            </Button>
          </div>
        </div>

        {/* Results */}
        {Object.keys(results).length > 0 && (
          <div className="space-y-4 border-t pt-4">
            <h4 className="font-semibold">Test Results:</h4>

            {/* Drive Access */}
            {results.folderAccess && (
              <div className="flex items-start gap-2">
                {results.folderAccess === 'success' ? (
                  <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                ) : (
                  <XCircle className="h-5 w-5 text-red-600 mt-0.5" />
                )}
                <div className="flex-1">
                  <p className="font-medium flex items-center gap-2">
                    <FolderOpen className="h-4 w-4" />
                    Drive API Access
                  </p>
                  {results.folderDetails && (
                    <div className="text-sm text-gray-600 mt-1 space-y-1">
                      <p>Folder ID: {results.folderDetails.folderId}</p>
                      <p>Files found: {results.folderDetails.filesCount}</p>
                      <p>Subfolders found: {results.folderDetails.foldersCount}</p>
                      {results.folderDetails.files.length > 0 && (
                        <details className="mt-2">
                          <summary className="cursor-pointer font-medium">Files</summary>
                          <ul className="mt-1 ml-4 list-disc">
                            {results.folderDetails.files.map((f: any) => (
                              <li key={f.id}>{f.name}</li>
                            ))}
                          </ul>
                        </details>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Sheets Access */}
            {results.spreadsheetAccess && (
              <div className="flex items-start gap-2">
                {results.spreadsheetAccess === 'success' ? (
                  <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                ) : (
                  <XCircle className="h-5 w-5 text-red-600 mt-0.5" />
                )}
                <div className="flex-1">
                  <p className="font-medium flex items-center gap-2">
                    <Sheet className="h-4 w-4" />
                    Sheets API Access
                  </p>
                  {results.spreadsheetDetails && (
                    <div className="text-sm text-gray-600 mt-1">
                      <p>Spreadsheet created: {results.spreadsheetDetails.spreadsheetId}</p>
                      <a
                        href={results.spreadsheetDetails.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline"
                      >
                        Open in Google Sheets →
                      </a>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Initialization Status */}
            {results.initStatus && (
              <div className="flex items-start gap-2">
                <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                <div className="flex-1">
                  <p className="font-medium">Full Initialization</p>
                  <div className="text-sm text-gray-600 mt-1">
                    <p>✅ Workspace initialized successfully!</p>
                    <p>Folder ID: {results.initStatus.folderId}</p>
                    <p>Spreadsheet ID: {results.initStatus.spreadsheetId}</p>
                    <p>Organized Folder ID: {results.initStatus.organizedFolderId}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Errors */}
            {results.error && (
              <div className="flex items-start gap-2">
                <XCircle className="h-5 w-5 text-red-600 mt-0.5" />
                <div className="flex-1">
                  <p className="font-medium text-red-600">Error</p>
                  <p className="text-sm text-red-600 mt-1">{results.error}</p>
                  <details className="mt-2 text-xs">
                    <summary className="cursor-pointer font-medium">
                      Troubleshooting
                    </summary>
                    <ul className="mt-2 ml-4 list-disc space-y-1 text-gray-600">
                      <li>Make sure you've signed in with Google and granted all permissions</li>
                      <li>Check that the Drive folder URL is correct</li>
                      <li>Verify that you have edit access to the folder</li>
                      <li>Check browser console for detailed error messages</li>
                    </ul>
                  </details>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </Card>
  );
}
