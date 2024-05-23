import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft } from '@fortawesome/free-solid-svg-icons';
import '../../css/Settings.css';

interface SubSettingsProps {
  onClose: () => void;
  botPath: string;
}

const SubSettings: React.FC<SubSettingsProps> = ({ onClose, botPath }) => {
  const [settings, setSettings] = useState<any>({});
  const [initialSettings, setInitialSettings] = useState<any>({});
  const [showConfirmation, setShowConfirmation] = useState<boolean>(false);

  useEffect(() => {
    async function loadSettings() {
      const loadedSettings = await window.ipcRenderer.invoke('read-settings', botPath);
      setSettings(loadedSettings);
      setInitialSettings(loadedSettings);
    }

    loadSettings();
  }, [botPath]);

  const handleSave = () => {
    window.ipcRenderer.send('write-settings', settings, botPath);
    setInitialSettings(settings);
    console.log(`Settings saved: ${JSON.stringify(settings)}`);
  };

  const handleClose = () => {
    if (JSON.stringify(settings) !== JSON.stringify(initialSettings)) {
      setShowConfirmation(true);
    } else {
      onClose();
    }
  };

  const handleConfirmLeave = () => {
    setShowConfirmation(false);
    onClose();
  };

  return (
    <div className="settings-view">
      <div className="header">
        <button className="close-btn" onClick={handleClose}>
          <FontAwesomeIcon icon={faArrowLeft} />
        </button>
        <h2 className="settings-title">Management Settings</h2>
      </div>
      <div className="settings-content">
        <div className="settings-card">
          <label className="other-setting">Start Command:</label>
          <input
            className='settings-input'
            type="text"
            value={settings.startCommand || 'node index.js'}
            onChange={(e) => setSettings((prevSettings: any) => ({...prevSettings, startCommand: e.target.value}))}
            placeholder="Enter start command"
          />
        </div>
        <div className="settings-card">
          <label className="other-setting">Deploy Commands - Global:</label>
          <input
            className='settings-input'
            type="text"
            value={settings.globalDeployCommand || 'node scripts/deploy-commands.js'}
            onChange={(e) => setSettings((prevSettings: any) => ({...prevSettings, globalDeployCommand: e.target.value}))}
            placeholder="Enter deploy command"
          />
        </div>
        <div className="settings-card">
          <label className="other-setting">Deploy Commands - Local:</label>
          <input
            className='settings-input'
            type="text"
            value={settings.localDeployCommand || 'node scripts/deploy-commands.js'}
            onChange={(e) => setSettings((prevSettings: any) => ({...prevSettings, localDeployCommand: e.target.value}))}
            placeholder="Enter deploy command"
          />
        </div>
        <button className="save-btn" onClick={handleSave}>Save</button>
      </div>

      {showConfirmation && (
        <div className="confirmation-popup">
          <div className="popup-content">
            <p>You have unsaved changes!</p>
            <p>Are you sure you want to leave without saving?</p>
            <button className="popup-btn" onClick={handleConfirmLeave}>Leave</button>
            <button className="popup-btn" onClick={() => setShowConfirmation(false)}>Cancel</button>
          </div>
        </div>
      )}
      
    </div>
  );
};

export default SubSettings;
