import { AutoParseableTool } from 'openai/lib/parser';
import tools from './tools';

export interface ToolResult {
  wasSuccessful: boolean;
  output: string;
  error?: string;
}

/**
 * Runs a tool by name with the given arguments.
 * @param toolName The name of the tool to run.
 * @param args The arguments to pass to the tool.
 * @returns The result of the tool execution.
 */
export async function runTool(
  toolName?: string,
  args?: string,
): Promise<ToolResult> {
  try {
    // "any" is used here because the type of the arguments is not known
    const allTools = tools as AutoParseableTool<any>[];

    const tool = allTools.find((t) => t.function.name === toolName);
    if (!tool) throw new Error(`Tool "${toolName}" was not found.`);

    // parse the arguments to pass to the tool
    const parsedArgs = tool.$parseRaw(args || '{}');
    if (!tool.$callback)
      throw new Error(`Tool ${toolName} does not have a callback function.`);

    // run the tool and get the result
    const result = await tool.$callback(parsedArgs);

    if (!result) throw new Error(`Tool "${toolName}" did not return a result.`);

    return {
      wasSuccessful: true,
      output: result,
      error: undefined,
    };
  } catch (error) {
    return {
      wasSuccessful: false,
      output: '',
      error: (error as Error).message,
    };
  }
}
