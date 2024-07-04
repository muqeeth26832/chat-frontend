import React, { useEffect, useState, useMemo, useContext } from "react";
import { FiUser, FiSend, FiMoon, FiSun } from "react-icons/fi";
import { UserContext } from "./UserContext";

const Chat = () => {
  const [ws, setWs] = useState(null);
  const [message, setMessage] = useState("");
  const [contacts, setContacts] = useState({});
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [darkMode, setDarkMode] = useState(true);
  const { username, userId } = useContext(UserContext); // Get the current user's username and userId from UserContext

  // Establish a WebSocket connection when the component mounts
  useEffect(() => {
    const ws = new WebSocket(`ws://${import.meta.env.VITE_WSL_URL}`);
    setWs(ws);
    ws.addEventListener("message", handleMessage);
  }, []);

  // Update the online people list, excluding the current user
  function showOnlinePeople(peopleArray) {
    let people = {};
    peopleArray.forEach(({ userId: id, username }) => {
      if (id !== userId) {
        people[id] = username;
      }
    });
    setContacts(people);
  }

  // Handle incoming WebSocket messages
  function handleMessage(e) {
    const messageData = JSON.parse(e.data);
    if ("online" in messageData) {
      showOnlinePeople(messageData.online);
    }
  }

  // Handle message send action
  const handleSendMessage = (e) => {
    e.preventDefault();
    console.log("Sending message:", message);
    setMessage("");
  };

  // Toggle between dark mode and light mode
  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  // Generate random pastel colors for user icons
  const getRandomPastelColor = () => {
    const hue = Math.floor(Math.random() * 360);
    return `hsl(${hue}, 70%, 80%)`;
  };

  // Memoize user colors to prevent re-generating colors on every render
  const userColors = useMemo(() => {
    const colors = {};
    Object.keys(contacts).forEach((userId) => {
      colors[userId] = getRandomPastelColor();
    });
    return colors;
  }, [contacts]);

  return (
    <div
      className={`flex h-screen ${
        darkMode ? "bg-black text-white" : "bg-white text-black"
      } transition-colors duration-300`}
    >
      {/* Left sidebar */}
      <div
        className={`w-1/3 border-r ${
          darkMode ? "border-gray-800" : "border-gray-200"
        }`}
      >
        {/* Sidebar header with user info and theme toggle */}
        <div
          className={`flex items-center justify-between p-4 border-b ${
            darkMode ? "border-gray-800" : "border-gray-200"
          }`}
        >
          <div className="flex items-center space-x-3">
            <FiUser size={24} />
            <h2 className="text-xl font-semibold">Chats</h2>
          </div>
          <div className="flex items-center space-x-3">
            <span
              className={`px-3 py-1 rounded-full text-sm font-medium ${
                darkMode ? "bg-gray-700" : "bg-gray-200"
              }`}
            >
              {username}
            </span>
            <button
              onClick={toggleDarkMode}
              className={`p-2 rounded-full ${
                darkMode
                  ? "bg-gray-800 text-yellow-300"
                  : "bg-gray-200 text-gray-800"
              } transition-all duration-300 ease-in-out transform hover:scale-110`}
            >
              {darkMode ? <FiSun size={24} /> : <FiMoon size={24} />}
            </button>
          </div>
        </div>
        {/* List of online contacts */}
        <div className="overflow-y-auto h-[calc(100vh-4rem)]">
          <ul>
            {Object.keys(contacts).map((contactId) => (
              <li
                onClick={() => setSelectedUserId(contactId)}
                key={contactId}
                className={`px-4 py-3 cursor-pointer transition-colors ${
                  contactId === selectedUserId
                    ? darkMode
                      ? "bg-gray-800"
                      : "bg-gray-200"
                    : darkMode
                    ? "hover:bg-gray-900"
                    : "hover:bg-gray-100"
                }`}
              >
                <div className="flex items-center space-x-3">
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center text-black"
                    style={{ backgroundColor: userColors[contactId] }}
                  >
                    <span className="text-lg font-medium">
                      {contacts[contactId].charAt(0)}
                    </span>
                  </div>
                  <span
                    className={`font-medium ${
                      contactId === selectedUserId ? "cursor-default" : ""
                    }`}
                  >
                    {contacts[contactId]}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Chat area */}
      <div className="flex flex-col w-2/3">
        {/* Selected user header */}
        {selectedUserId && (
          <div
            className={`p-4 border-b ${
              darkMode ? "border-gray-800" : "border-gray-200"
            } flex items-center`}
          >
            <div
              className="w-10 h-10 rounded-full flex items-center justify-center text-black mr-3"
              style={{ backgroundColor: userColors[selectedUserId] }}
            >
              <span className="text-lg font-medium">
                {contacts[selectedUserId].charAt(0)}
              </span>
            </div>
            <span className="font-semibold">{contacts[selectedUserId]}</span>
          </div>
        )}

        {/* Chat messages */}
        <div className="flex-grow p-4 overflow-y-auto">
          {/* Example message */}
          <div className="mb-4">
            <p
              className={`${
                darkMode ? "bg-gray-800" : "bg-gray-200"
              } inline-block rounded-lg px-4 py-2 max-w-xs`}
            >
              Hello, how are you?
            </p>
          </div>
        </div>

        {/* Message input */}
        <form
          onSubmit={handleSendMessage}
          className={`p-4 border-t ${
            darkMode ? "border-gray-800" : "border-gray-200"
          }`}
        >
          <div className="flex items-center">
            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Type a message..."
              className={`flex-grow mr-4 px-4 py-2 ${
                darkMode
                  ? "bg-gray-900 border-gray-700"
                  : "bg-white border-gray-300"
              } border rounded-full focus:outline-none focus:ring-2 ${
                darkMode ? "focus:ring-white" : "focus:ring-black"
              }`}
            />
            <button
              type="submit"
              className={`${
                darkMode
                  ? "bg-white text-black hover:bg-gray-200"
                  : "bg-black text-white hover:bg-gray-800"
              } rounded-full p-2 transition-colors`}
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
