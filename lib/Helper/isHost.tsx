import { Room } from 'livekit-client';

export function isHost(room: Room): boolean {
  const meta = JSON.parse(room.localParticipant.metadata ?? '{}');
  return meta.role === 'host';
}
