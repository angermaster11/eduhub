import React, { useState } from "react";
import { supabase } from "../supabaseClient";

export default function Login({ onSwitch }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("user"); // default role

  const handleLogin = async () => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      alert(error.message);
    } else {
      alert(`Login successful as ${role}!`);
      console.log({ data, role });
      // You can save role in state/context or redirect based on role
    }
  };

  return (
    <div className="p-6 bg-white rounded-2xl shadow-lg w-96 mx-auto mt-10">
      <h2 className="text-2xl font-bold text-center mb-4">Login</h2>
      {/* Dropdown for role */}
      <select
        value={role}
        onChange={(e) => setRole(e.target.value)}
        className="border p-2 w-full mb-4 rounded"
      >
        <option value="user">User</option>
        <option value="admin">Admin</option>
      </select>
      
      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="border p-2 w-full mb-2 rounded"
      />
      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        className="border p-2 w-full mb-2 rounded"
      />

      

      <button
        onClick={handleLogin}
        className="bg-blue-600 text-white px-4 py-2 w-full rounded hover:bg-blue-700"
      >
        Login
      </button>

      <p className="mt-4 text-sm text-center">
        Don’t have an account?{" "}
        <span className="text-blue-600 cursor-pointer" onClick={onSwitch}>
          Sign up
        </span>
      </p>
    </div>
  );
}
