import React, { useEffect, useState, useMemo, useContext } from "react";
import { FiUser, FiSend, FiMoon, FiSun, FiArrowLeft } from "react-icons/fi";
import { UserContext } from "./UserContext";

const Chat = () => {
  const [ws, setWs] = useState(null);
  const [message, setMessage] = useState(""); // what i am sending
  const [contacts, setContacts] = useState({});
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [darkMode, setDarkMode] = useState(true);
  const { username, userId } = useContext(UserContext); // Get the current user's username and userId from UserContext
  const [messageList, setMessageList] = useState([{ text: "hello" }]); // need to display this

  // Establish a WebSocket connection when the component mounts
  useEffect(() => {
    connectToWs();
  }, [selectedUserId]);

  function connectToWs() {
    const ws = new WebSocket(`ws://${import.meta.env.VITE_WSL_URL}`);
    setWs(ws);
    ws.addEventListener("message", handleMessage);
    ws.addEventListener("close", () => {
      setTimeout(() => {
        console.log("Disconnected. Trying to reconnect.");
        connectToWs();
      }, 1000);
    });
  }

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

  // Handle incoming WebSocket messageList
  function handleMessage(e) {
    const messageData = JSON.parse(e.data);
    if ("online" in messageData) {
      showOnlinePeople(messageData.online);
    } else if ("text" in messageData) {
      setMessageList((prev) => [
        ...prev,
        {
          isOur: false,
          sender: messageData.sender,
          recipient: messageData.recipient,
          text: messageData.text,
          id: messageData.id,
          timestamp: new Date(messageData.timestamp),
        },
      ]);
    }
  }

  const filteredMessageList = useMemo(() => {
    const seen = new Set();
    return messageList.filter((msg) => {
      const duplicate = seen.has(msg.text + msg.timestamp + msg.isOur);
      seen.add(msg.text + msg.timestamp + msg.isOur);
      return !duplicate;
    });
  }, [messageList]);

  // Handle message send action
  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!message.trim()) return;

    ws.send(
      JSON.stringify({
        recipient: selectedUserId,
        text: message,
      })
    );
    setMessageList((prev) => [
      ...prev,
      { text: message, isOur: true,recipient:selectedUserId, timestamp: new Date(), },
    ]);
    setMessage("");
  };

  const formatTimestamp = (date) => {
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
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

        {/* Prompt to select a user if none is selected */}
        {!selectedUserId && (
          <div className="flex flex-col items-center justify-center h-full">
            <FiArrowLeft
              size={48}
              className={`mb-4 ${
                darkMode ? "text-gray-400" : "text-gray-600"
              } animate-bounce`}
            />
            <div
              className={`text-lg font-medium ${
                darkMode ? "text-gray-400" : "text-gray-600"
              }`}
            >
              Select a user from the sidebar
            </div>
          </div>
        )}
        {/* Chat messages */}
        {selectedUserId && (
          <div className="flex-grow p-4 overflow-y-auto">
            {filteredMessageList.map((msg, index) => (
              <div
                key={index}
                className={`mb-4 flex ${
                  msg.isOur ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`rounded-lg px-4 py-2 max-w-xs ${
                    msg.isOur
                      ? darkMode
                        ? "bg-blue-600"
                        : "bg-blue-500"
                      : darkMode
                      ? "bg-gray-700"
                      : "bg-gray-200"
                  }`}
                >
                  <p className="mb-1">{msg.text}</p>
                  <p
                    className={`text-xs ${
                      msg.isOur ? "text-blue-200" : "text-gray-500"
                    }`}
                  >
                    {formatTimestamp(msg.timestamp || new Date())}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Message input */}
        {selectedUserId && (
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
        )}
      </div>
    </div>
  );
};

export default Chat;
