#!/usr/bin/env node
import { Command } from 'commander';
import chalk from 'chalk';
import packageJson from '../package.json' with { type: 'json' };
import { GeminiAgent } from './ai/gemini.js';
import { ToolRegistry } from './tools/registry.js';
import { NmapScanTool, GobusterDirTool, SubfinderTool, NucleiTool, FfufTool } from './tools/definitions.js';
import ora from 'ora';
import { SessionLogger } from './reporting/logger.js';
import { ReportGenerator } from './reporting/reporter.js';
import { STRATEGY_PLANNER, TACTICAL_EXECUTION } from './prompts/templates.js';

const { version } = packageJson;
const program = new Command();

program
  .name('shadow')
  .description("Hunter's SHADOW: System for Heuristic Analysis, Discovery, and Offensive Work")
  .version(version);

program
  .command('recon <target>')
  .description('Perform reconnaissance on a target URL/IP')
  .action(async (target) => {
    console.log(chalk.blue(`[*] Initiating recon on: ${target}`));
    
    const logger = new SessionLogger(target);
    const registry = new ToolRegistry();
    // Register all tools
    registry.register(NmapScanTool);
    registry.register(GobusterDirTool);
    registry.register(SubfinderTool);
    registry.register(NucleiTool);
    registry.register(FfufTool);

    try {
      const agent = new GeminiAgent(registry.listTools());
      const session = await agent.startChat();

      const spinner = ora('Hunter\'s SHADOW is devising a strategy...').start();

      // --- PHASE 1: STRATEGY ---
      const strategyPrompt = STRATEGY_PLANNER.replace('{{target}}', target);
      logger.log('AI_REQUEST', strategyPrompt);
      
      const strategyResult = await session.sendMessage(strategyPrompt);
      const strategyText = strategyResult.response.text();
      
      logger.log('AI_RESPONSE', strategyText);
      spinner.succeed('Strategy Devised');
      console.log(chalk.yellow('\n[Strategic Plan]:'));
      console.log(strategyText);

      // --- PHASE 2: EXECUTION ---
      spinner.start('Hunter\'s SHADOW is executing the plan...');
      
      const tacticalPrompt = TACTICAL_EXECUTION
        .replace('{{target}}', target)
        .replace('{{context}}', strategyText);

      logger.log('AI_REQUEST', tacticalPrompt);
      let result = await session.sendMessage(tacticalPrompt);
      let response = result.response;
      let text = response.text();

      // Execution Loop
      while (true) {
        const functionCalls = response.functionCalls();
        
        if (functionCalls && functionCalls.length > 0) {
          spinner.color = 'red';
          spinner.text = `Executing ${functionCalls.length} tools...`;
          
          const functionResponses = [];

          for (const call of functionCalls) {
            console.log(chalk.dim(`\n[Agent Request] Calling tool: ${call.name}`));
            logger.log('TOOL_CALL', { name: call.name, args: call.args });
            
            try {
              const executionResult = await registry.executeTool(call.name, call.args);
              const output = executionResult.stdout || executionResult.error || "No output";
              
              // Truncate extremely long outputs for the console, but log full
              const consoleOutput = output.length > 500 ? output.substring(0, 500) + '... (truncated)' : output;
              // console.log(chalk.gray(`Output: ${consoleOutput}`));

              logger.log('TOOL_OUTPUT', { name: call.name, output, error: executionResult.stderr });

              functionResponses.push({
                functionResponse: {
                  name: call.name,
                  response: { output, error: executionResult.stderr }
                }
              });
            } catch (err: any) {
               console.error(chalk.red(`Tool execution failed: ${err.message}`));
               functionResponses.push({
                functionResponse: {
                  name: call.name,
                  response: { error: err.message }
                }
              });
            }
          }

          spinner.text = 'Analyzing tool output...';
          result = await session.sendMessage(functionResponses);
          response = result.response;
          text = response.text();
          
        } else {
          spinner.stop();
          logger.log('AI_RESPONSE', text);
          console.log(chalk.green('\n[Mission Accomplished]:'));
          console.log(text);
          break;
        }
      }

      // Generate Report
      const reportMd = ReportGenerator.generateMarkdown(target, logger.getLogs());
      const reportFile = ReportGenerator.saveReport(target, reportMd);
      console.log(chalk.cyan(`\n[✔] Report generated: reports/${reportFile}`));

    } catch (error: any) {
      console.error(chalk.red("\n[Fatal Error]:"), error.message);
      process.exit(1);
    }
  });

program
  .command('analyze <target>')
  .description('Analyze collected data for vulnerabilities')
  .action(async (target) => {
      console.log(chalk.green(`[*] Analyzing target: ${target}`));
  });

program.parse(process.argv);