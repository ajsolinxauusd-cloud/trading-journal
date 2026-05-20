import { useState } from "react";

import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
} from "firebase/auth";

import { auth } from "../firebase";

import { useNavigate } from "react-router-dom";

export default function Login() {

  const navigate = useNavigate();

  const [email, setEmail] =
    useState("");

  const [password, setPassword] =
    useState("");

  const [isRegister, setIsRegister] =
    useState(false);

  const handleSubmit = async (e) => {

    e.preventDefault();

    try {

      // ✅ REGISTER
      if (isRegister) {

        await createUserWithEmailAndPassword(
          auth,
          email,
          password
        );

        alert("Account created!");

      }

      // ✅ LOGIN
      else {

        await signInWithEmailAndPassword(
          auth,
          email,
          password
        );

        alert("Login successful!");

      }

      navigate("/");

    }

    catch (error) {

      alert(error.message);

    }

  };

  return (

    <div className="min-h-screen bg-black flex items-center justify-center p-6">

      <div className="bg-gray-900 p-8 rounded-2xl w-full max-w-md">

        <h1 className="text-3xl text-white mb-6 text-center">

          {isRegister
            ? "Create Account"
            : "Login"}

        </h1>

        <form
          onSubmit={handleSubmit}
          className="space-y-4"
        >

          {/* EMAIL */}
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) =>
              setEmail(e.target.value)
            }
            className="
              w-full
              bg-black
              border
              border-gray-700
              text-white
              p-3
              rounded-lg
              outline-none
            "
            required
          />

          {/* PASSWORD */}
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) =>
              setPassword(e.target.value)
            }
            className="
              w-full
              bg-black
              border
              border-gray-700
              text-white
              p-3
              rounded-lg
              outline-none
            "
            required
          />

          {/* BUTTON */}
          <button
            type="submit"
            className="
              w-full
              bg-green-600
              hover:bg-green-700
              text-white
              p-3
              rounded-lg
              font-semibold
            "
          >

            {isRegister
              ? "Create Account"
              : "Login"}

          </button>

        </form>

        {/* TOGGLE */}
        <button
          onClick={() =>
            setIsRegister(!isRegister)
          }
          className="
            text-blue-400
            mt-4
            w-full
          "
        >

          {isRegister
            ? "Already have an account? Login"
            : "No account? Register"}

        </button>

      </div>

    </div>

  );

}