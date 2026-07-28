let ioInstance = null;

export const initSocket = (io) => {
  ioInstance = io;

  io.on('connection', (socket) => {
    console.log(`[Socket.io] Client connected: ${socket.id}`);

    socket.on('join_complaint_room', (complaintId) => {
      socket.join(`complaint_${complaintId}`);
      console.log(`[Socket.io] Socket ${socket.id} joined room complaint_${complaintId}`);
    });

    socket.on('join_officials_room', () => {
      socket.join('officials_dashboard');
      console.log(`[Socket.io] Socket ${socket.id} joined officials_dashboard room`);
    });

    socket.on('join_user_room', (userId) => {
      if (userId) {
        socket.join(`user_${userId}`);
        console.log(`[Socket.io] Socket ${socket.id} joined room user_${userId}`);
      }
    });

    socket.on('disconnect', () => {
      console.log(`[Socket.io] Client disconnected: ${socket.id}`);
    });
  });
};

export const getIO = () => {
  return ioInstance;
};

export const emitAgentProgress = (complaintId, agentProgressData) => {
  if (ioInstance) {
    ioInstance.to(`complaint_${complaintId}`).emit('agent_step_update', agentProgressData);
    ioInstance.to('officials_dashboard').emit('global_agent_step', { complaintId, ...agentProgressData });
  }
};

export const emitComplaintStatusUpdate = (complaint) => {
  if (ioInstance) {
    const cId = complaint.id || complaint._id;
    ioInstance.to(`complaint_${cId}`).emit('status_changed', complaint);
    ioInstance.to('officials_dashboard').emit('complaint_updated', complaint);
    
    const citizenId = complaint.citizenId || complaint.citizen?.id || complaint.citizen?._id;
    if (citizenId) {
      ioInstance.to(`user_${citizenId}`).emit('status_changed', complaint);
    }
  }
};

export const emitComplaintCreated = (complaint) => {
  if (ioInstance) {
    const citizenId = complaint.citizenId || complaint.citizen?.id || complaint.citizen?._id;
    if (citizenId) {
      ioInstance.to(`user_${citizenId}`).emit('complaint_created', complaint);
    }
    ioInstance.to('officials_dashboard').emit('complaint_created', complaint);
    ioInstance.emit('global_complaint_created', complaint);
  }
};
