import React, { useContext, useState } from "react";
import axios from "axios";
import { UserContext } from "./UserContext";
const RegisterAndLoginForm = () => {
  const [formData, setFormData] = useState({
    username: "",
    password: "",
  });
  const [loginOrRegister, setLoginOrRegister] = useState("register");

  const { setUsername, setId } = useContext(UserContext);

  // console.log(formData.username);
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const { username, password } = formData;
      const to = loginOrRegister === "register" ? "register" : "login";
      const url = "users/" + to;
      const response = await axios.post(url, {
        username,
        password,
      });
      // console.log(response.data);
      // after registering successfully
      setUsername(formData.username);
      // we get id as we sent it (this is id in our data base)
      setId(response.data.id);
    } catch (error) {
      console.error("Error:", error);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-blue-50">
      <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md">
        {/* <h2 className="text-2xl font-bold mb-6 text-center">Register</h2> */}
        <div className="flex items-center justify-center mb-6">
          {/* Replace 'path_to_your_icon.svg' with the actual path to your Lambda icon */}
          <img
            src="https://iith.dev/_next/static/media/Lambda-Banner.0cd6667f.png"
            alt="Lambda Icon"
            className="h-11 w-11 mr-2"
          />
          <h2 className="text-2xl font-bold">
            {/* {loginOrRegister=='register'? 'Register on lamda chat':'Login'}
             */}
             Lambda Chat
          </h2>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-gray-700">Username</label>
            <input
              type="text"
              name="username"
              value={formData.username}
              onChange={handleChange}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
              required
            />
          </div>
          <div>
            <label className="block text-gray-700">Password</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
              required
            />
          </div>
          <button
            type="submit"
            className="w-full py-2 px-4 bg-blue-500 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-400"
          >
            {loginOrRegister == "register" ? "Register" : "Login"}
          </button>
        </form>

        {loginOrRegister == "register" && (
          <div className="mt-4 text-center">
            <p className="text-gray-700">Already a member?</p>
            <button
              onClick={() => setLoginOrRegister("login")}
              className="text-blue-500 hover:underline"
            >
              Login here
            </button>
          </div>
        )}
        {loginOrRegister == "login" && (
          <div className="mt-4 text-center">
            <p className="text-gray-700">Dont have an account?</p>
            <button
              onClick={() => setLoginOrRegister("register")}
              className="text-blue-500 hover:underline"
            >
              Register here
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default RegisterAndLoginForm;
