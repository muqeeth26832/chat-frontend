import React, { useEffect, useState } from "react";
import { FiSettings, FiSend } from "react-icons/fi";

const Chat = () => {
  const [ws, setWs] = useState(null);

  useEffect(() => {
    const ws = new WebSocket(`ws://${import.meta.env.VITE_WSL_URL}`);
    setWs(ws);
    ws.addEventListener('message',handleMessage)
  }, []); // only when mounts
  

  function handleMessage(e){
      console.log("New message ",e)
  }

  //
  const [message, setMessage] = useState("");
  const [contacts, setContacts] = useState([
    { id: 1, name: "John Doe" },
    { id: 2, name: "Jane Smith" },
    { id: 3, name: "Bob Johnson" },
  ]);

  const handleSendMessage = (e) => {
    e.preventDefault();
    // Logic to send message
    console.log("Sending message:", message);
    setMessage("");
  };

  return (
    <div className="flex h-screen bg-gray-900 text-white">
      {/* Left sidebar */}
      <div className="w-1/4 border-r border-gray-700">
        <div className="flex items-center justify-between p-4 bg-gray-800">
          <h2 className="text-xl font-semibold">Chats</h2>
          <button className="text-blue-400 hover:text-blue-300">
            <FiSettings size={24} />
          </button>
        </div>
        <ul>
          {contacts.map((contact) => (
            <li
              key={contact.id}
              className="px-4 py-3 hover:bg-gray-800 cursor-pointer"
            >
              {contact.name}
            </li>
          ))}
        </ul>
      </div>

      {/* Chat area */}
      <div className="flex flex-col w-3/4">
        {/* Chat messages would go here */}
        <div className="flex-grow p-4 overflow-y-auto">
          {/* Example message */}
          <div className="mb-4">
            <p className="bg-blue-600 inline-block rounded-lg px-4 py-2 max-w-xs">
              Hello, how are you?
            </p>
          </div>
        </div>

        {/* Message input */}
        <form onSubmit={handleSendMessage} className="p-4 bg-gray-800">
          <div className="flex items-center">
            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Type a message..."
              className="flex-grow mr-4 px-4 py-2 bg-gray-700 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              type="submit"
              className="bg-blue-500 hover:bg-blue-600 rounded-full p-2"
            >
              <FiSend size={24} />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Chat;
