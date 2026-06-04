"use client";

import { useState } from "react";

const departments = [
  "AI Engineering",
  "Computer Engineering",
  "Information Technology",
  "Civil Engineering",
  "Mechanical Engineering",
  "Architecture",
  "Business",
  "Senior High School",
];

export default function Home() {
  const [name, setName] = useState("");
  const [department, setDepartment] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const startChat = () => {
    if (!name.trim()) {
      alert("Please enter your desired name.");
      return;
    }

    setIsLoading(true);
    localStorage.setItem("name", name);
    localStorage.setItem("department", department);

    setTimeout(() => {
      window.location.href = "/chat";
    }, 500);
  };

  return (
    <main className="min-h-screen bg-black flex items-center justify-center p-4 relative overflow-hidden">
      {/* 3D Background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 left-20 w-64 h-64 md:w-96 md:h-96 lg:w-[500px] lg:h-[500px] rounded-full border-2 border-red-600/30 float-3d" style={{ animationDelay: "0s" }}></div>
        <div className="absolute top-40 right-10 w-80 h-80 md:w-[420px] md:h-[420px] lg:w-[600px] lg:h-[600px] rounded-full border-2 border-yellow-500/20 float-3d" style={{ animationDelay: "1s" }}></div>
        <div className="absolute bottom-20 left-1/3 w-72 h-72 md:w-96 md:h-96 lg:w-[500px] lg:h-[500px] rounded-full border-2 border-red-600/20 float-3d" style={{ animationDelay: "2s" }}></div>
      </div>

      {/* Main card */}
      <div className="card-3d gold-border rounded-2xl p-8 md:p-12 lg:p-20 xl:p-24 w-full max-w-2xl md:max-w-3xl lg:max-w-5xl relative z-10 bg-gradient-to-br from-gray-950 via-black to-gray-950 slide-in">
        {/* Decorative top corner elements */}
        <div className="absolute top-0 left-0 w-6 h-6 md:w-8 md:h-8 lg:w-12 lg:h-12 border-t-2 border-l-2 border-yellow-500"></div>
        <div className="absolute top-0 right-0 w-6 h-6 md:w-8 md:h-8 lg:w-12 lg:h-12 border-t-2 border-r-2 border-yellow-500"></div>
        <div className="absolute bottom-0 left-0 w-6 h-6 md:w-8 md:h-8 lg:w-12 lg:h-12 border-b-2 border-l-2 border-yellow-500"></div>
        <div className="absolute bottom-0 right-0 w-6 h-6 md:w-8 md:h-8 lg:w-12 lg:h-12 border-b-2 border-r-2 border-yellow-500"></div>

        {/* Header */}
        <div className="text-center mb-8 md:mb-12 lg:mb-20">
          <h1 className="text-6xl md:text-7xl lg:text-8xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 via-white to-red-500 tracking-[0.35em] mb-3 md:mb-4 lg:mb-6">
            MAPUYAP
          </h1>
          <p className="mx-auto max-w-xl text-sm md:text-base lg:text-lg text-white/70 tracking-[0.18em] uppercase font-semibold mb-6">
            Connect with Mapúa students instantly in premium anonymous chat rooms.
          </p>
          <div className="flex gap-2 md:gap-3 lg:gap-4 justify-center mb-4 md:mb-6 lg:mb-8">
            <div className="h-1 w-12 md:w-16 lg:w-20 bg-red-600 glow-text"></div>
            <div className="h-1 w-12 md:w-16 lg:w-20 bg-yellow-500 glow-text"></div>
            <div className="h-1 w-12 md:w-16 lg:w-20 bg-red-600 glow-text"></div>
          </div>
        </div>

        {/* Form */}
        <div className="space-y-4 md:space-y-6 lg:space-y-8 mb-6 md:mb-8 lg:mb-12">
          <div className="relative group">
            <label className="text-yellow-500 text-xs lg:text-sm font-bold tracking-widest block mb-2 lg:mb-3">YOUR NAME</label>
            <input
              type="text"
              placeholder="Enter your name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && name.trim()) {
                  startChat();
                }
              }}
              className="w-full bg-gray-900/50 border-2 border-yellow-600/60 rounded-lg p-4 lg:p-5 text-white placeholder-gray-400 focus:outline-none focus:border-yellow-400 focus:bg-gray-900 transition-all duration-300 text-base lg:text-lg"
            />
            <div className="absolute inset-0 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none border-2 border-yellow-400/30"></div>
          </div>

          <div className="relative group">
            <label className="text-yellow-500 text-xs lg:text-sm font-bold tracking-widest block mb-2 lg:mb-3">DEPARTMENT</label>
            <select
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
              className="w-full bg-gray-900/50 border-2 border-yellow-600/60 rounded-lg p-4 lg:p-5 text-white focus:outline-none focus:border-yellow-400 focus:bg-gray-900 transition-all duration-300 text-base lg:text-lg"
            >
              <option value="" className="bg-gray-900 text-white">Select Department</option>
              {departments.map((dept) => (
                <option
                  key={dept}
                  value={dept}
                  className="bg-gray-900 text-white"
                >
                  {dept}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* CTA Button */}
        <button
          onClick={startChat}
          disabled={isLoading}
          className="w-full relative group overflow-hidden rounded-full py-4 lg:py-5 px-10 lg:px-12 font-extrabold text-white transition-all duration-300 transform hover:-translate-y-0.5 active:scale-95 disabled:opacity-50 text-base lg:text-lg shadow-[0_30px_60px_rgba(196,30,58,0.18)]"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-red-700 via-red-600 to-yellow-500 opacity-95 group-hover:from-red-600 group-hover:via-red-500 group-hover:to-yellow-400"></div>
          <div className="absolute inset-0 border border-white/10"></div>
          <div className="relative flex items-center justify-center gap-3">
            {isLoading ? (
              <>
                <div className="animate-spin h-5 w-5 lg:h-6 lg:w-6 border-2 border-white border-t-transparent rounded-full"></div>
                <span>CONNECTING...</span>
              </>
            ) : (
              <>
                <span className="text-lg">🚀 START CHAT</span>
              </>
            )}
          </div>
        </button>

        {/* Footer info */}
        <div className="mt-8 md:mt-10 lg:mt-16 pt-8 md:pt-10 lg:pt-16 border-t border-yellow-600/30">
          <p className="text-center text-white/60 text-xs md:text-sm lg:text-base leading-relaxed">
            <span className="block text-yellow-500 font-bold mb-2 lg:mb-3">🏆 PREMIUM EXPERIENCE</span>
            <span>Connect with Mapúa students instantly • Complete anonymity • Zero compromise</span>
          </p>
        </div>
      </div>
    </main>
  );
}