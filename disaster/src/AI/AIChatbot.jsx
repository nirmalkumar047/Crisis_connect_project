// frontend/src/components/AI/AIChatbot.jsx
import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, Send, Bot, User, Phone, AlertTriangle } from 'lucide-react';

const AIChatbot = ({ onEmergencyDetected }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: 1,
      type: 'ai',
      content: "👋 Hi! I'm your CrisisConnect AI Assistant. I can help you report emergencies, get information, or connect you with help. What's happening?",
      timestamp: new Date()
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessage = async () => {
    if (!inputMessage.trim()) return;

    const userMessage = {
      id: Date.now(),
      type: 'user',
      content: inputMessage,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsTyping(true);

    try {
      const response = await fetch('/api/ai/emergency-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: inputMessage,
          context: {
            previousMessages: messages.slice(-5),
            timestamp: new Date().toISOString()
          }
        })
      });

      const aiResponse = await response.json();

      const aiMessage = {
        id: Date.now() + 1,
        type: 'ai',
        content: aiResponse.message,
        actions: aiResponse.actions || [],
        urgencyLevel: aiResponse.urgencyLevel,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, aiMessage]);

      // Auto-trigger emergency form if high urgency detected
      if (aiResponse.urgencyLevel > 0.8) {
        onEmergencyDetected({
          extractedData: aiResponse.emergencyData,
          urgency: aiResponse.urgencyLevel,
          aiSummary: aiResponse.summary
        });
      }

    } catch (error) {
      console.error('AI Chat Error:', error);
      const errorMessage = {
        id: Date.now() + 1,
        type: 'ai',
        content: "I'm sorry, I'm having trouble connecting right now. For immediate emergencies, please call emergency services or use the emergency form directly.",
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleQuickAction = (action) => {
    switch (action.type) {
      case 'call_emergency':
        window.open('tel:911', '_self');
        break;
      case 'open_form':
        onEmergencyDetected({ openForm: true });
        break;
      case 'get_location':
        if (navigator.geolocation) {
          navigator.geolocation.getCurrentPosition((position) => {
            setInputMessage(`I'm at coordinates: ${position.coords.latitude}, ${position.coords.longitude}`);
          });
        }
        break;
    }
  };

  return (
    <>
      {/* Floating Chat Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`fixed bottom-6 right-6 w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-full shadow-2xl hover:shadow-3xl transition-all duration-300 z-50 flex items-center justify-center ${
          isOpen ? 'rotate-180' : 'animate-bounce'
        }`}
      >
        <MessageCircle size={24} />
      </button>

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-24 right-6 w-96 h-[500px] bg-white rounded-2xl shadow-2xl z-40 flex flex-col overflow-hidden border-2 border-blue-100">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-4 flex items-center gap-3">
            <div className="w-10 h-10 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
              <Bot size={20} />
            </div>
            <div>
              <h3 className="font-bold">CrisisConnect AI</h3>
              <p className="text-xs text-blue-100">Emergency Assistant</p>
            </div>
            <div className="ml-auto">
              <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
            {messages.map(message => (
              <div key={message.id} className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-xs rounded-2xl p-3 ${
                  message.type === 'user' 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-white text-gray-800 shadow-md'
                }`}>
                  <div className="flex items-start gap-2">
                    {message.type === 'ai' && (
                      <Bot size={16} className="text-blue-600 mt-1 flex-shrink-0" />
                    )}
                    <div className="flex-1">
                      <p className="text-sm">{message.content}</p>
                      
                      {/* AI Actions */}
                      {message.actions && message.actions.length > 0 && (
                        <div className="mt-2 space-y-1">
                          {message.actions.map((action, index) => (
                            <button
                              key={index}
                              onClick={() => handleQuickAction(action)}
                              className={`block w-full text-left text-xs p-2 rounded-lg transition-colors ${
                                action.type === 'call_emergency' 
                                  ? 'bg-red-100 hover:bg-red-200 text-red-800'
                                  : 'bg-blue-100 hover:bg-blue-200 text-blue-800'
                              }`}
                            >
                              {action.type === 'call_emergency' && <Phone size={12} className="inline mr-1" />}
                              {action.type === 'open_form' && <AlertTriangle size={12} className="inline mr-1" />}
                              {action.text}
                            </button>
                          ))}
                        </div>
                      )}
                      
                      {/* Urgency Indicator */}
                      {message.urgencyLevel && message.urgencyLevel > 0.7 && (
                        <div className="mt-2 flex items-center gap-1">
                          <AlertTriangle size={12} className="text-red-500" />
                          <span className="text-xs text-red-600 font-medium">High Urgency Detected</span>
                        </div>
                      )}
                    </div>
                  </div>
                  <p className="text-xs opacity-70 mt-1">{message.timestamp.toLocaleTimeString()}</p>
                </div>
              </div>
            ))}
            
            {/* Typing Indicator */}
            {isTyping && (
              <div className="flex justify-start">
                <div className="bg-white rounded-2xl p-3 shadow-md">
                  <div className="flex items-center gap-2">
                    <Bot size={16} className="text-blue-600" />
                    <div className="flex gap-1">
                      <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                      <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                    </div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="p-4 border-t border-gray-200 bg-white">
            <div className="flex gap-2">
              <input
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                placeholder="Type your message..."
                className="flex-1 border border-gray-300 rounded-full px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                disabled={isTyping}
              />
              <button
                onClick={sendMessage}
                disabled={!inputMessage.trim() || isTyping}
                className="bg-blue-600 text-white rounded-full p-2 hover:bg-blue-700 disabled:opacity-50 transition-colors"
              >
                <Send size={16} />
              </button>
            </div>
            
            {/* Quick Actions */}
            <div className="flex gap-2 mt-2">
              <button
                onClick={() => setInputMessage("This is an emergency!")}
                className="text-xs bg-red-100 text-red-700 px-3 py-1 rounded-full hover:bg-red-200 transition-colors"
              >
                🚨 Emergency
              </button>
              <button
                onClick={() => setInputMessage("I need medical help")}
                className="text-xs bg-blue-100 text-blue-700 px-3 py-1 rounded-full hover:bg-blue-200 transition-colors"
              >
                🏥 Medical
              </button>
              <button
                onClick={() => setInputMessage("What's my location?")}
                className="text-xs bg-green-100 text-green-700 px-3 py-1 rounded-full hover:bg-green-200 transition-colors"
              >
                📍 Location
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default AIChatbot;
