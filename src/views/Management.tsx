import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft } from '@fortawesome/free-solid-svg-icons';
import '../css/Management.css';

interface ManagementProps {
  botName: string;
  botPath: string;
  onClose: () => void;
}

const Management: React.FC<ManagementProps> = ({ botName, botPath, onClose }) => {
  const [isRunning, setIsRunning] = useState<boolean>(false);

  const handleStartStop = () => {
    setIsRunning(!isRunning);
  };

  return (
    <div className="bot-management-view">
      <div className="header">
        <button className="close-btn" onClick={onClose}>
          <FontAwesomeIcon icon={faArrowLeft} />
        </button>
        <div className="bot-info">
          <h2 className="bot-name">{botName}</h2>
          <p className="bot-path">{botPath}</p>
        </div>
      </div>
      <div className="bot-actions">
        <button className="action-btn stop-btn" onClick={handleStartStop}>
          {isRunning ? 'STOP' : 'START'}
        </button>
        <button className="action-btn edit-code-btn">EDIT CODE</button>
        <button className="action-btn invites-btn">INVITE</button>
        <button className="action-btn remove-bot-btn">REMOVE BOT</button>
      </div>
      <div className="bot-logs">
        <div className="log-window">
          <p>[X] Logged in as {botName} [X]</p>
        </div>
        <div className="bot-stats">
          <div className="stat">
            <h3>CPU Usage</h3>
            <p>0%</p>
            <p>Uptime: 0s</p>
          </div>
          <div className="stat">
            <h3>Memory</h3>
            <p>0 MB</p>
            <p>Uptime: 0s</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Management;
