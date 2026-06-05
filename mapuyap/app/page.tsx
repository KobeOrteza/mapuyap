"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

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
  const router = useRouter();
  const [name, setName] = useState("");
  const [department, setDepartment] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);

  const startChat = () => {
    if (!name.trim()) {
      alert("Please enter your desired name.");
      return;
    }
    if (!agreedToTerms) {
      alert("Please agree to the Terms & Conditions to proceed.");
      return;
    }

    setIsLoading(true);
    localStorage.setItem("name", name.trim());
    localStorage.setItem("department", department || "Unknown");

    setTimeout(() => {
      router.push("/chat");
    }, 400);
  };

  return (
    <main className="min-h-screen bg-black flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 left-20 w-64 h-64 rounded-full border-2 border-red-600/30 float-3d"></div>
        <div className="absolute top-40 right-10 w-80 h-80 rounded-full border-2 border-yellow-500/20 float-3d"></div>
      </div>

      <div className="card-3d gold-border rounded-2xl p-10 md:p-16 w-full max-w-2xl relative z-10 bg-gradient-to-br from-gray-950 via-black to-gray-950">
        <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-yellow-500"></div>
        <div className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-yellow-500"></div>
        <div className="absolute bottom-0 left-0 w-8 h-8 border-b-2 border-l-2 border-yellow-500"></div>
        <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-yellow-500"></div>

        <div className="text-center mb-12">
          <h1 className="text-6xl md:text-7xl font-black text-white text-3d text-shine mb-4">MAPUYAP</h1>
          <p className="text-white/70 text-sm tracking-[0.2em] font-bold">PREMIUM • STUDENT • CHAT</p>
        </div>

        <div className="space-y-6 mb-6">
          <div>
            <label className="text-yellow-500 text-xs font-bold tracking-widest block mb-2">YOUR NAME</label>
            <input
              type="text"
              placeholder="Enter your name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-gray-900/50 border-2 border-yellow-600/60 rounded-lg p-4 text-white placeholder-gray-400 focus:outline-none focus:border-yellow-400"
            />
          </div>

          <div>
            <label className="text-yellow-500 text-xs font-bold tracking-widest block mb-2">DEPARTMENT</label>
            <select
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
              className="w-full bg-gray-900/50 border-2 border-yellow-600/60 rounded-lg p-4 text-white focus:outline-none focus:border-yellow-400"
            >
              <option value="">Select Department</option>
              {departments.map((dept) => (
                <option key={dept} value={dept}>{dept}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="red-border rounded-lg p-4 mb-6 bg-gray-950/80 max-h-32 overflow-y-auto font-mono text-xs text-white/70">
          <p className="text-yellow-500 font-bold">✦ Platform Usage</p>
          <p className="mb-2">Independent student secure terminal. Disconnected from official infrastructure.</p>
          <p className="text-yellow-500 font-bold">✦ Conduct Policy</p>
          <p>Harassment and sharing core testing parameters are strictly forbidden.</p>
        </div>

        <div className="flex items-start gap-3 mb-8">
          <input
            type="checkbox"
            id="termsAgreement"
            checked={agreedToTerms}
            onChange={(e) => setAgreedToTerms(e.target.checked)}
            className="mt-0.5 h-4 w-4 accent-red-600 cursor-pointer"
          />
          <label htmlFor="termsAgreement" className="cursor-pointer text-white/60 text-[11px] select-none">
            I agree to Mapuyap's community criteria and safety constraints.
          </label>
        </div>

        <button
          onClick={startChat}
          disabled={isLoading || !name.trim() || !agreedToTerms}
          className="w-full relative rounded-lg py-4 font-bold text-white transition-all bg-gradient-to-r from-red-700 via-red-600 to-yellow-500 disabled:opacity-30 disabled:cursor-not-allowed"
        >
          {isLoading ? "INITIALIZING NODE..." : "✨ START CHAT TERMINAL ✨"}
        </button>
      </div>
    </main>
  );
}