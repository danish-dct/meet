import { Mic, MicOff, Video, VideoOff } from "lucide-react";

export const TrackMutedIndicator = ({
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