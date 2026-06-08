"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function ChatPage() {
  const router = useRouter();
  const [handle, setHandle] = useState("Cardinal");
  const [department, setDepartment] = useState("");

  useEffect(() => {
    // Grab cached user node details from local storage criteria
    const savedName = localStorage.getItem("name");
    const savedDept = localStorage.getItem("department");
    
    if (savedName) setHandle(savedName);
    if (savedDept) setDepartment(savedDept);
  }, []);

  const handleCancel = () => {
    router.push("/");
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

      {/* Full-Width Header Matching Home Layout */}
      <header className="w-full border-b-4 border-black px-6 md:px-12 py-6 bg-transparent relative z-10 flex justify-between items-center h-auto">
        <div className="w-full max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-2 font-black text-2xl tracking-tight relative">
            <div className="bg-[#B91C1C] text-white w-9 h-9 border-4 border-black rounded-none flex items-center justify-center font-sans shadow-[2px_2px_0px_0px_#000]">
              ⚡
            </div>
            <span className="tracking-tighter">MAPUYAP</span>
          </div>
          <div className="flex items-center gap-4 font-mono text-xs">
            <span className="bg-black text-white px-2 py-1 font-bold">NODE: ONLINE</span>
          </div>
        </div>
      </header>

      {/* Dead-Centered Structural Card Container */}
      <div className="w-full flex-grow flex items-center justify-center p-6 relative z-10">
        
        {/* Network Match Search Module Card */}
        <div className="w-full max-w-md bg-white border-4 border-black p-6 md:p-8 shadow-[8px_8px_0px_0px_#D97706] rounded-none relative block text-center">
          
          {/* Header Badge */}
          <div className="inline-block bg-[#B91C1C] text-white font-black text-2xl uppercase tracking-tighter px-6 py-2 border-4 border-black shadow-[4px_4px_0px_0px_#000] mb-6">
            MAPUYAP
          </div>

          {/* Animated Loading Indicator Block */}
          <div className="flex justify-center items-center gap-2 my-4">
            <span className="w-3 h-3 bg-[#B91C1C] border-2 border-black animate-bounce [animation-delay:-0.3s]"></span>
            <span className="w-3 h-3 bg-[#D97706] border-2 border-black animate-bounce [animation-delay:-0.15s]"></span>
            <span className="w-3 h-3 bg-black border-2 border-black animate-bounce"></span>
          </div>

          {/* Status Display Area */}
          <div className="space-y-2 mb-6">
            <h2 className="text-2xl font-black uppercase tracking-tight text-black">
              Searching...
            </h2>
            <p className="text-sm font-bold text-black/60">
              Looking for your perfect match as <span className="text-[#B91C1C] underline">{handle}</span> ({department || "General"})
            </p>
          </div>

          {/* Terminal Match Metrics Details Box */}
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

          {/* Core Navigation Action Cancel Trigger */}
          <button
            onClick={handleCancel}
            className="w-full bg-white text-black font-black border-4 border-black py-3 text-center tracking-wide uppercase text-sm shadow-[4px_4px_0px_0px_#000] hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[6px_6px_0px_0px_#B91C1C] active:translate-x-[2px] active:translate-y-[2px] active:shadow-[2px_2px_0px_0px_#000] transition-all block relative"
          >
            ← GO BACK
          </button>

        </div>
      </div>

      {/* Symmetrical footer spacer */}
      <footer className="w-full h-4 mt-auto" />
    </main>
  );
}