"use client";

import { useState, useEffect } from "react";

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
  const [showTermsModal, setShowTermsModal] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  const openTermsModal = () => {
    if (!name.trim()) {
      alert("Please enter your desired name.");
      return;
    }
    setShowTermsModal(true);
  };

  const startChat = () => {
    if (!agreedToTerms) return;

    setIsLoading(true);
    localStorage.setItem("name", name);
    localStorage.setItem("department", department);
    localStorage.setItem("mapuyapTermsAgreed", "true");

    setTimeout(() => {
      window.location.href = "/chat";
    }, 500);
  };

  return (
    <main className="min-h-screen bg-black flex items-center justify-center p-4 relative overflow-hidden">
      {/* Animated gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-red-950/20 via-black to-yellow-950/20 animate-pulse-slow"></div>
      
      {/* Animated orbs */}
      <div className="absolute top-10 left-10 w-96 h-96 bg-red-600/10 rounded-full blur-3xl animate-float"></div>
      <div className="absolute bottom-10 right-10 w-96 h-96 bg-yellow-500/10 rounded-full blur-3xl animate-float-delayed"></div>
      
      {/* Glow cursor follower */}
      <div 
        className="fixed w-96 h-96 rounded-full pointer-events-none transition-all duration-300 ease-out z-0"
        style={{
          background: `radial-gradient(circle, rgba(255,0,0,0.08) 0%, rgba(255,215,0,0.04) 50%, transparent 70%)`,
          transform: `translate(${mousePosition.x - 192}px, ${mousePosition.y - 192}px)`,
        }}
      />

      {/* 3D Background elements with enhanced animations */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 left-20 w-64 h-64 rounded-full border-2 border-red-600/40 float-3d shadow-glow-red" style={{ animationDelay: "0s" }}></div>
        <div className="absolute top-40 right-10 w-80 h-80 rounded-full border-2 border-yellow-500/30 float-3d-reverse" style={{ animationDelay: "1s" }}></div>
        <div className="absolute bottom-20 left-1/3 w-72 h-72 rounded-full border-2 border-red-600/30 float-3d-slow" style={{ animationDelay: "2s" }}></div>
        <div className="absolute top-1/2 left-1/4 w-48 h-48 rounded-full border border-yellow-500/20 pulse-ring"></div>
      </div>

      {/* Main card with enhanced glow */}
      <div className="card-3d gold-border rounded-2xl p-10 md:p-16 w-full max-w-2xl relative z-10 bg-gradient-to-br from-gray-950/95 via-black/95 to-gray-950/95 backdrop-blur-sm slide-in shadow-2xl shadow-red-900/20">
        {/* Animated corner elements with glow */}
        <div className="absolute top-0 left-0 w-10 h-10 border-t-2 border-l-2 border-yellow-500 shadow-glow-corner"></div>
        <div className="absolute top-0 right-0 w-10 h-10 border-t-2 border-r-2 border-yellow-500 shadow-glow-corner"></div>
        <div className="absolute bottom-0 left-0 w-10 h-10 border-b-2 border-l-2 border-yellow-500 shadow-glow-corner"></div>
        <div className="absolute bottom-0 right-0 w-10 h-10 border-b-2 border-r-2 border-yellow-500 shadow-glow-corner"></div>

        {/* Card border glow on hover */}
        <div className="absolute inset-0 rounded-2xl opacity-0 hover:opacity-100 transition-opacity duration-500 pointer-events-none" 
             style={{ boxShadow: "0 0 30px rgba(234, 179, 8, 0.2), inset 0 0 20px rgba(234, 179, 8, 0.1)" }}></div>

        {/* Header with glow text */}
        <div className="text-center mb-12 relative">
          <div className="absolute inset-0 blur-2xl bg-yellow-500/5 rounded-full"></div>
          <h1 className="text-6xl md:text-7xl font-black text-white text-3d text-shine mb-4 animate-glitch relative">
            MAPUYAP
            <span className="absolute inset-0 text-red-500 blur-sm opacity-30 animate-pulse">MAPUYAP</span>
          </h1>
          <div className="flex gap-2 justify-center mb-6">
            <div className="h-1 w-16 bg-gradient-to-r from-red-600 to-red-400 glow-text animate-pulse-slow"></div>
            <div className="h-1 w-16 bg-gradient-to-r from-yellow-500 to-yellow-300 glow-text animate-pulse-slow animation-delay-300"></div>
            <div className="h-1 w-16 bg-gradient-to-r from-red-600 to-red-400 glow-text animate-pulse-slow"></div>
          </div>
          <p className="text-white/70 text-sm tracking-[0.2em] font-bold animate-fade-in">
            <span className="text-yellow-500">✦</span> PREMIUM • STUDENT • CHAT <span className="text-yellow-500">✦</span>
          </p>
        </div>

        {/* Form with enhanced animations */}
        <div className="space-y-6 mb-8">
          <div className="relative group animate-slide-up" style={{ animationDelay: "0.1s" }}>
            <label className="text-yellow-500 text-xs font-bold tracking-widest block mb-2 transition-all duration-300 group-hover:text-yellow-400 group-focus-within:text-yellow-400">
              YOUR NAME
            </label>
            <div className="relative">
              <input
                type="text"
                placeholder="Enter your name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && name.trim()) {
                    openTermsModal();
                  }
                }}
                className="w-full bg-gray-900/50 border-2 border-yellow-600/40 rounded-lg p-4 text-white placeholder-gray-500 focus:outline-none focus:border-yellow-400 focus:bg-gray-900 transition-all duration-300 group-hover:border-yellow-500/60"
              />
              <div className="absolute inset-0 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none bg-gradient-to-r from-yellow-400/5 to-red-600/5"></div>
            </div>
          </div>

          <div className="relative group animate-slide-up" style={{ animationDelay: "0.2s" }}>
            <label className="text-yellow-500 text-xs font-bold tracking-widest block mb-2 transition-all duration-300 group-hover:text-yellow-400 group-focus-within:text-yellow-400">
              DEPARTMENT
            </label>
            <div className="relative">
              <select
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                className="w-full bg-gray-900/50 border-2 border-yellow-600/40 rounded-lg p-4 text-white focus:outline-none focus:border-yellow-400 focus:bg-gray-900 transition-all duration-300 cursor-pointer group-hover:border-yellow-500/60"
              >
                <option value="" className="bg-gray-900 text-white">Select Department</option>
                {departments.map((dept) => (
                  <option key={dept} value={dept} className="bg-gray-900 text-white">
                    {dept}
                  </option>
                ))}
              </select>
              <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                <svg className="w-4 h-4 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* CTA Button with enhanced glow and animation */}
        <button
          onClick={openTermsModal}
          disabled={isLoading}
          className="w-full relative group overflow-hidden rounded-lg py-4 px-8 font-bold text-white transition-all duration-300 transform hover:scale-105 active:scale-95 disabled:opacity-50 animate-slide-up glow-button"
          style={{ animationDelay: "0.3s" }}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-red-700 via-red-600 to-yellow-500 group-hover:from-red-600 group-hover:via-red-500 group-hover:to-yellow-400 transition-all duration-500"></div>
          <div className="absolute inset-0 border-2 border-yellow-300/30 group-hover:border-yellow-300/60 transition-all duration-300"></div>
          <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-gradient-to-r from-transparent via-white/10 to-transparent -skew-x-12"></div>
          <div className="relative flex items-center justify-center gap-2 z-10">
            {isLoading ? (
              <>
                <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full"></div>
                <span className="tracking-wider">CONNECTING...</span>
              </>
            ) : (
              <>
                <span className="text-xl animate-bounce-subtle">✨</span>
                <span className="tracking-wider">START CHAT</span>
                <span className="text-xl animate-bounce-subtle">✨</span>
              </>
            )}
          </div>
        </button>

        {/* Footer info with enhanced design */}
        <div className="mt-10 pt-10 border-t border-gradient-to-r from-transparent via-yellow-500/30 to-transparent">
          <p className="text-center text-white/60 text-sm leading-relaxed animate-fade-in">
            <span className="block text-yellow-500 font-bold mb-2 animate-pulse-slow">🏆 PREMIUM EXPERIENCE</span>
            <span className="text-white/50">Connect with Mapúa students instantly • Complete anonymity • Zero compromise</span>
          </p>
        </div>
      </div>

      {/* Terms and Conditions Modal with enhanced animations */}
      {showTermsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-in fade-in duration-300">
          <div className="bg-gradient-to-br from-gray-950 to-black border-2 border-yellow-500/50 rounded-2xl max-w-2xl w-full max-h-[85vh] overflow-y-auto relative slide-in shadow-2xl shadow-yellow-900/20">
            {/* Modal header with glow */}
            <div className="sticky top-0 bg-gradient-to-br from-gray-950 to-black border-b border-yellow-500/30 p-6 backdrop-blur-sm z-10">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold bg-gradient-to-r from-yellow-500 to-red-500 bg-clip-text text-transparent">
                  Terms & Conditions
                </h2>
                <button
                  onClick={() => {
                    setShowTermsModal(false);
                    setAgreedToTerms(false);
                  }}
                  className="text-white/60 hover:text-white hover:rotate-90 transition-all duration-300 text-2xl"
                >
                  ✕
                </button>
              </div>
              <p className="text-white/50 text-sm mt-1">Please read carefully before proceeding</p>
            </div>

            {/* Modal content with scroll animations */}
            <div className="p-6 space-y-6 text-white/80">
              <div className="animate-slide-up opacity-0" style={{ animationDelay: "0.05s", animationFillMode: "forwards" }}>
                <h3 className="text-lg font-bold text-yellow-500 mb-2 flex items-center gap-2">
                  <span className="text-xl">✨</span> What is Mapuyap
                </h3>
                <p className="text-sm leading-relaxed text-white/70">
                  Mapuyap is a premium chat platform exclusively for Mapúa University students and 
                  affiliated departments. It's a space where students can connect, collaborate, 
                  share academic experiences, and build meaningful connections within the Mapúa community.
                </p>
              </div>

              <div className="animate-slide-up opacity-0" style={{ animationDelay: "0.1s", animationFillMode: "forwards" }}>
                <h3 className="text-lg font-bold text-yellow-500 mb-2 flex items-center gap-2">
                  <span className="text-xl">📜</span> Terms and Conditions
                </h3>
                <p className="text-sm mb-2 text-white/60">By using Mapuyap, you agree to the following terms:</p>
                <ul className="text-sm space-y-2 list-disc pl-5 text-white/70">
                  <li className="hover:text-yellow-400 transition-colors duration-300">You must be a current Mapúa University student or affiliated with a listed department.</li>
                  <li className="hover:text-yellow-400 transition-colors duration-300">You are solely responsible for your interactions and messages on Mapuyap.</li>
                  <li className="hover:text-yellow-400 transition-colors duration-300">Do not share illegal, harmful, threatening, abusive, harassing, defamatory, vulgar, obscene, hateful, or discriminatory content.</li>
                  <li className="hover:text-yellow-400 transition-colors duration-300">Do not impersonate any other person, student, faculty member, or entity on Mapuyap.</li>
                  <li className="hover:text-yellow-400 transition-colors duration-300">Academic integrity violations (cheating, sharing exam answers, plagiarism) are strictly prohibited.</li>
                  <li className="hover:text-yellow-400 transition-colors duration-300">We reserve the right to terminate access for users who violate our community guidelines.</li>
                </ul>
              </div>

              <div className="animate-slide-up opacity-0" style={{ animationDelay: "0.15s", animationFillMode: "forwards" }}>
                <h3 className="text-lg font-bold text-yellow-500 mb-2 flex items-center gap-2">
                  <span className="text-xl">⚠️</span> Disclaimer of Liability
                </h3>
                <p className="text-sm leading-relaxed text-white/70">
                  Mapuyap is provided on an "as is" and "as available" basis. We make no warranties, 
                  express or implied, about the operation of Mapuyap or the information, content, 
                  or materials included. You expressly agree that your use of Mapuyap is at your sole risk.
                </p>
                <p className="text-sm leading-relaxed mt-2 text-white/60">
                  To the fullest extent permitted by law, we disclaim all liability for any direct, 
                  indirect, incidental, special, consequential, or exemplary damages arising out of 
                  or in connection with your use of Mapuyap, whether based on contract, tort, strict 
                  liability, or otherwise.
                </p>
              </div>

              <div className="border-l-2 border-yellow-500/50 pl-4 bg-gradient-to-r from-yellow-500/5 to-transparent p-4 rounded-lg animate-slide-up opacity-0" style={{ animationDelay: "0.2s", animationFillMode: "forwards" }}>
                <h3 className="text-md font-bold text-yellow-400 mb-1">📌 Third-Party Disclaimer</h3>
                <p className="text-xs leading-relaxed text-white/60">
                  Mapuyap is an independent service. We are not affiliated with, endorsed by, 
                  or connected to Mapúa University, its official platforms, or any other external 
                  services. Any references to academic departments are for organizational purposes only.
                </p>
              </div>

              {/* Checkbox agreement with glow effect */}
              <div className="flex items-start gap-3 pt-4 border-t border-yellow-500/30 animate-slide-up opacity-0" style={{ animationDelay: "0.25s", animationFillMode: "forwards" }}>
                <input
                  type="checkbox"
                  id="termsAgreement"
                  checked={agreedToTerms}
                  onChange={(e) => setAgreedToTerms(e.target.checked)}
                  className="mt-1 w-5 h-5 accent-yellow-500 cursor-pointer transition-all duration-300 hover:scale-110"
                />
                <label htmlFor="termsAgreement" className="text-sm cursor-pointer group">
                  <span className="font-bold text-yellow-400 group-hover:text-yellow-300 transition-colors duration-300">I confirm that I am over 18 years old</span>
                  <span className="text-white/60"> and </span>
                  <span className="font-bold text-yellow-400 group-hover:text-yellow-300 transition-colors duration-300">I agree to Mapuyap's Terms and Conditions</span>
                  <span className="text-white/60">, including the Disclaimer of Liability.</span>
                </label>
              </div>
            </div>

            {/* Modal footer with enhanced button */}
            <div className="sticky bottom-0 bg-gradient-to-br from-gray-950 to-black border-t border-yellow-500/30 p-6 backdrop-blur-sm">
              <button
                onClick={startChat}
                disabled={!agreedToTerms}
                className="w-full bg-gradient-to-r from-red-700 via-red-600 to-yellow-500 rounded-lg py-3 font-bold text-white transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:hover:scale-100 relative overflow-hidden group"
              >
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12"></div>
                <span className="relative z-10">
                  {!agreedToTerms ? "✓ Agree to terms to continue" : "✓ ACCEPT & CONTINUE TO CHAT"}
                </span>
              </button>
              <p className="text-center text-white/40 text-xs mt-3">
                By continuing, you agree to our full Terms & Conditions
              </p>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        
        @keyframes slide-in {
          from { 
            opacity: 0;
            transform: scale(0.95) translateY(30px);
          }
          to { 
            opacity: 1;
            transform: scale(1) translateY(0);
          }
        }
        
        @keyframes slide-up {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes float {
          0%, 100% { transform: translateY(0px) translateX(0px); }
          50% { transform: translateY(-20px) translateX(10px); }
        }
        
        @keyframes float-delayed {
          0%, 100% { transform: translateY(0px) translateX(0px); }
          50% { transform: translateY(20px) translateX(-10px); }
        }
        
        @keyframes float-slow {
          0%, 100% { transform: translateY(0px) scale(1); }
          50% { transform: translateY(-10px) scale(1.05); }
        }
        
        @keyframes pulse-ring {
          0% { transform: scale(1); opacity: 0.3; }
          100% { transform: scale(2); opacity: 0; }
        }
        
        @keyframes bounce-subtle {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-3px); }
        }
        
        @keyframes pulse-slow {
          0%, 100% { opacity: 0.4; }
          50% { opacity: 0.8; }
        }
        
        @keyframes glitch {
          0%, 100% { transform: skew(0deg, 0deg); }
          95% { transform: skew(0deg, 0deg); }
          96% { transform: skew(2deg, 1deg); }
          97% { transform: skew(-1deg, -0.5deg); }
          98% { transform: skew(0.5deg, 0.2deg); }
        }
        
        .animate-in { animation: fade-in 0.2s ease-out; }
        .slide-in { animation: slide-in 0.4s cubic-bezier(0.34, 1.2, 0.64, 1); }
        .animate-slide-up { animation: slide-up 0.5s ease-out forwards; }
        .float-3d { animation: float 8s ease-in-out infinite; }
        .float-3d-reverse { animation: float-delayed 10s ease-in-out infinite; }
        .float-3d-slow { animation: float-slow 12s ease-in-out infinite; }
        .pulse-ring { animation: pulse-ring 4s ease-out infinite; }
        .animate-bounce-subtle { animation: bounce-subtle 2s ease-in-out infinite; }
        .animate-pulse-slow { animation: pulse-slow 3s ease-in-out infinite; }
        .animation-delay-300 { animation-delay: 0.3s; }
        .animate-glitch { animation: glitch 8s infinite; }
        
        .glow-button:hover {
          box-shadow: 0 0 30px rgba(234, 179, 8, 0.3);
        }
        
        .shadow-glow-corner {
          filter: drop-shadow(0 0 8px rgba(234, 179, 8, 0.5));
        }
        
        .shadow-glow-red {
          box-shadow: 0 0 20px rgba(220, 38, 38, 0.2);
        }
        
        .border-gradient-to-r {
          border-image: linear-gradient(to right, transparent, rgba(234, 179, 8, 0.3), transparent) 1;
        }
        
        ::-webkit-scrollbar {
          width: 8px;
        }
        
        ::-webkit-scrollbar-track {
          background: #1a1a1a;
          border-radius: 10px;
        }
        
        ::-webkit-scrollbar-thumb {
          background: linear-gradient(to bottom, #dc2626, #eab308);
          border-radius: 10px;
        }
        
        ::-webkit-scrollbar-thumb:hover {
          background: linear-gradient(to bottom, #ef4444, #fbbf24);
        }
      `}</style>
    </main>
  );
}