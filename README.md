# tdx-kb-manager

An Electron application with React and TypeScript. 

This project primarily interacts with the TeamDynamix KnowledgeBase API and is designed to implement more enhanced workflows that the official client provides.

## Current Status

Currently the project is hard coded to only work with the St. Edward's specific TDX API, but I plan to make it configurable in the future.

## (Planned) Features

- Search and View KnowledgeBase Articles Metadata
- Perform mass actions on selected Articles (For example: change the category for a group of articles.)
- Add/Remove Tags to Articles
- Edit Article Summaries
- Edit Article Names

## Project Setup

Follows the recommended setup from `electron-vite`, the setup script was used for this project.

Uses `sqlite3` to cache article information to avoid excessive API calls. TDX has a 60 calls per minute limit.

Primarily interacts with the TDX API.

### Install

```bash
$ npm install
```

### Development

```bash
$ npm run dev
```

### Build

```bash
# For windows
$ npm run build:win

# For macOS
$ npm run build:mac

# For Linux
$ npm run build:linux
```
