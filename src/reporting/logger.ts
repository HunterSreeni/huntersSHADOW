import fs from 'fs';
import path from 'path';

export interface LogEntry {
  timestamp: string;
  type: 'AI_REQUEST' | 'AI_RESPONSE' | 'TOOL_CALL' | 'TOOL_OUTPUT' | 'SYSTEM';
  content: any;
}

export class SessionLogger {
  private logs: LogEntry[] = [];
  private logFile: string;

  constructor(target: string) {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const logDir = path.join(process.cwd(), 'logs');
    if (!fs.existsSync(logDir)) {
      fs.mkdirSync(logDir);
    }
    this.logFile = path.join(logDir, `session-${target}-${timestamp}.json`);
  }

  log(type: LogEntry['type'], content: any) {
    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      type,
      content
    };
    this.logs.push(entry);
    this.persist();
  }

  private persist() {
    fs.writeFileSync(this.logFile, JSON.stringify(this.logs, null, 2));
  }

  getLogs(): LogEntry[] {
    return this.logs;
  }
}
