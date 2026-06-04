"use client";

import { useParams } from "next/navigation";
import { useEffect, useState, useRef } from "react";
import { ref, push, onValue, get, set, remove, onDisconnect, runTransaction } from "firebase/database";
import { db } from "../../lib/firebase";
import { v4 as uuid } from "uuid";

const CLIENT_ID_KEY = "mapuyap-client-id";

const getClientId = () => {
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

export default function RoomPage() {
  const params = useParams();
  const roomId = params.roomId as string;

  const [message, setMessage] = useState("");
  const [replyTo, setReplyTo] = useState<Message | null>(null);
  const [hoveredMessageId, setHoveredMessageId] = useState<string | null>(null);
  const [reactionMenuMessageId, setReactionMenuMessageId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [presenceUsers, setPresenceUsers] = useState<Array<{clientId: string; name: string; department: string; status: string; roomId?: string;}>>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const longPressTimer = useRef<number | null>(null);
  const [onlineUsers, setOnlineUsers] = useState(0);
  const [pickerPosition, setPickerPosition] = useState<{ x: number; y: number } | null>(null);
  const pickerRef = useRef<HTMLDivElement>(null);

  const [name] = useState(() =>
    typeof window !== "undefined"
      ? localStorage.getItem("name") || "Anonymous"
      : "Anonymous"
  );

  const [department] = useState(() =>
    typeof window !== "undefined"
      ? localStorage.getItem("department") || "Unknown"
      : "Unknown"
  );

  const badWords = [
    "damn",
    "hell",
    "shit",
    "fuck",
    "bitch",
    "asshole",
  ];

  const reactions = ["❤️", "👍", "�", "😮", "😢", "😡"];

  const sanitizeMessage = (text: string) => {
    const regex = new RegExp(`\\b(${badWords.join("|")})\\b`, "gi");
    return text.replace(regex, (match) => "*".repeat(match.length));
  };

  const addReaction = async (messageId: string, reaction: string) => {
    const userId = getClientId();
    const reactionRef = ref(db, `rooms/${roomId}/messages/${messageId}/reactions/${reaction}/${userId}`);
    await runTransaction(reactionRef, (current) => {
      return current ? null : true;
    });
    closePicker();
  };

  const getReactionCounts = (msg: Message) => {
    const counts: Record<string, number> = {};
    if (msg.reactions) {
      Object.entries(msg.reactions).forEach(([emoji, users]) => {
        if (typeof users === 'object' && users !== null) {
          counts[emoji] = Object.keys(users).length;
        }
      });
    }
    return counts;
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
      setReactionMenuMessageId(messageId);
      setPickerPosition({ x, y });
    }, 600);
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

      setMessages(loaded as Message[]);
    });

    return () => unsubscribe();
  }, [roomId]);

  useEffect(() => {
    const clientId = getClientId();
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
        setPresenceUsers([]);
        setOnlineUsers(0);
        return;
      }

      const users = Object.entries(presence).map(
        ([clientId, value]) => ({
          clientId,
          ...(value as any),
        })
      );

      setPresenceUsers(users as Array<{clientId: string; name: string; department: string; status: string; roomId?: string;}>);
      setOnlineUsers(users.length);
    });

    return () => unsubscribePresence();
  }, []);

  const isMyMessage = (user: string) => user === name;

  const sendMessage = async () => {
    const trimmed = message.trim();
    if (!trimmed) return;

    try {
      const messagesRef = ref(db, `rooms/${roomId}/messages`);
      const safeText = sanitizeMessage(trimmed);

      const messageData: any = {
        user: name,
        department,
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

      setMessage("");
      setReplyTo(null);
    } catch (error) {
      console.error("Error sending message:", error);
      alert("Failed to send message. Please try again.");
    }
  };

  const nextStranger = () => {
    window.location.href = "/chat";
  };

  return (
    <main className="h-screen flex flex-col bg-black relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div
          className="absolute top-0 left-1/4 w-96 h-96 rounded-full border border-red-600/20 float-3d"
          style={{ animationDelay: "0s" }}
        ></div>
        <div
          className="absolute top-1/2 right-0 w-96 h-96 rounded-full border border-yellow-500/10 float-3d"
          style={{ animationDelay: "1s" }}
        ></div>
      </div>

      <header className="relative z-10 bg-linear-to-r from-red-700 to-red-900 text-white border-b-2 border-yellow-500/50">
        <div className="max-w-7xl mx-auto px-6 py-4 lg:py-6">
          <div className="flex flex-col lg:flex-row lg:justify-between lg:items-start gap-4 lg:gap-6">
            <div className="flex-1">
              <h1 className="text-3xl lg:text-5xl font-black text-white text-3d mb-2 lg:mb-3">
                MAPUYAP
              </h1>
              <div className="flex flex-col lg:flex-row lg:gap-8 text-sm lg:text-base gap-2">
                <span className="font-bold text-yellow-300">👤 {name}</span>
                <span className="text-yellow-200">📚 {department}</span>
                <span className="flex items-center gap-2 text-yellow-100">
                  <span className="inline-block w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
                  👥 {onlineUsers} online
                </span>
              </div>
            </div>

            <div className="flex gap-3 lg:gap-4 shrink-0">
              <button
                onClick={nextStranger}
                className="rounded-lg border border-yellow-300/30 bg-yellow-500/10 px-6 py-3 text-sm font-bold text-white transition hover:bg-yellow-500/20"
              >
                → NEXT
              </button>
              <button
                onClick={() => (window.location.href = "/")}
                className="red-border rounded-lg px-4 lg:px-8 py-2 lg:py-3 font-bold text-white transition-all duration-300 hover:bg-red-600/30 active:scale-95 text-sm lg:text-base"
              >
                ✕ LEAVE
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto p-6 space-y-4 relative z-10">
        <div className="max-w-4xl mx-auto w-full space-y-4">
          {messages.length === 0 ? (
            <div className="h-full flex items-center justify-center text-center py-12">
              <div className="text-yellow-500">
                <div className="text-6xl mb-4">💬</div>
                <p className="text-2xl font-bold">No messages yet</p>
                <p className="text-white/60 text-base mt-2">Start the conversation!</p>
              </div>
            </div>
          ) : (
            messages.map((msg) => {
              const reactionCounts = getReactionCounts(msg);
              const hasReactions = Object.keys(reactionCounts).length > 0;

              return (
                <div
                  key={msg.id}
                  className={`flex ${isMyMessage(msg.user) ? "justify-end" : "justify-start"} animate-slide-in`}
                >
                  <div
                    className={`message-bubble max-w-xs md:max-w-md transform transition-all hover:scale-105 relative ${
                      isMyMessage(msg.user)
                        ? "bg-linear-to-r from-red-700/90 to-red-600/90 text-white rounded-br-none border border-yellow-500/30 card-3d"
                        : "bg-gray-900/80 text-white border-2 border-yellow-600/40 rounded-bl-none card-3d"
                    } px-4 py-2`}
                    onMouseDown={(e) => !isMyMessage(msg.user) && startLongPress(msg.id, e)}
                    onTouchStart={(e) => !isMyMessage(msg.user) && startLongPress(msg.id, e)}
                    onMouseUp={cancelLongPress}
                    onMouseLeave={cancelLongPress}
                    onTouchEnd={cancelLongPress}
                    onTouchCancel={cancelLongPress}
                  >
                    <div className="flex items-center justify-between gap-2 mb-1 text-[0.72rem] leading-none">
                      <div className="flex items-center gap-2">
                        <p className="font-semibold text-yellow-300">{msg.user}</p>
                        <span className="text-white/60">
                          {new Date(msg.createdAt).toLocaleTimeString()}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => setReplyTo(msg)}
                        className="text-xs text-white/70 hover:text-white"
                      >
                        Reply
                      </button>
                    </div>
                    {msg.replyToUser && msg.replyToText && (
                      <div className="reply-context mb-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs text-white/70">
                        <span className="font-semibold text-yellow-300">{msg.replyToUser}</span>
                        <span className="block truncate mt-1">{msg.replyToText}</span>
                      </div>
                    )}
                    <p className="message-text text-sm leading-snug">{sanitizeMessage(msg.text)}</p>

                    {hasReactions && (
                      <div className="absolute bottom-0 right-0 translate-y-1/2 translate-x-1/2 flex flex-wrap gap-1 max-w-37.5 justify-end">
                        {Object.entries(reactionCounts).map(([emoji, count]) => (
                          <div
                            key={emoji}
                            className="inline-flex items-center gap-0.5 rounded-full bg-gray-800/80 border border-yellow-500/30 px-2 py-0.5 text-xs"
                          >
                            <span>{emoji}</span>
                            {count > 1 && <span className="text-white/70 text-[10px]">{count}</span>}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>

      {reactionMenuMessageId && pickerPosition && (
        <div
          ref={pickerRef}
          className="fixed z-50 scale-in"
          style={{
            left: `${pickerPosition.x}px`,
            top: `${Math.max(60, pickerPosition.y - 80)}px`,
            transform: 'translate(-50%, -100%)',
          }}
        >
          <div className="flex gap-2 rounded-2xl bg-gray-900/95 border border-yellow-500/40 p-3 shadow-2xl backdrop-blur-sm">
            {reactions.map((reaction) => (
              <button
                key={reaction}
                type="button"
                onClick={(event) => {
                  event.stopPropagation();
                  addReaction(reactionMenuMessageId, reaction);
                }}
                onMouseEnter={(e) => e.currentTarget.classList.add('scale-125')}
                onMouseLeave={(e) => e.currentTarget.classList.remove('scale-125')}
                className="text-2xl transition-transform duration-150 hover:scale-125 active:scale-100"
              >
                {reaction}
              </button>
            ))}
          </div>
        </div>
      )}

      {reactionMenuMessageId && (
        <div
          className="fixed inset-0 z-40"
          onClick={closePicker}
          onTouchEnd={closePicker}
        />
      )}

      <div className="relative z-10 border-t border-yellow-500/20 bg-black/80 px-6 py-4">
        <div className="max-w-4xl mx-auto">
          {replyTo && (
            <div className="reply-preview mb-3 flex items-center justify-between rounded-full border border-yellow-500/20 bg-white/5 px-4 py-2 text-sm text-white/80">
              <div className="truncate">
                Replying to <span className="font-semibold text-yellow-300">{replyTo.user}</span>:
                <span className="ml-1 text-white/70">"{replyTo.text.length > 48 ? `${replyTo.text.slice(0, 48)}...` : replyTo.text}"</span>
              </div>
              <button
                type="button"
                onClick={() => setReplyTo(null)}
                className="text-yellow-300 font-bold hover:text-white"
              >
                ×
              </button>
            </div>
          )}
          <div className="flex flex-col gap-4 md:flex-row md:items-center">
            <input
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  sendMessage();
                }
              }}
              placeholder="Type a message... (Enter to send)"
              className="flex-1 h-10 rounded-full border border-yellow-500/20 bg-gray-900/90 px-5 py-0 text-sm leading-tight text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-yellow-400 shadow-[0_10px_30px_rgba(255,255,255,0.04)]"
            />

            <button
              onClick={sendMessage}
              className="rounded-full bg-linear-to-r from-red-700 via-red-600 to-yellow-500 px-6 py-2 text-white font-bold transition hover:opacity-90"
            >
              📤 SEND
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}
