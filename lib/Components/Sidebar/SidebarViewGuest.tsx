import { TrackMutedIndicator } from "@/lib/Helper/trackMuteIndicator";
import { ParticipantName, useParticipants } from "@livekit/components-react";
import { Participant, Room, Track } from "livekit-client";

export const SidebarViewGuest = () => {
  const participants = useParticipants();

  return (
    <>
      <h2 className="text-lg font-bold">Participants ({participants.length})</h2>
      <ul className="mt-4 space-y-3">
        {participants.map((participant: Participant) => {
          console.log('Rendering participant:', participant);

          const metadata = JSON.parse(participant.metadata ?? '{}');
          const isHost = metadata.role === 'host';

          return (
            <li key={participant.sid} className="flex items-center space-x-3">
                <div className="flex-grow">
                    <ParticipantName participant={participant} />
                    {participant.isLocal && ' (You)'}
                    ({ metadata.role })
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
    </>
  )
}