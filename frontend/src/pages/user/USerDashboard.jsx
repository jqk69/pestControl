import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

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
      const token = sessionStorage.getItem('token');
      const response = await fetch('http://localhost:5000/user/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ message: userInput }),
      });

      const data = await response.json();
      const reply = data.reply || "Sorry, I didn't understand that.";
      setChatMessages((prev) => [...prev, { type: 'bot', text: reply }]);
      setUserInput('');
    } catch (err) {
      console.error('Chat error:', err);
      setChatMessages((prev) => [
        ...prev,
        { type: 'bot', text: 'Sorry, something went wrong. Please try again.' },
      ]);
    }
  };

  return (
    <main className="flex-1 overflow-y-auto p-6 bg-gray-900 text-gray-100">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-100 mb-2">
          Welcome {username},
        </h1>
        <p className="text-lg text-gray-400">
          to your one-stop solution for all pest-related problems
        </p>
      </div>

      <div className="bg-gray-800 rounded-lg shadow-lg p-8 max-w-8xl mb-6 bg-gradient-to-l from-gray-700 to-gray-800">
        <h2 className="text-4xl font-bold text-gray-100 mb-4">
          Ready to get started? Book your first pest control service now!
        </h2>
        <p className="text-gray-400 mb-6">
          We've helped thousands of families enjoy pest-free homes with our trusted services.
        </p>
        <div className="flex flex-wrap gap-4 pt-6 justify-end">
          <button
            className="bg-green-600 hover:bg-green-500 text-white font-medium py-3 px-10 mx-6 rounded-2xl transition duration-300"
            onClick={(e) => handleNavigate(e, 'services')}
          >
            Book a service →
          </button>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-6">
        <div className="bg-gray-800 rounded-lg p-8 flex-1 shadow-lg">
          <h2 className="text-2xl font-bold text-gray-100 mb-6">Our Impact</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-gray-700 p-6 rounded-lg">
              <h3 className="text-4xl font-bold text-green-400 mb-2">10,000+</h3>
              <p className="text-gray-400">Families Protected</p>
            </div>
            <div className="bg-gray-700 p-6 rounded-lg">
              <h3 className="text-4xl font-bold text-green-400 mb-2">95%</h3>
              <p className="text-gray-400">Customer Satisfaction</p>
            </div>
            <div className="bg-gray-700 p-6 rounded-lg">
              <h3 className="text-4xl font-bold text-green-400 mb-2">24/7</h3>
              <p className="text-gray-400">Support Available</p>
            </div>
            <button
              className="border border-green-500 text-green-400 hover:bg-green-600 hover:text-white font-medium py-2 px-6 rounded transition duration-300"
              onClick={(e) => handleNavigate(e, 'services')}
            >
              Explore Our Services →
            </button>
          </div>
        </div>

        <div className="bg-gray-800 rounded-lg shadow-lg p-8 flex-1">
          <h2 className="text-2xl font-bold text-gray-100 mb-6">Customer Testimonials</h2>
          <div className="space-y-4">
            {[
              { quote: 'Pestilee solved my ant problem in 24 hours!', author: 'Sarah K.' },
              { quote: 'The team was professional and thorough.', author: 'Michael T.' },
              { quote: 'Very friendly and quick service!', author: 'Anita P.' },
            ].map((testimonial, index) => (
              <div
                key={index}
                className="border-l-4 border-green-500 pl-4 py-2 bg-gray-700 rounded-r-md"
              >
                <p className="text-gray-300 italic">"{testimonial.quote}"</p>
                <p className="text-sm text-gray-500 mt-1">— {testimonial.author}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Chat Button */}
      <button
        onClick={toggleChat}
        className="fixed bottom-6 right-6 bg-green-600 hover:bg-green-500 text-white p-4 rounded-full shadow-lg transition duration-300"
      >
        💬
      </button>

      {/* Chat Window */}
      {chatOpen && (
        <div className="fixed bottom-20 right-6 w-80 h-[400px] bg-gray-800 shadow-xl rounded-lg p-4 flex flex-col z-50 border border-gray-700">
          <h3 className="text-xl font-bold text-gray-100 mb-4">Chat with us</h3>
          <div className="flex flex-col h-full bg-gray-700 rounded-md">
            {/* Messages */}
            <div className="flex-grow overflow-y-auto p-4 space-y-2">
              {chatMessages.map((msg, index) => (
                <div
                  key={index}
                  className={`text-sm p-2 rounded-md max-w-[75%] whitespace-pre-line ${
                    msg.type === 'user'
                      ? 'bg-green-600 text-white ml-auto'
                      : 'bg-gray-600 text-gray-200 mr-auto'
                  }`}
                >
                  {msg.text.split('\n').map((line, i) => (
                    <p key={i}>{line}</p>
                  ))}
                </div>
              ))}
            </div>

            {/* Input */}
            <div className="flex items-center p-2 border-t border-gray-600">
              <input
                type="text"
                className="flex-1 p-2 bg-gray-800 text-gray-100 border border-gray-600 rounded-l-md focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="Type your message..."
                value={userInput}
                onChange={(e) => setUserInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
              />
              <button
                className="bg-green-600 text-white p-2 rounded-r-md hover:bg-green-500 transition duration-300"
                onClick={handleSendMessage}
              >
                Send
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}