import React, { createContext, useContext, useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { AgentStepUpdate, Complaint } from '../types';

interface SocketContextType {
  socket: Socket | null;
  isConnected: boolean;
  joinComplaintRoom: (complaintId: string) => void;
  joinOfficialsRoom: () => void;
  joinUserRoom: (userId: string) => void;
  liveAgentSteps: AgentStepUpdate[];
  clearAgentSteps: () => void;
  latestComplaintUpdate: Complaint | null;
  newComplaintReceived: Complaint | null;
}

const SocketContext = createContext<SocketContextType | undefined>(undefined);

export const SocketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [liveAgentSteps, setLiveAgentSteps] = useState<AgentStepUpdate[]>([]);
  const [latestComplaintUpdate, setLatestComplaintUpdate] = useState<Complaint | null>(null);
  const [newComplaintReceived, setNewComplaintReceived] = useState<Complaint | null>(null);

  useEffect(() => {
    const socketInstance = io(window.location.origin, {
      transports: ['websocket', 'polling']
    });

    socketInstance.on('connect', () => {
      console.log('[Socket.io] Connected to server gateway');
      setIsConnected(true);
    });

    socketInstance.on('disconnect', () => {
      console.log('[Socket.io] Disconnected from server gateway');
      setIsConnected(false);
    });

    socketInstance.on('agent_step_update', (data: AgentStepUpdate) => {
      console.log('[Socket Agent Step]', data);
      setLiveAgentSteps((prev) => [...prev, data]);
    });

    socketInstance.on('global_agent_step', (data: AgentStepUpdate) => {
      setLiveAgentSteps((prev) => [...prev, data]);
    });

    socketInstance.on('status_changed', (updatedComplaint: Complaint) => {
      setLatestComplaintUpdate(updatedComplaint);
    });

    socketInstance.on('complaint_updated', (updatedComplaint: Complaint) => {
      setLatestComplaintUpdate(updatedComplaint);
    });

    socketInstance.on('complaint_created', (createdComplaint: Complaint) => {
      console.log('[Socket] New complaint created:', createdComplaint);
      setNewComplaintReceived(createdComplaint);
    });

    setSocket(socketInstance);

    return () => {
      socketInstance.disconnect();
    };
  }, []);

  const joinComplaintRoom = (complaintId: string) => {
    if (socket && complaintId) {
      socket.emit('join_complaint_room', complaintId);
    }
  };

  const joinOfficialsRoom = () => {
    if (socket) {
      socket.emit('join_officials_room');
    }
  };

  const joinUserRoom = (userId: string) => {
    if (socket && userId) {
      socket.emit('join_user_room', userId);
    }
  };

  const clearAgentSteps = () => {
    setLiveAgentSteps([]);
  };

  return (
    <SocketContext.Provider
      value={{
        socket,
        isConnected,
        joinComplaintRoom,
        joinOfficialsRoom,
        joinUserRoom,
        liveAgentSteps,
        clearAgentSteps,
        latestComplaintUpdate,
        newComplaintReceived
      }}
    >
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
};
