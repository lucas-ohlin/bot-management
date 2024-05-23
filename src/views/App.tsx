import React, { useEffect, useState } from 'react';
import Frame from '../components/app-components/Frame';
import Modal from '../components/app-components/Modal';
import ApplicationsContainer from '../components/app-components/Application';
import Management from './Management';
import Settings from './Settings';
import QuickActions from '../components/app-components/QuickActions';

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
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

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
    setSelectedBot(app);
  };

  const closeBotManagementView = () => {
    setSelectedBot(null);
  };

  const openSettings = () => {
    setIsSettingsOpen(true);
  };

  const closeSettings = () => {
    setIsSettingsOpen(false);
  };

  const removeBot = (botPath: string) => {
    const newApps = applications.filter(app => app.path !== botPath);
    setApplications(newApps);
    window.ipcRenderer.send('write-applications', newApps);
  };

  return (
    <>
      <Frame minimizeWindow={minimizeWindow} maximizeWindow={maximizeWindow} closeWindow={closeWindow} />
      {isModalOpen && <Modal onSave={saveApplication} />}
      {selectedBot ? (
        <Management botName={selectedBot.name} botPath={selectedBot.path} onClose={closeBotManagementView} onRemoveBot={removeBot} />
      ) : isSettingsOpen ? (
        <Settings onClose={closeSettings} />
      ) : (
        <div className="body-container">
          <QuickActions navigateTo={navigateTo} importBot={importBot} onSettingsClick={openSettings} />
          <ApplicationsContainer applications={applications} onManage={handleManage} />
        </div>
      )}
    </>
  );
};

export default App;
