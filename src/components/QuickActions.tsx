import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faDiscord } from '@fortawesome/free-brands-svg-icons';

interface QuickActionsProps {
  navigateTo: (url: string) => void;
  importBot: () => void;
}

const QuickActions: React.FC<QuickActionsProps> = ({ navigateTo, importBot }) => {
  return (
    <div className="quick-actions-container">
      <h2 className="quick-actions-title">Quick Actions</h2>
      <div className="quick-actions-divider"></div>
      <div className="quick-actions-btn-container">
        <div className="quick-actions-left">
          <button className="developer-portal-btn" onClick={() => navigateTo('https://discord.com/developers/applications')}>
            <FontAwesomeIcon icon={faDiscord} /> Dev Portal
          </button>
          <button className="quick-action-btn" onClick={importBot}>Import Bot</button>
          <button className="quick-action-btn">Create Bot</button>
        </div>
        <div className="quick-actions-right">
          <button className="developer-portal-btn" onClick={() => navigateTo('https://discord.gg/ybdyrPuEPR')}>
            <FontAwesomeIcon icon={faDiscord} /> Discord
          </button>
        </div>
      </div>
    </div>
  );
};

export default QuickActions;
