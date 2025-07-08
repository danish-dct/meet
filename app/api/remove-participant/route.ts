// app/api/remove-participant/route.ts

import { RoomServiceClient } from 'livekit-server-sdk';
import jwt from 'jsonwebtoken';
import { NextRequest, NextResponse } from 'next/server';

const LIVEKIT_URL = process.env.LIVEKIT_URL!;
const LIVEKIT_API_KEY = process.env.LIVEKIT_API_KEY!;
const LIVEKIT_API_SECRET = process.env.LIVEKIT_API_SECRET!;

export async function POST(req: NextRequest) {
  const authHeader = req.headers.get('authorization');
  const token = authHeader?.split(' ')[1];

  if (!token) {
    return NextResponse.json({ error: 'Missing token' }, { status: 401 });
  }

  let decoded: any;
  try {
    decoded = jwt.verify(token, LIVEKIT_API_SECRET);
  } catch (err) {
    return NextResponse.json({ error: 'Invalid token' }, { status: 403 });
  }

  console.log(decoded, 'Decoded JWT');
  // console.log(identity, 'identity');

  const isRoomAdmin = decoded?.video?.roomAdmin === true;
  const requestingIdentity = decoded.sub;
  const roomName = decoded?.video?.room;

  if (!isRoomAdmin || !roomName) {
    return NextResponse.json({ error: 'Not authorized to remove participants' }, { status: 403 });
  }

  const { identity } = await req.json();

  if (!identity) {
    return NextResponse.json({ error: 'Missing target identity' }, { status: 400 });
  }

  if (identity === requestingIdentity) {
    return NextResponse.json({ error: 'You cannot remove yourself' }, { status: 400 });
  }

  const roomService = new RoomServiceClient(
    LIVEKIT_URL,
    LIVEKIT_API_KEY,
    LIVEKIT_API_SECRET
  );

  try {
    await roomService.removeParticipant(roomName, identity);
    return NextResponse.json({ success: true, removed: identity });
  } catch (err: any) {
    console.error('Error removing participant:', err);
    return NextResponse.json({ error: 'Failed to remove participant' }, { status: 500 });
  }
}
