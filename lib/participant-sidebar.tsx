// lib/participant-sidebar.tsx
'use client';

import { useParticipants, ParticipantName } from '@livekit/components-react';
import { Participant, Track } from 'livekit-client';
import { Mic, MicOff, Video, VideoOff } from 'lucide-react';

// Helper to decide which icon to show based on track state
const TrackMutedIndicator = ({
  track,
  source,
}: {
  track?: { isMuted: boolean; isEnabled: boolean };
  source: 'microphone' | 'camera';
}) => {
  if (!track || !track.isEnabled) {
    return source === 'microphone' ? <MicOff className="w-4 h-4 text-red-500" /> : <VideoOff className="w-4 h-4 text-red-500" />;
  } else if (track.isMuted) {
    return source === 'microphone' ? <MicOff className="w-4 h-4" /> : <VideoOff className="w-4 h-4" />;
  }
  return source === 'microphone' ? <Mic className="w-4 h-4 text-green-500" /> : <Video className="w-4 h-4 text-green-500" />;
};

export const ParticipantSidebar = () => {
  // useParticipants returns all participants in the room, including the local one.
  const participants = useParticipants();

  return (
    <aside className="hidden w-72 flex-col bg-gray-50 dark:bg-gray-800 p-4 text-gray-900 dark:text-white md:flex overflow-y-auto">
      <h2 className="text-lg font-bold">Participants ({participants.length})</h2>
      <ul className="mt-4 space-y-3">
        {participants.map((participant: Participant) => {
          console.log('Rendering participant:', participant);

          return (
            <li key={participant.sid} className="flex items-center space-x-3">
              <div className="flex-grow">
                <ParticipantName participant={participant} />
                {participant.isLocal && ' (You)'}
              </div>
              <div className="flex items-center space-x-2">
                <TrackMutedIndicator
                  source="microphone"
                  track={participant.getTrackPublication(Track.Source.Microphone)}
                />
                <TrackMutedIndicator
                  source="camera"
                  track={participant.getTrackPublication(Track.Source.Camera)}
                />
              </div>
            </li>
          );
        })}
      </ul>
    </aside>
  );
};
