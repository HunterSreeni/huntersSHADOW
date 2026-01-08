import fs from 'fs';
import path from 'path';
import { LogEntry } from './logger.js';

export class ReportGenerator {
  static generateMarkdown(target: string, logs: LogEntry[]): string {
    let report = `# Hunter's SHADOW Security Assessment Report\n\n`;
    report += `**Target:** ${target}\n`;
    report += `**Date:** ${new Date().toLocaleString()}\n\n`;
    
    report += `## Executive Summary\n`;
    report += `This report details the automated security analysis performed by Hunter's SHADOW.\n\n`;

    report += `## Timeline of Activities\n\n`;
    
    logs.forEach(entry => {
      const time = new Date(entry.timestamp).toLocaleTimeString();
      switch (entry.type) {
        case 'AI_REQUEST':
          report += `### [${time}] AI Reasoning\n> ${entry.content}\n\n`;
          break;
        case 'AI_RESPONSE':
          if (typeof entry.content === 'string') {
            report += `#### Response\n${entry.content}\n\n`;
          }
          break;
        case 'TOOL_CALL':
          report += `**Action:** Executed tool ecue${entry.content.name}ecue with args ecue${JSON.stringify(entry.content.args)}ecue\n\n`;
          break;
        case 'TOOL_OUTPUT':
          report += `**Result:**\necue
${entry.content.output || 'No output'}\necue
\n`;
          break;
      }
    });

    report += `## Proof of Concept (POC)\n`;
    report += `*Based on the findings above, the following steps can be used to reproduce the identified state:*\n\n`;
    
    // Simplistic POC generation: just list the successful tool calls
    logs.filter(l => l.type === 'TOOL_CALL').forEach((l, i) => {
        report += `${i+1}. Run ecue${l.content.name}ecue on the target.\n`;
    });

    return report;
  }

  static saveReport(target: string, markdown: string) {
    const reportDir = path.join(process.cwd(), 'reports');
    if (!fs.existsSync(reportDir)) {
      fs.mkdirSync(reportDir);
    }
    const filename = `report-${target}-${Date.now()}.md`;
    fs.writeFileSync(path.join(reportDir, filename), markdown);
    return filename;
  }
}
