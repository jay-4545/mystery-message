"use client";

import React, { useState, useRef, useEffect } from "react";
import { User, Bot, Loader, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type Message = {
  text: string;
  sender: "user" | "ai";
};

function ChatBox() {
  const [input, setInput] = useState<string>("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim() || loading) return;

    const newMessages: Message[] = [
      ...messages,
      { text: input, sender: "user" },
    ];
    setMessages(newMessages);
    setInput("");
    setLoading(true);

    try {
      const response = await fetch("/api/customer-care", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: input }),
      });

      const data = await response.json();
      const aiMessage: string = data.message || "Error fetching AI response.";

      setMessages([...newMessages, { text: aiMessage, sender: "ai" }]);
    } catch (error) {
      console.error("Error:", error);
      setMessages([
        ...newMessages,
        { text: "AI response failed.", sender: "ai" },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") sendMessage();
  };

  return (
    <div className="my-8 2xl:px-[200px] lg:px-12 px-6">
      <div className="flex flex-col">
        <div className="h-80 overflow-y-auto border-b p-2 space-y-2 border rounded-lg">
          {messages.map((msg, index) => (
            <div
              key={index}
              className={`flex items-end ${msg.sender === "user" ? "justify-end" : "justify-start"}`}
            >
              {msg.sender === "ai" ? (
                <div className="flex items-center gap-2">
                  <Bot className="w-8 h-8 p-1 rounded-full bg-gray-300" />
                  <div className="bg-gray-300 text-black p-2 rounded-lg max-w-xs">
                    {msg.text}
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <div className="bg-blue-500 text-white p-2 rounded-lg max-w-xs">
                    {msg.text}
                  </div>
                  <User className="w-8 h-8 p-1 rounded-full bg-blue-500 text-white" />
                </div>
              )}
            </div>
          ))}
          {loading && (
            <div className="flex items-center gap-2 text-gray-500">
              <Bot className="w-8 h-8 p-1 rounded-full bg-gray-300" />
              <div className="bg-gray-300 text-black p-2 rounded-lg max-w-xs flex items-center gap-1">
                <Loader className="animate-spin w-4 h-4" />
                AI is typing...
              </div>
            </div>
          )}
          <div ref={chatEndRef} />
        </div>

        <div className="flex gap-2 mt-2">
          <Input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type a message..."
            className="flex-1 p-3"
            disabled={loading}
          />
          <Button
            onClick={sendMessage}
            disabled={loading || input.length === 0}
          >
            <Send />
          </Button>
        </div>
      </div>
    </div>
  );
}

export default ChatBox;
