import React, { useState } from "react";
import axios from "axios";
import { Send, MessageCircle } from "lucide-react";

const Chatbot = () => {
  const [message, setMessage] = useState("");
  const [chatHistory, setChatHistory] = useState([]);
  const [isOpen, setIsOpen] = useState(false);

  const sendMessage = async () => {
    if (!message.trim()) return;

    const userMessage = { sender: "User", text: message };
    setChatHistory([...chatHistory, userMessage]);

    try {
      const response = await axios.post("http://localhost:8000/chat", {
        message: message,
      });

      const botResponse = { sender: "Bot", text: response.data.response };
      setChatHistory([...chatHistory, userMessage, botResponse]);
    } catch (error) {
      console.error("Error fetching chatbot response:", error);
    }

    setMessage("");
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      sendMessage();
    }
  };

  return (
    <>
      {/* Chat bubble button (when closed) */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-full w-14 h-14 flex items-center justify-center shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 z-50 animate-bounce"
        >
          <MessageCircle size={24} />
        </button>
      )}

      {/* Chatbot window (when open) */}
      {isOpen && (
        <div className="fixed bottom-6 right-6 bg-white shadow-2xl rounded-2xl w-80 overflow-hidden border border-gray-200 transition-all duration-300 z-50">
          {/* Chat header */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-4 flex justify-between items-center">
            <div className="flex items-center">
              <MessageCircle size={20} className="mr-2" />
              <h3 className="font-semibold">Support Assistant</h3>
            </div>
            <button 
              onClick={() => setIsOpen(false)} 
              className="text-white hover:text-blue-200 transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          </div>

          {/* Chat messages */}
          <div className="h-64 overflow-y-auto p-4 bg-gray-50">
            {chatHistory.length === 0 ? (
              <div className="text-center text-gray-400 mt-12 flex flex-col items-center">
                <MessageCircle size={30} className="mb-2 text-blue-400 opacity-50" />
                <p>How can I help you today?</p>
              </div>
            ) : (
              chatHistory.map((chat, index) => (
                <div
                  key={index}
                  className={`p-3 rounded-2xl text-sm mb-2 max-w-[80%] shadow-sm ${
                    chat.sender === "User"
                      ? "bg-gradient-to-r from-blue-500 to-blue-600 text-white ml-auto rounded-tr-none"
                      : "bg-white text-gray-800 rounded-tl-none border border-gray-200"
                  }`}
                >
                  {chat.text}
                </div>
              ))
            )}
          </div>

          {/* Input area */}
          <div className="p-3 bg-white border-t border-gray-200">
            <div className="flex bg-gray-100 rounded-full overflow-hidden focus-within:ring-2 focus-within:ring-blue-400 focus-within:bg-white transition-all duration-200">
              <input
                type="text"
                className="flex-1 p-2 px-4 bg-transparent border-none outline-none text-sm"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Type a message..."
              />
              <button
                className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-2 rounded-full m-1 w-8 h-8 flex items-center justify-center hover:from-blue-600 hover:to-blue-700 transition-colors"
                onClick={sendMessage}
              >
                <Send size={14} />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Chatbot;