# MKT - Google Drive Helper 📂

Google Drive Helper is a lightweight, dependency-free utility for interacting with the **Google Drive API**, making it easy to authenticate users, create and read files (JSON and plain text), and manage folder contents.

## 🚀 Features

- ✅ **Simple authentication** using Google Identity Services.
- ✅ **Create, read, and move files** in Google Drive.
- ✅ **Supports JSON and plain text** file operations.
- ✅ **List files in a folder**.
- ✅ **No dependencies** – pure JavaScript.


## 📦 Installation

To install via npm, run:

```bash
npm install google-drive-helper
```


## 🎯 Quick Start

1️⃣ Import the module and initialize it

```js
import drive from "google-drive-helper";

// Initialize Google Drive Helper with your CLIENT_ID
drive.init("YOUR_GOOGLE_CLIENT_ID");
```

2️⃣ Authenticate the user

Call `authenticate()` when the user clicks a button.

```js
await drive.authenticate();
console.log("User authenticated successfully!");
```

# 📁 File Operations

📌 Create a JSON File

Save a JavaScript object as a JSON file inside a Google Drive folder.

```js
await drive.createJsonFile("FOLDER_ID", "settings.json", { theme: "dark", lang: "en" });
```


## 📌 Read a JSON File

Read a JSON file and parse its content.

```js
const settings = await drive.readJsonFile("FOLDER_ID", "settings.json");
console.log(settings); // Output: { theme: "dark", lang: "en" }

You can also read a file by file ID:

const settings = await drive.readJsonFile("FILE_ID");
```

## 📌 Create a Plain Text File

Save plain text content inside a Google Drive folder.

```js
await drive.createFile("FOLDER_ID", "notes.txt", "Hello, Google Drive!");
```

## 📌 Read a Plain Text File

Retrieve text content from a file.

```js
const content = await drive.readFile("FOLDER_ID", "notes.txt");
console.log(content); // Output: "Hello, Google Drive!"
```

Alternatively, read by file ID:

```js
const content = await drive.readFile("FILE_ID");
```

## 📌 Move a File Between Folders

Move a file from one folder to another.

```js
await drive.moveFile("SOURCE_FOLDER_ID", "notes.txt", "DESTINATION_FOLDER_ID");
```

## 📌 List All Files in a Folder

Retrieve a list of files inside a folder.

```js
const files = await drive.readFolder("FOLDER_ID");
console.log(files);
```

Each file in the array contains:
```json
[
  { "id": "FILE_ID", "name": "example.json" },
  { "id": "FILE_ID", "name": "notes.txt" }
]
```


## 🔧 Example HTML Page

You can also create an HTML page to test the library.

📝 index.html

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Google Drive Helper Example</title>
    <script src="https://accounts.google.com/gsi/client" async defer></script>
</head>
<body>

    <h1>Google Drive Helper Example</h1>
    <button id="authButton">Authenticate</button>
    <button id="createFile">Create JSON File</button>
    <button id="readFile">Read JSON File</button>
    <button id="listFiles">List Folder Files</button>
    <pre id="output"></pre>

    <script type="module" src="app.js"></script>
</body>
</html>
```

📝 app.js

```js
import { CLIENT_ID, FOLDER_ID } from "./config.js";
import drive from "../src/drive.js"; 

// Initialize
drive.init(CLIENT_ID);

document.getElementById("authButton").addEventListener("click", async () => {
    await drive.authenticate();
    log("Authentication successful!");
});

document.getElementById("createFile").addEventListener("click", async () => {
    await drive.createJsonFile(FOLDER_ID, "example.json", { message: "Hello, world!" });
    log("JSON file created!");
});

document.getElementById("readFile").addEventListener("click", async () => {
    const content = await drive.readJsonFile(FOLDER_ID, "example.json");
    log("Read JSON: " + JSON.stringify(content, null, 2));
});

document.getElementById("listFiles").addEventListener("click", async () => {
    const files = await drive.readFolder(FOLDER_ID);
    log("Files in folder: " + JSON.stringify(files, null, 2));
});

function log(message) {
    document.getElementById("output").textContent = message;
}
```


📝 config.js

```js
export const CLIENT_ID = "YOUR_GOOGLE_CLIENT_ID";
export const FOLDER_ID = "YOUR_FOLDER_ID";
```

## 🔐 Authentication Setup

1️⃣ Go to Google Cloud Console
2️⃣ Create a new project
3️⃣ Enable Google Drive API
4️⃣ Create OAuth 2.0 Credentials (Web Application)
5️⃣ Set "Authorized JavaScript Origins":

http://localhost:5500

6️⃣ Copy your CLIENT_ID and paste it into your code.


## 📜 License

This project is licensed under the MIT License.


## 🔗 Links

📦 npm package: https://www.npmjs.com/package/google-drive-helper
💻 GitHub Repo: https://github.com/cristianmercado19/google-drive-helper
📖 Google Drive API Docs: https://developers.google.com/drive


## 🚀 Contributing

Pull requests are welcome! If you’d like to improve the library, please open an issue first to discuss changes.
