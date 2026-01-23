/**
 * Telemedicine Video Room Component
 */

import { useEffect, useRef, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { orpc } from '../../lib/api';
import { Button } from '../ui/button';

export interface VideoRoomProps {
  appointmentId: string;
}

export function VideoRoom({ appointmentId }: VideoRoomProps) {
  const queryClient = useQueryClient();
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isConnected, setIsConnected] = useState(false);

  const { data: roomStatus } = useQuery(
    orpc.telemedicine.getRoomStatus({ appointmentId })
  );

  const createRoomMutation = useMutation({
    mutationFn: orpc.telemedicine.createRoom.mutate,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['telemedicine', 'room', appointmentId] });
    },
  });

  useEffect(() => {
    // Initialize video when room is available
    if (roomStatus?.roomUrl && !isConnected) {
      // This would initialize the video provider SDK
      // Example for Twilio:
      // const room = await connect(roomStatus.accessToken);
      // room.on('participantConnected', participant => {
      //   participant.tracks.forEach(track => {
      //     if (track.kind === 'video') {
      //       videoRef.current?.appendChild(track.attach());
      //     }
      //   });
      // });
      setIsConnected(true);
    }
  }, [roomStatus, isConnected]);

  if (!roomStatus?.roomUrl) {
    return (
      <div className="bg-white shadow rounded-lg p-6">
        <p className="text-gray-600 mb-4">Video room not yet created</p>
        <Button
          variant="primary"
          onClick={() => createRoomMutation.mutate({ appointmentId, provider: 'twilio' })}
          isLoading={createRoomMutation.isPending}
        >
          Create Video Room
        </Button>
      </div>
    );
  }

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <div className="mb-4">
        <h3 className="text-lg font-medium mb-2">Video Consultation</h3>
        <p className="text-sm text-gray-600">Status: {roomStatus.status}</p>
      </div>
      
      <div className="relative bg-black rounded-lg overflow-hidden" style={{ aspectRatio: '16/9' }}>
        <video
          ref={videoRef}
          autoPlay
          playsInline
          className="w-full h-full object-cover"
        />
        {!isConnected && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-900">
            <div className="text-white">Connecting...</div>
          </div>
        )}
      </div>

      <div className="mt-4 flex justify-center space-x-4">
        <Button variant="outline">Mute</Button>
        <Button variant="outline">Camera Off</Button>
        <Button variant="danger">End Call</Button>
      </div>
    </div>
  );
}
