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

    /**
     * Read a file
     */
    async readFile(fileId) {
        const response = await fetch(`https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`, {
            headers: { 'Authorization': `Bearer ${this.accessToken}` }
        });

        return await response.text();
    }

    /**
     * Move a file to a different folder
     */
    async moveFile(fromFolderId, fileName, toFolderId) {
        const fileId = await this.getFileId(fromFolderId, fileName);
        await fetch(`https://www.googleapis.com/drive/v3/files/${fileId}`, {
            method: 'PATCH',
            headers: {
                'Authorization': `Bearer ${this.accessToken}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ parents: [toFolderId] })
        });
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