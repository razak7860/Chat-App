import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import axios from "axios";

const Home = ({ socket }) => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  // Set up socket listener (only once on mount)
  useEffect(() => {
    socket.on("addUser", (users) => {
      console.log("addUser event received:", users);
    });

    // Clean up socket listener on unmount
    return () => {
      socket.off("addUser");
    };
  }, [socket]);

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      console.log("Submitting form data:", data);

      // Make the API call
      const response = await axios.get(
        "http://localhost:4000/api/users/",
        { params: data }, // For GET requests, send data via params
        { withCredentials: true }
      );

      if (response.status === 200) {
        console.log("API call successful, response:", response.data);

        // Save username locally
        localStorage.setItem("userName", data.email);

        // Emit socket event after ensuring API call succeeds
        console.log("Emitting newUser event");
        socket.emit("newUser", { userName: data.email, socketID: socket.id });

        // Navigate to the chat page
        navigate("/chat");
      } else {
        console.error("Unexpected response status:", response.status);
      }
    } catch (error) {
      console.error(
        "Error during API call or socket operation:",
        error.message
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className="home__container" onSubmit={handleSubmit(onSubmit)}>
      <h2 className="home__header">Sign in to Open Chat</h2>

      <label htmlFor="username">Username</label>
      <input
        type="text"
        id="username"
        className="username__input"
        {...register("email", { required: "Username is required" })}
        placeholder="Enter your username"
      />
      {errors.email && <p className="error-message">{errors.email.message}</p>}

      <br />
      <input
        type="password"
        id="password"
        className="username__input"
        {...register("password", { required: "Password is required" })}
        placeholder="Enter your password"
      />
      {errors.password && (
        <p className="error-message">{errors.password.message}</p>
      )}

      <button className="home__cta" disabled={loading}>
        {loading ? "Loading..." : "SIGN IN"}
      </button>
    </form>
  );
};

export default Home;
