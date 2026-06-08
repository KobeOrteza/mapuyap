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

  const handleFutureFeature = (featureName: string) => {
    alert(`${featureName} module is under development! Coming soon.`);
  };

  return (
    <main className="min-h-screen bg-white font-sans text-black relative p-6 md:p-12 selection:bg-[#B91C1C] selection:text-white block">
      {/* Neo-Brutalist Grid Background Pattern */}
      <div 
        className="absolute inset-0 opacity-5 pointer-events-none" 
        style={{
          backgroundImage: 'linear-gradient(#000 1px, transparent 1px), linear-gradient(90deg, #000 1px, transparent 1px)',
          backgroundSize: '40px 40px'
        }}
      />

      {/* Header / Navbar section */}
      <header className="max-w-7xl mx-auto flex justify-between items-center border-b-4 border-black pb-6 mb-12 relative z-10 bg-transparent h-auto">
        <div className="flex items-center gap-2 font-black text-2xl tracking-tight relative">
          <div className="bg-[#B91C1C] text-white w-9 h-9 border-4 border-black rounded-none flex items-center justify-center font-sans shadow-[2px_2px_0px_0px_#000]">
            ⚡
          </div>
          <span className="tracking-tighter">MAPUYAP</span>
        </div>
        <div className="hidden md:flex gap-6 font-bold text-sm relative">
          <span className="cursor-pointer hover:text-[#B91C1C] hover:underline">Guidelines</span>
          <span className="cursor-pointer hover:text-[#B91C1C] hover:underline">Safety</span>
          <span className="cursor-pointer hover:text-[#B91C1C] hover:underline">FAQ</span>
        </div>
      </header>

      {/* Main split content layout */}
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 items-start relative z-10 pb-12">
        
        {/* Left Side: Hero Text, Badges, and Stacking Chat Bubbles */}
        <div className="lg:col-span-7 space-y-12 relative block w-full">
          
          {/* Main Hero Group */}
          <div className="space-y-6">
            {/* Aesthetic Tag Pill Badges */}
            <div className="flex flex-wrap gap-2 relative">
              <span className="bg-[#B91C1C] text-white px-3 py-1 text-xs font-black uppercase tracking-wider border-2 border-black shadow-[2px_2px_0px_0px_#000] inline-block">
                Anonymous Chat
              </span>
              <span className="bg-[#D97706] text-white px-3 py-1 text-xs font-black uppercase tracking-wider border-2 border-black shadow-[2px_2px_0px_0px_#000] inline-block">
                Meet Students
              </span>
              <span className="bg-white text-black px-3 py-1 text-xs font-black uppercase tracking-wider border-2 border-black shadow-[2px_2px_0px_0px_#000] inline-block">
                No Profile Needed
              </span>
              <span className="bg-black text-white px-3 py-1 text-xs font-black uppercase tracking-wider border-2 border-black shadow-[2px_2px_0px_0px_#000] inline-block">
                Text + Verified
              </span>
            </div>

            <h1 className="text-5xl md:text-7xl font-black tracking-tight leading-none text-black block relative">
              Anonymous Chat with <span className="text-[#B91C1C]">Mapúans</span>
            </h1>
            
            <p className="text-lg md:text-xl font-bold max-w-xl text-black/70 leading-relaxed block relative">
              Free random chat to meet peers across campus. Connect safely through secure matching. No institutional sign-up or tracking.
            </p>
          </div>




          {/* Stacking Chat Bubbles Section */}
          <div className="pt-4 relative block max-w-lg space-y-3">
            <h3 className="text-xs font-black tracking-widest uppercase text-black/40 mb-4 block">
              // Future Expansion Nodes
            </h3>

            {/* Bubble 1: Cardinal Wall */}
            <div className="relative block group">
              <button
                onClick={() => handleFutureFeature("Cardinal Wall")}
                className="w-full md:w-auto text-left bg-white text-black font-black border-4 border-black px-6 py-4 text-base md:text-lg shadow-[6px_6px_0px_0px_#B91C1C] hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[8px_8px_0px_0px_#B91C1C] active:translate-x-[2px] active:translate-y-[2px] active:shadow-[4px_4px_0px_0px_#B91C1C] transition-all rounded-2xl flex items-center justify-between gap-4"
              >
                <span> Cardinal Wall</span>
                <span className="bg-[#B91C1C] text-white text-[10px] px-2 py-0.5 rounded-full font-mono tracking-wider font-bold">
                  COMING SOON
                </span>
              </button>
            </div>

            {/* Bubble 2: Q&A About Courses */}
            <div className="relative block pt-1 md:pl-8">
              <button
                onClick={() => handleFutureFeature("Course Q&A")}
                className="w-full md:w-auto text-left bg-white text-black font-black border-4 border-black px-6 py-4 text-base md:text-lg shadow-[6px_6px_0px_0px_#D97706] hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[8px_8px_0px_0px_#D97706] active:translate-x-[2px] active:translate-y-[2px] active:shadow-[4px_4px_0px_0px_#D97706] transition-all rounded-2xl flex items-center justify-between gap-4"
              >
                <span> Q&A About Courses</span>
                <span className="bg-[#D97706] text-white text-[10px] px-2 py-0.5 rounded-full font-mono tracking-wider font-bold">
                  COMING SOON
                </span>
              </button>
            </div>
          </div>

        </div>

        {/* Right Side: The Form Card */}
        <div className="lg:col-span-5 bg-white border-4 border-black p-6 md:p-8 shadow-[8px_8px_0px_0px_#D97706] rounded-none relative block h-auto lg:sticky lg:top-12">
          
          <div className="relative block mb-6">
            <h2 className="text-2xl font-black uppercase tracking-tight border-b-4 border-black pb-2 bg-[#B91C1C] text-white inline-block px-4 border-r-4 shadow-[4px_4px_0px_0px_#000] h-auto relative">
              Setup Node
            </h2>
          </div>

          {/* Form Input Container Area */}
          <div className="flex flex-col gap-5 mb-5 relative block h-auto">
            {/* Input Name */}
            <div className="relative block h-auto">
              <label className="block text-xs font-black tracking-wider uppercase mb-2 relative text-black">
                Your Handle / Alias
              </label>
              <input
                type="text"
                placeholder="e.g., Cardinal_01"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-white border-4 border-black p-3 font-bold text-black placeholder-black/40 focus:outline-none focus:bg-amber-50 shadow-[4px_4px_0px_0px_#000] transition-all focus:translate-x-[-2px] focus:translate-y-[-2px] focus:shadow-[6px_6px_0px_0px_#000] relative block h-auto"
              />
            </div>

            {/* Select Department */}
            <div className="relative block h-auto">
              <label className="block text-xs font-black tracking-wider uppercase mb-2 relative text-black">
                Department Cluster
              </label>
              <div className="relative block h-auto">
                <select
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  className="w-full bg-white border-4 border-black p-3 font-bold text-black focus:outline-none appearance-none cursor-pointer shadow-[4px_4px_0px_0px_#000] relative block h-auto pr-10"
                >
                  <option value="">Select Department (Optional)</option>
                  {departments.map((dept) => (
                    <option key={dept} value={dept}>
                      {dept}
                    </option>
                  ))}
                </select>
                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none font-black text-xs z-20">
                  ▼
                </div>
              </div>
            </div>
          </div>

          {/* Rules Terminal Block */}
          <div className="border-4 border-black p-4 mb-5 bg-stone-50 font-mono text-xs space-y-2 shadow-[2px_2px_0px_0px_#000] relative block h-auto">
            <div className="block">
              <p className="font-black text-[#B91C1C] m-0">✦ PLATFORM USAGE CRITERIA</p>
              <p className="text-black/80 m-0 pt-0.5">Independent community terminal. Encrypted client routing.</p>
            </div>
            <div className="block pt-1">
              <p className="font-black text-[#D97706] m-0">✦ CONDUCT CONTRACT</p>
              <p className="text-black/80 m-0 pt-0.5">Harassment or unauthorized structural attacks are instantly ban-filtered.</p>
            </div>
          </div>

          {/* Terms Agreement Checkbox */}
          <div className="flex items-start gap-3 mb-6 relative h-auto">
            <input
              type="checkbox"
              id="termsAgreement"
              checked={agreedToTerms}
              onChange={(e) => setAgreedToTerms(e.target.checked)}
              className="mt-0.5 h-5 w-5 min-w-[20px] accent-black border-4 border-black cursor-pointer rounded-none relative inline-block"
            />
            <label htmlFor="termsAgreement" className="cursor-pointer text-xs font-bold select-none leading-tight text-black/90 relative inline-block">
              I explicitly agree to Mapuyap's community safety criteria and conduct parameters.
            </label>
          </div>

          {/* Core Action Button */}
          <div className="relative block h-auto">
            <button
              onClick={startChat}
              disabled={isLoading || !name.trim() || !agreedToTerms}
              className="w-full bg-[#B91C1C] text-white font-black border-4 border-black py-4 text-center tracking-wide uppercase text-sm md:text-base shadow-[4px_4px_0px_0px_#000] hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[6px_6px_0px_0px_#D97706] active:translate-x-[2px] active:translate-y-[2px] active:shadow-[2px_2px_0px_0px_#000] transition-all disabled:opacity-40 disabled:pointer-events-none block relative h-auto hover:bg-[#A11818]"
            >
              {isLoading ? "Initializing Network Node..." : "Start Chatting ⚡"}
            </button>
          </div>
          
        </div>

      </div>
    </main>
  );
}