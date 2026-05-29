# ICMReader

A web application for reading, parsing, and exploring **Innovyze / Autodesk InfoWorks ICM** model data. ICMReader provides a lightweight browser-based interface for inspecting ICM network and simulation files without requiring the full InfoWorks ICM desktop client.

> Repository for the Replit project: https://replit.com/@robertdickinson/ICMReader

## Overview

ICMReader is designed to help water infrastructure engineers and hydraulic modelers:

- Load and parse ICM-format model and simulation files
- Browse network objects (nodes, links, subcatchments, conduits)
- Inspect attributes, hydraulic parameters, and simulation results
- Share and review model contents through a simple web UI

## Tech Stack

- **Frontend:** TypeScript + React (Vite), Tailwind CSS
- **Backend:** Node.js / Express (TypeScript)
- **Database / ORM:** Drizzle ORM
- **Build & Dev:** Vite, PostCSS, Replit

## Project Structure

```
ICMReader/
  client/          # Frontend React/TypeScript application
  server/          # Backend API and ICM file processing
  shared/          # Shared types and schemas used by client & server
  attached_assets/ # Sample ICM files and supporting assets
  drizzle.config.ts
  vite.config.ts
  tailwind.config.ts
  package.json
```

## Getting Started

### Prerequisites

- Node.js 18+ and npm

### Install & Run

```bash
# Clone the repo
git clone https://github.com/SWMMEnablement/ICMReader.git
cd ICMReader

# Install dependencies
npm install

# Start the development server
npm run dev
```

Then open the local URL shown in your terminal (typically http://localhost:5173).

### Running on Replit

This project is configured for Replit via `.replit`. You can fork the Replit workspace directly:
https://replit.com/@robertdickinson/ICMReader

## Usage

1. Launch the app (locally or on Replit).
2. Upload or select an ICM model/simulation file.
3. Browse the parsed network in the UI to inspect objects and attributes.

Sample files are available under `attached_assets/`.

## Related Projects

- [InfoWorksQuizzer](https://github.com/SWMMEnablement/InfoWorksQuizzer) – Interactive quizzes for learning ICM InfoWorks.

## License

No license has been specified yet. All rights reserved by the author until a license is added.

## Author

Maintained by [@robertdickinson](https://github.com/robertdickinson) under the **SWMMEnablement** organization.
