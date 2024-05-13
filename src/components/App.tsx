import React, { useEffect, useState } from 'react';
import Frame from './Frame'
import Modal from './Modal'; 
import ApplicationsContainer from './Bots';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faDiscord } from '@fortawesome/free-brands-svg-icons';

import '../css/App.css';
import '../css/Frame.css';
import '../css/Modal.css';

interface Application {
  name: string;
  path: string;
}

function App() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPath, setSelectedPath] = useState('');

  const minimizeWindow = (): void => { window.ipcRenderer.send('window-minimize') };
  const maximizeWindow = (): void => { window.ipcRenderer.send('window-maximize') };
  const closeWindow = (): void => { window.ipcRenderer.send('window-close') };

  const navigateTo = (url: string): void => { window.open(url, '_blank') };
  const importBot = () => { window.ipcRenderer.send('open-folder-dialog') };
  
  useEffect(() => {
    async function loadApplications() {
      const apps = await window.ipcRenderer.invoke('read-applications');
      setApplications(apps);
    }

    loadApplications();
    window.ipcRenderer.on('selected-directory', handleSelectDirectory);

    return () => {
      window.ipcRenderer.off('selected-directory', handleSelectDirectory);
    };
  }, []);

  const handleSelectDirectory = (_event: any, path: string) => {
    setSelectedPath(path);
    setIsModalOpen(true); 
  };

  const saveApplication = (botName: string) => {
    const newApp: Application = { name: botName, path: selectedPath };
    const newApps = [...applications, newApp];
    setApplications(newApps);
    window.ipcRenderer.send('write-applications', newApps);
    setIsModalOpen(false); 
  };

  return (
    <>
      <Frame minimizeWindow={minimizeWindow} maximizeWindow={maximizeWindow} closeWindow={closeWindow}/>
      {isModalOpen && <Modal onSave={saveApplication} />}
      <div className='body-container'>
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
        <ApplicationsContainer applications={applications} />
      </div>
    </>
  );
  
}

export default App;
