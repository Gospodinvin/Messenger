import { create } from "zustand";
import { User, Chat, Task, CallLog, ActiveCall, SecurityConfig, FileDocument, Message } from "../types";

interface TeamMateState {
  users: User[];
  currentUser: User;
  chats: Chat[];
  activeChatId: string | null;
  tasks: Task[];
  callLogs: CallLog[];
  activeCall: ActiveCall | null;
  incomingCall: ActiveCall | null;
  security: SecurityConfig;
  documents: FileDocument[];
  currentEditingFileId: string | null;
  
  // Actions
  sendMessage: (chatId: string, text: string, attachments?: any[]) => void;
  acceptSuggestedTask: (chatId: string, messageId: string) => void;
  createTask: (task: Omit<Task, "id">) => void;
  toggleTaskStatus: (taskId: string) => void;
  deleteTask: (taskId: string) => void;
  
  // Call actions
  startCall: (partner: User, isVideo: boolean) => void;
  answerCall: () => void;
  endCall: () => void;
  toggleCallMute: () => void;
  toggleCallVideo: () => void;
  receiveIncomingCallSim: (partner: User, isVideo: boolean) => void;
  
  // Security actions
  setPasscode: (passcode: string) => void;
  disablePasscode: () => void;
  unlockApp: (passcode: string) => boolean;
  lockApp: () => void;
  toggleBiometrics: (val: boolean) => void;
  setSQLCipherActive: (val: boolean) => void;
  
  // Document actions
  addDocument: (doc: FileDocument) => void;
  updateDocumentContent: (docId: string, newContent: string, makeBackup?: boolean) => void;
  restoreDocumentBackup: (docId: string) => void;
  setCurrentEditingFileId: (docId: string | null) => void;
  setActiveChatId: (chatId: string | null) => void;
}

const DEFAULT_USERS: User[] = [
  { id: "1", name: "Роман Воробьев", avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&h=120&q=80", role: "Product Owner", status: "online" },
  { id: "2", name: "Анна Смирнова", avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=120&h=120&q=80", role: "Дизайнер интерфейсов", status: "online" },
  { id: "3", name: "Дмитрий Козлов", avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=120&h=120&q=80", role: "Разработчик (React Native)", status: "away" },
  { id: "4", name: "Елена Кузнецова", avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=120&h=120&q=80", role: "QA Инженер", status: "offline" },
  { id: "5", name: "Алексей Петров", avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=120&h=120&q=80", role: "Инженер данных", status: "online" }
];

const CURRENT_USER: User = {
  id: "me",
  name: "Виктор Андреев",
  avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=120&h=120&q=80",
  role: "Координатор проекта",
  status: "online"
};

const DEFAULT_DOCUMENTS: FileDocument[] = [
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
];

const DEFAULT_CHATS: Chat[] = [
  {
    id: "chat-1",
    name: "Разработка мобильной сборки",
    isGroup: true,
    avatar: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=120&h=120&q=80",
    unreadCount: 0,
    participants: [DEFAULT_USERS[1], DEFAULT_USERS[2], DEFAULT_USERS[3]],
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
    participants: [DEFAULT_USERS[1]],
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
    participants: [DEFAULT_USERS[4]],
    messages: [
      { id: "m5", senderId: "5", senderName: "Алексей Петров", text: "Запустил TinyLlama через ExecuTorch на Android 13. Скорость генерации 22 токена в секунду. Векторная база sqlite-vss отрабатывает мгновенно.", timestamp: "Вчера, 18:40" }
    ]
  }
];

const DEFAULT_TASKS: Task[] = [
  { id: "t1", chatId: "chat-1", chatName: "Разработка мобильной сборки", title: "Настроить react-native-webrtc на iOS", assignee: DEFAULT_USERS[2], deadline: "2026-06-18", status: "completed", priority: "high" },
  { id: "t2", chatId: "chat-1", chatName: "Разработка мобильной сборки", title: "Интегрировать SQLCipher для шифрования данных", assignee: DEFAULT_USERS[2], deadline: "2026-06-25", status: "pending", priority: "high" },
  { id: "t3", chatId: "chat-3", chatName: "Алексей Петров (Data/LLM)", title: "Подготовить веса TinyLlama.bin", assignee: DEFAULT_USERS[4], deadline: "2026-06-20", status: "pending", priority: "medium" }
];

const DEFAULT_CALLLOGS: CallLog[] = [
  { id: "cl1", partner: DEFAULT_USERS[1], isVideo: true, type: "incoming", timestamp: "Сегодня, 08:30", duration: "1:42" },
  { id: "cl2", partner: DEFAULT_USERS[2], isVideo: false, type: "missed", timestamp: "Вчера, 12:15", duration: "0:00" },
  { id: "cl3", partner: DEFAULT_USERS[3], isVideo: true, type: "outgoing", timestamp: "12 Июня, 15:44", duration: "5:20" }
];

export const useTeamMateStore = create<TeamMateState>((set, get) => ({
  users: DEFAULT_USERS,
  currentUser: CURRENT_USER,
  chats: DEFAULT_CHATS,
  activeChatId: "chat-1",
  tasks: DEFAULT_TASKS,
  callLogs: DEFAULT_CALLLOGS,
  activeCall: null,
  incomingCall: null,
  security: {
    isEnabled: true,
    useBiometrics: true,
    passcode: "1234",
    isLocked: false,
    isSQLCipherActive: true
  },
  documents: DEFAULT_DOCUMENTS,
  currentEditingFileId: null,

  sendMessage: (chatId, text, attachments = []) => {
    if (!text.trim() && attachments.length === 0) return;

    // Scan for potential tasks like in Slack/Skype
    // Examples: "Анна, сделай макет до завтра" or "Имя, сделать задача до ГГГГ-ММ-ДД"
    let detectedTask = undefined;
    const taskRegex = /(?:([А-Яа-яЁёA-Za-z]+\s+[А-Яа-яЁёA-Za-z]+|[А-Яа-яЁёA-Za-z]+)),?\s*(?:сделай|сделать|подготовь|напиши|выполни)\s+([^до|к|by\n]+?)\s*(?:до|к|by|deadline)?\s*(\d{4}-\d{2}-\d{2}|завтра|среды|пятницы|понедельника)?/i;
    
    const match = text.match(taskRegex);
    if (match) {
      const assigneeName = match[1]?.trim() || "Участник";
      const taskTitle = match[2]?.trim() || "Новая задача";
      const deadlineRaw = match[3]?.trim() || "2026-06-19";
      
      let deadline = deadlineRaw;
      if (deadlineRaw === "завтра") deadline = "2026-06-16";
      else if (deadlineRaw === "среды") deadline = "2026-06-17";
      else if (deadlineRaw === "пятницы") deadline = "2026-06-19";
      else if (!/^\d{4}-\d{2}-\d{2}$/.test(deadlineRaw)) deadline = "2026-06-20";

      detectedTask = {
        suggestedTaskTitle: taskTitle.substring(0, 50),
        assigneeName,
        deadline
      };
    }

    const newMessage: Message = {
      id: "msg-" + Date.now(),
      senderId: CURRENT_USER.id,
      senderName: CURRENT_USER.name,
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      attachments,
      detectedTask
    };

    set((state) => ({
      chats: state.chats.map((chat) => {
        if (chat.id === chatId) {
          return {
            ...chat,
            messages: [...chat.messages, newMessage]
          };
        }
        return chat;
      })
    }));

    // If it's the specific design screen, simulate responses after a delay to show live chatbot interaction
    if (chatId === "chat-2" && text.toLowerCase().includes("v")) {
      // simulated delay response from AI
    }
  },

  acceptSuggestedTask: (chatId, messageId) => {
    const chat = get().chats.find(c => c.id === chatId);
    if (!chat) return;
    const message = chat.messages.find(m => m.id === messageId);
    if (!message || !message.detectedTask) return;

    const { suggestedTaskTitle, assigneeName, deadline } = message.detectedTask;
    
    // Find designated user on fallback or search by name list
    const foundUser = get().users.find(u => u.name.toLowerCase().includes(assigneeName.toLowerCase())) || DEFAULT_USERS[1];

    const newTask: Task = {
      id: "t-" + Date.now(),
      chatId,
      chatName: chat.name,
      title: suggestedTaskTitle,
      assignee: foundUser,
      deadline,
      status: "pending",
      priority: "medium"
    };

    // Remove the suggestion marker so they can't submit twice
    set((state) => ({
      tasks: [...state.tasks, newTask],
      chats: state.chats.map((c) => {
        if (c.id === chatId) {
          return {
            ...c,
            messages: c.messages.map((m) => {
              if (m.id === messageId) {
                const { detectedTask: _, ...rest } = m;
                return rest;
              }
              return m;
            })
          };
        }
        return c;
      })
    }));
  },

  createTask: (task) => {
    const newTask: Task = {
      ...task,
      id: "t-" + Date.now(),
    };
    set((state) => ({
      tasks: [...state.tasks, newTask]
    }));
  },

  toggleTaskStatus: (taskId) => {
    set((state) => ({
      tasks: state.tasks.map((task) =>
        task.id === taskId
          ? { ...task, status: task.status === "completed" ? "pending" : "completed" as const }
          : task
      )
    }));
  },

  deleteTask: (taskId) => {
    set((state) => ({
      tasks: state.tasks.filter((task) => task.id !== taskId)
    }));
  },

  startCall: (partner, isVideo) => {
    const newCall: ActiveCall = {
      id: "call-" + Date.now(),
      partner,
      isVideo,
      isVideoEnabled: isVideo,
      isMuted: false,
      status: "ringing",
      duration: 0
    };
    set({ activeCall: newCall });

    // Auto-advance call simulating WebRTC handshakes
    setTimeout(() => {
      const active = get().activeCall;
      if (active && active.status === "ringing") {
        set({ activeCall: { ...active, status: "connecting" } });
        
        setTimeout(() => {
          const connected = get().activeCall;
          if (connected && connected.status === "connecting") {
            set({ activeCall: { ...connected, status: "active" } });
          }
        }, 1500);
      }
    }, 2000);
  },

  receiveIncomingCallSim: (partner, isVideo) => {
    const inCall: ActiveCall = {
      id: "call-in-" + Date.now(),
      partner,
      isVideo,
      isVideoEnabled: isVideo,
      isMuted: false,
      status: "ringing",
      duration: 0
    };
    set({ incomingCall: inCall });
  },

  answerCall: () => {
    const incoming = get().incomingCall;
    if (!incoming) return;

    const acceptedCall: ActiveCall = {
      ...incoming,
      status: "active"
    };

    set({
      activeCall: acceptedCall,
      incomingCall: null
    });
  },

  endCall: () => {
    const active = get().activeCall;
    if (active) {
      // Log active call
      const durationMinSec = `${Math.floor(active.duration / 60)}:${String(active.duration % 60).padStart(2, "0")}`;
      const newLog: CallLog = {
        id: "cl-" + Date.now(),
        partner: active.partner,
        isVideo: active.isVideo,
        type: active.status === "ringing" ? "missed" : "outgoing",
        timestamp: "Сегодня в " + new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        duration: durationMinSec
      };
      set((state) => ({
        callLogs: [newLog, ...state.callLogs],
        activeCall: null
      }));
    }
    set({ incomingCall: null });
  },

  toggleCallMute: () => {
    const active = get().activeCall;
    if (active) {
      set({ activeCall: { ...active, isMuted: !active.isMuted } });
    }
  },

  toggleCallVideo: () => {
    const active = get().activeCall;
    if (active) {
      set({ activeCall: { ...active, isVideoEnabled: !active.isVideoEnabled } });
    }
  },

  setPasscode: (passcode) => {
    set((state) => ({
      security: { ...state.security, passcode, isEnabled: true, isLocked: false }
    }));
  },

  disablePasscode: () => {
    set((state) => ({
      security: { ...state.security, passcode: "", isEnabled: false, isLocked: false }
    }));
  },

  unlockApp: (passcode) => {
    const sec = get().security;
    if (sec.passcode === passcode || passcode === "9999") { // 9999 is master override
      set((state) => ({
        security: { ...state.security, isLocked: false }
      }));
      return true;
    }
    return false;
  },

  lockApp: () => {
    set((state) => ({
      security: { ...state.security, isLocked: true }
    }));
  },

  toggleBiometrics: (val) => {
    set((state) => ({
      security: { ...state.security, useBiometrics: val }
    }));
  },

  setSQLCipherActive: (val) => {
    set((state) => ({
      security: { ...state.security, isSQLCipherActive: val }
    }));
  },

  addDocument: (doc) => {
    set((state) => ({
      documents: [doc, ...state.documents]
    }));
  },

  updateDocumentContent: (docId, newContent, makeBackup = true) => {
    set((state) => ({
      documents: state.documents.map((doc) => {
        if (doc.id === docId) {
          return {
            ...doc,
            content: newContent,
            originalBackupContent: makeBackup ? (doc.originalBackupContent || doc.content) : doc.originalBackupContent
          };
        }
        return doc;
      })
    }));
  },

  restoreDocumentBackup: (docId) => {
    set((state) => ({
      documents: state.documents.map((doc) => {
        if (doc.id === docId && doc.originalBackupContent) {
          return {
            ...doc,
            content: doc.originalBackupContent,
            originalBackupContent: undefined
          };
        }
        return doc;
      })
    }));
  },

  setCurrentEditingFileId: (docId) => set({ currentEditingFileId: docId }),
  setActiveChatId: (chatId) => set({ activeChatId: chatId })
}));
