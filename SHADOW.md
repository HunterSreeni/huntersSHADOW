# Hunter's SHADOW
**System for Heuristic Analysis, Discovery, and Offensive Work**

Hunter's SHADOW is an AI-powered CLI tool designed to automate the initial phases of penetration testing and bug bounty hunting. It leverages **Google's Gemini 2.5 Flash** model to reason about targets, devise strategies, and autonomously execute industry-standard security tools.

## 🚀 Features

- **AI-Driven Strategy:** Does not just run tools blindly. It analyzes the target and creates a custom "Battle Plan".
- **Tool Orchestration:** Autonomously executes:
    - `nmap` (Network Discovery)
    - `gobuster` (Directory/File Enumeration)
    - `nuclei` (Vulnerability Scanning)
    - `subfinder` (Subdomain Enumeration)
    - `ffuf` (Web Fuzzing)
- **Dockerized Environment:** Runs in a self-contained container with all dependencies pre-installed.
- **Auto-Reporting:** Generates detailed Markdown reports in the `reports/` directory, logging every tool output and AI decision.
- **Type-Safe:** Built with TypeScript and Zod for robust input validation.

## 🛠️ Tech Stack

- **Language:** TypeScript (Node.js)
- **AI Model:** Google Gemini 2.5 Flash
- **Containerization:** Docker (Ubuntu 22.04 base)
- **CLI Framework:** Commander.js
- **Tooling:** Go (Golang), Python 3

## 📂 Project Structure

```
huntersSHADOW/
├── src/
│   ├── ai/             # Gemini integration & agent logic
│   ├── tools/          # Tool definitions (Zod schemas) & registry
│   ├── reporting/      # Logger & Markdown generator
│   ├── prompts/        # Prompt templates (Strategy & Tactics)
│   └── index.ts        # Main CLI entry point
├── Dockerfile          # Environment setup (Tools + Runtime)
├── run-shadow.sh       # Convenience launcher script
└── reports/            # Output directory for scan reports
```

## ⚡ Quick Start

1. **Setup Environment:**
   Create a `.env` file in the root directory:
   ```bash
   GOOGLE_API_KEY=your_gemini_api_key
   ```

2. **Launch a Mission:**
   Use the helper script to build and run the container:
   ```bash
   ./run-shadow.sh recon scanme.nmap.org
   ```

3. **View Report:**
   Check the `reports/` folder for the generated Markdown file.

## 🛡️ Disclaimer
This tool is for **educational and authorized security testing purposes only**. Do not use it on targets you do not have explicit permission to test.
