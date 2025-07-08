
// Next.js API Route: /api/get-rooms
// This code runs on the server-side when a GET request is made to /api/get-rooms
export async function GET(req, res) {
  if (req.method !== 'GET') {
    return new Response(JSON.stringify({ error: 'Method Not Allowed' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    // Return all currently created rooms from our mock database
    return new Response(JSON.stringify({ rooms: createdRooms }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error fetching rooms:', error);
    return new Response(JSON.stringify({ error: 'Internal server error.' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
