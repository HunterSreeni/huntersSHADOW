import { z } from 'zod';

// Define the structure of a Tool
export interface Tool<TInput = any, TOutput = any> {
  name: string;
  description: string;
  schema: z.ZodSchema<TInput>; // Input validation schema
  execute(input: TInput): Promise<TOutput>;
}

export class ToolRegistry {
  private tools: Map<string, Tool> = new Map();

  register(tool: Tool) {
    if (this.tools.has(tool.name)) {
      console.warn(`Tool '${tool.name}' is already registered. Overwriting.`);
    }
    this.tools.set(tool.name, tool);
  }

  getTool(name: string): Tool | undefined {
    return this.tools.get(name);
  }

  listTools(): Tool[] {
    return Array.from(this.tools.values());
  }

  async executeTool(name: string, input: any): Promise<any> {
    const tool = this.tools.get(name);
    if (!tool) {
      throw new Error(`Tool '${name}' not found.`);
    }

    // Validate input
    const parsedInput = tool.schema.parse(input);
    
    // Execute
    return await tool.execute(parsedInput);
  }
}
