class GoogleDrive {
    constructor() {
        this.clientId = null;
        this.tokenClient = null;
        this.accessToken = null;
		this.gisLoaded = false; // Flag to check if Google API is loaded
    }

    /**
     * Initialize the Drive API with Client ID
     */
    async init(clientId) {
        this.clientId = clientId;

        // Wait for Google API to load
        await this.loadGoogleAPI();

        this.tokenClient = google.accounts.oauth2.initTokenClient({
            client_id: this.clientId,
            scope: 'https://www.googleapis.com/auth/drive.file',
            callback: (tokenResponse) => {
                this.accessToken = tokenResponse.access_token;
                console.log("Google Accounts Authenticated successfully!");
            }
        });
    }

    /**
     * Load Google API dynamically and wait for it
     */
    loadGoogleAPI() {
        return new Promise((resolve) => {
            if (this.gisLoaded) {
                return resolve();
            }

            const checkGoogleAPI = () => {
                if (window.google && google.accounts && google.accounts.oauth2) {
                    this.gisLoaded = true;
                    resolve();
                } else {
                    setTimeout(checkGoogleAPI, 5000);
                }
            };

            checkGoogleAPI();
        });
    }

    /**
     * Authenticate User and Get Access Token
     */
    authenticate() {
        return new Promise((resolve, reject) => {

            if (!this.tokenClient) {
                return reject("Drive API not initialized. Call drive.init(CLIENT_ID) first.");
            }

            this.tokenClient.requestAccessToken();
            
            resolve();
        });
    }

    /**
     * Create a JSON file in a specified folder
     */
    async createJsonFile(folderId, fileName, obj) {
        return this.createFile(folderId, fileName, JSON.stringify(obj), "application/json");
    }

    /**
     * Create a plain text file in a specified folder
     */
    async createFile(folderId, fileName, content, mimeType = "text/plain") {
        const metadata = {
            name: fileName,
            parents: [folderId],
            mimeType: mimeType
        };

        const form = new FormData();
        form.append('metadata', new Blob([JSON.stringify(metadata)], { type: 'application/json' }));
        form.append('file', new Blob([content], { type: mimeType }));

        const response = await fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${this.accessToken}`
            },
            body: form
        });

        return await response.json();
    }


    async readMimeType(fileId) {
        if (!this.accessToken) {
            throw new Error("User is not authenticated. Call authenticate() first.");
        }
    
        // Step 1: Get File Metadata to Check its MIME Type
        const metadataResponse = await fetch(`https://www.googleapis.com/drive/v3/files/${fileId}?fields=mimeType`, {
            headers: { 'Authorization': `Bearer ${this.accessToken}` }
        });
    
        const metadata = await metadataResponse.json();
        if (!metadata.mimeType) {
            throw new Error("Failed to get file metadata.");
        }
    
        const mimeType = metadata.mimeType;

        return mimeType;
    }

    /**
     * Read a file
     */
    async readFileById(fileId) {
    
        const mimeType = await this.readMimeType(fileId);
    
        if (this.isGoogleDocsType(mimeType)) {
            return await this.exportGoogleFile(fileId, googleDocsTypes[mimeType]);
        }else {
            return await this.readBinaryTextFile(fileId);
        }
    }

    isGoogleDocsType(mimeType) {
        const googleDocsTypes = {
            "application/vnd.google-apps.document": "text/plain",  // Google Docs -> TXT
            "application/vnd.google-apps.spreadsheet": "text/csv", // Google Sheets -> CSV
            "application/vnd.google-apps.presentation": "application/pdf" // Google Slides -> PDF
        };

        return googleDocsTypes[mimeType];
    }

    async readBinaryTextFile(fileId) {
        const response = await fetch(`https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`, {
            headers: { 'Authorization': `Bearer ${this.accessToken}` }
        });
    
        if (!response.ok) {
            throw new Error(`Failed to read file: ${response.statusText}`);
        }
    
        return await response.text(); // Read content as a string
    }

    async exportGoogleFile(fileId, exportMimeType) {
        const exportUrl = `https://www.googleapis.com/drive/v3/files/${fileId}/export?mimeType=${encodeURIComponent(exportMimeType)}`;
        
        const response = await fetch(exportUrl, {
            headers: { 'Authorization': `Bearer ${this.accessToken}` }
        });
    
        if (!response.ok) {
            throw new Error(`Failed to export file: ${response.statusText}`);
        }
    
        return await response.text(); // Convert export response to string
    }

    /**
     * Read file, will return an object
     */
    async readFile(folderId, fileName) {
        const fileId = await this.getFileId(folderId, fileName);
        const fileContent = await this.readFileById(fileId);

        return fileContent;
    }

    /**
     * Read Json file, will return an object
     */
    async readJsonFile(folderId, fileName) {
        const fileContent = await this.readFile(folderId, fileName);
        const jsonObject = JSON.parse(fileContent);
        return jsonObject;
    }

    /**
     * Move a file to a different folder
     */
    async moveFile(fromFolderId, fileName, toFolderId) {  
        // Get the file ID
        const fileId = await this.getFileId(fromFolderId, fileName);

        if (!fileId) {
            throw new Error(`File "${fileName}" not found in folder ${fromFolderId}`);
        }
    
        // Get the current file metadata to check its parents
        const fileMetadataResponse = await fetch(`https://www.googleapis.com/drive/v3/files/${fileId}?fields=parents`, {
            headers: {
                'Authorization': `Bearer ${this.accessToken}`
            }
        });
    
        const fileMetadata = await fileMetadataResponse.json();
        const oldParents = fileMetadata.parents ? fileMetadata.parents.join(',') : '';
    
        // Move the file by adding new parent and removing the old one
        const moveResponse = await fetch(`https://www.googleapis.com/drive/v3/files/${fileId}?addParents=${toFolderId}&removeParents=${oldParents}&fields=id, parents`, {
            method: 'PATCH',
            headers: {
                'Authorization': `Bearer ${this.accessToken}`,
                'Content-Type': 'application/json'
            }
        });
    
        if (!moveResponse.ok) {
            throw new Error(`Failed to move file: ${moveResponse.statusText}`);
        }
    }

    /**
     * Read all files in a folder
     */
    async readFolder(folderId) {
        const response = await fetch(`https://www.googleapis.com/drive/v3/files?q='${folderId}'+in+parents`, {
            headers: { 'Authorization': `Bearer ${this.accessToken}` }
        });

        const data = await response.json();
        return data.files;
    }

    /**
     * Helper to get File ID by Name in a Folder
     */
    async getFileId(folderId, fileName) {
        const query =  `name='${fileName}' and '${folderId}' in parents`; 

        const response = await fetch(`https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent(query)}`, {
            headers: { 'Authorization': `Bearer ${this.accessToken}` }
        });

        const data = await response.json();

        if (data.files.length === 0) 
            throw new Error("File not found");

        return data.files[0].id;
    }

    /**
     * Delete a file by File ID
     */
    async deleteFileId(fileId) {

        const response = await fetch(`https://www.googleapis.com/drive/v3/files/${fileId}`, 
            {
                method: "DELETE",
                headers: {
                    Authorization: `Bearer ${this.accessToken}`
                }
            }
        );

        if (!response.ok) {
            throw new Error(`Failed to delete file: ${response.statusText}`);
        }
    }

    async deleteFile(folderId, fileName) {

        const searchResponse = await fetch(`https://www.googleapis.com/drive/v3/files?q='${folderId}'+in+parents+and+name='${fileName}'&fields=files(id)`,
            {
                headers: {
                    Authorization: `Bearer ${this.accessToken}`
                }
            }
        );
    
        const searchData = await searchResponse.json();

        if (!searchData.files || searchData.files.length === 0) {
            throw new Error("File not found.");
        }

        if(searchData.files.length > 1) {
            throw new Error(`Multiple files (${searchData.files.length}) has been found, use deleteFileId function instead.`);
        }
    
        // Delete the file
        const fileId = searchData.files[0].id;

        return this.deleteFileId(fileId);
    }
}

// Export instance
const drive = new GoogleDrive();
export default drive;