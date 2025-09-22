import React, { useState } from "react";
import { supabase } from "../supabaseClient";

export default function Signup({ onSwitch }) {
  const [name, setName] = useState("");
  const [gender, setGender] = useState("male");
  const [dob, setDob] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("user"); // default role

const handleSignup = async () => {
  // Sign up
  const { data, error } = await supabase.auth.signUp({ email, password });

  if (error) {
    alert(error.message);
    return;
  }

  const user = data.user;
  if (!user) return;

  // Update the profile row that trigger already created
  const { error: profileError } = await supabase
    .from("profiles")
    .update({
      name,
      gender,
      dob,
      phone,
      role,
      display_name: name, // optional, needed for trigger
    })
    .eq("user_id", user.id);

  if (profileError) {
    console.log("Profile update error:", profileError.message);
    alert("Profile update failed: " + profileError.message);
  } else {
    alert("Signup successful! Please verify your email.");
  }
};



  return (
    <div className="p-6 bg-white rounded-2xl shadow-lg w-96 mx-auto mt-10">
      <h2 className="text-2xl font-bold text-center mb-4">Sign Up</h2>
        {/* Role */}
      <select
        value={role}
        onChange={(e) => setRole(e.target.value)}
        className="border p-2 w-full mb-4 rounded"
      >
        <option value="user">User</option>
        <option value="admin">Admin</option>
      </select>

      {/* Name */}
      <input
        type="text"
        placeholder="Full Name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        className="border p-2 w-full mb-2 rounded"
      />

      {/* Gender */}
      <select
        value={gender}
        onChange={(e) => setGender(e.target.value)}
        className="border p-2 w-full mb-2 rounded"
      >
        <option value="male">Male</option>
        <option value="female">Female</option>
        <option value="other">Other</option>
      </select>

      {/* Date of Birth */}
      <input
        type="date"
        value={dob}
        onChange={(e) => setDob(e.target.value)}
        className="border p-2 w-full mb-2 rounded"
      />

      {/* Phone */}
      <input
        type="tel"
        placeholder="Phone Number"
        value={phone}
        onChange={(e) => setPhone(e.target.value)}
        className="border p-2 w-full mb-2 rounded"
      />

      {/* Email */}
      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="border p-2 w-full mb-2 rounded"
      />

      {/* Password */}
      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        className="border p-2 w-full mb-2 rounded"
      />

      
      <button
        onClick={handleSignup}
        className="bg-green-600 text-white px-4 py-2 w-full rounded hover:bg-green-700"
      >
        Sign Up
      </button>

      <p className="mt-4 text-sm text-center">
        Already have an account?{" "}
        <span className="text-blue-600 cursor-pointer" onClick={onSwitch}>
          Login
        </span>
      </p>
    </div>
  );
}
