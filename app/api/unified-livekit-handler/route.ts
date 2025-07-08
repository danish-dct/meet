// --- Unified Next.js API Handler ---
// This function acts as a router for different API "paths"
// In a real Next.js project, this would typically be in a file like `pages/api/unified-livekit-handler.js`
// or `app/api/unified-livekit-handler/route.ts`

import {
    AccessToken,
    RoomServiceClient
} from 'livekit-server-sdk';
import {
    NextRequest,
    NextResponse
} from 'next/server';

// Load LiveKit environment variables
const LIVEKIT_API_KEY = process.env.LIVEKIT_API_KEY || 'YOUR_LIVEKIT_API_KEY';
const LIVEKIT_API_SECRET = process.env.LIVEKIT_API_SECRET || 'YOUR_LIVEKIT_API_SECRET';
const LIVEKIT_URL = process.env.NEXT_PUBLIC_LIVEKIT_URL || 'wss://your-livekit-server-url.livekit.cloud';
let createdRooms: any = [];

/* let RoomServiceClient;
let AccessToken;
if (typeof window === 'undefined') {
  import('livekit-server-sdk').then(module => {
    RoomServiceClient = module.RoomServiceClient;
    AccessToken = module.AccessToken;
  }).catch(err => {
    console.error("Failed to load livekit-server-sdk on server:", err);
  });
} */

export const config = {
    api: {
        bodyParser: true,
    },
};

// API Logic Functions (these would be in separate files in a real Next.js project)
async function handleCreateRoomApi(req: NextRequest) {
    const {
        roomName,
        userEmail,
        userName
    } = await req.json();

    if (!roomName || !userEmail || !userName) {
        return new Response(JSON.stringify({
            error: 'Room name, user email, and display name are required.'
        }), {
            status: 400,
            headers: {
                'Content-Type': 'application/json'
            },
        });
    }

    if (process.env.REGISTERED_HOST_EMAIL !== userEmail) {
        return new Response(JSON.stringify({
            error: 'The email is not a HOST email. Opt for a subscription to host a meeting.'
        }), {
            status: 422,
            headers: {
                'Content-Type': 'application/json'
            },
        });
    }

    if (!RoomServiceClient) {
        return new Response(JSON.stringify({
            error: 'LiveKit server SDK not initialized.'
        }), {
            status: 500,
            headers: {
                'Content-Type': 'application/json'
            },
        });
    }

    const roomService = new RoomServiceClient(LIVEKIT_URL, LIVEKIT_API_KEY, LIVEKIT_API_SECRET);

    try {
        await roomService.createRoom({
            name: roomName
        });
        console.log(`LiveKit room "${roomName}" created successfully.`);
    } catch (livekitError: any) {
        console.error('Error creating LiveKit room:', livekitError);
        return new Response(JSON.stringify({
            error: `Failed to create LiveKit room: ${livekitError.message}`
        }), {
            status: 500,
            headers: {
                'Content-Type': 'application/json'
            },
        });
    }

    const newRoom = {
        roomName,
        creatorEmail: userEmail,
        creatorName: userName,
        createdAt: new Date().toISOString()
    };
    createdRooms.push(newRoom);

    return new Response(JSON.stringify({
        message: 'Room created successfully',
        room: newRoom
    }), {
        status: 200,
        headers: {
            'Content-Type': 'application/json'
        },
    });
}

async function handleGetTokenApi(req: NextRequest) {
    const {
        roomName,
        participantIdentity,
        participantName
    } = await req.json();

    console.log(roomName, participantIdentity, participantName, "roomName")

    if (!roomName || !participantIdentity || !participantName) {
        return new Response(JSON.stringify({
            error: 'Room name, participant identity, and participant name are required.'
        }), {
            status: 400,
            headers: {
                'Content-Type': 'application/json'
            },
        });
    }

    if (!AccessToken) {
        return new Response(JSON.stringify({
            error: 'LiveKit server SDK not initialized.'
        }), {
            status: 500,
            headers: {
                'Content-Type': 'application/json'
            },
        });
    }

    const at = new AccessToken(LIVEKIT_API_KEY, LIVEKIT_API_SECRET, {
        identity: participantIdentity,
        name: participantName,
        metadata: '',
    });



    at.addGrant({
        roomJoin: true,
        room: roomName,
        canPublish: true,
        canSubscribe: true,
        canUpdateOwnMetadata: true,
    });

    const token = await at.toJwt()
    // console.log(await at.toJwt())

    return new Response(JSON.stringify({
        token
    }), {
        status: 200,
        headers: {
            'Content-Type': 'application/json'
        },
    });
}

async function handleGetRoomsApi() {
    return new Response(JSON.stringify({
        rooms: createdRooms
    }), {
        status: 200,
        headers: {
            'Content-Type': 'application/json'
        },
    });
}

// Unified API Handler for Next.js
export async function POST(req: NextRequest, res: NextResponse) { // This will be the POST handler for /api/unified-livekit-handler
    const {
        searchParams
    } = new URL(req.url);
    const path = searchParams.get('path'); // Get the intended API path from query param

    // For POST requests, dispatch based on the path
    switch (path) {
        case '/api/create-room':
            return handleCreateRoomApi(req);
        case '/api/get-livekit-token':
            return handleGetTokenApi(req);
        default:
            return new Response(JSON.stringify({
                error: 'Invalid API path for POST request.'
            }), {
                status: 400,
                headers: {
                    'Content-Type': 'application/json'
                },
            });
    }
}

export async function GET(req: NextRequest, res: NextResponse) { // This will be the GET handler for /api/unified-livekit-handler
    const {
        searchParams
    } = new URL(req.url);
    const path = searchParams.get('path'); // Get the intended API path from query param

    // For GET requests, dispatch based on the path
    switch (path) {
        case '/api/get-rooms':
            return handleGetRoomsApi();
        default:
            return new Response(JSON.stringify({
                error: 'Invalid API path for GET request.'
            }), {
                status: 400,
                headers: {
                    'Content-Type': 'application/json'
                },
            });
    }
}
