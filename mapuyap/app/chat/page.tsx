"use client";

import { useEffect, useState } from "react";
import {
  ref,
  push,
  remove,
  get,
  set,
} from "firebase/database";
import { db } from "../lib/firebase";
import { v4 as uuid } from "uuid";

export default function ChatPage() {
  const [status, setStatus] = useState("Searching...");

  useEffect(() => {
    findMatch();
  }, []);

  const findMatch = async () => {
    const name =
      localStorage.getItem("name") ||
      "Anonymous";

    const department =
      localStorage.getItem("department") ||
      "Unknown";

    const queueRef = ref(db, "queue");
    const snapshot = await get(queueRef);
    const queue = snapshot.val();

    if (!queue) {
      const myRef = push(queueRef);
      await set(myRef, {
        name,
        department,
      });
      waitForMatch(myRef.key!);
      return;
    }

    const users = Object.entries(queue);

    if (users.length === 0) {
      const myRef = push(queueRef);
      await set(myRef, {
        name,
        department,
      });
      waitForMatch(myRef.key!);
      return;
    }

    const [otherId] = users[0];
    const roomId = uuid();

    await set(
      ref(db, `rooms/${roomId}`),
      {
        createdAt: Date.now(),
      }
    );

    await set(
      ref(db, `matches/${otherId}`),
      {
        roomId,
      }
    );

    await remove(
      ref(db, `queue/${otherId}`)
    );

    window.location.href =
      `/chat/${roomId}`;
  };

  const waitForMatch = (myId: string) => {
    const matchRef =
      ref(db, `matches/${myId}`);

    const interval = setInterval(
      async () => {
        const snap = await get(matchRef);

        if (snap.exists()) {
          clearInterval(interval);
          const roomId =
            snap.val().roomId;
          await remove(matchRef);
          window.location.href =
            `/chat/${roomId}`;
        }
      },
      1000
    );
  };

  return (
    <main className="min-h-screen bg-white font-sans text-black relative flex flex-col justify-between w-full box-border overflow-x-hidden">
      
      {/* Unified Neo-Brutalist Grid Background Pattern */}
      <div 
        className="absolute inset-0 opacity-5 pointer-events-none" 
        style={{
          backgroundImage: 'linear-gradient(#000 1px, transparent 1px), linear-gradient(90deg, #000 1px, transparent 1px)',
          backgroundSize: '40px 40px',
          backgroundRepeat: 'repeat'
        }}
      />

      {/* Full-Width Header Spanning the screen edges */}
      <header className="w-full border-b-4 border-black px-6 md:px-12 py-6 bg-transparent relative z-10 flex justify-between items-center h-auto">
        <div className="w-full max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-2 font-black text-2xl tracking-tight relative">
            <div className="bg-[#B91C1C] text-white w-9 h-9 border-4 border-black rounded-none flex items-center justify-center font-sans shadow-[2px_2px_0px_0px_#000]">
              ⚡
            </div>
            <span className="tracking-tighter">MAPUYAP</span>
          </div>
          <div className="flex items-center gap-4 font-mono text-xs">
            <span className="bg-black text-white px-2 py-1 font-bold">NODE: BUSY</span>
          </div>
        </div>
      </header>

      {/* Dead-Centered Card Container Workspace */}
      <div className="w-full flex-grow flex items-center justify-center p-6 relative z-10">
        
        {/* Network Match Search Module Card */}
        <div className="w-full max-w-md bg-white border-4 border-black p-6 md:p-8 shadow-[8px_8px_0px_0px_#D97706] rounded-none relative block text-center">
          
          {/* Header Badge */}
          <div className="inline-block bg-[#B91C1C] text-white font-black text-2xl uppercase tracking-tighter px-6 py-2 border-4 border-black shadow-[4px_4px_0px_0px_#000] mb-6">
            MAPUYAP
          </div>

          {/* Animated Square Brutalist Loading Block Indicators */}
          <div className="flex justify-center items-center gap-2 mb-4 h-8">
            <span className="w-3 h-3 bg-[#B91C1C] border-2 border-black animate-bounce [animation-delay:-0.3s]"></span>
            <span className="w-3 h-3 bg-[#D97706] border-2 border-black animate-bounce [animation-delay:-0.15s]"></span>
            <span className="w-3 h-3 bg-black border-2 border-black animate-bounce"></span>
          </div>

          {/* Dynamic Status Text Trackers */}
          <div className="space-y-2 mb-6">
            <h2 className="text-3xl font-black uppercase tracking-tight text-black">
              {status}
            </h2>
            <p className="text-sm font-bold text-black/60">
              Looking for your perfect match...
            </p>
          </div>

          {/* Terminal Style Information Metadata Block */}
          <div className="border-4 border-black p-4 mb-6 bg-stone-50 font-mono text-left text-xs space-y-2 shadow-[3px_3px_0px_0px_#000]">
            <p className="text-black font-bold m-0 flex items-center gap-1">
              ✨ <span className="font-black text-[#B91C1C]">Connecting:</span> Mapúa Peer Stream
            </p>
            <p className="text-black font-bold m-0 flex items-center gap-1">
              🏆 <span className="font-black text-[#D97706]">Access:</span> Verified Campus Routing
            </p>
            <p className="text-black font-bold m-0 flex items-center gap-1">
              🔒 <span className="font-black text-black">Privacy:</span> Ephemeral Session Keyed
            </p>
          </div>

          {/* Core Action Navigation Return Hook */}
          <button
            onClick={() => window.location.href = "/"}
            className="w-full bg-white text-black font-black border-4 border-black py-3 text-center tracking-wide uppercase text-sm shadow-[4px_4px_0px_0px_#000] hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[6px_6px_0px_0px_#B91C1C] active:translate-x-[2px] active:translate-y-[2px] active:shadow-[2px_2px_0px_0px_#000] transition-all block relative"
          >
            ← GO BACK
          </button>

        </div>
      </div>

      {/* Balanced layout bottom spacing spacer */}
      <footer className="w-full h-4 mt-auto" />
    </main>
  );
}