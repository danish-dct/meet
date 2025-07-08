import { useConnection } from "@/lib/Context/ConnectionContext";
import { TrackMutedIndicator } from "@/lib/Helper/trackMuteIndicator";
import { ParticipantName, useParticipants } from "@livekit/components-react";
import { Participant, Room, Track } from "livekit-client";
import { CircleEllipsis, DoorOpen, Settings, Settings2 } from "lucide-react";
import { use } from "react";

export const SidebarViewHost = () => {
  const { connectionDetails } = useConnection();
  const participants = useParticipants();

  const handleSettings = (identity: string) => {
    alert(identity);
  }

  const handleRemoveParticipant = async (identity: string) => {
    // alert(roomName);
    // alert(identity);

    const token = connectionDetails?.participantToken;

    const res= await fetch('/api/remove-participant', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ identity }),
    });

    const data = await res.json();
    if (res.ok) {
      alert(`Removed ${identity}`);
    } else {
      alert(`Error: ${data.error}`);
    }
  }

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
              {
                !isHost && (
                  <div className="flex">
                    <CircleEllipsis 
                      size={20} 
                      className="cursor-pointer" 
                      onClick={() => handleSettings(participant.identity)} 
                    />
                    <DoorOpen 
                      size={20} 
                      className="cursor-pointer ml-1" 
                      onClick={() => handleRemoveParticipant(participant.identity)}
                    />
                    <div></div>
                  </div>
                  // <select name="settings">
                  //   <option value="moderator">Set as Moderator</option>
                  //   <option value="translator">Set as Translator</option>
                  // </select>
                )
              }
            </li>
            );
          })}
      </ul>
    </>
  )
}