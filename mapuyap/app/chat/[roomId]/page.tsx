"use client";

import { useParams } from "next/navigation";
import { useEffect, useState, useRef } from "react";
import { ref, push, onValue, set, remove, onDisconnect, runTransaction } from "firebase/database";
import { db } from "../../lib/firebase";
import { v4 as uuid } from "uuid";

const CLIENT_ID_KEY = "mapuyap-client-id";

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
  const [darkMode, setDarkMode] = useState(false);
  const [otherUserInfo, setOtherUserInfo] = useState<{ name: string; department: string }>({ name: "Waiting for someone...", department: "..." });
  
  const [isChatEnded, setIsChatEnded] = useState(false);
  const [isOtherUserTyping, setIsOtherUserTyping] = useState(false);
  const typingTimeoutRef = useRef<number | null>(null);

  // Load configuration preferences
  useEffect(() => {
    const savedMode = localStorage.getItem("darkMode");
    if (savedMode === "true") {
      setDarkMode(true);
    }
  }, []);

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

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  // Sync personal typing status to Firebase
  const handleInputChange = (val: string) => {
    setMessage(val);
    if (isChatEnded) return;

    const clientId = getClientId();
    if (!clientId) return;

    const myTypingRef = ref(db, `rooms/${roomId}/typing/${clientId}`);
    
    if (val.trim().length > 0) {
      set(myTypingRef, { name, isTyping: true });
      onDisconnect(myTypingRef).remove();

      if (typingTimeoutRef.current) window.clearTimeout(typingTimeoutRef.current);
      
      typingTimeoutRef.current = window.setTimeout(() => {
        remove(myTypingRef);
      }, 2000);
    } else {
      remove(myTypingRef);
    }
  };

  // Listen for other typing states
  useEffect(() => {
    const typingRef = ref(db, `rooms/${roomId}/typing`);
    const clientId = getClientId();

    const unsubscribe = onValue(typingRef, (snapshot) => {
      const data = snapshot.val();
      if (!data) {
        setIsOtherUserTyping(false);
        return;
      }

      const typingUsers = Object.entries(data).filter(([id]) => id !== clientId);
      setIsOtherUserTyping(typingUsers.length > 0);
    });

    return () => unsubscribe();
  }, [roomId]);

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
  }, [messages, isOtherUserTyping]);

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
  }, [roomId, name, otherUserInfo.name]);

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
    if (!name || !department || isChatEnded) return;
    
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
  }, [roomId, name, department, isChatEnded]);

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
    if (!trimmed || !name || !department || isChatEnded) {
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

      if (replyTo) {
        messageData.replyToId = replyTo.id;
        messageData.replyToUser = replyTo.user;
        messageData.replyToText = sanitizeMessage(replyTo.text);
      }

      await push(messagesRef, messageData);
      
      // Clear typing presence flags explicitly on dispatch
      const clientId = getClientId();
      if (clientId) {
        remove(ref(db, `rooms/${roomId}/typing/${clientId}`));
      }

      setMessage("");
      setReplyTo(null);
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  const handleEndChat = async () => {
    setIsChatEnded(true);
    setReplyTo(null);
    setMessage("");
    setOtherUserInfo({ name: "Chat Ended", department: "Disconnected" });
    
    const clientId = getClientId();
    if (clientId) {
      try {
        await remove(ref(db, `presence/${clientId}`));
        await remove(ref(db, `rooms/${roomId}/typing/${clientId}`));
      } catch (e) {
        console.error("Error clearing state structures:", e);
      }
    }
  };

  const handleNextChat = () => {
    setMessages([]);
    setIsChatEnded(false);
    setOtherUserInfo({ name: "Waiting for someone...", department: "..." });
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
            {isChatEnded ? "SESSION CLOSED" : "YOU ARE NOW CHATTING WITH"}
          </p>
          <p className={`text-base font-bold mt-0.5 ${darkMode ? "text-red-300" : "text-red-700"}`}>
            {otherUserInfo.name}
          </p>
          <p className={`text-xs mt-0.5 ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
            {otherUserInfo.department}
          </p>
          {!isChatEnded && (
            <div className="flex items-center justify-center gap-2 mt-2">
              <span className="inline-block w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
              <p className={`text-xs ${darkMode ? "text-gray-400" : "text-gray-500"}`}>Active now</p>
              <span className={`text-xs ${darkMode ? "text-gray-600" : "text-gray-300"}`}>•</span>
              <p className={`text-xs ${darkMode ? "text-gray-400" : "text-gray-500"}`}>👥 {onlineUsers} online</p>
            </div>
          )}
        </div>
      </div>

      {/* Messages Container */}
      <div className={`flex-1 overflow-y-auto px-4 py-4 space-y-6 ${darkMode ? "bg-gray-900" : "bg-gray-50"}`}>
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

            return (
              <div key={msg.id} className={`flex flex-col msg-animate-pop ${myMessage ? "items-end" : "items-start"}`}>
                <p className={`text-xs font-bold mb-1 mx-2 uppercase tracking-wider ${
                  myMessage 
                    ? darkMode ? "text-gray-400" : "text-gray-500"
                    : darkMode ? "text-red-400" : "text-red-600"
                }`}>
                  {msg.user}
                </p>
                
                <div className={`flex w-full ${myMessage ? "justify-end" : "justify-start"}`}>
                  <div
                    className={`
                      inline-flex flex-col rounded-2xl px-5 py-3.5 shadow-sm max-w-[85%] sm:max-w-[70%] text-left
                      ${myMessage
                        ? darkMode
                          ? "bg-red-700 text-white rounded-tr-none"
                          : "bg-red-500 text-white rounded-tr-none"
                        : darkMode
                        ? "bg-gray-800 text-gray-100 rounded-tl-none border border-gray-700"
                        : "bg-white text-gray-800 rounded-tl-none border border-gray-200"
                      }
                    `}
                    onMouseDown={(e) => !myMessage && !isChatEnded && startLongPress(msg.id, e)}
                    onTouchStart={(e) => !myMessage && !isChatEnded && startLongPress(msg.id, e)}
                    onMouseUp={cancelLongPress}
                    onMouseLeave={cancelLongPress}
                    onTouchEnd={cancelLongPress}
                    onTouchCancel={cancelLongPress}
                  >
                    {msg.replyToUser && msg.replyToText && (
                      <div className={`mb-3 rounded-xl border-l-4 border-yellow-500 px-3 py-2 text-xs w-full overflow-hidden text-left ${
                        darkMode ? "bg-gray-900/60 text-gray-300" : "bg-gray-100/80 text-gray-700"
                      }`}>
                        <div className="flex items-center gap-1 font-bold text-[11px] mb-0.5 text-yellow-600">
                          <span>↪️</span>
                          <span>{msg.replyToUser}</span>
                        </div>
                        <p className="italic line-clamp-2 text-ellipsis break-words">
                          {msg.replyToText}
                        </p>
                      </div>
                    )}
                    
                    <div className="text-base font-normal leading-relaxed break-words whitespace-pre-wrap">
                      {sanitizeMessage(msg.text)}
                    </div>
                    
                    {!myMessage && !isChatEnded && (
                      <div className="flex justify-end mt-2 border-t border-gray-100/10 pt-1.5">
                        <button
                          onClick={() => setReplyTo(msg)}
                          className={`text-xs font-medium inline-flex items-center gap-1 py-0.5 px-2 rounded-md transition ${
                            darkMode 
                              ? "text-gray-400 hover:bg-gray-700 hover:text-yellow-400" 
                              : "text-gray-500 hover:bg-gray-100 hover:text-yellow-600"
                          }`}
                        >
                          <span>↪️</span> Reply
                        </button>
                      </div>
                    )}

                    {hasReactions && (
                      <div className="flex flex-wrap gap-1.5 mt-3 pt-2 border-t border-gray-400/10 w-full justify-start">
                        {Object.entries(reactionCounts).map(([emoji, count]) => {
                          const hasReacted = userReacted[emoji];
                          return (
                            <button
                              key={emoji}
                              onClick={() => {
                                if (isChatEnded) return;
                                if (hasReacted) {
                                  removeReaction(msg.id, emoji);
                                } else {
                                  addReaction(msg.id, emoji);
                                }
                              }}
                              className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-sm font-semibold transition-all duration-200 ${
                                isChatEnded ? "cursor-default" : "hover:scale-105 active:scale-95"
                              } ${
                                hasReacted
                                  ? darkMode
                                    ? "bg-yellow-500/20 border border-yellow-500 text-yellow-300"
                                    : "bg-yellow-100 border border-yellow-400 text-yellow-800"
                                  : darkMode
                                  ? "bg-gray-700 border border-transparent text-gray-200 hover:bg-gray-600"
                                  : "bg-gray-100 border border-transparent text-gray-700 hover:bg-gray-200"
                              }`}
                            >
                              <span>{emoji}</span>
                              {count > 1 && <span className="text-xs opacity-90">{count}</span>}
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

        {/* Typing Presence Indicator Block */}
        {isOtherUserTyping && !isChatEnded && (
          <div className="flex flex-col items-start msg-animate-pop">
            <p className={`text-xs font-bold mb-1 mx-2 uppercase tracking-wider ${darkMode ? "text-red-400" : "text-red-600"}`}>
              {otherUserInfo.name}
            </p>
            <div className={`inline-flex items-center rounded-2xl px-5 py-3.5 shadow-sm rounded-tl-none border ${
              darkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"
            }`}>
              <div className="flex items-center gap-1.5 py-1">
                <span className={`w-2 h-2 rounded-full dot-typing-anim ${darkMode ? "bg-gray-400" : "bg-gray-500"}`}></span>
                <span className={`w-2 h-2 rounded-full dot-typing-anim delay-150 ${darkMode ? "bg-gray-400" : "bg-gray-500"}`}></span>
                <span className={`w-2 h-2 rounded-full dot-typing-anim delay-300 ${darkMode ? "bg-gray-400" : "bg-gray-500"}`}></span>
              </div>
            </div>
          </div>
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

      {/* Control Actions & Input Footer Bar */}
      <div className={`border-t-2 ${darkMode ? "border-gray-800 bg-gray-900" : "border-gray-100 bg-white"} px-4 py-4 shadow-xl flex flex-col`}>
        <div className="px-1 py-1 flex flex-col gap-3">
          {replyTo && (
            <div className={`flex items-center justify-between rounded-xl border px-4 py-2 text-xs ${darkMode ? "border-yellow-700 bg-yellow-900/20 text-gray-300" : "border-yellow-300 bg-yellow-50 text-gray-700"}`}>
              <div className="truncate">
                <span className={darkMode ? "text-gray-400" : "text-gray-500"}>Replying to</span>{" "}
                <span className="text-red-500 font-bold">{replyTo.user}</span>
              </div>
              <button onClick={() => setReplyTo(null)} className="text-red-500 text-sm px-2 hover:text-red-700">✕</button>
            </div>
          )}

          <div className="flex gap-3 items-center w-full">
            {!isChatEnded ? (
              <button
                onClick={handleEndChat}
                className={`h-[54px] min-w-[95px] px-5 rounded-2xl text-base font-bold transition-all duration-150 active:scale-95 flex items-center justify-center tracking-wide shadow-sm ${
                  darkMode 
                    ? "bg-red-800 text-white hover:bg-red-700 border border-red-700" 
                    : "bg-red-600 text-white hover:bg-red-700 border border-red-600"
                }`}
              >
                End
              </button>
            ) : (
              <button
                onClick={handleNextChat}
                className={`h-[54px] min-w-[95px] px-5 rounded-2xl text-base font-bold transition-all duration-150 active:scale-95 flex items-center justify-center tracking-wide shadow-sm ${
                  darkMode 
                    ? "bg-gray-700 text-white hover:bg-gray-600 border border-gray-600" 
                    : "bg-gray-200 text-gray-800 hover:bg-gray-300 border border-gray-300"
                }`}
              >
                Next
              </button>
            )}

            <div className="flex-1">
              <input
                value={message}
                disabled={isChatEnded}
                onChange={(e) => handleInputChange(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    sendMessage();
                  }
                }}
                placeholder={isChatEnded ? "This chat has ended." : "Say something"}
                className={`w-full h-[54px] px-5 border-2 rounded-2xl focus:outline-none text-lg font-medium transition-all ${
                  isChatEnded
                    ? "bg-gray-100 border-gray-200 text-gray-400 cursor-not-allowed placeholder-gray-400"
                    : darkMode
                    ? "bg-gray-800 border-gray-700 text-white placeholder-gray-500 focus:border-gray-500 focus:ring-1 focus:ring-gray-500"
                    : "bg-white border-gray-300 text-gray-800 placeholder-gray-400 focus:border-gray-400 focus:ring-1 focus:ring-gray-400"
                }`}
              />
            </div>

            <button
              onClick={sendMessage}
              disabled={!message.trim() || isChatEnded}
              className={`h-[54px] px-7 rounded-2xl font-bold text-base transition-all duration-150 active:scale-95 flex items-center justify-center tracking-wide shadow-sm ${
                !message.trim() || isChatEnded
                  ? "bg-gray-100 text-gray-400 border border-gray-200 cursor-not-allowed"
                  : darkMode
                  ? "bg-blue-600 text-white hover:bg-blue-500 border border-blue-500"
                  : "bg-blue-500 text-white hover:bg-blue-600 border border-blue-500"
              }`}
            >
              Send
            </button>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes fade-in {
          from { opacity: 0; transform: scale(0.98); }
          to { opacity: 1; transform: scale(1); }
        }
        @keyframes zoom-in {
          from { transform: scale(0.95); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }
        @keyframes msg-pop {
          from { opacity: 0; transform: translateY(10px) scale(0.98); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes dot-bounce {
          0%, 100% { transform: translateY(0); opacity: 0.4; }
          50% { transform: translateY(-5px); opacity: 1; }
        }
        .animate-in {
          animation: fade-in 0.15s ease-out, zoom-in 0.1s ease-out;
        }
        .msg-animate-pop {
          animation: msg-pop 0.25s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        .dot-typing-anim {
          animation: dot-bounce 1.2s infinite ease-in-out;
        }
        .delay-150 {
          animation-delay: 0.15s;
        }
        .delay-300 {
          animation-delay: 0.3s;
        }
      `}</style>
    </div>
  );
}