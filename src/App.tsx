/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from "react";
import { 
  MessageSquare, 
  Phone, 
  Shield, 
  FileText, 
  CheckSquare, 
  Plus, 
  Send, 
  Video, 
  Mic, 
  MicOff, 
  VideoOff, 
  Lock, 
  Unlock, 
  Fingerprint, 
  Search, 
  Trash2, 
  Edit, 
  Check, 
  FileSpreadsheet, 
  Play, 
  ArrowDownToLine, 
  History, 
  Volume2, 
  Terminal, 
  X, 
  Activity, 
  Sparkles, 
  RefreshCw, 
  AlertCircle, 
  Eye, 
  Share2,
  LockKeyhole,
  CheckCircle2,
  Calendar,
  Layers,
  ArrowRight,
  Database,
  Cpu,
  Info
} from "lucide-react";
import { useTeamMateStore } from "./store";
import { Chat, User, Task, FileDocument, Attachment } from "./types";

export default function App() {
  const store = useTeamMateStore();
  
  // Tab control inside smartphone simulator
  const [activeTab, setActiveTab] = useState<"chats" | "tasks" | "files" | "calls" | "security">("chats");
  
  // Terminal log simulator state
  const [logs, setLogs] = useState<Array<{ id: string; time: string; text: string; type: "sys" | "ai" | "db" | "net" }>>([
    { id: "1", time: "09:59:40", text: "[SQLCipher] Mount teammate_secure.db: AES-256 initialization key computed successfully.", type: "db" },
    { id: "2", time: "09:59:41", text: "[ExecuTorch] HermeJS engine checking for model weights...", type: "sys" },
    { id: "3", time: "09:59:43", text: "[ExecuTorch] TinyLlama-1.1B.bin models successfully loaded into client cache directory.", type: "ai" },
    { id: "4", time: "09:59:44", text: "[P2P Signalling] Socket connected to Render gateway: waiting for client Handshakes.", type: "net" }
  ]);

  const addLog = (text: string, type: "sys" | "ai" | "db" | "net" = "sys") => {
    const timeStr = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" });
    setLogs(prev => [
      ...prev,
      { id: Date.now().toString(), time: timeStr, text, type }
    ]);
  };

  // Chats local states
  const [chatSearch, setChatSearch] = useState("");
  const [msgInput, setMsgInput] = useState("");
  const activeChat = store.chats.find(c => c.id === store.activeChatId) || store.chats[0];

  // AI Document control states
  const [selectedDocId, setSelectedDocId] = useState<string>("doc-1");
  const selectedDoc = store.documents.find(d => d.id === selectedDocId) || store.documents[0];
  const [editPrompt, setEditPrompt] = useState("");
  const [analysisPrompt, setAnalysisPrompt] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const [aiResult, setAiResult] = useState<string>("");
  const [ocrProcessing, setOcrProcessing] = useState(false);

  // New task form state (in screen tab)
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [newTaskAssigneeId, setNewTaskAssigneeId] = useState("2"); // defaults to Anna
  const [newTaskDeadline, setNewTaskDeadline] = useState("2026-06-21");
  const [newTaskPriority, setNewTaskPriority] = useState<"low" | "medium" | "high">("medium");

  // Call dialer states
  const [dialUser, setDialUser] = useState<User>(store.users[0]);
  const [dialVideo, setDialVideo] = useState(true);

  // Lockscreen passcode input
  const [passcodeInput, setPasscodeInput] = useState("");
  const [passcodeError, setPasscodeError] = useState(false);

  // Setup / simulation state
  const [fileToUpload, setFileToUpload] = useState<{ name: string; type: string; size: string; contentSnapshot: string } | null>(null);

  // Real-time server synchronization loop
  useEffect(() => {
    let active = true;
    const syncWithServer = async () => {
      try {
        const response = await fetch("/api/sync");
        if (response.ok && active) {
          const data = await response.json();
          if (data.success) {
            useTeamMateStore.setState({
              chats: data.chats,
              tasks: data.tasks,
              documents: data.documents
            });
          }
        }
      } catch (err) {
        // Fallback gracefully if backend is rebooting
      }
    };

    syncWithServer();
    const interval = setInterval(syncWithServer, 2500); // Poll every 2.5 seconds for instant updates
    return () => {
      active = false;
      clearInterval(interval);
    };
  }, []);

  // Call timer effect
  useEffect(() => {
    let interval: any;
    if (store.activeCall && store.activeCall.status === "active") {
      interval = setInterval(() => {
        useTeamMateStore.setState((state) => {
          if (state.activeCall) {
            return {
              activeCall: {
                ...state.activeCall,
                duration: state.activeCall.duration + 1
              }
            };
          }
          return state;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [store.activeCall]);

  const handleSendMessage = () => {
    if (!msgInput.trim() && !fileToUpload) return;

    let attachs: Attachment[] = [];
    if (fileToUpload) {
      const attach: Attachment = {
        id: "att-" + Date.now(),
        name: fileToUpload.name,
        type: fileToUpload.type as any,
        size: fileToUpload.size,
        localPath: `/app/secure/sandbox_storage/attachments/${fileToUpload.name}`,
        contentSnapshot: fileToUpload.contentSnapshot
      };
      attachs.push(attach);
      addLog(`[Local Storage] Document cached: ${fileToUpload.name} (${fileToUpload.size}) in sandbox folder`, "db");
    }

    store.sendMessage(activeChat.id, msgInput, attachs);
    addLog(`[Message Sent] Payload ciphered in SQLCipher. Chat ID: ${activeChat.id}`, "db");
    
    // Simulate smart task recognition logs
    const taskKeywords = ["сделай", "сделать", "подготовь", "напиши", "выполни"];
    if (taskKeywords.some(kw => msgInput.toLowerCase().includes(kw))) {
      addLog(`[NLP Engine] Found potential cooperative task keywords. Prompting approval card.`, "ai");
    }

    setMsgInput("");
    setFileToUpload(null);

    // AI automated simulation chat responses from team members
    const activeId = activeChat.id;
    setTimeout(() => {
      if (activeId === "chat-2") {
        // Direct Design chat
        store.sendMessage("chat-2", "Виктор, файл был отредактирован локально в приложении. Можешь сделать выжимку или быстро поменять реквизиты, ассистент делает это за 2 секунды прямо в оффлайн-редакторе!");
        addLog(`[Simulator Incoming Message] Push notification broadcasted local.`, "sys");
      }
    }, 2500);
  };

  const handleUnlock = (code: string) => {
    const success = store.unlockApp(code);
    if (success) {
      setPasscodeInput("");
      setPasscodeError(false);
      addLog("[Auth System] Biometric / Code valid. SQLite container unlocked.", "db");
    } else {
      setPasscodeError(true);
      setPasscodeInput("");
      addLog("[Auth Warning] Unauthorized decrypt attempt. SQLCipher block rejected passcode.", "db");
    }
  };

  const handleUploadSimulate = (type: "pdf" | "docx" | "xlsx" | "png") => {
    if (type === "pdf") {
      setFileToUpload({
        name: "product_specification.pdf",
        type: "pdf",
        size: "155.4 KB",
        contentSnapshot: "ТЕХНИЧЕСКОЕ ЗАДАНИЕ (ПДФ): Разработка приложения TeamMate Pro.\n" +
                         "Минимальные версии: iOS 17.0, Android 13.0.\n" +
                         "Шифрование базы данных: SQLCipher AES-256.\n" +
                         "Модели LLM: TinyLlama 1.1B (модель весит 1.1 ГБ, скачка при первом запуске)."
      });
      addLog("[Local Parser] PDF binary streamed to memory.", "sys");
    } else if (type === "docx") {
      setFileToUpload({
        name: "contract_draft.docx",
        type: "docx",
        size: "72.1 KB",
        contentSnapshot: "ДОГОВОР ПОДРЯДА №2026. Исполнитель: ООО Ромашка.\n" +
                         "Заказчик: Инжиниринг Групп.\n" +
                         "Срок действия: до 25 декабря 2026.\n" +
                         "Окончательная договорная сумма: 150 000 рублей российских."
      });
      addLog("[Local Parser] mammoth.js read successfully", "sys");
    } else if (type === "xlsx") {
      setFileToUpload({
        name: "q2_expenses.xlsx",
        type: "xlsx",
        size: "24.8 KB",
        contentSnapshot: "ОТЧЕТ О ЗАКУПКАХ:\n" +
                         "Серверы (Render WebSockets) | 950 рублей\n" +
                         "Материалы рекламной кампании | 8 500 рублей\n" +
                         "Премии QA отдела | 15 000 рублей\n" +
                         "Итого по расходам: 24 450 рублей."
      });
      addLog("[Local Parser] SheetJS workbook parsed", "sys");
    } else if (type === "png") {
      setFileToUpload({
        name: "receipt_scan.png",
        type: "image",
        size: "1.2 MB",
        contentSnapshot: "ИЗОБРАЖЕНИЕ: Чек об оплате.\n" +
                         "Магазин: Электроника Лимитед.\n" +
                         "Товар: Тестовое устройство для отладки звонков.\n" +
                         "Сумма: 31 200 рублей.\n" +
                         "Кассир №2. Спасибо за покупку!"
      });
      addLog("[Local UI] Image picker returns local sandbox file stream.", "sys");
    }
  };

  // Run Real AI File Analysis on server using @google/genai
  const handleAnalyzeFileInApp = async () => {
    if (!analysisPrompt.trim()) return;
    setAiLoading(true);
    addLog(`[Local RAG Engine] OCR + Vector chunk check matching command: "${analysisPrompt}"`, "ai");

    try {
      const response = await fetch("/api/ai/analyze-file", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fileName: selectedDoc.name,
          fileType: selectedDoc.type,
          fileData: btoa(unescape(encodeURIComponent(selectedDoc.content))),
          userQuery: analysisPrompt
        })
      });

      const data = await response.json();
      if (data.success) {
        setAiResult(data.result);
        addLog(`[ExecuTorch Model Output] 120 tokens processed inside local GPU device tree.`, "ai");
      } else {
        setAiResult(`Ошибка ИИ: ${data.message || "Не удалось получить ответ"}`);
      }
    } catch (error) {
      console.error(error);
      setAiResult("Ошибка сети / Сервер API недоступен. Проверьте подключение.");
    } finally {
      setAiLoading(false);
    }
  };

  // Run Real AI File Modification on server using @google/genai 
  const handleModifyFileInApp = async () => {
    if (!editPrompt.trim()) return;
    setAiLoading(true);
    addLog(`[Local Engine] Opening ${selectedDoc.name} for mutation sequence.`, "ai");

    try {
      const response = await fetch("/api/ai/modify-file", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fileName: selectedDoc.name,
          fileContent: selectedDoc.content,
          editInstruction: editPrompt
        })
      });

      const data = await response.json();
      if (data.success) {
        // Backup is done automatically in the store action
        store.updateDocumentContent(selectedDocId, data.editedContent, true);
        addLog(`[Local Mutator] File transformed. Saved clone and compiled modifications.`, "sys");
        setAiResult(`Файл ${selectedDoc.name} успешно изменен!\nРедактор применил мутации локально.`);
        setEditPrompt("");
      } else {
        setAiResult(`Ошибка модификации: ${data.message}`);
      }
    } catch (error) {
      console.error(error);
      setAiResult("Ошибка локальных библиотек (pdf-lib / SheetJS) при замене.");
    } finally {
      setAiLoading(false);
    }
  };

  // Simulated OCR extract on custom photo attachment
  const runSimulatedOCR = async (docObj: any) => {
    setOcrProcessing(true);
    addLog(`[Tesseract OCR] Scanning bitmap file: ${docObj.name}...`, "ai");
    
    setTimeout(() => {
      setOcrProcessing(false);
      const textCandidate = "ТЕКСТ С КАРТИНКИ (OCR):\n" + docObj.contentSnapshot;
      // Add a newly processed text document to the local library
      store.addDocument({
        id: "ocr-" + Date.now(),
        name: `ocr_${docObj.name.replace(".", "_")}.txt`,
        type: "txt",
        size: "1.5 KB",
        createdAt: "Только что, OCR",
        content: textCandidate
      });
      addLog(`[Tesseract OCR] Text successfully extracted from receipt scan. Cached text to docs panel.`, "ai");
      alert("Снимок чека успешно отсканирован! Текст добавлен в Библиотеку как текстовый файл.");
    }, 1500);
  };

  const handleSimulateCallTrigger = (partner: User, isVideo: boolean) => {
    setActiveTab("calls");
    store.startCall(partner, isVideo);
    addLog(`[WebRTC Voice] ICE candidate handshake generated. Dialing: ${partner.name}...`, "net");
  };

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 flex flex-col font-sans selection:bg-teal-500 selection:text-black">
      
      {/* Upper Navigation Header */}
      <header className="border-b border-neutral-800 bg-neutral-900/50 backdrop-blur-md sticky top-0 z-40 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="bg-gradient-to-tr from-teal-500 to-emerald-400 p-2.5 rounded-xl shadow-lg shadow-teal-500/10">
            <Layers className="w-6 h-6 text-neutral-950 font-bold" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-white flex items-center">
              TeamMate Pro <span className="ml-2 text-xs bg-teal-500/10 text-teal-400 px-2 py-0.5 rounded-full border border-teal-500/20">Mobile Build Spec v1.4</span>
            </h1>
            <p className="text-xs text-neutral-400">Спецификация для React Native 0.76+ & Expo 52</p>
          </div>
        </div>

        <div className="flex items-center space-x-6">
          <div className="hidden lg:flex items-center space-x-2 text-xs text-neutral-400">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>Локальный эмулятор ИИ активен</span>
          </div>
          <button 
            onClick={() => {
              store.receiveIncomingCallSim(store.users[1], true);
              addLog("[Simulator] Simulating inbound WebRTC call request from Anna Smirnova.", "net");
            }}
            className="text-xs bg-neutral-800 hover:bg-neutral-700 transition px-3 py-1.5 rounded-lg border border-neutral-700 flex items-center space-x-1.5"
          >
            <span>Имитировать Входящий Звонок</span>
          </button>
        </div>
      </header>

      {/* Main Container Layout */}
      <main className="flex-1 max-w-7xl mx-auto w-full p-4 lg:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* LEFT COLUMN: THE PHONE SIMULATOR (5 COLS) */}
        <div className="lg:col-span-5 flex flex-col items-center">
          
          {/* Smart Phone Shell Frame */}
          <div className="relative w-full max-w-[380px] aspect-[9/19.5] bg-neutral-900 rounded-[50px] border-[12px] border-neutral-800 shadow-2xl overflow-hidden flex flex-col ring-1 ring-neutral-700/50">
            
            {/* Phone Notch/Dynamic Island */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-6 bg-neutral-800 rounded-b-2xl z-50 flex items-center justify-between px-4">
              <div className="w-3.5 h-3.5 bg-neutral-950 rounded-full border border-neutral-800"></div>
              <div className="w-8 h-1 bg-neutral-950 rounded-full"></div>
            </div>

            {/* Phone Screen Status Bar */}
            <div className="bg-neutral-900 text-neutral-400 px-6 pt-7 pb-2 text-[11px] font-medium flex justify-between items-center z-10 select-none">
              <span>09:59 PM</span>
              <div className="flex items-center space-x-1.5">
                <span className="text-[9px] bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 px-1 rounded">offline</span>
                <span className="text-[9px] bg-teal-500/20 text-teal-400 border border-teal-500/20 px-1 rounded">SQLCipher</span>
                <Activity className="w-3 h-3 text-neutral-500" />
                <div className="w-5 h-2.5 border border-neutral-600 rounded-sm p-0.5 flex items-center">
                  <div className="h-full w-4/5 bg-emerald-400 rounded-2xs"></div>
                </div>
              </div>
            </div>

            {/* SCREEN ZONE: PASSED SCREEN OR LOCK SCREEN */}
            <div className="flex-1 bg-neutral-950 text-neutral-100 flex flex-col relative overflow-y-auto">
              
              {store.security.isLocked ? (
                /* LOCK SCREEN INTERFACE */
                <div className="flex-1 flex flex-col justify-between p-6 bg-gradient-to-b from-neutral-900 to-neutral-950">
                  <div className="flex flex-col items-center mt-12">
                    <div className="w-16 h-16 bg-teal-500/10 border border-teal-500/20 text-teal-400 rounded-2xl flex items-center justify-center mb-4">
                      <LockKeyhole className="w-8 h-8" />
                    </div>
                    <h2 className="text-lg font-bold text-white">TeamMate Pro</h2>
                    <p className="text-xs text-neutral-400 text-center mt-2 px-6">
                      База зашифрована SQLCipher. Введите пароль для авторизации контейнера.
                    </p>
                  </div>

                  <div className="flex flex-col items-center mb-8">
                    {/* Visual PIN Indicators */}
                    <div className="flex space-x-3 mb-6">
                      {[0, 1, 2, 3].map((idx) => (
                        <div 
                          key={idx} 
                          className={`w-3.5 h-3.5 rounded-full border border-neutral-600 transition-colors ${
                            passcodeInput.length > idx ? "bg-teal-400 border-teal-400" : "bg-transparent"
                          }`}
                        ></div>
                      ))}
                    </div>

                    {passcodeError && (
                      <p className="text-xs text-red-400 mb-4 font-semibold text-center bg-red-500/10 px-3 py-1 rounded">
                        Неверный пин-код! Попробуйте 1234
                      </p>
                    )}

                    {/* Numeric Pin Pad */}
                    <div className="grid grid-cols-3 gap-3 w-56">
                      {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
                        <button
                          key={num}
                          onClick={() => {
                            if (passcodeInput.length < 4) {
                              const next = passcodeInput + num;
                              setPasscodeInput(next);
                              if (next.length === 4) handleUnlock(next);
                            }
                          }}
                          className="h-12 w-12 rounded-full bg-neutral-800 hover:bg-neutral-700 transition flex items-center justify-center text-lg font-semibold active:scale-95 text-white"
                        >
                          {num}
                        </button>
                      ))}
                      <button 
                        onClick={() => {
                          setPasscodeInput("1234");
                          handleUnlock("1234");
                        }}
                        className="text-[10px] text-teal-400 uppercase text-center flex items-center justify-center font-bold"
                      >
                        Тест: 1234
                      </button>
                      <button
                        onClick={() => {
                          if (passcodeInput.length < 4) {
                            const next = passcodeInput + "0";
                            setPasscodeInput(next);
                            if (next.length === 4) handleUnlock(next);
                          }
                        }}
                        className="h-12 w-12 rounded-full bg-neutral-800 hover:bg-neutral-700 transition flex items-center justify-center text-lg font-semibold active:scale-95 text-white"
                      >
                        0
                      </button>
                      <button
                        onClick={() => setPasscodeInput(prev => prev.slice(0, -1))}
                        className="text-xs text-neutral-400 hover:text-white flex items-center justify-center active:scale-95"
                      >
                        Del
                      </button>
                    </div>

                    {/* Biometric trigger simulation */}
                    {store.security.useBiometrics && (
                      <button 
                        onClick={() => handleUnlock("1234")} 
                        className="mt-6 flex items-center space-x-2 text-xs bg-neutral-800/80 hover:bg-neutral-700 hover:text-white transition px-4 py-2 rounded-xl border border-neutral-700"
                      >
                        <Fingerprint className="w-4 h-4 text-teal-400" />
                        <span>Симуляция биометрии (Face ID)</span>
                      </button>
                    )}
                  </div>
                </div>
              ) : (
                
                /* FULL APP WRAPPER WHEN UNLOCKED */
                <div className="flex-1 flex flex-col">
                  
                  {/* APP HEADER */}
                  <div className="bg-neutral-900 px-4 py-2.5 border-b border-neutral-800 flex justify-between items-center">
                    <div>
                      <h3 className="text-sm font-bold text-white tracking-wide">
                        {activeTab === "chats" && "Мессенджер"}
                        {activeTab === "tasks" && "Задачи"}
                        {activeTab === "files" && "Библиотека / ИИ"}
                        {activeTab === "calls" && "История Звонков"}
                        {activeTab === "security" && "Безопасность"}
                      </h3>
                      <div className="flex items-center space-x-1.5 mt-0.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                        <select
                          value={store.currentUser.id}
                          onChange={(e) => {
                            const val = e.target.value;
                            const allUsers = [
                              { id: "me", name: "Виктор Андреев", avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=120&h=120&q=80", role: "Координатор проекта", status: "online" as const },
                              ...store.users,
                            ];
                            const matched = allUsers.find(u => u.id === val);
                            if (matched) {
                              useTeamMateStore.setState({ currentUser: matched });
                              addLog(`[Профиль] Вы переключились на роль: ${matched.name}`, "sys");
                            }
                          }}
                          className="bg-transparent text-teal-400 font-medium text-[10px] uppercase tracking-wider focus:outline-none cursor-pointer border-none p-0"
                          title="Выберите вашего пользователя для отправки сообщений от своего имени"
                        >
                          <option value="me" className="bg-neutral-900 text-neutral-300">Виктор (Я)</option>
                          <option value="1" className="bg-neutral-900 text-neutral-300">Роман</option>
                          <option value="2" className="bg-neutral-900 text-neutral-300">Анна</option>
                          <option value="3" className="bg-neutral-900 text-neutral-300">Дмитрий</option>
                          <option value="4" className="bg-neutral-900 text-neutral-300">Елена</option>
                          <option value="5" className="bg-neutral-900 text-neutral-300">Алексей</option>
                        </select>
                      </div>
                    </div>
                    
                    <button 
                      onClick={() => {
                        store.lockApp();
                        addLog("[Security] User locked device container manually.", "sys");
                      }}
                      className="p-1.5 hover:bg-neutral-800 rounded bg-neutral-950 border border-neutral-800 text-neutral-400 hover:text-teal-400"
                      title="Заблокировать контейнер"
                    >
                      <Lock className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* ACTIVE TAB CONTENT DISPLAY SCREEN */}
                  <div className="flex-1 flex flex-col min-h-0 overflow-y-auto">
                    
                    {/* 1. CHATS TAB SCREEN */}
                    {activeTab === "chats" && (
                      <div className="flex-1 flex flex-col min-h-0">
                        {/* Chat search */}
                        <div className="p-2 border-b border-neutral-900 bg-neutral-950 flex items-center">
                          <div className="relative flex-1">
                            <Search className="w-3 h-3 text-neutral-500 absolute left-2 top-2.5" />
                            <input
                              type="text"
                              value={chatSearch}
                              onChange={(e) => setChatSearch(e.target.value)}
                              placeholder="Поиск контактов или групп..."
                              className="w-full bg-neutral-900 pl-7 pr-3 py-1.5 rounded-lg text-xs text-neutral-200 placeholder-neutral-500 border border-neutral-800 focus:outline-none focus:border-neutral-700"
                            />
                          </div>
                        </div>

                        {/* List of Chats */}
                        {store.activeChatId ? (
                          /* Active Chat Screen View */
                          <div className="flex-1 flex flex-col min-h-0 bg-neutral-950">
                            
                            {/* Target Chat Top Header */}
                            <div className="px-3 py-2 bg-neutral-900 flex justify-between items-center border-b border-neutral-800">
                              <button 
                                onClick={() => store.setActiveChatId(null)}
                                className="text-xs text-neutral-400 hover:text-white flex items-center space-x-1"
                              >
                                <span>← Назад</span>
                              </button>
                              
                              <div className="flex flex-col items-center">
                                <span className="text-xs font-bold text-white">{activeChat.name}</span>
                                <span className="text-[9px] text-neutral-400">
                                  {activeChat.isGroup ? `${activeChat.participants.length + 1} уч.` : "онлайн"}
                                </span>
                              </div>

                              <div className="flex space-x-2">
                                <button 
                                  onClick={() => handleSimulateCallTrigger(activeChat.participants[0], false)}
                                  className="p-1 bg-neutral-800 hover:bg-neutral-700 text-teal-400 rounded transition"
                                  title="Аудиовызов WebRTC"
                                >
                                  <Phone className="w-3.5 h-3.5" />
                                </button>
                                <button 
                                  onClick={() => handleSimulateCallTrigger(activeChat.participants[0], true)}
                                  className="p-1 bg-neutral-800 hover:bg-neutral-700 text-teal-400 rounded transition"
                                  title="Видеовызов WebRTC"
                                >
                                  <Video className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>

                            {/* Chat messages list */}
                            <div className="flex-1 overflow-y-auto p-3 space-y-3 flex flex-col">
                              {activeChat.messages.map((m) => {
                                const isMe = m.senderId === "me";
                                return (
                                  <div 
                                    key={m.id} 
                                    className={`flex flex-col max-w-[85%] ${isMe ? "self-end items-end" : "self-start items-start"}`}
                                  >
                                    {!isMe && (
                                      <span className="text-[9px] text-neutral-400 mb-0.5 ml-1">{m.senderName}</span>
                                    )}
                                    <div className={`p-2.5 rounded-xl text-xs leading-relaxed ${
                                      isMe 
                                        ? "bg-teal-500 text-black font-medium rounded-tr-none" 
                                        : "bg-neutral-900 border border-neutral-800 text-neutral-200 rounded-tl-none"
                                    }`}>
                                      <p>{m.text}</p>

                                      {/* Attachment Display */}
                                      {m.attachments && m.attachments.length > 0 && (
                                        <div className="mt-2 space-y-1 bg-neutral-950/40 p-2 rounded-lg border border-neutral-800/50">
                                          {m.attachments.map((att) => (
                                            <div key={att.id} className="flex flex-col">
                                              <div className="flex items-center space-x-2">
                                                {att.type === "image" ? (
                                                  <FileText className="w-4 h-4 text-amber-400 flex-shrink-0" />
                                                ) : att.type === "xlsx" ? (
                                                  <FileSpreadsheet className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                                                ) : (
                                                  <FileText className="w-4 h-4 text-indigo-400 flex-shrink-0" />
                                                )}
                                                <div className="overflow-hidden">
                                                  <p className="text-[10px] font-bold text-white truncate">{att.name}</p>
                                                  <p className="text-[8px] text-neutral-400">{att.size}</p>
                                                </div>
                                              </div>

                                              {/* Action Buttons for files */}
                                              <div className="mt-2 flex items-center space-x-1">
                                                <button 
                                                  onClick={() => {
                                                    // Quick add to app files and select
                                                    const alreadyExists = store.documents.some(d => d.name === att.name);
                                                    if (!alreadyExists) {
                                                      store.addDocument({
                                                        id: "doc-att-" + att.id,
                                                        name: att.name,
                                                        type: att.type as any,
                                                        size: att.size,
                                                        createdAt: "Только что, из чата",
                                                        content: att.contentSnapshot || "Данные не предопределены"
                                                      });
                                                      addLog(`[File Cache] Transferred ${att.name} to local workspace sandbox.`, "sys");
                                                    }
                                                    setSelectedDocId(alreadyExists ? store.documents.find(d => d.name === att.name)!.id : "doc-att-" + att.id);
                                                    setActiveTab("files");
                                                    addLog(`[UI Select] Loaded ${att.name} onto on-device AI workspace.`, "ai");
                                                  }}
                                                  className="text-[9px] bg-neutral-800 hover:bg-neutral-700 text-teal-400 px-1.5 py-0.5 rounded transition font-medium"
                                                >
                                                  Открыть/ИИ
                                                </button>
                                                {att.type === "image" && (
                                                  <button
                                                    onClick={() => runSimulatedOCR(att)}
                                                    className="text-[9px] bg-neutral-800 hover:bg-neutral-700 text-amber-400 px-1.5 py-0.5 rounded transition font-medium"
                                                  >
                                                    Текст (OCR)
                                                  </button>
                                                )}
                                              </div>
                                            </div>
                                          ))}
                                        </div>
                                      )}
                                    </div>

                                    {/* Task proposal automated bubble inside Chat room */}
                                    {m.detectedTask && (
                                      <div className="mt-2 w-full bg-neutral-900 border border-amber-500/30 p-2.5 rounded-xl shadow-lg flex flex-col space-y-1.5">
                                        <div className="flex items-center space-x-1">
                                          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                                          <span className="text-[10px] font-bold text-amber-300">ИИ обнаружил задачу</span>
                                        </div>
                                        <p className="text-[11px] text-neutral-300 italic font-mono">
                                          &quot;{m.detectedTask.suggestedTaskTitle}&quot;
                                        </p>
                                        <div className="flex justify-between items-center text-[10px] text-neutral-400">
                                          <span>Исполнитель: {m.detectedTask.assigneeName}</span>
                                          <span>Срок: {m.detectedTask.deadline}</span>
                                        </div>
                                        <button 
                                          onClick={() => {
                                            store.acceptSuggestedTask(activeChat.id, m.id);
                                            addLog("[NLP Task Auto] Task created from chat context context.", "ai");
                                          }}
                                          className="text-[10px] font-medium bg-amber-500/20 hover:bg-amber-500 hover:text-black transition-all px-2 py-1 rounded text-center text-amber-300"
                                        >
                                          Принять задачу в спринт
                                        </button>
                                      </div>
                                    )}

                                    <span className="text-[8px] text-neutral-500 mt-0.5">{m.timestamp}</span>
                                  </div>
                                );
                              })}
                            </div>

                            {/* Attachment simulator preview bar */}
                            {fileToUpload && (
                              <div className="mx-3 my-1 p-2 bg-neutral-900 border border-teal-500/30 rounded-lg flex items-center justify-between">
                                <div className="flex items-center space-x-2">
                                  <FileText className="w-4 h-4 text-teal-400" />
                                  <div>
                                    <p className="text-[10px] font-bold text-white truncate max-w-[180px]">{fileToUpload.name}</p>
                                    <p className="text-[8px] text-neutral-400">Готов к отправке • {fileToUpload.size}</p>
                                  </div>
                                </div>
                                <button onClick={() => setFileToUpload(null)} className="p-1 hover:bg-neutral-800 rounded">
                                  <X className="w-3.5 h-3.5 text-neutral-400" />
                                </button>
                              </div>
                            )}

                            {/* Message input bar */}
                            <div className="p-2 bg-neutral-900 border-t border-neutral-800 flex items-center space-x-1.5 font-sans">
                              {/* Document simulation selector dropdown */}
                              <div className="relative group">
                                <button className="p-2 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 rounded-lg flex items-center transition">
                                  <Plus className="w-3.5 h-3.5" />
                                </button>
                                <div className="hidden group-hover:block absolute bottom-full left-0 mb-2 w-48 bg-neutral-900 border border-neutral-800 rounded-xl shadow-2xl p-1.5 space-y-1">
                                  <p className="text-[8.5px] font-bold text-neutral-500 uppercase px-2 py-1">Прикрепить файл</p>
                                  <button 
                                    onClick={() => handleUploadSimulate("docx")}
                                    className="w-full text-left text-[11px] px-2 py-1 rounded hover:bg-neutral-800 text-neutral-300 flex items-center space-x-2"
                                  >
                                    <FileText className="w-3.5 h-3.5 text-blue-400" />
                                    <span>contract_draft.docx</span>
                                  </button>
                                  <button 
                                    onClick={() => handleUploadSimulate("xlsx")}
                                    className="w-full text-left text-[11px] px-2 py-1 rounded hover:bg-neutral-800 text-neutral-300 flex items-center space-x-2"
                                  >
                                    <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" />
                                    <span>q2_expenses.xlsx</span>
                                  </button>
                                  <button 
                                    onClick={() => handleUploadSimulate("pdf")}
                                    className="w-full text-left text-[11px] px-2 py-1 rounded hover:bg-neutral-800 text-neutral-300 flex items-center space-x-2"
                                  >
                                    <FileText className="w-3.5 h-3.5 text-red-400" />
                                    <span>product_spec.pdf</span>
                                  </button>
                                  <button 
                                    onClick={() => handleUploadSimulate("png")}
                                    className="w-full text-left text-[11px] px-2 py-1 rounded hover:bg-neutral-800 text-neutral-300 flex items-center space-x-2"
                                  >
                                    <FileText className="w-3.5 h-3.5 text-amber-400" />
                                    <span>Изображение (OCR)</span>
                                  </button>
                                </div>
                              </div>

                              <input
                                type="text"
                                value={msgInput}
                                onChange={(e) => setMsgInput(e.target.value)}
                                onKeyDown={(e) => { if (e.key === "Enter") handleSendMessage(); }}
                                placeholder="Наберите сообщение или /task..."
                                className="flex-1 bg-neutral-950 border border-neutral-800 px-3 py-1.5 rounded-lg text-xs text-neutral-200 placeholder-neutral-500 focus:outline-none focus:border-neutral-700"
                              />

                              <button 
                                onClick={handleSendMessage}
                                className="p-2 bg-teal-500 hover:bg-teal-400 text-black rounded-lg transition"
                              >
                                <Send className="w-3.5 h-3.5" />
                              </button>
                            </div>

                          </div>
                        ) : (
                          /* Chats Master List View */
                          <div className="flex-1 divide-y divide-neutral-900 overflow-y-auto">
                            {store.chats
                              .filter(c => c.name.toLowerCase().includes(chatSearch.toLowerCase()))
                              .map(chat => (
                                <button
                                  key={chat.id}
                                  onClick={() => {
                                    store.setActiveChatId(chat.id);
                                    addLog(`[UI Navigation] Selected chat workspace: ${chat.name}`, "sys");
                                  }}
                                  className="w-full px-3 py-3 hover:bg-neutral-900/55 text-left flex items-start space-x-3 transition-colors"
                                >
                                  <img 
                                    src={chat.avatar} 
                                    alt={chat.name} 
                                    className="w-10 h-10 rounded-full object-cover border border-neutral-800 flex-shrink-0" 
                                  />
                                  <div className="flex-1 min-w-0">
                                    <div className="flex justify-between items-baseline mb-0.5">
                                      <h4 className="text-xs font-bold text-white truncate max-w-[150px]">{chat.name}</h4>
                                      <span className="text-[9px] text-neutral-500">
                                        {chat.messages[chat.messages.length - 1]?.timestamp || "09:00"}
                                      </span>
                                    </div>
                                    <p className="text-[11px] text-neutral-400 truncate">
                                      {chat.messages[chat.messages.length - 1]?.text || "Нет сообщений"}
                                    </p>
                                  </div>
                                  {chat.unreadCount > 0 && (
                                    <span className="bg-teal-500 text-black text-[9px] font-extrabold px-1.5 py-0.5 rounded-full">
                                      {chat.unreadCount}
                                    </span>
                                  )}
                                </button>
                              ))}
                          </div>
                        )}

                      </div>
                    )}

                    {/* 2. TASKS TAB SCREEN */}
                    {activeTab === "tasks" && (
                      <div className="flex-1 flex flex-col p-3 bg-neutral-950 font-sans">
                        <div className="flex justify-between items-center mb-3">
                          <span className="text-xs font-bold text-neutral-300">План Спринта ({store.tasks.filter(t => t.status === "pending").length} в работе)</span>
                        </div>

                        {/* List of active tasks */}
                        <div className="flex-1 space-y-2.5 overflow-y-auto max-h-[290px]">
                          {store.tasks.map((task) => (
                            <div 
                              key={task.id} 
                              className={`p-2.5 rounded-xl border transition-all ${
                                task.status === "completed" 
                                  ? "bg-neutral-900/50 border-neutral-900 opacity-60 text-neutral-500" 
                                  : "bg-neutral-900 border-neutral-800 text-neutral-200"
                              }`}
                            >
                              <div className="flex items-start justify-between">
                                <div className="flex items-start space-x-2">
                                  <button 
                                    onClick={() => {
                                      store.toggleTaskStatus(task.id);
                                      addLog(`[SQLite Database] Task status toggled: ${task.title}`, "db");
                                    }}
                                    className="mt-0.5 text-neutral-400 hover:text-teal-400"
                                  >
                                    <CheckSquare className={`w-3.5 h-3.5 ${task.status === "completed" ? "text-teal-400 fill-teal-400/20" : ""}`} />
                                  </button>
                                  <div>
                                    <p className={`text-[11px] font-medium leading-normal ${task.status === "completed" ? "line-through text-neutral-500" : "text-white"}`}>
                                      {task.title}
                                    </p>
                                    <p className="text-[9px] text-neutral-400 mt-1 flex items-center">
                                      <span className="bg-neutral-800 text-neutral-300 px-1 py-0.2 rounded mr-1.5">{task.chatName}</span>
                                      <span>{task.deadline}</span>
                                    </p>
                                  </div>
                                </div>
                                <span className={`text-[8px] font-bold uppercase px-1 rounded ${
                                  task.priority === "high" ? "bg-red-500/20 text-red-400 border border-red-500/10" :
                                  task.priority === "medium" ? "bg-amber-500/20 text-amber-300 border border-amber-500/15" :
                                  "bg-neutral-800 text-neutral-400"
                                }`}>
                                  {task.priority === "high" ? "крит" : "норма"}
                                </span>
                              </div>

                              <div className="mt-2 pt-2 border-t border-neutral-800/40 flex justify-between items-center text-[10px]">
                                <span className="text-neutral-400">Ответственный: {task.assignee.name}</span>
                                <button 
                                  onClick={() => {
                                    store.deleteTask(task.id);
                                    addLog("[SQLite] Task row hard deleted.", "db");
                                  }}
                                  className="text-neutral-500 hover:text-red-400 transition"
                                >
                                  Удалить
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>

                        {/* Add Task Quick Form inside App */}
                        <div className="mt-3 p-2 bg-neutral-900 border border-neutral-800 rounded-xl space-y-2">
                          <p className="text-[10px] font-bold text-white">Добавить Новую Задачу</p>
                          <input 
                            type="text" 
                            placeholder="Название задачи..."
                            value={newTaskTitle}
                            onChange={(e) => setNewTaskTitle(e.target.value)}
                            className="w-full bg-neutral-950 border border-neutral-800 rounded px-2 py-1 text-[11px] text-neutral-200 focus:outline-none focus:border-neutral-700" 
                          />
                          <div className="grid grid-cols-2 gap-2">
                            <select 
                              value={newTaskAssigneeId}
                              onChange={(e) => setNewTaskAssigneeId(e.target.value)}
                              className="bg-neutral-950 text-neutral-300 border border-neutral-800 text-[10px] rounded p-1"
                            >
                              {store.users.map(u => <option key={u.id} value={u.id}>{u.name.split(" ")[0]}</option>)}
                            </select>
                            <input 
                              type="date"
                              value={newTaskDeadline}
                              onChange={(e) => setNewTaskDeadline(e.target.value)}
                              className="bg-neutral-950 text-neutral-300 border border-neutral-800 text-[10px] rounded p-1" 
                            />
                          </div>
                          <div className="flex justify-between items-center">
                            <div className="flex space-x-1">
                              {["low", "medium", "high"].map((p) => (
                                <button
                                  key={p}
                                  onClick={() => setNewTaskPriority(p as any)}
                                  className={`text-[9px] px-1.5 py-0.5 rounded border transition capitalize ${
                                    newTaskPriority === p 
                                      ? "bg-teal-500 text-black border-teal-500 font-bold" 
                                      : "bg-neutral-950 border-neutral-800 text-neutral-400"
                                  }`}
                                >
                                  {p === "high" ? "крит" : p === "medium" ? "средн" : "низк"}
                                </button>
                              ))}
                            </div>
                            <button 
                              onClick={() => {
                                if (!newTaskTitle.trim()) return;
                                const designatedUser = store.users.find(u => u.id === newTaskAssigneeId) || store.users[0];
                                store.createTask({
                                  chatId: activeChat.id,
                                  chatName: activeChat.name,
                                  title: newTaskTitle,
                                  assignee: designatedUser,
                                  deadline: newTaskDeadline,
                                  status: "pending",
                                  priority: newTaskPriority
                                });
                                setNewTaskTitle("");
                                addLog(`[SQLite Write] Scheduled new task for ${designatedUser.name}`, "db");
                              }}
                              className="bg-teal-500 hover:bg-teal-400 text-black font-semibold text-[10px] px-3 py-1 rounded transition"
                            >
                              Создать
                            </button>
                          </div>
                        </div>

                      </div>
                    )}

                    {/* 3. FILES / AI TAB SCREEN */}
                    {activeTab === "files" && (
                      <div className="flex-1 flex flex-col p-3 bg-neutral-950 font-sans">
                        
                        {/* Selector for app documents */}
                        <div className="mb-2.5">
                          <label className="text-[10px] font-bold text-neutral-400 uppercase tracking-wide block mb-1">Файл на локальном устройстве:</label>
                          <select
                            value={selectedDocId}
                            onChange={(e) => {
                              setSelectedDocId(e.target.value);
                              addLog(`[Local Storage] Loaded ${e.target.value} content into CPU register.`, "sys");
                            }}
                            className="w-full bg-neutral-900 text-white text-xs rounded-lg border border-neutral-800 p-2 focus:outline-none"
                          >
                            {store.documents.map((doc) => (
                              <option key={doc.id} value={doc.id}>
                                {doc.name} ({doc.size})
                              </option>
                            ))}
                          </select>
                        </div>

                        {/* Visual representations of active document */}
                        <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-3 mb-3 max-h-[140px] overflow-y-auto">
                          <div className="flex justify-between items-center border-b border-neutral-800 pb-1.5 mb-2">
                            <span className="text-[10px] text-teal-400 font-bold uppercase">Внутренний кэш документа:</span>
                            {selectedDoc.originalBackupContent && (
                              <button 
                                onClick={() => {
                                  store.restoreDocumentBackup(selectedDoc.id);
                                  addLog(`[Security/System] Recovered original state for ${selectedDoc.name}.`, "sys");
                                  alert("Оригинальная резервная копия восстановлена!");
                                }}
                                className="text-[9px] bg-red-500/10 hover:bg-red-500 text-red-200 px-1.5 rounded"
                              >
                                Откатить изменения (.bak)
                              </button>
                            )}
                          </div>
                          
                          <p className="text-[11px] text-neutral-300 font-mono whitespace-pre-wrap leading-relaxed select-text">
                            {selectedDoc.content}
                          </p>
                        </div>

                        {/* Interactive File Mutator Tool */}
                        <div className="p-2 bg-neutral-900 rounded-xl border border-neutral-800 space-y-2">
                          <div className="flex items-center space-x-1">
                            <Cpu className="w-3.5 h-3.5 text-teal-400 animate-pulse" />
                            <span className="text-[10px] uppercase font-bold text-teal-400">Локальный ИИ Мутатор документов</span>
                          </div>

                          <div className="space-y-1.5">
                            <input 
                              type="text"
                              value={editPrompt}
                              onChange={(e) => setEditPrompt(e.target.value)}
                              placeholder="Например: Поменяй ООО Ромашка на ООО Василёк..."
                              className="w-full bg-neutral-950 border border-neutral-800 text-[11px] text-neutral-200 placeholder-neutral-500 rounded p-1.5 focus:outline-none focus:border-teal-500/50" 
                            />
                            
                            <button
                              disabled={aiLoading}
                              onClick={handleModifyFileInApp}
                              className="w-full bg-teal-500 hover:bg-teal-400 disabled:opacity-50 text-neutral-950 font-bold text-[10px] py-1.5 rounded transition uppercase tracking-wider flex items-center justify-center space-x-1"
                            >
                              {aiLoading ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Edit className="w-3.5 h-3.5" />}
                              <span>Запустить Локальную замену в {selectedDoc.type.toUpperCase()}</span>
                            </button>
                          </div>
                        </div>

                        {/* Interactive Analysis (RAG) Block */}
                        <div className="mt-2.5 p-2 bg-neutral-900 rounded-xl border border-neutral-800 space-y-2">
                          <label className="text-[10px] font-bold text-neutral-400 flex items-center space-x-1">
                            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                            <span>Локальный RAG Анализ файлов (ExecuTorch)</span>
                          </label>

                          <div className="flex space-x-1.5">
                            <input 
                              type="text"
                              value={analysisPrompt}
                              onChange={(e) => setAnalysisPrompt(e.target.value)}
                              placeholder="Задать вопрос по документу..."
                              className="flex-1 bg-neutral-950 border border-neutral-800 text-[11px] text-neutral-200 placeholder-neutral-500 rounded px-2 py-1.5 focus:outline-none" 
                            />
                            <button
                              disabled={aiLoading}
                              onClick={handleAnalyzeFileInApp}
                              className="bg-neutral-800 hover:bg-neutral-700 text-teal-400 rounded-lg p-1.5 border border-neutral-700 transition"
                            >
                              <Play className="w-3.5 h-3.5" />
                            </button>
                          </div>

                          <div className="flex justify-end space-x-1.5 pt-1">
                            <button
                              onClick={() => {
                                // Add back to active chat
                                store.sendMessage(activeChat.id, `Проанализировал файл ${selectedDoc.name}:\n\n${aiResult || "Нет данных"}`);
                                addLog(`[AI Out] Analysis message published to chat stream.`, "sys");
                                alert("Результаты отправлены в текущий чат!");
                              }}
                              className="text-[9px] bg-neutral-800 hover:bg-neutral-700 text-neutral-300 px-2 py-1 rounded border border-neutral-700 flex items-center space-x-1"
                            >
                              <Share2 className="w-3 h-3 text-teal-400" />
                              <span>Отправить в чат</span>
                            </button>
                          </div>
                        </div>

                      </div>
                    )}

                    {/* 4. CALLS TAB SCREEN */}
                    {activeTab === "calls" && (
                      <div className="flex-1 flex flex-col p-3 bg-neutral-950 font-sans">
                        <span className="text-xs font-bold text-neutral-300 mb-2">Недавние WebRTC вызовы</span>
                        
                        <div className="flex-1 space-y-2 overflow-y-auto max-h-[160px]">
                          {store.callLogs.map((log) => (
                            <div key={log.id} className="p-2 bg-neutral-900 border border-neutral-800 rounded-xl flex items-center justify-between">
                              <div className="flex items-center space-x-2">
                                <img src={log.partner.avatar} className="w-8 h-8 rounded-full object-cover" />
                                <div>
                                  <p className="text-[11px] font-bold text-white">{log.partner.name}</p>
                                  <p className="text-[9px] text-neutral-400 flex items-center">
                                    {log.type === "incoming" && "Входящий • "}
                                    {log.type === "outgoing" && "Исходящий • "}
                                    {log.type === "missed" && <span className="text-red-400 mr-1">Пропущенный • </span>}
                                    {log.timestamp}
                                  </p>
                                </div>
                              </div>
                              <div className="flex items-center space-x-1.5">
                                {log.isVideo ? <Video className="w-3.5 h-3.5 text-neutral-400" /> : <Phone className="w-3.5 h-3.5 text-neutral-400" />}
                                <span className="text-[10px] font-mono text-neutral-400">{log.duration}</span>
                              </div>
                            </div>
                          ))}
                        </div>

                        {/* Dial User Quick Panel */}
                        <div className="mt-3 p-2 bg-neutral-900 border border-neutral-800 rounded-xl">
                          <p className="text-[10px] font-bold text-neutral-400 mb-2 uppercase">Набрать пользователя напрямую (P2P)</p>
                          <div className="flex items-center space-x-2">
                            <select
                              value={dialUser.id}
                              onChange={(e) => {
                                const found = store.users.find(u => u.id === e.target.value);
                                if (found) setDialUser(found);
                              }}
                              className="flex-1 bg-neutral-950 border border-neutral-800 text-[11px] text-neutral-200 rounded p-1"
                            >
                              {store.users.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
                            </select>
                            
                            <button
                              onClick={() => handleSimulateCallTrigger(dialUser, false)}
                              className="p-1.5 bg-neutral-800 hover:bg-neutral-700 rounded text-teal-400 border border-neutral-700"
                            >
                              <Phone className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleSimulateCallTrigger(dialUser, true)}
                              className="p-1.5 bg-neutral-800 hover:bg-neutral-700 rounded text-teal-400 border border-neutral-700"
                            >
                              <Video className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* 5. SECURITY TAB SCREEN */}
                    {activeTab === "security" && (
                      <div className="flex-1 flex flex-col p-3 bg-neutral-950 font-sans space-y-2.5">
                        
                        <div className="p-3 bg-neutral-900 border border-neutral-800 rounded-xl space-y-1.5">
                          <div className="flex justify-between items-center">
                            <span className="text-[11px] font-bold text-white">Шифрование SQLCipher</span>
                            <span className="text-[10px] bg-teal-500/15 text-teal-400 px-1.5 py-0.2 rounded font-mono border border-teal-500/10">AES-256</span>
                          </div>
                          <p className="text-[10px] text-neutral-400 leading-normal">
                            Все сообщения, файлы и задачи сохраняются в локальную базу данных, защищенную криптографическим ключом, полученным на основе вашего пин-кода.
                          </p>
                          <div className="flex items-center justify-between text-xs pt-1">
                            <span className="text-neutral-300">Состояние шифратора:</span>
                            <span className="text-teal-400 font-bold uppercase flex items-center space-x-1">
                              <Check className="w-3.5 h-3.5" />
                              <span>Crypto Active</span>
                            </span>
                          </div>
                        </div>

                        {/* App Passcode Configuration */}
                        <div className="p-3 bg-neutral-900 border border-neutral-800 rounded-xl space-y-2">
                          <p className="text-[11px] font-bold text-white">Авторизация & Биометрия</p>
                          
                          <div className="flex justify-between items-center text-xs">
                            <span className="text-neutral-300">Встроенный пин-код (1234)</span>
                            <button 
                              onClick={() => {
                                store.setPasscode("1234");
                                addLog("[Security Config] Set master pass sequence in Keychain.", "sys");
                                alert("Пин-код успешно обновлен на 1234!");
                              }}
                              className="text-[10px] bg-neutral-800 hover:bg-neutral-700 px-2 py-0.5 rounded text-teal-400 border border-neutral-700"
                            >
                              Сброс на 1234
                            </button>
                          </div>

                          <div className="flex items-center justify-between text-xs">
                            <span className="text-neutral-300">Включить Touch ID / Face ID</span>
                            <input 
                              type="checkbox" 
                              checked={store.security.useBiometrics}
                              onChange={(e) => {
                                store.toggleBiometrics(e.target.checked);
                                addLog(`[Biometric Trigger] FaceID sensor toggle set to: ${e.target.checked}`, "sys");
                              }}
                              className="accent-teal-500"
                            />
                          </div>
                        </div>

                        {/* Local Directory / Folder Storage mockup size */}
                        <div className="p-2.5 bg-neutral-900 border border-neutral-800 rounded-xl">
                          <label className="text-[9px] font-bold text-neutral-400 uppercase tracking-wider block mb-1">Защищенная папка приложения:</label>
                          <div className="grid grid-cols-2 gap-2 text-center text-[10px] font-mono">
                            <div className="bg-neutral-950 p-1.5 rounded border border-neutral-800">
                              <p className="text-neutral-400">SQLite DB</p>
                              <p className="text-white font-bold">142 KB</p>
                            </div>
                            <div className="bg-neutral-950 p-1.5 rounded border border-neutral-800">
                              <p className="text-neutral-400">Attachments</p>
                              <p className="text-white font-bold">6.1 MB</p>
                            </div>
                          </div>
                        </div>

                      </div>
                    )}

                  </div>

                  {/* SMARTPHONE SYSTEM BOTTOM TAB NAVIGATION BAR */}
                  <div className="bg-neutral-900 border-t border-neutral-800 px-3 py-2.5 flex justify-around items-center select-none font-sans">
                    <button 
                      onClick={() => setActiveTab("chats")}
                      className={`flex flex-col items-center space-y-1 ${activeTab === "chats" ? "text-teal-400" : "text-neutral-500 hover:text-neutral-300"}`}
                    >
                      <MessageSquare className="w-4 h-4" />
                      <span className="text-[9px] font-bold">Чат</span>
                    </button>
                    
                    <button 
                      onClick={() => setActiveTab("tasks")}
                      className={`flex flex-col items-center space-y-1 ${activeTab === "tasks" ? "text-teal-400" : "text-neutral-500 hover:text-neutral-300"}`}
                    >
                      <CheckSquare className="w-4 h-4" />
                      <span className="text-[9px] font-bold">Задачи</span>
                    </button>

                    <button 
                      onClick={() => setActiveTab("files")}
                      className={`flex flex-col items-center space-y-1 ${activeTab === "files" ? "text-teal-400" : "text-neutral-500 hover:text-neutral-300"}`}
                    >
                      <FileText className="w-4 h-4" />
                      <span className="text-[9px] font-bold">ИИ & Файлы</span>
                    </button>

                    <button 
                      onClick={() => setActiveTab("calls")}
                      className={`flex flex-col items-center space-y-1 ${activeTab === "calls" ? "text-teal-400" : "text-neutral-500 hover:text-neutral-300"}`}
                    >
                      <Phone className="w-4 h-4" />
                      <span className="text-[9px] font-bold">Звонки</span>
                    </button>

                    <button 
                      onClick={() => setActiveTab("security")}
                      className={`flex flex-col items-center space-y-1 ${activeTab === "security" ? "text-teal-400" : "text-neutral-500 hover:text-neutral-300"}`}
                    >
                      <Shield className="w-4 h-4" />
                      <span className="text-[9px] font-bold">Крипто</span>
                    </button>
                  </div>

                  {/* OVERLAY POPUPS: ACTIVE WEBRTC ACTIVE CALL DIALOG */}
                  {store.activeCall && (
                    <div className="absolute inset-0 bg-neutral-950/95 z-50 flex flex-col justify-between p-6 animate-fade-in font-sans">
                      <div className="flex flex-col items-center mt-8">
                        <span className="text-xs text-teal-400 border border-teal-500/20 bg-teal-500/10 px-3 py-1 rounded-full uppercase tracking-wider font-bold mb-6">
                          WebRTC {store.activeCall.isVideo ? "Видеовызов" : "Аудиовызов"}
                        </span>
                        <img 
                          src={store.activeCall.partner.avatar} 
                          alt={store.activeCall.partner.name}
                          className="w-24 h-24 rounded-full border-4 border-teal-500/40 object-cover shadow-2xl shadow-teal-500/10 animate-pulse" 
                        />
                        <h2 className="text-lg font-bold text-white mt-4">{store.activeCall.partner.name}</h2>
                        <p className="text-xs text-neutral-400 mt-1 uppercase tracking-widest">{store.activeCall.partner.role}</p>

                        <div className="mt-6 flex items-center space-x-2 text-xs bg-neutral-900 border border-neutral-800 px-4 py-1.5 rounded-full text-white">
                          <Activity className="w-3.5 h-3.5 text-teal-400 animate-spin" />
                          <span>Статус: {
                            store.activeCall.status === "ringing" ? "Гудки (P2P)..." :
                            store.activeCall.status === "connecting" ? "Авторизация WebRTC..." :
                            `Соединение установлено (${Math.floor(store.activeCall.duration / 60)}:${String(store.activeCall.duration % 60).padStart(2, "0")})`
                          }</span>
                        </div>
                      </div>

                      {/* Display video simulation placeholder if enabled */}
                      {store.activeCall.isVideoEnabled && store.activeCall.status === "active" && (
                        <div className="w-full aspect-video bg-neutral-900 border border-neutral-800 rounded-2xl relative overflow-hidden flex items-center justify-center">
                          <div className="absolute top-2 left-2 text-[8px] bg-black/60 px-2 py-0.5 rounded text-teal-400 font-mono">
                            Client Stream via react-native-webrtc
                          </div>
                          <video 
                            className="w-full h-full object-cover transform scale-x-[-1]" 
                            autoPlay 
                            muted 
                            playsInline 
                            ref={(el) => {
                              if (el && typeof navigator !== "undefined" && navigator.mediaDevices) {
                                navigator.mediaDevices.getUserMedia({ video: true }).then((stream) => {
                                  el.srcObject = stream;
                                }).catch(() => {});
                              }
                            }}
                          ></video>
                          <div className="absolute bottom-2 right-2 w-16 h-24 bg-neutral-800 rounded-lg border border-neutral-700 overflow-hidden">
                            <img src={store.currentUser.avatar} className="w-full h-full object-cover" />
                          </div>
                        </div>
                      )}

                      <div className="flex flex-col items-center space-y-6 mb-4">
                        <div className="flex justify-center space-x-6">
                          <button 
                            onClick={() => {
                              store.toggleCallMute();
                              addLog(`[Call Audio] Mute set to ${!store.activeCall?.isMuted}`, "sys");
                            }}
                            className={`p-4 rounded-full border transition-all ${
                              store.activeCall.isMuted 
                                ? "bg-red-500/20 border-red-500 text-red-400" 
                                : "bg-neutral-800 border-neutral-700 text-white hover:bg-neutral-700"
                            }`}
                          >
                            {store.activeCall.isMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
                          </button>

                          <button 
                            onClick={() => {
                              store.toggleCallVideo();
                              addLog(`[Call Video] Video enabled state toggled to ${!store.activeCall?.isVideoEnabled}`, "sys");
                            }}
                            className={`p-4 rounded-full border transition-all ${
                              !store.activeCall.isVideoEnabled 
                                ? "bg-red-500/20 border-red-500 text-red-400" 
                                : "bg-neutral-800 border-neutral-700 text-white hover:bg-neutral-700"
                            }`}
                          >
                            {store.activeCall.isVideoEnabled ? <Video className="w-5 h-5" /> : <VideoOff className="w-5 h-5" />}
                          </button>

                          <button 
                            onClick={() => {
                              store.endCall();
                              addLog("[Call WebRTC] Audio/Video call ended. Disconnected stream session.", "net");
                            }}
                            className="p-4 bg-red-500 hover:bg-red-400 text-black font-extrabold rounded-full transition-colors"
                          >
                            <Phone className="w-5 h-5 rotate-[135deg]" />
                          </button>
                        </div>

                        <div className="text-[10px] text-neutral-500 text-center font-mono max-w-[280px]">
                          Сигнальный сервер: render-freetier.com/webrtc-gateway<br />
                          Защита: P2P DTLS SRTP шифрование голосовых кадров.
                        </div>
                      </div>
                    </div>
                  )}

                  {/* INBOUND CALL OVERLAY MODAL */}
                  {store.incomingCall && (
                    <div className="absolute inset-0 bg-neutral-950/95 z-50 flex flex-col justify-between p-6 animate-pulse font-sans">
                      <div className="flex flex-col items-center mt-12">
                        <span className="text-xs text-amber-400 border border-amber-500/20 bg-amber-500/10 px-3 py-1 rounded-full uppercase tracking-wider font-bold mb-8">
                          ВХОДЯЩИЙ ЗВОНОК (WEBRTC)
                        </span>
                        <img 
                          src={store.incomingCall.partner.avatar} 
                          alt={store.incomingCall.partner.name}
                          className="w-24 h-24 rounded-full border-4 border-amber-400 object-cover shadow-2xl shadow-amber-500/10" 
                        />
                        <h2 className="text-lg font-bold text-white mt-4">{store.incomingCall.partner.name}</h2>
                        <p className="text-xs text-neutral-400 mt-1">{store.incomingCall.partner.role}</p>
                      </div>

                      <div className="flex flex-col items-center space-y-6 mb-8">
                        <div className="flex space-x-12">
                          <button 
                            onClick={() => {
                              store.endCall();
                              addLog("[Simulator] Inbound call rejected.", "sys");
                            }}
                            className="p-5 bg-red-500 hover:bg-red-400 text-black rounded-full shadow-lg transition-transform active:scale-90"
                          >
                            <Phone className="w-6 h-6 rotate-[135deg]" />
                          </button>

                          <button 
                            onClick={() => {
                              store.answerCall();
                              setActiveTab("calls");
                              addLog("[Call Answer] Initiated WebRTC PeerConnection session.", "net");
                            }}
                            className="p-5 bg-emerald-500 hover:bg-emerald-400 text-black rounded-full shadow-lg animate-bounce transition-transform active:scale-90"
                          >
                            <Phone className="w-6 h-6" />
                          </button>
                        </div>
                        <span className="text-xs text-neutral-400">Встроенный интерфейс expo-callkit-telecom</span>
                      </div>
                    </div>
                  )}

                </div>
              )}

            </div>

            {/* Simulated Phone Shell Home Bottom Line */}
            <div className="h-6 bg-neutral-900 border-t border-neutral-900 flex justify-center items-center pb-2">
              <div className="w-28 h-1 bg-neutral-700 rounded-full"></div>
            </div>

          </div>
        </div>

        {/* RIGHT COLUMN: DEVELOPER DASHBOARD & FILE EDITOR SPECS (7 COLS) */}
        <div className="lg:col-span-7 flex flex-col space-y-6">
          
          {/* Document Preview & Modify Panel */}
          <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6 shadow-xl relative overflow-hidden backdrop-blur-2xl">
            <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
              <FileText className="w-36 h-36 text-white" />
            </div>

            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center space-x-3">
                <div className="bg-amber-400/20 text-amber-300 p-2 rounded-xl border border-amber-500/25">
                  <FileSpreadsheet className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">Интерактивный Терминал Документов</h3>
                  <p className="text-xs text-neutral-400">Просмотр, редактирование и автогенерация по запросу</p>
                </div>
              </div>
              <span className="text-xs bg-neutral-800 text-teal-400 px-2.5 py-1 rounded-full font-mono border border-neutral-700">
                Local RAG & Docx/Xlsx Engine
              </span>
            </div>

            {/* Documents List & Content Workspace representation */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
              
              {/* Document directory */}
              <div className="md:col-span-4 space-y-1.5">
                <span className="text-[10px] font-bold text-neutral-500 uppercase tracking-wider block mb-1">Файловое хранилище</span>
                {store.documents.map((doc) => (
                  <button
                    key={doc.id}
                    onClick={() => {
                      setSelectedDocId(doc.id);
                      addLog(`[Local Storage] Loaded ${doc.name} content into Editor.`, "sys");
                    }}
                    className={`w-full p-2 rounded-lg text-left transition flex items-center justify-between border ${
                      selectedDocId === doc.id
                        ? "bg-teal-500/10 border-teal-500/30 text-teal-300"
                        : "bg-neutral-950/40 border-neutral-800 text-neutral-400 hover:bg-neutral-900"
                    }`}
                  >
                    <div className="flex items-center space-x-2 overflow-hidden">
                      {doc.type === "xlsx" ? (
                        <FileSpreadsheet className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                      ) : (
                        <FileText className="w-4 h-4 text-blue-400 flex-shrink-0" />
                      )}
                      <span className="text-xs font-medium truncate">{doc.name}</span>
                    </div>
                    <span className="text-[9px] text-neutral-500 flex-shrink-0">{doc.size}</span>
                  </button>
                ))}
              </div>

              {/* Live interactive document viewer */}
              <div className="md:col-span-8 bg-neutral-950 border border-neutral-800 rounded-xl p-4 flex flex-col min-h-[220px] justify-between">
                <div>
                  <div className="flex justify-between items-center border-b border-neutral-800 pb-2 mb-3">
                    <span className="text-xs text-white font-bold flex items-center space-x-1">
                      <Eye className="w-3.5 h-3.5 text-neutral-400" />
                      <span>{selectedDoc.name}</span>
                    </span>
                    <span className="text-[10px] text-neutral-500 font-mono">Добавлен: {selectedDoc.createdAt}</span>
                  </div>

                  <div className="text-xs text-neutral-300 font-mono max-h-[140px] overflow-y-auto whitespace-pre-line leading-relaxed bg-neutral-900/50 p-2.5 rounded-lg border border-neutral-900 select-text">
                    {selectedDoc.content}
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-neutral-900 flex justify-between items-center">
                  <button 
                    onClick={() => {
                      // Trigger normal simulated file explorer download
                      const blob = new Blob([selectedDoc.content], { type: "text/plain" });
                      const url = URL.createObjectURL(blob);
                      const a = document.createElement("a");
                      a.href = url;
                      a.download = selectedDoc.name;
                      a.click();
                      addLog(`[I/O Download] File exported to Host Operating System download directory: ${selectedDoc.name}`, "sys");
                    }}
                    className="text-xs bg-neutral-800 hover:bg-neutral-700 text-white px-3 py-1.5 rounded-lg transition border border-neutral-700 flex items-center space-x-1.5"
                  >
                    <ArrowDownToLine className="w-3.5 h-3.5 text-teal-400" />
                    <span>Скачать документ</span>
                  </button>

                  <button 
                    onClick={() => {
                      store.sendMessage(activeChat.id, `Отправляю файл: ${selectedDoc.name}`, [
                        {
                          id: selectedDoc.id,
                          name: selectedDoc.name,
                          type: selectedDoc.type,
                          size: selectedDoc.size,
                          localPath: `/app/secure/sandbox_storage/${selectedDoc.name}`,
                          contentSnapshot: selectedDoc.content
                        }
                      ]);
                      addLog(`[Sandbox Share] Exported file metadata attachment directly to active chat workspace.`, "net");
                      alert(`Файл ${selectedDoc.name} успешно отправлен в активный чат!`);
                    }}
                    className="text-xs bg-teal-500 hover:bg-teal-400 text-black font-semibold px-3 py-1.5 rounded-lg transition flex items-center space-x-1.5"
                  >
                    <Share2 className="w-3.5 h-3.5" />
                    <span>Отправить в Чат</span>
                  </button>
                </div>
              </div>

            </div>

            {/* Smart NLP Document Editor Sandbox instructions */}
            <div className="mt-4 bg-teal-500/5 border border-teal-500/15 p-3 rounded-lg flex items-start space-x-2.5">
              <Info className="w-4 h-4 text-teal-400 flex-shrink-0 mt-0.5" />
              <div className="text-xs text-neutral-300 leading-normal">
                <span className="font-bold text-teal-400">Инструкция ИИ-редактора:</span> Вы можете изменить содержание любого файла, открыв вкладку <span className="font-semibold text-white">«ИИ и Файлы»</span> в мобильном эмуляторе слева, написав команду на естественном языке (например, <span className="italic text-neutral-400">«Поменяй дату на 25 мая 2026 года»</span>) и нажав «Запустить». Наш фоновый бэкенд вызовет Gemini-3.5-flash, имитируя автономный ExecuTorch на мобильном.
              </div>
            </div>

          </div>

          {/* Device Terminal & Console logs */}
          <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6 shadow-xl flex-1 flex flex-col justify-between">
            <div>
              <div className="flex justify-between items-center border-b border-neutral-800 pb-3 mb-4">
                <div className="flex items-center space-x-2.5">
                  <Terminal className="w-5 h-5 text-teal-400" />
                  <div>
                    <h4 className="text-sm font-bold text-white">Console: TeamMate Pro Mobile Telemetry</h4>
                    <p className="text-[11px] text-neutral-400">Simulating on-device SQLite, Tesseract OCR, and WebRTC stack</p>
                  </div>
                </div>
                <button 
                  onClick={() => setLogs([])}
                  className="text-xs text-neutral-500 hover:text-neutral-300 transition"
                >
                  Очистить логи
                </button>
              </div>

              {/* Logs Stream Panel */}
              <div className="space-y-1.5 font-mono text-[10.5px] max-h-[190px] overflow-y-auto bg-neutral-950 p-4 rounded-xl border border-neutral-800 select-text">
                {logs.map((log) => (
                  <div key={log.id} className="flex items-start space-x-2.5 hover:bg-neutral-900/30 p-0.5 rounded transition">
                    <span className="text-neutral-500 flex-shrink-0">{log.time}</span>
                    <span className={`font-bold flex-shrink-0 uppercase text-[9px] px-1 rounded-sm ${
                      log.type === "sys" ? "bg-blue-500/10 text-blue-400" :
                      log.type === "ai" ? "bg-purple-500/10 text-purple-400" :
                      log.type === "db" ? "bg-amber-500/10 text-amber-400" :
                      "bg-emerald-500/10 text-emerald-400"
                    }`}>
                      {log.type}
                    </span>
                    <span className="text-neutral-300 leading-normal">{log.text}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-neutral-800/80 grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="flex items-center space-x-2.5 text-neutral-400">
                <Database className="w-4 h-4 text-teal-400" />
                <span>Защищенное хранилище: SQLCipher AES-256 активен</span>
              </div>
              <div className="flex items-center space-x-2.5 text-neutral-400">
                <Cpu className="w-4 h-4 text-purple-400" />
                <span>Локальный ИИ: ExecuTorch (TinyLlama-1.1B) загружен</span>
              </div>
            </div>

          </div>

        </div>

      </main>

      {/* Aesthetic Footer with summary triggers */}
      <footer className="border-t border-neutral-800 bg-neutral-900/40 py-5 px-6 text-center text-xs text-neutral-500 flex flex-col md:flex-row items-center justify-between gap-4">
        <div>
          © 2026 TeamMate Pro App Emulator. Все ИИ вызовы работают бесшовно на сервере, симулируя автономное мобильное устройство.
        </div>
        <div className="flex items-center space-x-3 text-[11px]">
          <span className="bg-neutral-800 px-2 py-1 rounded text-neutral-400 border border-neutral-700">Hermes JS Engine Only</span>
          <span className="bg-neutral-800 px-2 py-1 rounded text-neutral-400 border border-neutral-700">Expo SDK 52 Ready</span>
        </div>
      </footer>

    </div>
  );
}
