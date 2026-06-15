import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

// Setup JSON parsing with a generous limit for bases64 file uploads
app.use(express.json({ limit: "50mb" }));

// Helper to initialize Gemini SDK safely
let aiClient: any = null;
function getGeminiClient() {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY is not defined. Please add it via Secrets panel in the AI Studio UI.");
    }
    aiClient = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        }
      }
    });
  }
  return aiClient;
}

// REST API for processing file analysis (Simulates local ExecuTorch + OCR + RAG)
app.post("/api/ai/analyze-file", async (req, res) => {
  try {
    const { fileName, fileType, fileData, userQuery } = req.body;
    
    let client;
    try {
      client = getGeminiClient();
    } catch (err: any) {
      return res.status(400).json({
        success: false,
        error: "missing_api_key",
        message: err.message
      });
    }

    let contents: any[] = [];
    
    // System message instructing Gemini to behave like a highly efficient on-device LLM (ExecuTorch/TinyLlama)
    const systemInstruction = 
      "You are a local on-device AI Copilot for 'TeamMate Pro' running completely offline. " +
      "You analyze attachments, chat histories, logs, and spreadsheets. Give very concise, ultra-organized, and practically useful answers. " +
      "If the uploaded file is an image, perform OCR first, extract the text, and then answer the user query based on the text. " +
      "If it is a spreadsheet (XLSX/CSV), parse the structure and answer query precisely (e.g. list rows, sum cells, format metrics).";

    // Prepare content parts
    const textPart = {
      text: `Analyze the user's query about the attached file.\nFile Name: ${fileName}\nFile Type: ${fileType}\n\nUser Query: "${userQuery}"`
    };

    if (fileData) {
      // fileData is expected to be a base64 encoded string
      // determine standard mime type
      let mimeType = fileType || "application/octet-stream";
      if (fileName.endsWith(".pdf")) mimeType = "application/pdf";
      else if (fileName.endsWith(".docx")) mimeType = "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
      else if (fileName.endsWith(".xlsx")) mimeType = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
      else if (fileName.endsWith(".png")) mimeType = "image/png";
      else if (fileName.endsWith(".jpg") || fileName.endsWith(".jpeg")) mimeType = "image/jpeg";
      else if (fileName.endsWith(".txt")) mimeType = "text/plain";

      const filePart = {
        inlineData: {
          mimeType,
          data: fileData
        }
      };
      contents = [filePart, textPart];
    } else {
      contents = [textPart];
    }

    const response = await client.models.generateContent({
      model: "gemini-3.5-flash",
      contents,
      config: {
        systemInstruction,
        temperature: 0.2,
      },
    });

    res.json({
      success: true,
      result: response.text,
    });

  } catch (error: any) {
    console.error("AI Analysis Error:", error);
    res.status(500).json({
      success: false,
      error: "server_error",
      message: error.message || "An error occurred during local AI simulation."
    });
  }
});

// REST API for file modification on natural language request (Simulates local docx/xlsx/pdf manipulators)
app.post("/api/ai/modify-file", async (req, res) => {
  try {
    const { fileName, fileContent, editInstruction } = req.body;

    let client;
    try {
      client = getGeminiClient();
    } catch (err: any) {
      return res.status(400).json({
        success: false,
        error: "missing_api_key",
        message: err.message
      });
    }

    const prompt = 
      `You are a secure, offline document editor in TeamMate Pro. The user wants to modify a file based on natural language instructions.\n` +
      `File Name: ${fileName}\n` +
      `Current Content / Text Representation:\n` +
      `---- START OF FILE ----\n` +
      `${fileContent}\n` +
      `---- END OF FILE ----\n\n` +
      `User Edit Instructions: "${editInstruction}"\n\n` +
      `Please reconstruct the entire file content, applying the requested edits. Keep all other fields, formatting styles (if clear in text), and information identical. Do not add conversational conversational text before or after the modified file. Just return the modified file content directly in the response. If the text representation shows a table or CSV style, preserve it.`;

    const response = await client.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        temperature: 0.1,
      }
    });

    res.json({
      success: true,
      editedContent: response.text,
      originalName: fileName
    });

  } catch (error: any) {
    console.error("AI Modification Error:", error);
    res.status(500).json({
      success: false,
      error: "server_error",
      message: error.message || "An error occurred during document transformation."
    });
  }
});

async function main() {
  // Vite Dev Server middleware inside development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    // Production client asset serving
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`TeamMate Pro backend running at http://0.0.0.0:${PORT}`);
  });
}

main().catch((err) => {
  console.error("Failed to start server:", err);
});
