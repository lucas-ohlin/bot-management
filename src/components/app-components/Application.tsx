import React, { useState } from 'react';

interface Application {
  name: string;
  path: string;
}

interface ApplicationsContainerProps {
  applications: Application[];
  onManage: (app: Application) => void;
  onSelect: (app: Application) => void;
}

const ApplicationsContainer: React.FC<ApplicationsContainerProps> = ({ applications, onManage, onSelect }) => {
  const [selectedBotPath, setSelectedBotPath] = useState<string | null>(null);
  const [showPopup, setShowPopup] = useState<boolean>(false);
  
  const truncateText = (text: string, maxLength: number): string => {
    return text.length > maxLength ? `${text.slice(0, maxLength)}...` : text;
  };

  const handleSelect = (app: Application) => {
    setSelectedBotPath(app.path);
    onSelect(app);
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      setShowPopup(true);
      setTimeout(() => setShowPopup(false), 1000);
    }).catch(err => {
      console.error('Failed to copy text: ', err);
    });
  };

  return (
    <div className="applications-container">
      {showPopup && <div className="copy-application-popup">Copied</div>}
      <h2 className="applications-title">Applications</h2>
      <div className="applications-divider"></div>
      <table className="applications-table">
        <thead>
          <tr>
            <th>NAME</th>
            <th>PATH</th>
            <th>ACTION</th>
          </tr>
        </thead>
        <tbody>
          {applications.map((app, index) => (
            <tr key={index}>
              <td title={app.name} onClick={() => handleCopy(app.name)} className='copyable'>{truncateText(app.name, 20)}</td>
              <td title={app.path} onClick={() => handleCopy(app.path)} className='copyable'>{truncateText(app.path, 40)}</td>
              <td className="action-cell">
                <button className="developer-portal-btn" onClick={() => onManage(app)}>Manage</button>
                <button className="select-bot-btn" onClick={() => handleSelect(app)}>
                  {selectedBotPath === app.path ? '✓' : ''}
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ApplicationsContainer;
