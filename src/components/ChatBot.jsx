import React, { useState, useEffect } from 'react';
import axios from 'axios';

// ฟังก์ชันแสดงข้อความทีละตัว
function typeWriter(element, text, speed = 50) {
  let i = 0;
  function typing() {
    if (i < text.length) {
      element.innerHTML += text.charAt(i);
      i++;
      setTimeout(typing, speed);
    }
  }
  typing();
}

const ChatBot = () => {
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [userMessage, setUserMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const toggleChat = () => {
    setIsChatOpen(!isChatOpen);
  };

  const closeChat = () => {
    setIsChatOpen(false);
  };

  const sendMessage = async (message) => {
    setLoading(true);
    const response = await axios.post('https://deeyingsystem.onrender.com/chat', { message });
    const reply = response.data.reply;

    setMessages([...messages, { user: message, bot: reply }]);
    setLoading(false);
  };

  useEffect(() => {
    const savedMessages = JSON.parse(localStorage.getItem('chatMessages')) || [];
    setMessages(savedMessages);
  }, []);

  useEffect(() => {
    localStorage.setItem('chatMessages', JSON.stringify(messages));
  }, [messages]);

  return (
    <div>
      {!isChatOpen && (
        <button
          onClick={toggleChat}
          style={{
            position: 'fixed',
            bottom: '20px',
            right: '20px',
            borderRadius: '50%',
            backgroundColor: '#007bff',
            color: 'white',
            padding: '15px',
            fontSize: '16px',
            cursor: 'pointer',
            boxShadow: '0px 0px 10px rgba(0, 0, 0, 0.2)',
            zIndex: 9999, // เพิ่ม z-index
          }}
        >
          Chat
        </button>
      )}

      {isChatOpen && (
        <div
          style={{
            position: 'fixed',
            bottom: '0px',
            right: '20px',
            width: '320px',
            height: '450px',
            backgroundColor: 'white',
            borderRadius: '10px',
            boxShadow: '0px 5px 20px rgba(0, 0, 0, 0.3)',
            display: 'flex',
            flexDirection: 'column',
            zIndex: 9999, // เพิ่ม z-index
          }}
        >
          {/* Header of the chat */}
          <div
            style={{
              backgroundColor: '#007bff',
              color: 'white',
              padding: '10px',
              borderRadius: '10px 10px 0 0',
              fontWeight: 'bold',
              textAlign: 'center',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <span>Chat Bot</span>
            <button
              onClick={closeChat}
              style={{
                background: 'transparent',
                border: 'none',
                color: 'white',
                fontSize: '20px',
                cursor: 'pointer',
              }}
            >
              -
            </button>
          </div>

          {/* Messages Container */}
          <div
            id="chat-history"
            style={{
              padding: '10px',
              flex: 1,
              overflowY: 'auto',
              backgroundColor: '#f9f9f9',
              borderRadius: '0 0 10px 10px',
            }}
          >
            {messages.map((msg, index) => (
              <div key={index} style={{ marginBottom: '15px' }}>
                {/* User message */}
                <div
                  style={{
                    maxWidth: '70%',
                    backgroundColor: '#007bff',
                    color: 'white',
                    padding: '10px',
                    borderRadius: '20px',
                    marginLeft: 'auto',
                    textAlign: 'right',
                    marginTop: '10px',
                    boxShadow: '0px 4px 10px rgba(0, 0, 0, 0.1)',
                  }}
                >
                  <strong>You:</strong> {msg.user}
                </div>

                {/* Bot message */}
                <div
                  style={{
                    maxWidth: '70%',
                    backgroundColor: '#e0e0e0',
                    color: 'black',
                    padding: '10px',
                    borderRadius: '20px',
                    marginRight: 'auto',
                    marginTop: '10px',
                    boxShadow: '0px 4px 10px rgba(0, 0, 0, 0.1)',
                  }}
                >
                  <strong>Bot:</strong> <span id={`bot-message-${index}`}>{msg.bot}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Input and Send Button */}
          <div
            style={{
              padding: '10px',
              display: 'flex',
              alignItems: 'center',
              backgroundColor: '#fff',
              borderTop: '1px solid #ccc',
            }}
          >
            <input
              type="text"
              value={userMessage}
              onChange={(e) => setUserMessage(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  sendMessage(userMessage);
                  setUserMessage('');
                }
              }}
              style={{
                width: '80%',
                padding: '12px',
                borderRadius: '20px',
                border: '1px solid #ccc',
                marginRight: '10px',
                fontSize: '16px',
              }}
              placeholder="Type a message..."
            />
            <button
              onClick={() => {
                sendMessage(userMessage);
                setUserMessage('');
              }}
              style={{
                padding: '12px 20px',
                backgroundColor: '#007bff',
                color: 'white',
                border: 'none',
                borderRadius: '20px',
                cursor: 'pointer',
              }}
            >
              Send
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatBot;
