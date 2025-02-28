import { CLIENT_ID, FOLDER_ID, DESTINATION_FOLDER_ID } from './config.js';
import drive from '../src/drive.js';


// Initialize Google Drive Utils
drive.init(CLIENT_ID);

let createdFileDetails; 

document.getElementById("authButton").addEventListener("click", async () => {
    try {
        await drive.authenticate();
        log("Authentication successful!");
    } catch (error) {
        log("Authentication failed: " + error);
    }
});

document.getElementById("deleteFile").addEventListener("click", async () => {
    try {
        await drive.deleteFile(FOLDER_ID, "example.json");
        log("File example.json deleted successfully!");
    } catch (error) {
        log("Error deleting JSON file: " + error);
    }
});

document.getElementById("deleteFileId").addEventListener("click", async () => {
    try {
        const fileIdToDelete = await drive.getFileId(FOLDER_ID, "example.json");
        
        await drive.deleteFileId(fileIdToDelete);
        
        log(`File (example.json) deleted (byId ${fileIdToDelete}) successfully!`);
    } catch (error) {
        log("Error deleting JSON file: " + error);
    }
});


document.getElementById("createPlainFile").addEventListener("click", async () => {
    try {
        await drive.createFile(FOLDER_ID, "notes.txt", "Hello, Google Drive!");
        log("Plain file created successfully!");
    } catch (error) {
        log("Error creating plain file: " + error);
    }
});

document.getElementById("readFile").addEventListener("click", async () => {
    try {
        const content = await drive.readFile(FOLDER_ID, "notes.txt");
        log(`File content:${content}`);
    } catch (error) {
        log("Error reading plain file: " + error);
    }
});


document.getElementById("movePlainFile").addEventListener("click", async () => {
    try {
        await drive.moveFile(FOLDER_ID, "notes.txt", DESTINATION_FOLDER_ID);
        log(`File notes.txt moved to another folder`);
    } catch (error) {
        log("Error reading plain file: " + error);
    }
});


document.getElementById("createJsonFile").addEventListener("click", async () => {
    try {
        createdFileDetails = await drive.createJsonFile(FOLDER_ID, "example.json", { message: "Hello, world!" });
        log("JSON file created successfully!");
    } catch (error) {
        log("Error creating JSON file: " + error);
    }
});

document.getElementById("readJsonFile").addEventListener("click", async () => {
    try {
        const content = await drive.readJsonFile(FOLDER_ID, "example.json");
        log("Read JSON file: " + JSON.stringify(content, null, 2));
    } catch (error) {
        log("Error reading JSON file: " + error);
    }
});

document.getElementById("listFiles").addEventListener("click", async () => {
    try {
        const files = await drive.readFolder(FOLDER_ID);
        log("Files in folder: " + JSON.stringify(files, null, 2));
    } catch (error) {
        log("Error listing files: " + error);
    }
});

function log(message) {
    document.getElementById("output").textContent = message;
}