# Hunter's SHADOW - Project Plan

## Phase 1: Core Architecture (✅ Completed)
- [x] **Project Scaffolding:** TypeScript/Node.js CLI setup.
- [x] **Docker Environment:** Ubuntu-based container with `nmap`, `gobuster`, `nuclei`, `subfinder`, `ffuf`.
- [x] **AI Integration:** Google Gemini 2.5 Flash implementation for high-speed reasoning.
- [x] **Tool Registry:** Type-safe (Zod) system for defining and executing shell tools.
- [x] **Reporting:** Automatic generation of Markdown reports with execution timelines.
- [x] **Launcher:** `run-shadow.sh` script for seamless Docker execution and volume mounting.

## Phase 2: Enhanced Capabilities (Current Focus)
- [ ] **Wordlist Optimization:** Integrate `SecLists` properly (currently using `rockyou.txt` manually).
- [ ] **Tool Expansion:**
    - [ ] `sqlmap` for database testing.
    - [ ] `nikto` for web server scanning.
    - [ ] `hydra` for brute-forcing (careful usage).
- [ ] **Prompt Engineering:**
    - [ ] Refine `STRATEGY_PLANNER` for different target types (API vs. Web App vs. Network).
    - [ ] Add specific prompt templates for "Vulnerability Verification" (Proof of Concept).

## Phase 3: Advanced Features (Future)
- [ ] **MCP (Model Context Protocol):**
    - [ ] Implement an MCP Client to connect to external servers (e.g., local vulnerability databases).
- [ ] **Interactive Mode:**
    - [ ] Allow the user to "interrupt" the agent and give new instructions mid-scan.
- [ ] **Persistence:**
    - [ ] Save scan state to a local SQLite database to resume interrupted sessions.
- [ ] **Multi-Agent System:**
    - [ ] Separate agents for "Recon", "Exploitation", and "Reporting" working in parallel.

## Phase 4: CI/CD & Distribution
- [ ] **GitHub Actions:** Automate Docker builds and linting.
- [ ] **Release:** Publish Docker image to Docker Hub (private/public).
