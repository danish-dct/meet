// lib/participant-sidebar.tsx
'use client';

import { useParticipants, ParticipantName, useRoomContext } from '@livekit/components-react';
import { Participant, Track } from 'livekit-client';
import { Mic, MicOff, Video, VideoOff } from 'lucide-react';
import { isHost } from './Helper/isHost';
import { SidebarViewHost } from './Components/Sidebar/SidebarViewHost';
import { SidebarViewGuest } from './Components/Sidebar/SidebarViewGuest';

export const ParticipantSidebar = () => {
  const room = useRoomContext();
  // useParticipants returns all participants in the room, including the local one.

  const isHostUser = isHost(room);

  return (
    <aside className="hidden w-[600px] flex-col bg-gray-50 dark:bg-gray-800 p-4 text-gray-900 dark:text-white md:flex overflow-y-auto">
        {
          isHostUser ? <SidebarViewHost /> : <SidebarViewGuest />
        }
    </aside>
  );
};
