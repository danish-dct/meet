"use client";

import { useRouter } from 'next/navigation';
import React, { useState } from 'react';

// Utility function to generate a random alphanumeric string
const generateRandomString = (length: any) => {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

// Function to generate a room name in the format xxx-xxx-xxx
const generateRoomName = () => {
  return `${generateRandomString(3)}-${generateRandomString(3)}-${generateRandomString(3)}`;
};

export default function App() {
  const router = useRouter();

  const [userEmail, setUserEmail] = useState('danishiqbal4@gmail.com');
  const [userName, setUserName] = useState('Danish123');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleCreateRoom = async (e: any) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    const generatedRoomName = generateRoomName();

    if (!userEmail.trim()) {
      setMessage('Please enter your email.');
      setLoading(false);
      return;
    }
    if (!userName.trim()) {
      setMessage('Please enter your display name.');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(`${window.location.origin}/api/unified-livekit-handler?path=/api/create-room`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ roomName: generatedRoomName, userEmail, userName }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage(`Room "${data.room.roomName}" created successfully by ${data.room.creatorName} (${data.room.creatorEmail})!`);

        const { roomName, creatorName, creatorEmail } = data.room;

        const queryString = new URLSearchParams({
          userName: creatorName,
          userEmail: creatorEmail,
        }).toString();

        // router.push(`/rooms/new/${roomName}?${queryString}`);
        router.push(`/rooms/${roomName}?${queryString}`);
      } else {
        setMessage(`Error: ${data.error}`);
      }
    } catch (error) {
      console.error('Failed to create room:', error);
      setMessage('Network error while creating room.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-4 font-sans">
      <div className="bg-white p-8 rounded-xl shadow-lg w-full max-w-md">
        <h1 className="text-3xl font-bold text-center text-gray-800 mb-6">Create LiveKit Room</h1>
        <form onSubmit={handleCreateRoom} className="space-y-4">
          <div>
            <label htmlFor="userEmail" className="block text-sm font-medium text-gray-700">
              Your Email
            </label>
            <input
              type="email"
              id="userEmail"
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm text-black"
              value={userEmail}
              onChange={(e) => setUserEmail(e.target.value)}
              placeholder="Enter your email"
              required
            />
          </div>
          <div>
            <label htmlFor="userName" className="block text-sm font-medium text-gray-700">
              Your Display Name
            </label>
            <input
              type="text"
              id="userName"
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm text-black"
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
              placeholder="e.g., John Doe"
              required
            />
          </div>
          <button
            type="submit"
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={loading}
          >
            {loading ? 'Creating...' : 'Create Room'}
          </button>
        </form>

        {message && (
          <p className={`mt-4 text-center text-sm ${message.includes('Error') ? 'text-red-600' : 'text-green-600'}`}>
            {message}
          </p>
        )}

      </div>
    </div>
  );
}
