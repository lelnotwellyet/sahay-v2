import React, { useRef, useEffect, useState } from 'react';
import './styles/VideoCall.css';

const VideoCall = ({ session, onEndCall }) => {
  const localVideoRef = useRef();
  const remoteVideoRef = useRef();
  const [callDuration, setCallDuration] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);

  useEffect(() => {
    // Initialize WebRTC connection here
    initializeVideoCall();
    
    // Start call timer
    const timer = setInterval(() => {
      setCallDuration(prev => prev + 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [session]);

  const initializeVideoCall = async () => {
    try {
      // Get local video stream
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: true, 
        audio: true 
      });
      localVideoRef.current.srcObject = stream;

      // If using Jitsi or other service, you would initialize it here
      // For now, we'll use the meeting link directly
      console.log('Meeting session:', session);

    } catch (error) {
      console.error('Error accessing media devices:', error);
    }
  };

  const toggleMute = () => {
    if (localVideoRef.current.srcObject) {
      const audioTracks = localVideoRef.current.srcObject.getAudioTracks();
      audioTracks.forEach(track => {
        track.enabled = !track.enabled;
      });
      setIsMuted(!isMuted);
    }
  };

  const toggleVideo = () => {
    if (localVideoRef.current.srcObject) {
      const videoTracks = localVideoRef.current.srcObject.getVideoTracks();
      videoTracks.forEach(track => {
        track.enabled = !track.enabled;
      });
      setIsVideoOff(!isVideoOff);
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleEndCall = () => {
    // Stop all tracks
    if (localVideoRef.current.srcObject) {
      localVideoRef.current.srcObject.getTracks().forEach(track => track.stop());
    }
    onEndCall();
  };

  const openMeetingLink = () => {
    if (session.meetingLink) {
      window.open(session.meetingLink, '_blank');
    }
  };

  return (
    <div className="video-call-container">
      <div className="call-header">
        <h3>Session with {session.clientName || session.counsellorName}</h3>
        <div className="call-timer">
          {formatTime(callDuration)}
        </div>
      </div>

      <div className="video-grid">
        <div className="video-container">
          <video 
            ref={remoteVideoRef} 
            autoPlay 
            playsInline
            className="remote-video"
          />
          <div className="video-label">
            {session.clientName ? 'Client' : 'Counsellor'}
          </div>
        </div>
        
        <div className="video-container local">
          <video 
            ref={localVideoRef} 
            autoPlay 
            playsInline 
            muted
            className="local-video"
          />
          <div className="video-label">You</div>
        </div>
      </div>

      <div className="call-info">
        <p><strong>Session Type:</strong> {session.sessionType}</p>
        <p><strong>Date:</strong> {session.date} at {session.time}</p>
        {session.meetingLink && (
          <button className="meeting-link-btn" onClick={openMeetingLink}>
            Open Meeting in New Tab
          </button>
        )}
      </div>

      <div className="call-controls">
        <button 
          className={`control-btn ${isMuted ? 'active' : ''}`}
          onClick={toggleMute}
        >
          {isMuted ? '🔇 Unmute' : '🎤 Mute'}
        </button>
        
        <button 
          className={`control-btn ${isVideoOff ? 'active' : ''}`}
          onClick={toggleVideo}
        >
          {isVideoOff ? '📹 Video On' : '📹 Video Off'}
        </button>
        
        <button 
          className="control-btn end-call"
          onClick={handleEndCall}
        >
          📞 End Call
        </button>
      </div>

      <div className="session-tools">
        <button className="tool-btn">📋 Session Notes</button>
        <button className="tool-btn">💬 Chat</button>
        <button className="tool-btn">🔄 Share Screen</button>
      </div>
    </div>
  );
};

export default VideoCall;