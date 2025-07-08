
// Next.js API Route: /api/create-room
// This code runs on the server-side when a POST request is made to /api/create-room

// IMPORTANT: In a real Next.js project, you would typically place this API route
// in a separate file like `pages/api/create-room.ts` (Pages Router)
// or `app/api/create-room/route.ts` (App Router).
// For this self-contained example, it's included in the same file.

// Load LiveKit environment variables
// In a real project, these would be in .env.local and accessed via process.env
const LIVEKIT_API_KEY = process.env.LIVEKIT_API_KEY || 'YOUR_LIVEKIT_API_KEY';
const LIVEKIT_API_SECRET = process.env.LIVEKIT_API_SECRET || 'YOUR_LIVEKIT_API_SECRET';
const LIVEKIT_URL = process.env.LIVEKIT_URL || 'wss://your-livekit-server-url.livekit.cloud'; // Example URL

// Only import livekit-server-sdk on the server-side
// This is a common pattern when bundling client and server code in one file for demonstration
let RoomServiceClient;
if (typeof window === 'undefined') {
  // Dynamically import livekit-server-sdk only on the server
  import('livekit-server-sdk').then(module => {
    RoomServiceClient = module.RoomServiceClient;
  }).catch(err => {
    console.error("Failed to load livekit-server-sdk on server:", err);
  });
}


export const config = {
  api: {
    bodyParser: true,
  },
};

export async function POST(req: Next, res) {
  // Check if it's a POST request (Next.js API routes)
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method Not Allowed' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    const { roomName, userEmail, userName } = await req.json(); // Destructure userName from the body

    if (!roomName || !userEmail || !userName) { // Added userName to validation
      return new Response(JSON.stringify({ error: 'Room name, user email, and display name are required.' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // --- NO STATIC USER CHECK HERE ---
    // Any user can attempt to create a room now.
    // In a real app, you'd integrate proper authentication/authorization here.

    // Ensure RoomServiceClient is loaded before use
    if (!RoomServiceClient) {
      return new Response(JSON.stringify({ error: 'LiveKit server SDK not initialized.' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // --- LiveKit Room Creation ---
    const roomService = new RoomServiceClient(LIVEKIT_URL, LIVEKIT_API_KEY, LIVEKIT_API_SECRET);

    try {
      // Attempt to create the room on the LiveKit server
      await roomService.createRoom({ name: roomName });
      console.log(`LiveKit room "${roomName}" created successfully.`);
    } catch (livekitError) {
      // Handle cases where LiveKit server might deny creation (e.g., room already exists, invalid name)
      console.error('Error creating LiveKit room:', livekitError);
      return new Response(JSON.stringify({ error: `Failed to create LiveKit room: ${livekitError.message}` }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // --- Add to Mock Database (for display purposes in this example) ---
    const newRoom = { roomName, creatorEmail: userEmail, creatorName: userName, createdAt: new Date().toISOString() }; // Store creatorName
    createdRooms.push(newRoom); // Add to our mock database

    return new Response(JSON.stringify({ message: 'Room created successfully', room: newRoom }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error creating room:', error);
    return new Response(JSON.stringify({ error: 'Internal server error.' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
