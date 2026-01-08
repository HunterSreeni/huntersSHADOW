import { exec } from 'child_process';
import { promisify } from 'util';
import { Tool } from './registry.js';
import { z } from 'zod';
import chalk from 'chalk';

const execAsync = promisify(exec);

// Generic Shell Command Tool Factory
export const createShellTool = (
  name: string,
  description: string,
  commandTemplate: (args: any) => string,
  argSchema: z.ZodSchema<any>
): Tool => {
  return {
    name,
    description,
    schema: argSchema,
    execute: async (args: any) => {
      const command = commandTemplate(args);
      console.log(chalk.yellow(`\n[Tool Exec] Running: ${command}`));
      
      try {
        const { stdout, stderr } = await execAsync(command);
        if (stderr) {
            // Some tools write to stderr even on success (progress bars etc), so we append it but don't fail immediately
             // unless stdout is empty or we determine it's a fatal error. 
             // For now, we return both.
        }
        return { stdout: stdout.trim(), stderr: stderr.trim() };
      } catch (error: any) {
         console.error(chalk.red(`[Tool Error] Command failed: ${command}`));
         return { error: error.message, stderr: error.stderr };
      }
    },
  };
};

// --- PRE-DEFINED TOOLS ---

export const NmapScanTool = createShellTool(
    'nmap_scan',
    'Run an Nmap scan on a target host. Use specific flags if unsure (-F for fast).',
    (args) => `nmap ${args.flags || '-F'} ${args.target}`,
    z.object({
        target: z.string().describe('The target IP or hostname'),
        flags: z.string().optional().describe('Nmap flags (e.g., "-sV -p-", "-F" for fast)')
    })
);

export const GobusterDirTool = createShellTool(
    'gobuster_dir',
    'Run Gobuster to discover directories.',
    // Using standard rockyou or dirtbuster list if available
    (args) => `gobuster dir -u ${args.url} -w ${args.wordlist || '/usr/share/wordlists/rockyou.txt'} ${args.flags || '--no-error'}`,
    z.object({
        url: z.string().url().describe('The target URL'),
        wordlist: z.string().optional().describe('Path to the wordlist file'),
        flags: z.string().optional().describe('Additional Gobuster flags')
    })
);

export const SubfinderTool = createShellTool(
    'subfinder',
    'Run Subfinder to discover subdomains for a domain.',
    (args) => `subfinder -d ${args.domain} -silent`,
    z.object({
        domain: z.string().describe('The root domain to find subdomains for (e.g., example.com)')
    })
);

export const NucleiTool = createShellTool(
    'nuclei',
    'Run Nuclei vulnerability scanner on a target URL.',
    (args) => `nuclei -u ${args.url} -silent -nc`, 
    z.object({
        url: z.string().describe('The target URL to scan')
    })
);

export const FfufTool = createShellTool(
    'ffuf',
    'Run FFUF to fuzz parameters or directories.',
    (args) => `ffuf -u ${args.url}/FUZZ -w ${args.wordlist || '/usr/share/wordlists/rockyou.txt'} -mc 200,301,302`,
    z.object({
        url: z.string().describe('The base URL'),
        wordlist: z.string().optional().describe('Wordlist path')
    })
);
