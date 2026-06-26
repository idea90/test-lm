import { Composio } from '@composio/core';
import dotenv from 'dotenv';

dotenv.config();

const composio = new Composio({ 
  apiKey: process.env.COMPOSIO_API_KEY 
});

async function main() {
  console.log("Initializing your Remote MCP Router...");
  
  // Use any unique identifier for session management (e.g., 'gemini-user-1')
  const session = await composio.create('gemini-user-1');
  
  console.log("\n🚀 Composio Remote MCP Server Ready!");
  console.log(`Your Remote MCP URL is:\n${session.mcp.url}`);
}

main().catch(console.error);