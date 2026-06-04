"use client";

import { useParams } from "next/navigation";
import { useEffect, useState, useRef } from "react";

import {
  ref,
  push,
  onValue,
} from "firebase/database";

import { db } from "../../lib/firebase";

export default function RoomPage() {
  const params = useParams();
  const roomId = params.roomId as string;

  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<any[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const [name] = useState(
    () =>
      localStorage.getItem("name") || "Anonymous"
  );

  const [department] = useState(
    () =>
      localStorage.getItem("department") ||
      "Unknown"
  );

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    const messagesRef = ref(
      db,
      `rooms/${roomId}/messages`
    );

    const unsubscribe = onValue(
      messagesRef,
      (snapshot) => {
        const data = snapshot.val();

        if (!data) {
          setMessages([]);
          return;
        }

        const loaded = Object.entries(data).map(
          ([id, value]) => ({
            id,
            ...(value as any),
          })
        );

        setMessages(loaded);
      }
    );

    return () => unsubscribe();
  }, [roomId]);

  const sendMessage = async () => {
    if (!message.trim()) return;

    await push(
      ref(db, `rooms/${roomId}/messages`),
      {
        user: name,
        department,
        text: message,
        time: Date.now(),
      }
    );

    setMessage("");
  };

  const isMyMessage = (user: string) => user === name;

  return (
    <main className="h-screen flex flex-col bg-black relative overflow-hidden">
      {/* 3D Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 rounded-full border border-red-600/20 float-3d" style={{ animationDelay: "0s" }}></div>
        <div className="absolute top-1/2 right-0 w-96 h-96 rounded-full border border-yellow-500/10 float-3d" style={{ animationDelay: "1s" }}></div>
      </div>

      {/* Header */}
      <header className="relative z-10 bg-gradient-to-r from-red-700 to-red-900 text-white p-6 border-b-2 border-yellow-500/50">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <div className="flex-1">
            <h1 className="text-4xl font-black text-white text-3d mb-2">
              MAPUYAP
            </h1>
            <div className="flex flex-col md:flex-row md:gap-6 text-sm">
              <span className="font-bold text-yellow-300">👤 {name}</span>
              <span className="text-yellow-200">📚 {department}</span>
            </div>
          </div>

          <button
            onClick={() =>
              (window.location.href = "/")
            }
            className="red-border rounded-lg px-8 py-3 font-bold text-white transition-all duration-300 hover:bg-red-600/30 active:scale-95"
          >
            ✕ LEAVE
          </button>
        </div>
      </header>

      {/* Messages Container */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4 relative z-10">
        <div className="max-w-4xl mx-auto w-full space-y-4">
          {messages.length === 0 && (
            <div className="h-full flex items-center justify-center text-center py-12">
              <div className="text-yellow-500">
                <div className="text-6xl mb-4">💬</div>
                <p className="text-2xl font-bold">No messages yet</p>
                <p className="text-white/60 text-base mt-2">Start the conversation!</p>
              </div>
            </div>
          )}

          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex ${isMyMessage(msg.user) ? "justify-end" : "justify-start"} animate-slide-in`}
            >
              <div
                className={`max-w-xs md:max-w-md px-6 py-4 rounded-lg transform transition-all hover:scale-105 ${
                  isMyMessage(msg.user)
                    ? "bg-gradient-to-r from-red-700 to-red-600 text-white rounded-br-none border border-yellow-500/30 card-3d"
                    : "bg-gray-900 text-white border-2 border-yellow-600/40 rounded-bl-none card-3d"
                }`}
              >
                <div className="flex items-center gap-3 mb-2">
                  <p className="font-bold text-sm text-yellow-300">
                    {msg.user}
                  </p>
                  <span className="text-xs opacity-70">
                    {new Date(msg.time).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  </span>
                </div>
                <p className="text-xs opacity-70 mb-2 text-yellow-200">
                  {msg.department}
                </p>
                <p className="text-base leading-relaxed break-words">
                  {msg.text}
                </p>
              </div>
            </div>
          ))}

          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Message Input */}
      <div className="relative z-10 bg-gradient-to-t from-black via-gray-900 to-transparent border-t-2 border-yellow-500/50 p-6">
        <div className="max-w-4xl mx-auto flex gap-4">
          <input
            value={message}
            onChange={(e) =>
              setMessage(e.target.value)
            }
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                sendMessage();
              }
            }}
            placeholder="Type a message... (Enter to send)"
            className="flex-1 gold-border rounded-lg px-6 py-4 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-yellow-400 bg-gray-900/80 transition-all resize-none"
          />

          <button
            onClick={sendMessage}
            className="relative group overflow-hidden rounded-lg px-8 py-4 font-bold text-white transition-all duration-300 hover:scale-105 active:scale-95"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-red-700 via-red-600 to-yellow-500 group-hover:from-red-600 group-hover:via-red-500 group-hover:to-yellow-400"></div>
            <div className="relative">📤 SEND</div>
          </button>
        </div>
      </div>
    </main>
  );
}