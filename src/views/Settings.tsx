import React, { useState, useEffect, useMemo } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft, faCode, faAtom, faBrain, faLemon } from '@fortawesome/free-solid-svg-icons';
import { faPython, faJs } from '@fortawesome/free-brands-svg-icons';

import '../css/Settings.css';

interface SettingsProps {
  onClose: () => void;
}

const ideIcons = {
  vscode: faCode,
  vsstudio: faCode,
  sublime: faLemon,
  atom: faAtom,
  intellij: faBrain,
  webstorm: faJs,
  pycharm: faPython,
};

const getIDEIcon = (idePath: string | null): { icon: any, name: string } => {
  if (!idePath) return { icon: null, name: '' };

  // I love If statements !!
  const ide = idePath.toLowerCase();
  if (ide.includes('code.exe')) return { icon: ideIcons.vscode, name: 'Visual Studio Code' };
  if (ide.includes('devenv.exe')) return { icon: ideIcons.vscode, name: 'Visual Studio' };
  if (ide.includes('sublime_text.exe')) return { icon: ideIcons.sublime, name: 'Sublime Text' };
  if (ide.includes('atom.exe')) return { icon: ideIcons.atom, name: 'Atom' };
  if (ide.includes('idea.exe')) return { icon: ideIcons.intellij, name: 'IntelliJ IDEA' };
  if (ide.includes('webstorm.exe')) return { icon: ideIcons.webstorm, name: 'WebStorm' };
  if (ide.includes('pycharm.exe')) return { icon: ideIcons.pycharm, name: 'PyCharm' };

  return { icon: null, name: 'Unknown IDE' };
};

const Settings: React.FC<SettingsProps> = ({ onClose }) => {
  const [settings, setSettings] = useState<any>({});
  const [initialSettings, setInitialSettings] = useState<any>({});
  const [showConfirmation, setShowConfirmation] = useState<boolean>(false);
  const ideInfo = useMemo(() => getIDEIcon(settings.selectedIDEPath), [settings.selectedIDEPath]);

  useEffect(() => {
    async function loadSettings() {
      const loadedSettings = await window.ipcRenderer.invoke('read-settings');
      setSettings(loadedSettings);
      setInitialSettings(loadedSettings);
    }

    loadSettings();
  }, []);

  const handleSelectIDE = () => {
    window.ipcRenderer.invoke('open-file-dialog').then((filePaths: string[]) => {
      if (filePaths && filePaths.length > 0) {
        setSettings((prevSettings: any) => ({...prevSettings, selectedIDEPath: filePaths[0]}));
      }
    });
  };

  const handleSave = () => {
    window.ipcRenderer.send('write-settings', settings);
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
        <h2 className="settings-title">Settings</h2>
      </div>
      <div className="settings-content">
        <div className="settings-card">
          <label className="ide-selector">Default Code Editor:</label>
          <div className="ide-info">
            {ideInfo.icon && <FontAwesomeIcon icon={ideInfo.icon} size="2x" />}
            <div className="ide-details">
              <span>{ideInfo.name}</span>
              <span className="ide-path">{settings.selectedIDEPath || 'No IDE selected'}</span>
            </div>
          </div>
          <button className="select-btn" onClick={handleSelectIDE}>Select IDE</button>
        </div>
        <div className="settings-card">
          <label className="other-setting">Test:</label>
          <div className="ide-info">
            <div className="ide-details">
              <span>Just to check</span>
              <span className="ide-path">How it looks with other settings</span>
            </div>
          </div>
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

export default Settings;
