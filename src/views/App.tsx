import React, { useEffect, useState } from 'react';
import Frame from '../components/Frame';
import Modal from '../components/Modal';
import ApplicationsContainer from '../components/Application';
import Management from './Management';
import QuickActions from '../components/QuickActions';

import '../css/App.css';
import '../css/Frame.css';
import '../css/Application.css';
import '../css/QuickActions.css';
import '../css/Modal.css';

interface Application {
  name: string;
  path: string;
}

const App: React.FC = () => {
  const [applications, setApplications] = useState<Application[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPath, setSelectedPath] = useState('');
  const [selectedBot, setSelectedBot] = useState<Application | null>(null);

  const minimizeWindow = (): void => { window.ipcRenderer.send('window-minimize') };
  const maximizeWindow = (): void => { window.ipcRenderer.send('window-maximize') };
  const closeWindow = (): void => { window.ipcRenderer.send('window-close') };

  const navigateTo = (url: string): void => {
    window.open(url, '_blank');
  };
  const importBot = () => {
    window.ipcRenderer.send('open-folder-dialog');
  };

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

  const handleManage = (app: Application) => {
    console.log("handleManage called with app:", app);
    setSelectedBot(app);
  };

  const closeBotManagementView = () => {
    setSelectedBot(null);
  };

  return (
    <>
      <Frame minimizeWindow={minimizeWindow} maximizeWindow={maximizeWindow} closeWindow={closeWindow} />
      {isModalOpen && <Modal onSave={saveApplication} />}
      {selectedBot ? (
        <Management
          botName={selectedBot.name}
          botPath={selectedBot.path}
          onClose={closeBotManagementView}
        />
      ) : (
        <div className="body-container">
          <QuickActions navigateTo={navigateTo} importBot={importBot} />
          <ApplicationsContainer applications={applications} onManage={handleManage} />
        </div>
      )}
    </>
  );
};

export default App;
