"use client";

import React, { useState, useEffect, useRef } from 'react';
import { Room, RoomEvent, LocalParticipant, Track, Participant } from 'livekit-client';
import { useParams, useSearchParams } from 'next/navigation';

// const Page = ({ params }: { params: { roomName: string } }) => {
const Page = () => {
  const params = useParams();
  const searchParams = useSearchParams();

  const roomName = params.roomName as string;
  const userName = searchParams.get('userName');
  const userEmail = searchParams.get('userEmail');

  const [participantIdentity, setParticipantIdentity] = useState('Danish123_xyz');
  const [participantName, setParticipantName] = useState('Danish123');
  const [loading, setLoading] = useState(false);
  const [liveKitToken, setLiveKitToken] = useState('');
  const [currentRoomName, setCurrentRoomName] = useState('');
  const [message, setMessage] = useState('');

  // LiveKit Room state and refs for custom UI
  const [roomInstance, setRoomInstance] = useState<Room | null>(null);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const localVideoRef = useRef(null);
  const localAudioRef = useRef(null);
  const [isMicMuted, setIsMicMuted] = useState(false);
  const [isCameraOff, setIsCameraOff] = useState(false);

  // Effect for LiveKit room connection and event handling
  useEffect(() => {
    if (liveKitToken && currentRoomName) {
      const room = new Room();
      setRoomInstance(room);

      const connectToRoom = async () => {
        try {
          await room.connect(process.env.NEXT_PUBLIC_LIVEKIT_URL || 'wss://your-livekit-server-url.livekit.cloud', liveKitToken);
          console.log('Connected to LiveKit room:', room.name);

          // Publish local tracks
          await room.localParticipant.enableCameraAndMicrophone();
          updateParticipants(room); // Update participants after local participant joins and publishes

          // Event listeners for participant changes
          room.on(RoomEvent.ParticipantConnected, (participant) => {
            console.log('Participant connected:', participant.identity);
            updateParticipants(room);
          });
          room.on(RoomEvent.ParticipantDisconnected, (participant) => {
            console.log('Participant disconnected:', participant.identity);
            updateParticipants(room);
          });
          room.on(RoomEvent.TrackPublished, (publication, participant) => {
            console.log('Track published:', publication.kind, participant.identity);
            if (publication.track) {
              publication.track.attach(document.getElementById(`track-${participant.identity}-${publication.kind}`) as HTMLMediaElement);
            }
            updateParticipants(room);
          });
          room.on(RoomEvent.TrackUnpublished, (publication, participant) => {
            console.log('Track unpublished:', publication.kind, participant.identity);
            updateParticipants(room);
          });
          room.on(RoomEvent.TrackSubscribed, (track, publication, participant) => {
            console.log('Track subscribed:', track.kind, participant.identity);
            if (track.kind === Track.Kind.Video && localVideoRef.current) {
              // Attach local video to ref
              if (participant instanceof LocalParticipant) {
                track.attach(localVideoRef.current);
              } else {
                // Attach remote video to a dynamically created element
                const videoElement = document.getElementById(`video-${participant.identity}`);
                if (videoElement) {
                  track.attach(videoElement as HTMLMediaElement);
                }
              }
            } else if (track.kind === Track.Kind.Audio && localAudioRef.current) {
               // Attach local audio to ref
              if (participant instanceof LocalParticipant) {
                track.attach(localAudioRef.current);
              } else {
                // Attach remote audio to a dynamically created element
                const audioElement = document.getElementById(`audio-${participant.identity}`);
                if (audioElement) {
                  track.attach(audioElement as HTMLMediaElement);
                }
              }
            }
            updateParticipants(room);
          });
          room.on(RoomEvent.TrackUnsubscribed, (track, publication, participant) => {
            console.log('Track unsubscribed:', track.kind, participant.identity);
            // Detach track if it was attached
            const element = document.getElementById(`track-${participant.identity}-${track.kind}`);
            if (element) {
                track.detach(element as HTMLMediaElement);
            }
            updateParticipants(room);
          });
          room.on(RoomEvent.LocalTrackPublished, (publication, localParticipant) => {
            if (publication.track) {
              if (publication.kind === Track.Kind.Video && localVideoRef.current) {
                publication.track.attach(localVideoRef.current);
              } else if (publication.kind === Track.Kind.Audio && localAudioRef.current) {
                publication.track.attach(localAudioRef.current);
              }
            }
            updateParticipants(room);
          });
          room.on(RoomEvent.LocalTrackUnpublished, (publication, localParticipant) => {
            if (publication.track) {
              if (publication.kind === Track.Kind.Video && localVideoRef.current) {
                publication.track.detach(localVideoRef.current);
              } else if (publication.kind === Track.Kind.Audio && localAudioRef.current) {
                publication.track.detach(localAudioRef.current);
              }
            }
            updateParticipants(room);
          });


        } catch (error: any) {
          console.error('Failed to connect to LiveKit room:', error);
          setMessage(`Failed to connect: ${error.message}`);
          setLiveKitToken(''); // Clear token on failure
          setRoomInstance(null);
        }
      };

      connectToRoom();

      return () => {
        if (room) {
          room.disconnect();
          console.log('Disconnected from LiveKit room.');
        }
      };
    }
  }, [liveKitToken, currentRoomName]);

  const updateParticipants = (room: Room) => {
    console.log(room.localParticipant, "room.localParticipant")
    console.log(room.remoteParticipants, "room.remoteParticipants")
    const remoteParticipants = Array.from(room?.remoteParticipants?.values() || []); // Changed to remoteParticipants
    const allParticipants = [room?.localParticipant, ...remoteParticipants].filter(Boolean);
    setParticipants(allParticipants);
  };

  const toggleMic = async () => {
    if (roomInstance && roomInstance.localParticipant) {
      const currentMuteState = roomInstance.localParticipant.isMicrophoneEnabled;
      await roomInstance.localParticipant.setMicrophoneEnabled(!currentMuteState);
      setIsMicMuted(currentMuteState);
    }
  };

  const toggleCamera = async () => {
    if (roomInstance && roomInstance.localParticipant) {
      const currentCameraState = roomInstance.localParticipant.isCameraEnabled;
      alert(currentCameraState)
      await roomInstance.localParticipant.setCameraEnabled(!currentCameraState);
      setIsCameraOff(currentCameraState);
    }
  };

  const handleJoinRoom = async (roomToJoin: string) => {
    setLoading(true);
    setMessage('');

    if (!participantIdentity.trim()) {
      setMessage('Please enter a participant identity to join.');
      setLoading(false);
      return;
    }
    if (!participantName.trim()) {
      setMessage('Please enter a participant name to join.');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(`${window.location.origin}/api/unified-livekit-handler?path=/api/get-livekit-token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          roomName: roomToJoin,
          participantIdentity,
          participantName,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setLiveKitToken(data.token);
        setCurrentRoomName(roomToJoin);
        setMessage(`Joining room "${roomToJoin}" as ${participantName}...`);
      } else {
        setMessage(`Error getting token: ${data.error}`);
      }
    } catch (error) {
      console.error('Failed to get LiveKit token:', error);
      setMessage('Network error while fetching LiveKit token.');
    } finally {
      setLoading(false);
    }
  };

  const handleLeaveRoom = () => {
    if (roomInstance) {
      roomInstance.disconnect();
    }
    setLiveKitToken('');
    setCurrentRoomName('');
    setRoomInstance(null);
    setParticipants([]);
    setMessage('Left the room.');
  };

  // If a LiveKit token is available, render the custom LiveKit UI
  if (liveKitToken && currentRoomName) {
    return (
      <div className="bg-gray-100 flex flex-col items-center justify-center p-4 font-sans">
        <div className="bg-white p-8 rounded-xl shadow-lg w-full max-w-4xl">
          <h1 className="text-3xl font-bold text-center text-gray-800 mb-6">LiveKit Room: {currentRoomName}</h1>

          <div className="flex flex-wrap justify-center gap-4 mb-4">
            {/* Local Participant Video */}
            <div className="w-full sm:w-1/2 md:w-1/3 lg:w-1/4 bg-gray-200 rounded-lg overflow-hidden shadow-md">
              <p className="text-center bg-gray-700 text-white p-2 text-sm">You ({participantName})</p>
              <video ref={localVideoRef} autoPlay playsInline muted className="w-full h-auto"></video>
              <audio ref={localAudioRef} autoPlay playsInline muted></audio> {/* Local audio output */}
              <div className="flex justify-center gap-2 p-2">
                <button
                  onClick={toggleMic}
                  className={`py-1 px-3 rounded-md text-sm font-medium ${isMicMuted ? 'bg-red-500 hover:bg-red-600' : 'bg-blue-500 hover:bg-blue-600'} text-white`}
                >
                  {isMicMuted ? 'Unmute Mic' : 'Mute Mic'}
                </button>
                <button
                  onClick={toggleCamera}
                  className={`py-1 px-3 rounded-md text-sm font-medium ${isCameraOff ? 'bg-red-500 hover:bg-red-600' : 'bg-blue-500 hover:bg-blue-600'} text-white`}
                >
                  {isCameraOff ? 'Turn Camera On' : 'Turn Camera Off'}
                </button>
              </div>
            </div>

            {/* Remote Participants Videos */}
            {/* {participants.filter(p => !p.isLocal).map(participant => ( */}
            {participants.filter(p => p).map(participant => (
              <div key={participant.identity} className="w-full sm:w-1/2 md:w-1/3 lg:w-1/4 bg-gray-200 rounded-lg overflow-hidden shadow-md">
                <p className="text-center bg-gray-700 text-white p-2 text-sm">{participant.name || participant.identity}</p>
                {/* Render video track if available */}
                {participant.videoTrackPublications.size > 0 && (
                  <video
                    id={`video-${participant.identity}`}
                    autoPlay
                    playsInline
                    className="w-full h-auto"
                    ref={(el) => {
                      if (el && participant.videoTrackPublications.size > 0) {
                        const videoPub = Array.from(participant.videoTrackPublications.values())[0];
                        if (videoPub.track) {
                          videoPub.track.attach(el);
                        }
                      }
                    }}
                  ></video>
                )}
                {/* Render audio track if available */}
                {participant.audioTrackPublications.size > 0 && (
                  <audio
                    id={`audio-${participant.identity}`}
                    autoPlay
                    playsInline
                    ref={(el) => {
                      if (el && participant.audioTrackPublications.size > 0) {
                        const audioPub = Array.from(participant.audioTrackPublications.values())[0];
                        if (audioPub.track) {
                          audioPub.track.attach(el);
                        }
                      }
                    }}
                  ></audio>
                )}
                {participant.videoTrackPublications.size === 0 && (
                  <div className="w-full h-32 flex items-center justify-center bg-gray-300 text-gray-600">
                    No Video
                  </div>
                )}
              </div>
            ))}
          </div>

          <button
            onClick={handleLeaveRoom}
            className="mt-4 w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
          >
            Leave Room
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-4 font-sans">
      <div className="bg-white p-8 rounded-xl shadow-lg w-full max-w-md">

        <div className="mt-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Join an Existing Room ({roomName})</h2>
          <div className="space-y-4 mb-4">
            <div>
              <label htmlFor="participantIdentity" className="block text-sm font-medium text-gray-700">
                Participant Identity (Unique ID)
              </label>
              <input
                type="text"
                id="participantIdentity"
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm text-black"
                value={participantIdentity}
                onChange={(e) => setParticipantIdentity(e.target.value)}
                placeholder="e.g., user-123"
                required
              />
            </div>
            <div>
              <label htmlFor="participantName" className="block text-sm font-medium text-gray-700">
                Participant Display Name
              </label>
              <input
                type="text"
                id="participantName"
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm text-black"
                value={participantName}
                onChange={(e) => setParticipantName(e.target.value)}
                placeholder="e.g., Alice"
                required
              />
            </div>

            <button
              onClick={() => handleJoinRoom(roomName)}
              className="mt-2 sm:mt-0 sm:ml-4 flex-shrink-0 py-1 px-3 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={loading}
            >
              {loading ? 'Joining...' : 'Join Room'}
            </button>

            {message && (
              <p className={`mt-4 text-center text-sm ${message.includes('Error') ? 'text-red-600' : 'text-green-600'}`}>
                {message}
              </p>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}

export default Page;