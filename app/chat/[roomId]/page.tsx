"use client";

import { useParams } from "next/navigation";
import { useEffect, useState, useRef } from "react";
import { ref, push, onValue, set, remove, onDisconnect, runTransaction } from "firebase/database";
import { db } from "../../lib/firebase";
import { v4 as uuid } from "uuid";

const CLIENT_ID_KEY = "mapuyap-client-id";
const LOUDSPEAKER_PAID_KEY = "loudspeaker-paid";

const getClientId = () => {
  if (typeof window === "undefined") return "";
  let clientId = localStorage.getItem(CLIENT_ID_KEY);
  if (!clientId) {
    clientId = uuid();
    localStorage.setItem(CLIENT_ID_KEY, clientId);
  }
  return clientId;
};

type Message = {
  id: string;
  user: string;
  department?: string;
  text: string;
  createdAt: number;
  replyToId?: string;
  replyToUser?: string;
  replyToText?: string;
  reactions?: Record<string, Record<string, boolean>>;
  isLoudspeaker?: boolean;
};

type PresenceUser = {
  name: string;
  department: string;
  status: string;
  roomId: string;
  updatedAt: number;
};

export default function RoomPage() {
  const params = useParams();
  const roomId = params.roomId as string;

  const [message, setMessage] = useState("");
  const [replyTo, setReplyTo] = useState<Message | null>(null);
  const [reactionMenuMessageId, setReactionMenuMessageId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const longPressTimer = useRef<number | null>(null);
  const [onlineUsers, setOnlineUsers] = useState(0);
  const [pickerPosition, setPickerPosition] = useState<{ x: number; y: number } | null>(null);
  const [name, setName] = useState("");
  const [department, setDepartment] = useState("");
  const [showLoudspeaker, setShowLoudspeaker] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [otherUserInfo, setOtherUserInfo] = useState<{ name: string; department: string }>({ name: "Waiting for someone...", department: "..." });
  const [loudspeakerPurchased, setLoudspeakerPurchased] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentCode, setPaymentCode] = useState("");

  // Load dark mode preference
  useEffect(() => {
    const savedMode = localStorage.getItem("darkMode");
    if (savedMode === "true") {
      setDarkMode(true);
    }
    const purchased = localStorage.getItem(LOUDSPEAKER_PAID_KEY);
    if (purchased === "true") {
      setLoudspeakerPurchased(true);
    }
  }, []);

  // Save dark mode preference
  useEffect(() => {
    localStorage.setItem("darkMode", darkMode.toString());
  }, [darkMode]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const storedName = localStorage.getItem("name") || "Anonymous";
      const storedDept = localStorage.getItem("department") || "Unknown";
      setName(storedName);
      setDepartment(storedDept);
    }
  }, []);

  const badWords = ["damn", "hell", "shit", "fuck", "bitch", "asshole"];
  const reactions = ["❤️", "👍", "😂", "😮", "😢", "😡"];

  const sanitizeMessage = (text: string) => {
    const regex = new RegExp(`\\b(${badWords.join("|")})\\b`, "gi");
    return text.replace(regex, (match) => "*".repeat(match.length));
  };

  const addReaction = async (messageId: string, reaction: string) => {
    const userId = getClientId();
    if (!userId) return;
    const reactionRef = ref(db, `rooms/${roomId}/messages/${messageId}/reactions/${reaction}/${userId}`);
    await runTransaction(reactionRef, (current) => {
      return current ? null : true;
    });
    closePicker();
  };

  const removeReaction = async (messageId: string, reaction: string) => {
    const userId = getClientId();
    if (!userId) return;
    const reactionRef = ref(db, `rooms/${roomId}/messages/${messageId}/reactions/${reaction}/${userId}`);
    await set(reactionRef, null);
  };

  const getReactionCounts = (msg: Message) => {
    const counts: Record<string, number> = {};
    const userReacted: Record<string, boolean> = {};
    const userId = getClientId();
    
    if (msg.reactions) {
      Object.entries(msg.reactions).forEach(([emoji, users]) => {
        if (typeof users === 'object' && users !== null) {
          counts[emoji] = Object.keys(users).length;
          if (userId && users[userId]) {
            userReacted[emoji] = true;
          }
        }
      });
    }
    return { counts, userReacted };
  };

  const startLongPress = (messageId: string, event: React.MouseEvent | React.TouchEvent) => {
    if (longPressTimer.current) {
      window.clearTimeout(longPressTimer.current);
    }
    longPressTimer.current = window.setTimeout(() => {
      let x = 0;
      let y = 0;
      if ('touches' in event) {
        x = event.touches[0].clientX;
        y = event.touches[0].clientY;
      } else {
        x = event.clientX;
        y = event.clientY;
      }
      
      const pickerWidth = 320;
      const pickerHeight = 80;
      let adjustedX = x;
      let adjustedY = y - 60;
      
      if (adjustedX - pickerWidth / 2 < 10) {
        adjustedX = pickerWidth / 2 + 10;
      }
      if (adjustedX + pickerWidth / 2 > window.innerWidth - 10) {
        adjustedX = window.innerWidth - pickerWidth / 2 - 10;
      }
      if (adjustedY - pickerHeight < 0) {
        adjustedY = y + 40;
      }
      
      setReactionMenuMessageId(messageId);
      setPickerPosition({ x: adjustedX, y: adjustedY });
    }, 500);
  };

  const cancelLongPress = () => {
    if (longPressTimer.current) {
      window.clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }
  };

  const closePicker = () => {
    setReactionMenuMessageId(null);
    setPickerPosition(null);
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    const messagesRef = ref(db, `rooms/${roomId}/messages`);

    const unsubscribe = onValue(messagesRef, (snapshot) => {
      const data = snapshot.val();

      if (!data) {
        setMessages([]);
        return;
      }

      const loaded = Object.entries(data).map(([id, value]) => ({
        id,
        ...(value as any),
      }));

      loaded.sort((a: any, b: any) => a.createdAt - b.createdAt);
      setMessages(loaded as Message[]);
      
      const otherUserMsg = loaded.find(msg => msg.user !== name);
      if (otherUserMsg && otherUserMsg.user && otherUserMsg.user !== otherUserInfo.name) {
        setOtherUserInfo({
          name: otherUserMsg.user,
          department: otherUserMsg.department || "Unknown"
        });
      }
    });

    return () => unsubscribe();
  }, [roomId, name]);

  useEffect(() => {
    if (!name) return;
    
    const presenceRef = ref(db, "presence");
    
    const unsubscribePresence = onValue(presenceRef, (snapshot) => {
      const presence = snapshot.val();
      if (!presence) return;
      
      const users = Object.entries(presence) as [string, PresenceUser][];
      const otherUser = users.find(([id, userData]) => 
        userData.roomId === roomId && userData.name !== name
      );
      
      if (otherUser) {
        const [_, userData] = otherUser;
        setOtherUserInfo({
          name: userData.name,
          department: userData.department || "Unknown"
        });
      }
    });
    
    return () => unsubscribePresence();
  }, [roomId, name]);

  useEffect(() => {
    if (!name || !department) return;
    
    const clientId = getClientId();
    if (!clientId) return;
    
    const presenceRef = ref(db, `presence/${clientId}`);

    const setPresence = async () => {
      await set(presenceRef, {
        name,
        department,
        status: "inRoom",
        roomId,
        updatedAt: Date.now(),
      });
      await onDisconnect(presenceRef).remove();
    };

    setPresence().catch(console.error);

    return () => {
      remove(presenceRef).catch(console.error);
    };
  }, [roomId, name, department]);

  useEffect(() => {
    const presenceRef = ref(db, "presence");

    const unsubscribePresence = onValue(presenceRef, (snapshot) => {
      const presence = snapshot.val();
      if (!presence) {
        setOnlineUsers(0);
        return;
      }

      const users = Object.entries(presence);
      setOnlineUsers(users.length);
    });

    return () => unsubscribePresence();
  }, []);

  const isMyMessage = (user: string) => user === name;

  const sendMessage = async () => {
    const trimmed = message.trim();
    if (!trimmed || !name || !department) {
      return;
    }

    if (showLoudspeaker && !loudspeakerPurchased) {
      setShowPaymentModal(true);
      return;
    }

    try {
      const messagesRef = ref(db, `rooms/${roomId}/messages`);
      const safeText = sanitizeMessage(trimmed);

      const messageData: any = {
        user: name,
        department: department,
        text: safeText,
        createdAt: Date.now(),
        reactions: {},
      };

      if (showLoudspeaker && loudspeakerPurchased) {
        messageData.isLoudspeaker = true;
      }

      if (replyTo) {
        messageData.replyToId = replyTo.id;
        messageData.replyToUser = replyTo.user;
        messageData.replyToText = sanitizeMessage(replyTo.text);
      }

      await push(messagesRef, messageData);

      setMessage("");
      setReplyTo(null);
      setShowLoudspeaker(false);
    } catch (error) {
      console.error("Error sending message:", error);
      alert("Failed to send message. Please try again.");
    }
  };

  const handlePaymentVerification = () => {
    if (paymentCode === "PAID123") {
      setLoudspeakerPurchased(true);
      localStorage.setItem(LOUDSPEAKER_PAID_KEY, "true");
      setShowPaymentModal(false);
      setPaymentCode("");
      alert("Payment verified! Loudspeaker feature is now unlocked for this session.");
    } else {
      alert("Invalid payment code. Please send ₱99 to GCash: 09123456789 and enter the code 'PAID123'");
    }
  };

  const nextStranger = () => {
    window.location.href = "/chat";
  };

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  const toggleLoudspeaker = () => {
    if (!loudspeakerPurchased) {
      setShowPaymentModal(true);
    } else {
      setShowLoudspeaker(!showLoudspeaker);
    }
  };

  return (
    <div className={`h-screen flex flex-col ${darkMode ? "bg-gray-900" : "bg-gray-50"}`}>
      {/* Header */}
      <header className={`${darkMode ? "bg-gradient-to-r from-red-800 to-red-900" : "bg-gradient-to-r from-red-600 to-red-700"} border-b-4 border-yellow-500 shadow-lg`}>
        <div className="px-4 py-3 flex items-center justify-between">
          <div className="flex-1"></div>
          <div className="text-center flex-1">
            <h1 className="text-xl font-bold text-white tracking-wide">MAPUYAP</h1>
            <p className="text-yellow-300 text-[10px]">Connect • Chat • Grow</p>
          </div>
          <div className="flex-1 flex justify-end">
            <button
              onClick={toggleDarkMode}
              className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 transition flex items-center justify-center"
            >
              {darkMode ? <span className="text-yellow-400 text-sm">☀️</span> : <span className="text-white text-sm">🌙</span>}
            </button>
          </div>
        </div>
      </header>

      {/* Chat Info Bar */}
      <div className={`${darkMode ? "bg-red-900/30 border-red-800" : "bg-red-50 border-red-200"} border-b px-4 py-3`}>
        <div className="text-center">
          <p className={`text-xs font-semibold tracking-wide ${darkMode ? "text-red-400" : "text-red-500"}`}>
            YOU ARE NOW CHATTING WITH
          </p>
          <p className={`text-base font-bold mt-0.5 ${darkMode ? "text-red-300" : "text-red-700"}`}>
            {otherUserInfo.name}
          </p>
          <p className={`text-xs mt-0.5 ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
            {otherUserInfo.department}
          </p>
          <div className="flex items-center justify-center gap-2 mt-2">
            <span className="inline-block w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
            <p className={`text-xs ${darkMode ? "text-gray-400" : "text-gray-500"}`}>Active now</p>
            <span className={`text-xs ${darkMode ? "text-gray-600" : "text-gray-300"}`}>•</span>
            <p className={`text-xs ${darkMode ? "text-gray-400" : "text-gray-500"}`}>👥 {onlineUsers} online</p>
          </div>
        </div>
      </div>

      {/* Loudspeaker Banner */}
      {showLoudspeaker && loudspeakerPurchased && (
        <div className={`${darkMode ? "bg-yellow-900/30 border-yellow-600" : "bg-yellow-50 border-yellow-400"} border-l-4 mx-4 mt-3 p-3 rounded shadow-sm`}>
          <div className="flex items-start gap-2">
            <span className="text-yellow-600 text-lg">📢</span>
            <div className="flex-1">
              <p className={`text-xs font-bold uppercase ${darkMode ? "text-yellow-400" : "text-yellow-700"}`}>Loudspeaker Mode Active</p>
              <p className={`text-xs ${darkMode ? "text-gray-400" : "text-gray-600"}`}>Your message will be highlighted and visible to everyone</p>
            </div>
            <button onClick={() => setShowLoudspeaker(false)} className={`${darkMode ? "text-gray-500 hover:text-gray-300" : "text-gray-400 hover:text-gray-600"}`}>✕</button>
          </div>
        </div>
      )}

      {/* Messages Container - Fixed bubble sizing */}
      <div className={`flex-1 overflow-y-auto px-4 py-4 space-y-4 ${darkMode ? "bg-gray-900" : "bg-gray-50"}`}>
        {messages.length === 0 ? (
          <div className="h-full flex items-center justify-center text-center py-12">
            <div className={darkMode ? "text-gray-600" : "text-gray-400"}>
              <div className="text-6xl mb-4">💬</div>
              <p className={`text-lg font-semibold ${darkMode ? "text-gray-500" : "text-gray-500"}`}>No messages yet</p>
              <p className={`text-sm mt-2 ${darkMode ? "text-gray-600" : "text-gray-400"}`}>Start the conversation!</p>
            </div>
          </div>
        ) : (
          messages.map((msg) => {
            const { counts: reactionCounts, userReacted } = getReactionCounts(msg);
            const hasReactions = Object.keys(reactionCounts).length > 0;
            const myMessage = isMyMessage(msg.user);
            const isLoudspeakerMsg = msg.isLoudspeaker;

            return (
              <div key={msg.id} className={`flex ${myMessage ? "justify-end" : "justify-start"}`}>
                <div className="flex flex-col max-w-[75%] md:max-w-[60%]">
                  {/* Sender name */}
                  {!myMessage && (
                    <p className={`text-xs font-semibold mb-1 ml-1 ${darkMode ? "text-red-400" : "text-red-600"}`}>
                      {msg.user}
                    </p>
                  )}
                  
                  {/* Message Bubble - Fixed sizing and containment */}
                  <div
                    className={`
                      inline-block rounded-2xl px-4 py-2.5
                      ${isLoudspeakerMsg
                        ? "bg-gradient-to-r from-yellow-500 to-yellow-600 text-white shadow-lg border-2 border-yellow-300"
                        : myMessage
                        ? darkMode
                          ? "bg-red-700 text-white rounded-br-md"
                          : "bg-red-500 text-white rounded-br-md"
                        : darkMode
                        ? "bg-gray-800 text-gray-200 rounded-bl-md border border-gray-700"
                        : "bg-white text-gray-800 rounded-bl-md shadow-sm border border-gray-200"
                      }
                    `}
                    style={{
                      wordBreak: "break-word",
                      overflowWrap: "break-word",
                      maxWidth: "100%",
                    }}
                    onMouseDown={(e) => !myMessage && startLongPress(msg.id, e)}
                    onTouchStart={(e) => !myMessage && startLongPress(msg.id, e)}
                    onMouseUp={cancelLongPress}
                    onMouseLeave={cancelLongPress}
                    onTouchEnd={cancelLongPress}
                    onTouchCancel={cancelLongPress}
                  >
                    {/* Loudspeaker indicator */}
                    {isLoudspeakerMsg && (
                      <div className="flex items-center gap-1 mb-1">
                        <span className="text-xs">📢</span>
                        <span className="text-[10px] font-bold uppercase">Loudspeaker</span>
                      </div>
                    )}
                    
                    {/* Reply Context */}
                    {msg.replyToUser && msg.replyToText && (
                      <div className={`mb-2 rounded-lg border-l-2 border-yellow-500 px-2 py-1 text-xs ${darkMode ? "bg-gray-700/50" : "bg-gray-100"}`}>
                        <span className={`font-semibold text-[10px] ${darkMode ? "text-yellow-400" : "text-yellow-600"}`}>
                          ↪️ {msg.replyToUser}
                        </span>
                        <p className={`${darkMode ? "text-gray-400" : "text-gray-500"} text-[10px] truncate mt-0.5`}>
                          {msg.replyToText}
                        </p>
                      </div>
                    )}
                    
                    {/* Message Text - Fixed width containment */}
                    <p className="text-sm leading-relaxed" style={{ wordBreak: "break-word", whiteSpace: "pre-wrap" }}>
                      {sanitizeMessage(msg.text)}
                    </p>
                    
                    {/* Reply button */}
                    {!myMessage && (
                      <div className="flex justify-end mt-1.5">
                        <button
                          onClick={() => setReplyTo(msg)}
                          className={`text-[10px] ${darkMode ? "text-gray-500 hover:text-yellow-400" : "text-gray-400 hover:text-yellow-600"} transition`}
                        >
                          ↩️ Reply
                        </button>
                      </div>
                    )}

                    {/* Reactions */}
                    {hasReactions && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {Object.entries(reactionCounts).map(([emoji, count]) => {
                          const hasReacted = userReacted[emoji];
                          return (
                            <button
                              key={emoji}
                              onClick={() => {
                                if (hasReacted) {
                                  removeReaction(msg.id, emoji);
                                } else {
                                  addReaction(msg.id, emoji);
                                }
                              }}
                              className={`inline-flex items-center gap-0.5 rounded-full px-1.5 py-0.5 text-xs transition-all duration-200 hover:scale-110 ${
                                hasReacted
                                  ? darkMode
                                    ? "bg-yellow-600/30 border border-yellow-500"
                                    : "bg-yellow-100 border border-yellow-400"
                                  : darkMode
                                  ? "bg-gray-700 hover:bg-gray-600"
                                  : "bg-gray-100 hover:bg-gray-200"
                              }`}
                            >
                              <span>{emoji}</span>
                              {count > 1 && <span className={darkMode ? "text-gray-400" : "text-gray-500"}>{count}</span>}
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Reaction Picker */}
      {reactionMenuMessageId && pickerPosition && (
        <>
          <div
            className="fixed z-50 animate-in fade-in zoom-in duration-200"
            style={{
              left: `${pickerPosition.x}px`,
              top: `${pickerPosition.y}px`,
              transform: 'translate(-50%, -50%)',
            }}
          >
            <div className={`flex gap-3 rounded-full p-3 shadow-2xl border-2 border-yellow-500 ${darkMode ? "bg-gray-900" : "bg-white"} backdrop-blur-lg`}>
              {reactions.map((reaction) => (
                <button
                  key={reaction}
                  onClick={(e) => {
                    e.stopPropagation();
                    addReaction(reactionMenuMessageId, reaction);
                  }}
                  className="text-3xl transition-all duration-150 hover:scale-125 active:scale-95 p-2 rounded-full hover:bg-yellow-500/20"
                >
                  {reaction}
                </button>
              ))}
            </div>
          </div>
          <div className="fixed inset-0 z-40" onClick={closePicker} onTouchEnd={closePicker} />
        </>
      )}

      {/* Payment Modal */}
      {showPaymentModal && (
        <>
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className={`rounded-2xl max-w-md w-full p-6 ${darkMode ? "bg-gray-800" : "bg-white"} shadow-2xl`}>
              <div className="text-center mb-4">
                <div className="text-5xl mb-3">📢</div>
                <h2 className={`text-xl font-bold ${darkMode ? "text-white" : "text-gray-800"}`}>Unlock Loudspeaker Feature</h2>
                <p className={`text-sm mt-2 ${darkMode ? "text-gray-400" : "text-gray-600"}`}>
                  Send messages that stand out and reach everyone!
                </p>
              </div>
              
              <div className={`p-4 rounded-lg mb-4 ${darkMode ? "bg-yellow-900/30" : "bg-yellow-50"} border border-yellow-300`}>
                <p className={`text-sm font-semibold ${darkMode ? "text-yellow-400" : "text-yellow-700"}`}>💰 Payment Details:</p>
                <p className={`text-sm mt-1 ${darkMode ? "text-gray-300" : "text-gray-700"}`}>
                  GCash Number: <span className="font-mono font-bold">0912 3456 789</span>
                </p>
                <p className={`text-sm ${darkMode ? "text-gray-300" : "text-gray-700"}`}>
                  Amount: <span className="font-bold text-green-600">₱99.00</span>
                </p>
                <p className={`text-xs mt-2 ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
                  Send payment and enter the verification code below.
                </p>
              </div>
              
              <div className="mb-4">
                <label className={`block text-sm font-medium mb-2 ${darkMode ? "text-gray-300" : "text-gray-700"}`}>
                  Verification Code
                </label>
                <input
                  type="text"
                  value={paymentCode}
                  onChange={(e) => setPaymentCode(e.target.value)}
                  placeholder="Enter code from receipt"
                  className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 ${
                    darkMode ? "bg-gray-700 border-gray-600 text-white" : "bg-white border-gray-300 text-gray-900"
                  }`}
                />
                <p className={`text-xs mt-1 ${darkMode ? "text-gray-500" : "text-gray-400"}`}>
                  Demo code: <span className="font-mono font-bold">PAID123</span>
                </p>
              </div>
              
              <div className="flex gap-3">
                <button
                  onClick={() => setShowPaymentModal(false)}
                  className={`flex-1 px-4 py-2 rounded-lg font-semibold transition ${
                    darkMode ? "bg-gray-700 text-gray-300 hover:bg-gray-600" : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                  }`}
                >
                  Cancel
                </button>
                <button
                  onClick={handlePaymentVerification}
                  className="flex-1 px-4 py-2 rounded-lg font-semibold transition bg-gradient-to-r from-yellow-500 to-yellow-600 text-white hover:from-yellow-600 hover:to-yellow-700"
                >
                  Verify Payment
                </button>
              </div>
            </div>
          </div>
          <div className="fixed inset-0 bg-black/50 z-40" onClick={() => setShowPaymentModal(false)} />
        </>
      )}

      {/* Input Area */}
      <div className={`border-t-2 ${darkMode ? "border-yellow-800 bg-gray-900" : "border-gray-200 bg-white"} px-4 py-3 shadow-lg`}>
        {replyTo && (
          <div className={`mb-2 flex items-center justify-between rounded-lg border px-3 py-1.5 text-xs ${darkMode ? "border-yellow-700 bg-yellow-900/20 text-gray-300" : "border-yellow-300 bg-yellow-50 text-gray-700"}`}>
            <div className="truncate">
              <span className={darkMode ? "text-gray-400" : "text-gray-500"}>Replying to</span>{" "}
              <span className="text-red-500 font-bold">{replyTo.user}</span>
            </div>
            <button onClick={() => setReplyTo(null)} className="text-red-500 text-sm px-2 hover:text-red-700">✕</button>
          </div>
        )}

        <div className="flex gap-2 flex-wrap sm:flex-nowrap">
          <div className="flex gap-2 order-2 sm:order-1">
            <button
              onClick={toggleLoudspeaker}
              className={`px-3 py-2 rounded-full text-xs font-semibold transition whitespace-nowrap ${
                showLoudspeaker && loudspeakerPurchased
                  ? "bg-yellow-500 text-white"
                  : loudspeakerPurchased
                  ? darkMode
                    ? "bg-gray-800 text-gray-300 border border-gray-700 hover:bg-yellow-900/30"
                    : "bg-gray-100 text-gray-600 border border-gray-200 hover:bg-yellow-50"
                  : darkMode
                  ? "bg-gray-800 text-gray-500 border border-gray-700 cursor-not-allowed"
                  : "bg-gray-100 text-gray-400 border border-gray-200 cursor-not-allowed"
              }`}
              disabled={!loudspeakerPurchased}
            >
              📢 Loudspeaker {!loudspeakerPurchased && "🔒"}
            </button>

            <button
              onClick={nextStranger}
              className={`px-3 py-2 rounded-full text-xs font-semibold transition whitespace-nowrap ${
                darkMode
                  ? "bg-gray-800 text-gray-300 border border-gray-700 hover:bg-red-900/30"
                  : "bg-gray-100 text-gray-600 border border-gray-200 hover:bg-red-50"
              }`}
            >
              → Next
            </button>

            <button
              onClick={() => (window.location.href = "/")}
              className={`px-3 py-2 rounded-full text-xs font-semibold transition whitespace-nowrap ${
                darkMode
                  ? "bg-gray-800 text-gray-300 border border-gray-700 hover:bg-red-900/30"
                  : "bg-gray-100 text-gray-600 border border-gray-200 hover:bg-red-50"
              }`}
            >
              ✕ End
            </button>
          </div>

          <div className="flex-1 relative order-1 sm:order-2">
            <input
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  sendMessage();
                }
              }}
              placeholder="Say something..."
              className={`w-full px-4 py-2 border rounded-full focus:outline-none focus:ring-1 text-sm ${
                darkMode
                  ? "bg-gray-800 border-gray-700 text-white placeholder-gray-500 focus:border-red-500 focus:ring-red-500"
                  : "bg-white border-gray-300 text-gray-900 placeholder-gray-400 focus:border-red-500 focus:ring-red-500"
              }`}
            />
          </div>

          <button
            onClick={sendMessage}
            className={`px-6 py-2 rounded-full font-semibold text-sm transition shadow-md active:scale-95 whitespace-nowrap order-3 ${
              darkMode
                ? "bg-gradient-to-r from-red-700 to-red-800 text-white hover:from-red-800 hover:to-red-900"
                : "bg-gradient-to-r from-red-500 to-red-600 text-white hover:from-red-600 hover:to-red-700"
            }`}
          >
            Send
          </button>
        </div>
      </div>

      <style jsx>{`
        @keyframes fade-in {
          from { opacity: 0; transform: scale(0.9); }
          to { opacity: 1; transform: scale(1); }
        }
        @keyframes zoom-in {
          from { transform: scale(0.8); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }
        .animate-in {
          animation: fade-in 0.2s ease-out, zoom-in 0.15s ease-out;
        }
      `}</style>
    </div>
  );
}