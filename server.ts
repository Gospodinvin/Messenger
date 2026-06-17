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

// Seeded initial database inside server memory for multi-device sync
const syncDb = {
  chats: [
    {
      id: "chat-1",
      name: "Разработка мобильной сборки",
      isGroup: true,
      avatar: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=120&h=120&q=80",
      unreadCount: 0,
      participants: [
        { id: "1", name: "Роман Воробьев", avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&h=120&q=80", role: "Product Owner", status: "online" },
        { id: "2", name: "Анна Смирнова", avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=120&h=120&q=80", role: "Дизайнер интерфейсов", status: "online" },
        { id: "3", name: "Дмитрий Козлов", avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=120&h=120&q=80", role: "Разработчик (React Native)", status: "away" },
        { id: "4", name: "Елена Кузнецова", avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=120&h=120&q=80", role: "QA Инженер", status: "offline" },
        { id: "5", name: "Алексей Петров", avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=120&h=120&q=80", role: "Инженер данных", status: "online" }
      ],
      messages: [
        { id: "m1", senderId: "3", senderName: "Дмитрий Козлов", text: "Привет! Настроил react-native-webrtc на iOS. Есть вопросы по интеграции с expo-callkit-telecom.", timestamp: "09:12" },
        { id: "m2", senderId: "2", senderName: "Анна Смирнова", text: "Я закончила макеты экрана звонков в темной теме. Иконки из lucide-react вывела.", timestamp: "09:30" },
        { id: "m3", senderId: "3", senderName: "Дмитрий Козлов", text: "Виктор Андреев, сделай аудит отчета по затратам до среды! Нужно все перепроверить.", timestamp: "09:31",
          detectedTask: { suggestedTaskTitle: "Аудит отчета по затратам", assigneeName: "Виктор Андреев", deadline: "2026-06-17" }
        }
      ]
    },
    {
      id: "chat-2",
      name: "Анна Смирнова (Дизайн)",
      isGroup: false,
      avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=120&h=120&q=80",
      unreadCount: 1,
      participants: [
        { id: "2", name: "Анна Смирнова", avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=120&h=120&q=80", role: "Дизайнер интерфейсов", status: "online" }
      ],
      messages: [
        { id: "m4", senderId: "2", senderName: "Анна Смирнова", text: "Виктор, привет! Посмотри файл report_q2_raw.docx. Надо поменять название компании на ООО Василёк и исправить сумму.", timestamp: "08:15" }
      ]
    },
    {
      id: "chat-3",
      name: "Алексей Петров (Data/LLM)",
      isGroup: false,
      avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=120&h=120&q=80",
      unreadCount: 0,
      participants: [
        { id: "5", name: "Алексей Петров", avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=120&h=120&q=80", role: "Инженер данных", status: "online" }
      ],
      messages: [
        { id: "m5", senderId: "5", senderName: "Алексей Петров", text: "Запустил TinyLlama через ExecuTorch на Android 13. Скорость генерации 22 токена в секунду. Векторная база sqlite-vss отрабатывает мгновенно.", timestamp: "Вчера, 18:40" }
      ]
    }
  ],
  tasks: [
    { id: "t1", chatId: "chat-1", chatName: "Разработка мобильной сборки", title: "Настроить react-native-webrtc на iOS", assignee: { id: "2", name: "Анна Смирнова", avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=120&h=120&q=80", role: "Дизайнер интерфейсов", status: "online" }, deadline: "2026-06-18", status: "completed", priority: "high" },
    { id: "t2", chatId: "chat-1", chatName: "Разработка мобильной сборки", title: "Интегрировать SQLCipher для шифрования данных", assignee: { id: "2", name: "Анна Смирнова", avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=120&h=120&q=80", role: "Дизайнер интерфейсов", status: "online" }, deadline: "2026-06-25", status: "pending", priority: "high" },
    { id: "t3", chatId: "chat-3", chatName: "Алексей Петров (Data/LLM)", title: "Подготовить веса TinyLlama.bin", assignee: { id: "5", name: "Алексей Петров", avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=120&h=120&q=80", role: "Инженер данных", status: "online" }, deadline: "2026-06-20", status: "pending", priority: "medium" }
  ],
  documents: [
    {
      id: "doc-1",
      name: "report_q2_raw.docx",
      type: "docx",
      size: "42.5 KB",
      createdAt: "2026-06-12 14:15",
      content: "КВАРТАЛЬНЫЙ ОТЧЁТ РАЗРОВИТИЯ\n" +
               "Компания: ООО Ромашка\n" +
               "Дата: 1 июня 2026\n" +
               "Статус проекта: Активная ветка стабильного релиза.\n" +
               "Итоговые затраты разработки: 180 000 рублей.\n" +
               "Маркетинговый бюджет: 70 000 рублей.\n" +
               "Выручка от подписок: 350 000 рублей.\n" +
               "Цели на Q3: Интеграция локальных ML Kit моделей для Android и iOS. Переход на шифрование SQLCipher для всех локальных кэшей."
    },
    {
      id: "doc-2",
      name: "team_budget.xlsx",
      type: "xlsx",
      size: "18.2 KB",
      createdAt: "2026-06-14 09:30",
      content: "Бюджет команды TeamMate Pro (Июнь 2026):\n" +
               "ID | Описание | Сумма | Ответственный | Статус\n" +
               "1 | Лицензии Expo EAS | 1 500 рублей | Виктор А. | Оплачено\n" +
               "2 | Аренда Render WebSockets | 800 рублей | Дмитрий К. | Ожидает\n" +
               "3 | Покупка тестового iPhone SE | 22 000 рублей | Анна С. | Одобрено\n" +
               "4 | Оплата хостинга баз данных | 4 500 рублей | Алексей П. | В процессе\n" +
               "5 | Бонус за майский релиз | 45 000 рублей | Все | Выплачено"
    },
    {
      id: "doc-3",
      name: "privacy_policy.txt",
      type: "txt",
      size: "5.4 KB",
      createdAt: "2026-06-10 11:00",
      content: "ПОЛИТИКА КОНФИДЕНЦИАЛЬНОСТИ ПРИЛОЖЕНИЯ 'TEAMMATE PRO'\n\n" +
               "1. Все сообщения, отправленные через мессенджер, шифруются локально на устройстве с использованием технологии SQLCipher (AES-256).\n" +
               "2. Пакеты голосовых и видео звонков осуществляются напрямую между мобильными сверстниками (P2P Client Direct WebRTC) без хранения данных на ретрансляционных серверах.\n" +
               "3. Интеллектуальный ассистент использует встроенную библиотеку ExecuTorch для запуска языковых моделей локально, что полностью исключает передачу файлов на внешние облачные API."
    }
  ] as any[]
};

// REST API for shared database synchronization across client instances
app.get("/api/sync", (req, res) => {
  res.json({
    success: true,
    chats: syncDb.chats,
    tasks: syncDb.tasks,
    documents: syncDb.documents
  });
});

app.post("/api/sync/message", (req, res) => {
  const { chatId, message } = req.body;
  const chat = syncDb.chats.find(c => c.id === chatId);
  if (chat) {
    if (!chat.messages.some(m => m.id === message.id)) {
      chat.messages.push(message);
    }
    res.json({ success: true, chats: syncDb.chats });
  } else {
    res.status(404).json({ success: false, error: "Chat not found" });
  }
});

app.post("/api/sync/task/accept-suggested", (req, res) => {
  const { chatId, messageId, task } = req.body;
  if (!syncDb.tasks.some(t => t.id === task.id)) {
    syncDb.tasks.push(task);
  }
  const chat = syncDb.chats.find(c => c.id === chatId);
  if (chat) {
    chat.messages = chat.messages.map(m => {
      if (m.id === messageId) {
        const { detectedTask, ...rest } = m;
        return rest;
      }
      return m;
    });
  }
  res.json({ success: true });
});

app.post("/api/sync/task/create", (req, res) => {
  const { task } = req.body;
  if (!syncDb.tasks.some(t => t.id === task.id)) {
    syncDb.tasks.push(task);
  }
  res.json({ success: true });
});

app.post("/api/sync/task/toggle", (req, res) => {
  const { taskId } = req.body;
  syncDb.tasks = syncDb.tasks.map(t => {
    if (t.id === taskId) {
      return { ...t, status: t.status === "completed" ? "pending" : "completed" };
    }
    return t;
  });
  res.json({ success: true });
});

app.post("/api/sync/task/delete", (req, res) => {
  const { taskId } = req.body;
  syncDb.tasks = syncDb.tasks.filter(t => t.id !== taskId);
  res.json({ success: true });
});

app.post("/api/sync/document/add", (req, res) => {
  const { doc } = req.body;
  if (!syncDb.documents.some(d => d.id === doc.id)) {
    syncDb.documents.unshift(doc);
  }
  res.json({ success: true });
});

app.post("/api/sync/document/update", (req, res) => {
  const { docId, content, backupContent } = req.body;
  syncDb.documents = syncDb.documents.map(d => {
    if (d.id === docId) {
      return { ...d, content, originalBackupContent: backupContent };
    }
    return d;
  });
  res.json({ success: true });
});

app.post("/api/sync/document/restore", (req, res) => {
  const { docId } = req.body;
  syncDb.documents = syncDb.documents.map(d => {
    if (d.id === docId && d.originalBackupContent) {
      return { ...d, content: d.originalBackupContent, originalBackupContent: undefined };
    }
    return d;
  });
  res.json({ success: true });
});

// Standard health check API endpoint
app.get("/api/health", (req, res) => {
  res.json({ status: "ok" });
});

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
