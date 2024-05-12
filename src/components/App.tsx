import React from 'react';
import Frame from './Frame'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faDiscord } from '@fortawesome/free-brands-svg-icons';

import '../css/App.css';
import '../css/Frame.css';

function App() {

  const minimizeWindow = (): void => { window.ipcRenderer.send('window-minimize') };
  const maximizeWindow = (): void => { window.ipcRenderer.send('window-maximize') };
  const closeWindow = (): void => { window.ipcRenderer.send('window-close') };

  const navigateTo = (url: string): void => {
    window.open(url, '_blank');
  };

  return (
    <>
      <Frame minimizeWindow={minimizeWindow} maximizeWindow={maximizeWindow} closeWindow={closeWindow}/>
      <div className='body-container'>
        <div className="quick-actions-container">
          <h2 className="quick-actions-title">Quick Actions</h2>
          <div className="quick-actions-divider"></div>
          <div className="quick-actions-btn-container">
            <div className="quick-actions-left">
              <button className="developer-portal-btn" onClick={() => navigateTo('https://discord.com/developers/applications')}>
                <FontAwesomeIcon icon={faDiscord} /> Dev Portal
              </button>
              <button className="quick-action-btn">Import Bot</button>
              <button className="quick-action-btn">Create Bot</button>
            </div>
            <div className="quick-actions-right">
              <button className="developer-portal-btn" onClick={() => navigateTo('https://discord.gg/ybdyrPuEPR')}>
                <FontAwesomeIcon icon={faDiscord} /> Discord
              </button>
            </div>
          </div>
        </div>
        <div className="applications-container">
          <h2 className="applications-title">Applications</h2>
          <div className="applications-divider"></div>
          <div className="applications-btn-container">
            <button className="application-btn">App 1</button>
            <button className="application-btn">App 2</button>
            <button className="application-btn">App 3</button>
          </div>
        </div>
      </div>
    </>
  );
}


export default App;
