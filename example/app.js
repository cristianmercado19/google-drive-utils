import { CLIENT_ID, FOLDER_ID } from './config.js';
import drive from '../src/drive.js';


// Initialize Google Drive Utils
drive.init(CLIENT_ID);

document.getElementById("authButton").addEventListener("click", async () => {
    try {
        await drive.authenticate();
        log("Authentication successful!");
    } catch (error) {
        log("Authentication failed: " + error);
    }
});

document.getElementById("createFile").addEventListener("click", async () => {
    try {
        await drive.createJsonFile(FOLDER_ID, "example.json", { message: "Hello, world!" });
        log("JSON file created successfully!");
    } catch (error) {
        log("Error creating JSON file: " + error);
    }
});

document.getElementById("readFile").addEventListener("click", async () => {
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