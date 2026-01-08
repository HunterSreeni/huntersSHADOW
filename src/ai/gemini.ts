import { 
  GoogleGenerativeAI, 
  GenerativeModel, 
  FunctionDeclaration,
  SchemaType,
  ChatSession
} from "@google/generative-ai";
import { config } from "../config.js";
import chalk from "chalk";
import { Tool } from "../tools/registry.js";

export class GeminiAgent {
  private genAI: GoogleGenerativeAI;
  private model: GenerativeModel;

  constructor(tools: Tool[] = []) {
    if (!config.googleApiKey) {
      throw new Error("GOOGLE_API_KEY is not set in environment variables.");
    }
    this.genAI = new GoogleGenerativeAI(config.googleApiKey);
    
    const geminiTools = tools.length > 0 ? [{
      functionDeclarations: tools.map(this.mapToolToGeminiFormat)
    }] : undefined;

    this.model = this.genAI.getGenerativeModel({ 
      model: "gemini-2.5-flash",
      tools: geminiTools
    });
  }

  // Helper to map our generic Tool interface to Gemini's expected format
  // Note: This is a simplified mapper. Complex Zod schemas might need a robust library.
  private mapToolToGeminiFormat(tool: Tool): FunctionDeclaration {
    return {
      name: tool.name,
      description: tool.description,
      parameters: {
        type: SchemaType.OBJECT,
        properties: GeminiAgent.zodSchemaToGeminiProperties(tool.schema),
        required: GeminiAgent.getRequiredFields(tool.schema)
      }
    };
  }

  // Basic Zod -> Gemini Schema Type mapper
  private static zodSchemaToGeminiProperties(zodSchema: any): any {
    const properties: any = {};
    
    // Safely get the shape if it's a ZodObject
    let shape = {};
    if (zodSchema._def && zodSchema._def.shape) {
      shape = typeof zodSchema._def.shape === 'function' ? zodSchema._def.shape() : zodSchema._def.shape;
    }

    for (const key in shape) {
      const field = (shape as any)[key];
      // Simplistic type mapping - expand as needed
      let type = SchemaType.STRING; // Default
      
      properties[key] = {
        type: type,
        description: field.description || `Parameter ${key}`
      };
    }
    return properties;
  }

  private static getRequiredFields(zodSchema: any): string[] {
    let shape = {};
    if (zodSchema._def && zodSchema._def.shape) {
      shape = typeof zodSchema._def.shape === 'function' ? zodSchema._def.shape() : zodSchema._def.shape;
    }

    const required: string[] = [];
    for (const key in shape) {
      const field = (shape as any)[key];
      if (!field.isOptional()) {
        required.push(key);
      }
    }
    return required;
  }

  async startChat(history: any[] = []): Promise<ChatSession> {
    return this.model.startChat({
        history: history,
        generationConfig: {
            maxOutputTokens: 2048,
        }
    });
  }

  async generatePlan(target: string, goal: string): Promise<string> {
    const prompt = `
      You are an expert penetration tester and security researcher named 'Hunter's SHADOW'.
      Your goal is to perform a security assessment on the target: ${target}.
      Specific Objective: ${goal}

      Please outline a step-by-step plan to achieve this objective using standard tools like nmap, gobuster, or custom analysis.
      Do not execute anything yet, just provide the heuristic plan.
      Format the response as a clear, numbered list.
    `;

    try {
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      return response.text();
    } catch (error) {
      console.error(chalk.red("Error generating plan from Gemini:"), error);
      throw error;
    }
  }
}
