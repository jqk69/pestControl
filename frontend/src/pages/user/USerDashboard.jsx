import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function UserDashboard() {
  const [chatOpen, setChatOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState([
    { type: 'bot', text: 'How can I assist you today?' },
  ]);
  const [userInput, setUserInput] = useState('');
  const username = sessionStorage.getItem('username');
  const navigate = useNavigate();

  const handleNavigate = (e, path) => {
    e.preventDefault();
    navigate(`/user/${path}`);
  };

  const toggleChat = () => {
    setChatOpen(!chatOpen);
  };

  const handleSendMessage = async () => {
    if (!userInput.trim()) return;

    const newMessages = [...chatMessages, { type: 'user', text: userInput }];
    setChatMessages(newMessages);

    try {
      const token = sessionStorage.getItem("token");
      const response = await fetch("http://localhost:5000/user/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ message: userInput }),
      });

      const data = await response.json();
      const reply = data.reply || "Sorry, I didn't understand that.";
      setChatMessages((prev) => [...prev, { type: 'bot', text: reply }]);
      setUserInput('');
    } catch (err) {
      console.error("Chat error:", err);
    }
  };

  return (
    <>
      <main className="flex-1 overflow-y-auto p-6">
        <div className="mb-7">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            Welcome {username},
          </h1>
          <p className="text-lg text-gray-600">
            to your one stop solution for all pest related problems
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-md p-8 max-w-10xl h-70 mb-5 bg-gradient-to-l from-gray-50 to-gray-300">
          <h2 className="text-4xl font-bold text-gray-800 mb-4 ">
            Ready to get started? Book your first pest control service now!
          </h2>
          <p className="text-gray-600 mb-6">
            We've helped thousands of families enjoy pest-free homes with our trusted services.
          </p>
          <div className="flex flex-wrap gap-4 pt-6 justify-end-safe">
            <button
              className="bg-black hover:bg-gray-700 text-white font-medium py-2 px-9 mx-6 rounded-2xl transition h-20"
              onClick={(e) => handleNavigate(e, 'services')}
            >
              Book a service →
            </button>
          </div>
        </div>

        <div className="flex flex-col md:flex-row gap-6 h-88">
          <div className="bg-white rounded-lg p-8 flex-1 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.2)]">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Our Impact</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-green-50 p-6 rounded-lg">
                <h3 className="text-4xl font-bold text-green-600 mb-2">10,000+</h3>
                <p className="text-gray-600">Families Protected</p>
              </div>
              <div className="bg-green-50 p-6 rounded-lg">
                <h3 className="text-4xl font-bold text-green-600 mb-2">95%</h3>
                <p className="text-gray-600">Customer Satisfaction</p>
              </div>
              <div className="bg-gray-200 p-6 rounded-lg">
                <h3 className="text-4xl font-bold text-green-600 mb-2">24/7</h3>
                <p className="text-gray-600">Support Available</p>
              </div>

              <button className="border border-green-600 text-green-600 hover:bg-green-50 font-medium py-2 px-6 rounded transition">
                Explore Our Services →
              </button>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-8 flex-1">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Customer Testimonials</h2>
            <div className="space-y-4">
              <div className="border-l-4 border-green-500 pl-4 py-2 bg-green-50">
                <p className="text-gray-600 italic">"Pestilee solved my ant problem in 24 hours!"</p>
                <p className="text-sm text-gray-500 mt-1">— Sarah K.</p>
              </div>
              <div className="border-l-4 border-green-500 pl-4 py-2 bg-green-50">
                <p className="text-gray-600 italic">"The team was professional and thorough."</p>
                <p className="text-sm text-gray-500 mt-1">— Michael T.</p>
              </div>
              <div className="border-l-4 border-green-500 pl-4 py-2 bg-green-50">
                <p className="text-gray-600 italic">"Very friendly and quick service!"</p>
                <p className="text-sm text-gray-500 mt-1">— Anita P.</p>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Chat Button */}
      <button
        onClick={toggleChat}
        className="fixed bottom-5 right-5 bg-blue-600 hover:bg-blue-700 text-white p-4 rounded-full shadow-lg"
      >
        💬
      </button>

      {/* Chat Window */}
      {chatOpen && (
        <div className="fixed bottom-16 right-5 w-100 h-126 bg-white shadow-lg rounded-lg p-4 flex flex-col z-50">
          <h3 className="text-xl font-bold mb-4">Chat with us</h3>
          <div className="flex flex-col h-full bg-gray-50 rounded-md">
            {/* Messages */}
            <div className="flex-grow overflow-y-auto p-4 bg-gray-100 rounded-t-md space-y-2">
              {chatMessages.map((msg, index) => (
                <div
                  key={index}
                  className={`text-sm p-2 rounded-md max-w-[75%] whitespace-pre-line ${
                    msg.type === 'user'
                      ? 'bg-blue-100 self-end text-right ml-auto'
                      : 'bg-gray-200 self-start text-left mr-auto'
                  }`}
                >
                  {msg.text.split('\n').map((line, i) => (
                    <p key={i}>{line}</p>
                  ))}
                </div>
              ))}

            </div>

            {/* Input */}
            <div className="flex items-center p-2 border-t border-gray-300">
              <input
                type="text"
                className="flex-1 p-2 border rounded-l-md focus:outline-none"
                placeholder="Type your message..."
                value={userInput}
                onChange={(e) => setUserInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
              />
              <button
                className="bg-blue-600 text-white p-2 rounded-r-md hover:bg-blue-700 transition"
                onClick={handleSendMessage}
              >
                Send
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
