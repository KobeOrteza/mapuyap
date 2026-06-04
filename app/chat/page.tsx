"use client";

import { useEffect, useState } from "react";

import {
  ref,
  push,
  remove,
  get,
  set,
  onDisconnect,
} from "firebase/database";

import { db } from "../lib/firebase";

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

export default function ChatPage() {
  const [status, setStatus] = useState("Searching...");

  useEffect(() => {
    findMatch();
  }, []);

  const findMatch = async () => {
    const name = localStorage.getItem("name") || "Anonymous";
    const department = localStorage.getItem("department") || "Unknown";
    const clientId = getClientId();

    const presenceRef = ref(db, `presence/${clientId}`);
    await set(presenceRef, {
      name,
      department,
      status: "searching",
      roomId: null,
      updatedAt: Date.now(),
    });
    await onDisconnect(presenceRef).remove();

    const queueRef = ref(db, "queue");

    const snapshot = await get(queueRef);

    const queue = snapshot.val();

    if (!queue) {
      const myRef = push(queueRef);

      await set(myRef, {
        name,
        department,
        clientId,
        status: "searching",
        createdAt: Date.now(),
      });
      await onDisconnect(ref(db, `queue/${myRef.key}`)).remove();

      waitForMatch(myRef.key!);

      return;
    }

    const users = Object.entries(queue);

    if (users.length === 0) {
      const myRef = push(queueRef);

      await set(myRef, {
        name,
        department,
        clientId,
        status: "searching",
        createdAt: Date.now(),
      });
      await onDisconnect(ref(db, `queue/${myRef.key}`)).remove();

      waitForMatch(myRef.key!);

      return;
    }

    const [otherId] = users[0];

    const roomId = uuid();

    await set(ref(db, `rooms/${roomId}`), {
      createdAt: Date.now(),
    });

    await set(ref(db, `matches/${otherId}`), {
      roomId,
    });

    await remove(ref(db, `queue/${otherId}`));

    await set(presenceRef, {
      name,
      department,
      status: "matched",
      roomId,
      updatedAt: Date.now(),
    });

    window.location.href = `/chat/${roomId}`;
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
    <main className="min-h-screen bg-black flex items-center justify-center relative overflow-hidden">
      {/* 3D Background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 left-20 w-96 h-96 rounded-full border-2 border-red-600/30 float-3d" style={{ animationDelay: "0s" }}></div>
        <div className="absolute top-40 right-10 w-[500px] h-[500px] rounded-full border-2 border-yellow-500/20 float-3d" style={{ animationDelay: "1s" }}></div>
        <div className="absolute bottom-20 left-1/3 w-80 h-80 rounded-full border-2 border-red-600/20 float-3d" style={{ animationDelay: "2s" }}></div>
      </div>

      <div className="card-3d gold-border rounded-2xl p-12 text-center relative z-10 bg-gradient-to-br from-gray-950 via-black to-gray-950 slide-in max-w-xl mx-4">
        {/* Decorative corners */}
        <div className="absolute top-0 left-0 w-6 h-6 border-t-2 border-l-2 border-yellow-500"></div>
        <div className="absolute top-0 right-0 w-6 h-6 border-t-2 border-r-2 border-yellow-500"></div>
        <div className="absolute bottom-0 left-0 w-6 h-6 border-b-2 border-l-2 border-yellow-500"></div>
        <div className="absolute bottom-0 right-0 w-6 h-6 border-b-2 border-r-2 border-yellow-500"></div>

        <h1 className="text-5xl md:text-6xl font-black text-white text-3d text-shine mb-8">
          MAPUYAP
        </h1>

        <div className="mb-12">
          <div className="relative h-20 flex items-center justify-center mb-8">
            <div className="flex gap-2 items-center">
              <div className="w-3 h-3 bg-red-600 rounded-full animate-bounce" style={{ animationDelay: "0s" }}></div>
              <div className="w-3 h-3 bg-yellow-500 rounded-full animate-bounce" style={{ animationDelay: "0.2s" }}></div>
              <div className="w-3 h-3 bg-red-600 rounded-full animate-bounce" style={{ animationDelay: "0.4s" }}></div>
            </div>
          </div>
          <p className="text-2xl font-bold text-yellow-500 mb-4">
            {status}
          </p>
          <p className="text-white/60 text-base">
            Looking for your perfect match...
          </p>
        </div>

        <div className="red-border rounded-lg p-8 mb-8 bg-gray-900/30">
          <p className="text-white/80 text-sm leading-relaxed space-y-3">
            <span className="block">✨ Connecting with a Mapúa student</span>
            <span className="block">🏆 Premium anonymous chat</span>
            <span className="block">🔒 Your privacy is guaranteed</span>
          </p>
        </div>

        <button
          onClick={() => window.location.href = "/"}
          className="w-full red-border rounded-lg py-3 px-6 text-white font-bold transition-all duration-300 hover:bg-red-600/20 active:scale-95"
        >
          ← GO BACK
        </button>
      </div>
    </main>
  );
}