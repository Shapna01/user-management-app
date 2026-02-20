"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AuthPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    const res = await fetch("/api/users/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }), 
    });

    const data = await res.json();

    if (res.ok) {
      sessionStorage.setItem("user", JSON.stringify(data.user));
      router.push("/dashboard");
    } else {
      setMessage(data.error);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-300 via-purple-300 to-pink-300">
      <div className="bg-white p-8 rounded-xl shadow-2xl w-[400px] border border-gray-200">
        <h2 className="text-3xl font-bold mb-6 text-center text-fuchsia-900">
          User Management
        </h2>

        <h1 className="text-3xl font-bold mb-6 text-center text-fuchsia-700">
          Login
        </h1>

        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="border border-gray-300 p-2 rounded focus:ring-2 focus:ring-purple-400 outline-none"
          />

          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="border border-gray-300 p-2 rounded focus:ring-2 focus:ring-purple-400 outline-none"
          />

          <button
            type="submit"
            className="bg-gradient-to-r from-purple-500 to-blue-500 text-white p-2 rounded mt-2"
          >
            Login
          </button>
        </form>

        {message && (
          <p className="mt-3 text-center text-red-600 bg-red-100 p-2 rounded">
            {message}
          </p>
        )}
      </div>
    </div>
  );
}