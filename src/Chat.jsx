import React, { useEffect, useState, useMemo, useContext, useRef } from "react";
import {
  FiUser,
  FiSend,
  FiMoon,
  FiSun,
  FiArrowLeft,
  FiLogOut,
} from "react-icons/fi";
import { FaPaperclip } from "react-icons/fa";

import { UserContext } from "./UserContext";
import axios from "axios";

const Chat = () => {
  const [ws, setWs] = useState(null);
  const [message, setMessage] = useState("");
  const [onlinePeople, setOnlinePeople] = useState({});
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [darkMode, setDarkMode] = useState(true);
  const { username, userId, setUsername, setUserId } = useContext(UserContext);
  const [messageList, setMessageList] = useState([]);
  const messagesEndRef = useRef(null);
  const [offlinePeople, setOfflinePeople] = useState({});

  useEffect(() => {
    connectToWs();
  }, [selectedUserId]);

  const filteredMessageList = useMemo(() => {
    const seen = new Set();
    return messageList.filter((msg) => {
      const duplicate = seen.has(msg.text + msg.timestamp + msg._id);
      seen.add(msg.text + msg.timestamp + msg._id);
      return !duplicate;
    });
  }, [messageList]);
  useEffect(() => {
    scrollToBottom();
  }, [filteredMessageList, selectedUserId]);

  useEffect(() => {
    axios.get(`users/messages/${selectedUserId}`).then((res) => {
      setMessageList(res.data);
    });
  }, [selectedUserId]);

  useEffect(() => {
    axios.get("users/people").then((res) => {
      const offlinePeopleList = res.data
        .filter((p) => p._id !== userId)
        .filter((p) => !Object.keys(onlinePeople).includes(p._id));
      const offlinePeopleObj = {};
      offlinePeopleList.forEach((p) => {
        offlinePeopleObj[p._id] = p.username;
      });
      setOfflinePeople(offlinePeopleObj);
    });
  }, [onlinePeople]);
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

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

  function showOnlinePeople(peopleArray) {
    let people = {};
    peopleArray.forEach(({ userId: id, username }) => {
      if (id !== userId) {
        people[id] = username;
      }
    });
    setOnlinePeople(people);
  }

  function handleAttachment(e) {
    console.log("ok");
  }

  function handleMessage(e) {
    const messageData = JSON.parse(e.data);

    if ("online" in messageData) {
      showOnlinePeople(messageData.online);
    } else if ("text" in messageData) {
      setMessageList((prev) => [
        ...prev,
        {
          sender: messageData.sender,
          recipient: messageData.recipient,
          text: messageData.text,
          id: messageData.id,
          timestamp: new Date(messageData.timestamp),
        },
      ]);
    }
  }

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
      {
        text: message,
        sender: userId,
        recipient: selectedUserId,
        timestamp: new Date(),
      },
    ]);
    setMessage("");
  };

  const formatTimestamp = (date) => {
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  const getRandomPastelColor = () => {
    const hue = Math.floor(Math.random() * 360);
    return `hsl(${hue}, 70%, 80%)`;
  };

  const userColors = useMemo(() => {
    const colors = {};
    [...Object.keys(onlinePeople), ...Object.keys(offlinePeople)].forEach(
      (userId) => {
        colors[userId] = getRandomPastelColor();
      }
    );
    return colors;
  }, [onlinePeople, offlinePeople]);

  const handleLogout = async () => {
    await axios.post("./users/logout").then(() => {
      setWs(null);
      setUserId(null);
      setUsername(null);
    });
    if (ws) {
      ws.close();
    }
    localStorage.removeItem("token");
    // Implement your logout logic here, e.g., redirect to login page
  };

  return (
    <div
      className={`flex h-screen overflow-hidden ${
        darkMode ? "bg-gray-900 text-white" : "bg-gray-100 text-black"
      } transition-colors duration-300`}
    >
      {/* Left sidebar */}
      <div
        className={`w-1/3 border-r ${
          darkMode ? "border-gray-700" : "border-gray-300"
        } flex flex-col`}
      >
        {/* Top bar with logo and dark mode toggle */}
        <div
          className={`p-4 border-b ${
            darkMode ? "border-gray-700" : "border-gray-300"
          } flex items-center justify-between sticky top-0 bg-opacity-90 backdrop-filter backdrop-blur-sm ${
            darkMode ? "bg-gray-900" : "bg-gray-100"
          }`}
        >
          <div className="flex items-center space-x-3">
            {/* Custom Chat Logo */}
            <div className="w-8 h-8">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="currentColor"
                className="size-6"
              >
                <path d="M4.913 2.658c2.075-.27 4.19-.408 6.337-.408 2.147 0 4.262.139 6.337.408 1.922.25 3.291 1.861 3.405 3.727a4.403 4.403 0 0 0-1.032-.211 50.89 50.89 0 0 0-8.42 0c-2.358.196-4.04 2.19-4.04 4.434v4.286a4.47 4.47 0 0 0 2.433 3.984L7.28 21.53A.75.75 0 0 1 6 21v-4.03a48.527 48.527 0 0 1-1.087-.128C2.905 16.58 1.5 14.833 1.5 12.862V6.638c0-1.97 1.405-3.718 3.413-3.979Z" />
                <path d="M15.75 7.5c-1.376 0-2.739.057-4.086.169C10.124 7.797 9 9.103 9 10.609v4.285c0 1.507 1.128 2.814 2.67 2.94 1.243.102 2.5.157 3.768.165l2.782 2.781a.75.75 0 0 0 1.28-.53v-2.39l.33-.026c1.542-.125 2.67-1.433 2.67-2.94v-4.286c0-1.505-1.125-2.811-2.664-2.94A49.392 49.392 0 0 0 15.75 7.5Z" />
              </svg>
            </div>
          </div>

          {/* Username (centered or right-aligned) */}
          <div className="flex-grow flex justify-center">
            {" "}
            {/* Use 'justify-end' instead of 'justify-center' for right alignment */}
            <div
              className={`px-4 py-2 rounded-full ${
                darkMode ? "bg-gray-700" : "bg-gray-200"
              } flex items-center space-x-2`}
            >
              <div
                className={`p-1 rounded-full ${
                  darkMode ? "bg-gray-600" : "bg-gray-300"
                }`}
              >
                <FiUser size={16} />
              </div>
              <span className="font-semibold text-sm truncate max-w-[150px]">
                {username}
              </span>
            </div>
          </div>

          {/* Dark Mode Toggle */}
          <button
            onClick={toggleDarkMode}
            className={`p-2 rounded-full ${
              darkMode
                ? "bg-gray-700 text-yellow-300 hover:bg-gray-600"
                : "bg-gray-300 text-gray-700 hover:bg-gray-400"
            } transition-all duration-300 ease-in-out transform hover:scale-110`}
          >
            {darkMode ? <FiSun size={24} /> : <FiMoon size={24} />}
          </button>
        </div>

        {/* Scrollable area for contacts */}
        <div className="flex-grow overflow-y-auto">
          {/* Online users */}
          {Object.keys(onlinePeople).length > 0 && (
            <div
              className={`p-2 font-semibold ${
                darkMode
                  ? "bg-gray-800 text-gray-300"
                  : "bg-gray-200 text-gray-700"
              }`}
            >
              Online Users
            </div>
          )}
          <ul>
            {Object.keys(onlinePeople).map((contactId) => (
              <li
                onClick={() => setSelectedUserId(contactId)}
                key={contactId}
                className={`px-4 py-3 cursor-pointer transition-colors ${
                  contactId === selectedUserId
                    ? darkMode
                      ? "bg-gray-700"
                      : "bg-gray-300"
                    : darkMode
                    ? "hover:bg-gray-800"
                    : "hover:bg-gray-200"
                }`}
              >
                <div className="flex items-center space-x-3">
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center text-black"
                    style={{ backgroundColor: userColors[contactId] }}
                  >
                    <span className="text-lg font-medium">
                      {onlinePeople[contactId].charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <span className="font-medium">{onlinePeople[contactId]}</span>
                  <span className="ml-auto w-3 h-3 bg-green-500 rounded-full"></span>
                </div>
              </li>
            ))}
          </ul>
          {/* Offline users */}
          {Object.keys(offlinePeople).length > 0 && (
            <div
              className={`p-2 font-semibold ${
                darkMode
                  ? "bg-gray-800 text-gray-300"
                  : "bg-gray-200 text-gray-700"
              }`}
            >
              Offline Users
            </div>
          )}
          <ul>
            {Object.keys(offlinePeople).map((contactId) => (
              <li
                onClick={() => setSelectedUserId(contactId)}
                key={contactId}
                className={`px-4 py-3 cursor-pointer transition-colors ${
                  contactId === selectedUserId
                    ? darkMode
                      ? "bg-gray-700"
                      : "bg-gray-300"
                    : darkMode
                    ? "hover:bg-gray-800"
                    : "hover:bg-gray-200"
                }`}
              >
                <div className="flex items-center space-x-3">
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center text-black"
                    style={{ backgroundColor: userColors[contactId] }}
                  >
                    <span className="text-lg font-medium">
                      {offlinePeople[contactId].charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <span className="font-medium">
                    {offlinePeople[contactId]}
                  </span>
                  <span className="ml-auto w-3 h-3 bg-gray-500 rounded-full"></span>
                </div>
              </li>
            ))}
          </ul>
        </div>

        {/* Bottom bar with logout button */}
        <div
          className={`p-4 border-t ${
            darkMode ? "border-gray-700" : "border-gray-300"
          } sticky bottom-0 bg-opacity-90 backdrop-filter backdrop-blur-sm ${
            darkMode ? "bg-gray-900" : "bg-gray-100"
          }`}
        >
          <button
            onClick={handleLogout}
            className={`w-full py-2 px-4 rounded-full font-medium transition-colors flex items-center justify-center space-x-2 ${
              darkMode
                ? "bg-red-600 text-white hover:bg-red-700"
                : "bg-red-500 text-white hover:bg-red-600"
            } shadow-md hover:shadow-lg transform hover:-translate-y-0.5`}
          >
            <FiLogOut size={20} />
            <span>Logout</span>
          </button>
        </div>
      </div>

      {/* Chat area */}
      <div className="flex flex-col w-2/3 h-screen">
        {/* Selected user header */}
        {selectedUserId && (
          <div
            className={`p-4 border-b ${
              darkMode ? "border-gray-700" : "border-gray-300"
            } flex items-center`}
          >
            <div
              className="w-10 h-10 rounded-full flex items-center justify-center text-black mr-3"
              style={{ backgroundColor: userColors[selectedUserId] }}
            >
              <span className="text-lg font-medium">
                {(
                  onlinePeople[selectedUserId] ||
                  offlinePeople[selectedUserId] ||
                  "?"
                )
                  .charAt(0)
                  .toUpperCase()}
              </span>
            </div>
            <span className="font-semibold">
              {onlinePeople[selectedUserId] ||
                offlinePeople[selectedUserId] ||
                "Unknown User"}
            </span>
          </div>
        )}
        {/* Prompt to select a user if none is selected */}
        {!selectedUserId && (
          <div className="flex flex-col items-center justify-center flex-grow">
            <FiArrowLeft
              size={48}
              className={`mb-4 ${
                darkMode ? "text-gray-500" : "text-gray-400"
              } animate-bounce`}
            />
            <div
              className={`text-lg font-medium ${
                darkMode ? "text-gray-500" : "text-gray-400"
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
                  msg.sender === userId ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`rounded-lg px-4 py-2 max-w-xs ${
                    msg.sender === userId
                      ? darkMode
                        ? "bg-blue-600"
                        : "bg-blue-500"
                      : darkMode
                      ? "bg-gray-700"
                      : "bg-gray-300"
                  }`}
                >
                  <p className="mb-1">{msg.text}</p>
                  <p
                    className={`text-xs ${
                      msg.sender === userId ? "text-blue-200" : "text-gray-500"
                    }`}
                  >
                    {formatTimestamp(msg.timestamp || new Date())}
                  </p>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
        )}
        {/* Message input */}

        {selectedUserId && (
          <form
            onSubmit={handleSendMessage}
            className={`p-4 border-t  ${
              darkMode ? "border-gray-700" : "border-gray-300"
            }`}
          >
            <div className="flex items-center space-x-4">
              <button
                type="button"
                onClick={handleAttachment}
                className={`${
                  darkMode
                    ? "bg-gray-800 text-gray-300 hover:bg-gray-700"
                    : "bg-gray-300 text-gray-700 hover:bg-gray-400"
                } p-2 rounded-full transition-colors`}
              >
                <FaPaperclip size={24} />
              </button>
              <input
                type="text"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Type a message..."
                className={`flex-grow px-4 py-2 ${
                  darkMode
                    ? "bg-gray-800 border-gray-600"
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
