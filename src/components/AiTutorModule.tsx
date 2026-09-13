import React, { useState, useRef, useEffect } from "react";
import { Message } from "../types";
import { Send, Sparkles, User, MessageCircle, HelpCircle } from "lucide-react";

export default function AiTutorModule() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "initial",
      role: "assistant",
      content: "Hello! I am your AI Master Chocolatier. Whether you want to calibrate an artisanal cocoa roasting profile, troubleshoot thick melanger viscosity, refine your tempering curve, or configure professional panning seals for coated hazelnuts—I am here to guide you. What are you crafting today?",
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const samplePrompts = [
    "How do I roast Madagascar beans for bright acidity?",
    "Why is my coated nuts panning dull & matte?",
    "How much lecithin reduces viscosity in a 1kg batch?",
    "Explain why chocolate seizes when a drop of water falls in."
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleSendMessage = async (textToSend: string) => {
    if (!textToSend.trim() || isLoading) return;

    const userMsg: Message = {
      id: Math.random().toString(36).substring(7),
      role: "user",
      content: textToSend,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsLoading(true);

    try {
      // Map message history to simple roles for API payload
      const payloadHistory = messages.slice(1).map((m) => ({
        role: m.role,
        text: m.content,
      }));

      const res = await fetch("/api/tutor", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: textToSend,
          history: payloadHistory,
        }),
      });

      if (!res.ok) {
        throw new Error("Failed to consult chocolatier server API");
      }

      const data = await res.json();

      const assistantMsg: Message = {
        id: Math.random().toString(36).substring(7),
        role: "assistant",
        content: data.text || "I was unable to formulate a response. Please try again.",
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, assistantMsg]);
    } catch (error: any) {
      console.error("AI tutor communication failure:", error);
      const errorMsg: Message = {
        id: Math.random().toString(36).substring(7),
        role: "assistant",
        content: "Error: My connection to the roasting room was lost. Please check your network and try consulting again.",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-8" id="ai-tutor-container">
      {/* Suggestions Sidebar */}
      <div className="lg:col-span-1 bg-amber-50/50 border border-amber-100/50 rounded-3xl p-5 space-y-4 h-max" id="ai-suggestions-panel">
        <h4 className="font-extrabold text-amber-950 text-sm flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-amber-800" /> Chocolatier Prompts
        </h4>
        <p className="text-[11px] text-amber-900 leading-normal">
          Click on any query below to immediately consult the master chef on specific chemistry or formulas:
        </p>
        <div className="space-y-2" id="prompt-pills-container">
          {samplePrompts.map((prompt) => (
            <button
              key={prompt}
              id={`pill-btn-${prompt.toLowerCase().substring(0, 15).replace(/\s+/g, "-")}`}
              onClick={() => handleSendMessage(prompt)}
              className="w-full text-left p-3 rounded-xl bg-white border border-amber-100/60 hover:border-amber-950/40 text-xs text-amber-950 leading-snug cursor-pointer font-medium hover:bg-amber-50 transition-all duration-150"
            >
              {prompt}
            </button>
          ))}
        </div>
      </div>

      {/* Main Chat Interface */}
      <div className="lg:col-span-3 bg-white border border-gray-100 rounded-3xl p-6 shadow-sm flex flex-col h-[550px]" id="chat-messages-panel">
        <div className="border-b border-gray-50 pb-3 flex items-center gap-2.5">
          <div className="bg-amber-100 p-2 rounded-xl text-amber-950">
            <MessageCircle className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-extrabold text-gray-950 text-base">Expert Tutor Consulting Room</h3>
            <p className="text-[10px] text-gray-400">Powered by server-side Gemini 3.5 Flash</p>
          </div>
        </div>

        {/* Chat log */}
        <div className="flex-1 overflow-y-auto py-4 space-y-4 px-1" id="chat-scroll-viewport">
          {messages.map((m) => {
            const isUser = m.role === "user";
            return (
              <div
                key={m.id}
                className={`flex gap-3 max-w-[85%] ${isUser ? "ml-auto flex-row-reverse" : ""}`}
              >
                <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 text-xs ${
                  isUser ? "bg-amber-950 text-amber-50" : "bg-amber-100 text-amber-950"
                }`}>
                  {isUser ? <User className="w-4 h-4" /> : <Sparkles className="w-4 h-4" />}
                </div>
                <div className={`p-4 rounded-2xl text-xs leading-relaxed font-sans ${
                  isUser
                    ? "bg-amber-950 text-amber-50 rounded-tr-none"
                    : "bg-gray-50 border border-gray-100 text-gray-800 rounded-tl-none"
                }`}>
                  <p className="whitespace-pre-line">{m.content}</p>
                </div>
              </div>
            );
          })}

          {isLoading && (
            <div className="flex gap-3 max-w-[80%]" id="assistant-typing-indicator">
              <div className="w-8 h-8 rounded-full bg-amber-100 text-amber-950 flex items-center justify-center text-xs">
                <Sparkles className="w-4 h-4 animate-spin" />
              </div>
              <div className="p-4 rounded-2xl text-xs bg-gray-50 border border-gray-100 text-gray-400 rounded-tl-none">
                <span className="animate-pulse">Chef is writing out technical answer...</span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input box */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage(input);
          }}
          className="border-t border-gray-100 pt-4 flex gap-2"
          id="chat-input-form"
        >
          <input
            type="text"
            id="chat-message-input"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={isLoading}
            placeholder="Ask anything about roasting, conching, Beta V crystals, or panning seals..."
            className="flex-1 px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-1 focus:ring-amber-950 text-xs"
          />
          <button
            type="submit"
            id="chat-send-btn"
            disabled={!input.trim() || isLoading}
            className={`px-4 py-3 rounded-xl text-amber-50 font-bold text-xs flex items-center gap-1 cursor-pointer transition-all ${
              !input.trim() || isLoading
                ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                : "bg-amber-950 hover:bg-amber-900 shadow"
            }`}
          >
            <Send className="w-3.5 h-3.5" /> Consult
          </button>
        </form>
      </div>
    </div>
  );
}
