import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft, faPlus, faMinus, faCog } from '@fortawesome/free-solid-svg-icons';
import SubSettings from '../components/manegement-components/SubSettings';
import BotLogs from '../components/manegement-components/BotLogs';
import BotStatistics, { BotStatistics as BotStats } from '../components/manegement-components/BotStatistics';

import '../css/Management.css';

interface ManagementProps {
  botName: string;
  botPath: string;
  onClose: () => void;
  onRemoveBot: (botPath: string) => void;
}

interface Token {
  name: string;
  value: string;
  botPath: string;
}

const Management: React.FC<ManagementProps> = ({ botName, botPath, onClose, onRemoveBot }) => {
  const [isRunning, setIsRunning] = useState<boolean>(false);

  const [showEditCodePopup, setShowEditCodePopup] = useState<boolean>(false);
  const [showRemovePopup, setShowRemovePopup] = useState<boolean>(false);
  const [showAddTokenPopup, setShowAddTokenPopup] = useState<boolean>(false);
  const [showRemoveTokenPopup, setShowRemoveTokenPopup] = useState<boolean>(false);
  const [showSubSettings, setShowSubSettings] = useState<boolean>(false);
  const [selectedIDEPath, setSelectedIDEPath] = useState<string | null>(null);

  const [tokens, setTokens] = useState<Token[]>([]);
  const [selectedToken, setSelectedToken] = useState<string | null>(null);
  const [newTokenName, setNewTokenName] = useState<string>('');
  const [newTokenValue, setNewTokenValue] = useState<string>('');
  
  const [botStatistics, setBotStatistics] = useState<BotStats | null>(null);
  const [loadingStatus, setLoadingStatus] = useState<'loading' | 'failed' | 'loaded'>('loading');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [logs, setLogs] = useState<string[]>([]);

  useEffect(() => {
    async function loadSettings() {
      const settings = await window.ipcRenderer.invoke('read-settings');
      setSelectedIDEPath(settings.selectedIDEPath);
    }

    async function loadTokens() {
      const tokens = await window.ipcRenderer.invoke('read-tokens', botPath);
      setTokens(tokens);
      if (tokens.length > 0) 
        setSelectedToken(tokens[0].name);
    }

    loadSettings();
    loadTokens();
  }, [botPath]);

  useEffect(() => {
    async function loadBotStatistics() {
      const stats = await window.ipcRenderer.invoke('read-bot-stats', botPath);
      if (stats) {
        setBotStatistics(stats);
        setLoadingStatus('loaded');
      } else {
        setLoadingStatus('failed');
        setErrorMessage('Failed to load bot statistics.');
      }
    }

    loadBotStatistics();
  }, [botPath]);

  useEffect(() => {
    const handleLog = (_event: any, log: string) => {
      setLogs(prevLogs => [...prevLogs, log]);
    };

    window.ipcRenderer.on('bot-log', handleLog);

    return () => {
      window.ipcRenderer.off('bot-log', handleLog);
    };
  }, []);

  const refreshBotStatistics = async () => {
    setLoadingStatus('loading');
    setErrorMessage(null);
    if (tokens.length > 0 && selectedToken) {
      const token = tokens.find(t => t.name === selectedToken)?.value;
      if (token) {
        try {
          const stats = await window.ipcRenderer.invoke('bot-stats', token);
          if (stats === false) {
            setErrorMessage('Failed to get bot statistics.');
            setLoadingStatus('failed');
          } else {
            setBotStatistics(stats);
            setLoadingStatus('loaded');
            window.ipcRenderer.send('write-bot-stats', botPath, stats);
          }
        } catch (error: any) {
          console.error('Failed to get bot statistics:', error);
          setErrorMessage(error.message || 'An unknown error occurred');
          setLoadingStatus('failed');
        }
      } else {
        setLoadingStatus('failed');
        setErrorMessage('No valid token found');
      }
    } else {
      setLoadingStatus('failed');
      setErrorMessage('No bot token selected');
    }
  };

  const handleStartStop = async () => {
    const settings = await window.ipcRenderer.invoke('read-settings');
    const startCommand = settings.startCommand || 'node index.js';

    if (isRunning) {
      window.ipcRenderer.send('stop-bot');
    } else {
      window.ipcRenderer.send('start-bot', botPath, startCommand);
    }
    setIsRunning(!isRunning);
  };

  const handleEditCode = () => {
    if (selectedIDEPath) {
      window.ipcRenderer.send('open-ide', selectedIDEPath, botPath);
    } else {
      setShowEditCodePopup(true);
    }
  };

  const handleRemoveBot = () => {
    setShowRemovePopup(true);
  };

  const confirmRemoveBot = () => {
    onRemoveBot(botPath);
    setShowRemovePopup(false);
    onClose();
  };

  const handleAddToken = () => {
    setShowAddTokenPopup(true);
  };

  const confirmAddToken = () => {
    const newToken: Token = { name: newTokenName, value: newTokenValue, botPath };
    const updatedTokens = [...tokens, newToken];
    setTokens(updatedTokens);
    window.ipcRenderer.send('write-tokens', updatedTokens);
    setNewTokenName('');
    setNewTokenValue('');
    setShowAddTokenPopup(false);
  };

  const handleRemoveToken = () => {
    setShowRemoveTokenPopup(true);
  };

  const confirmRemoveToken = () => {
    const tokenToRemove = tokens.find(token => token.name === selectedToken && token.botPath === botPath);
    if (tokenToRemove) {
      window.ipcRenderer.send('remove-token', tokenToRemove);
      const updatedTokens = tokens.filter(token => token !== tokenToRemove);
      setTokens(updatedTokens);
      if (updatedTokens.length > 0) {
        setSelectedToken(updatedTokens[0].name);
      } else {
        setSelectedToken(null);
      }
    }
    setShowRemoveTokenPopup(false);
  };

  const handleSelectToken = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedToken(event.target.value);
  };

  const handleOpenSubSettings = () => {
    setShowSubSettings(true);
  };

  const handleCloseSubSettings = () => {
    setShowSubSettings(false);
  };

  const handleDeployGlobal = async () => {
    const settings = await window.ipcRenderer.invoke('read-settings');
    const globalDeployCommand = settings.globalDeployCommand || 'node scripts/deploy-commands.js';
    window.ipcRenderer.send('deploy-global', botPath, globalDeployCommand);
  };

  const handleDeployLocal = async () => {
    const settings = await window.ipcRenderer.invoke('read-settings');
    const localDeployCommand = settings.localDeployCommand || 'node scripts/deploy-commands.js';
    window.ipcRenderer.send('deploy-local', botPath, localDeployCommand);
  };

  return (
    <div className="bot-management-view">
      {showSubSettings && <SubSettings onClose={handleCloseSubSettings} botPath={botPath} />}
      <div className="header">
        <button className="close-btn" onClick={onClose}>
          <FontAwesomeIcon icon={faArrowLeft} />
        </button>
        <div className="bot-info">
          <h2 className="bot-name">{botName}</h2>
          <div className="bot-path">
            <p>{botPath}</p>
            <div className="token-selection-wrapper">
              <label htmlFor="token-select">TOKEN :</label>
              <select id="token-select" value={selectedToken || ''} onChange={handleSelectToken}>
                {tokens.map(token => (
                  <option key={token.name} value={token.name}>
                    {token.name}
                  </option>
                ))}
              </select>
              <button className="add-token-btn" onClick={handleAddToken}>
                <FontAwesomeIcon icon={faPlus} />
              </button>
              <button className="remove-token-btn" onClick={handleRemoveToken}>
                <FontAwesomeIcon icon={faMinus} />
              </button>
            </div>
          </div>
        </div>
      </div>
      <div className="bot-actions">
        <button className={`action-btn ${isRunning ? 'stop-btn' : 'start-btn'}`} onClick={handleStartStop}>
          {isRunning ? 'STOP' : 'START'}
        </button>
        <button className="action-btn edit-code-btn" onClick={handleEditCode}>EDIT CODE</button>
        <button className="action-btn deploy-global-btn" onClick={handleDeployGlobal}>DEPLOY GLOBAL</button>
        <button className="action-btn deploy-local-btn" onClick={handleDeployLocal}>DEPLOY LOCAL</button>
        <button className="action-btn remove-bot-btn" onClick={handleRemoveBot}>REMOVE BOT</button>
        <button className="subsettings-btn" onClick={handleOpenSubSettings}>
          <FontAwesomeIcon icon={faCog} />
        </button>
      </div>

      {showEditCodePopup && (
        <div className="popup">
          <p>Please select a default code editor in the settings.</p>
          <button className="close-popup-btn" onClick={() => setShowEditCodePopup(false)}>Close</button>
        </div>
      )}
      {showRemovePopup && (
        <div className="confirmation-popup">
          <div className="popup-content">
            <p>Are you sure you want to remove the bot?</p>
            <button className="popup-btn" onClick={confirmRemoveBot}>Remove</button>
            <button className="popup-btn" onClick={() => setShowRemovePopup(false)}>Cancel</button>
          </div>
        </div>
      )}
      {showAddTokenPopup && (
        <div className="confirmation-popup">
          <div className="popup-content">
            <p>Add a new bot token:</p>
            <input type="text" placeholder="Token Name" value={newTokenName} onChange={e => setNewTokenName(e.target.value)} />
            <input type="text" placeholder="Token Value" value={newTokenValue} onChange={e => setNewTokenValue(e.target.value)} />
            <button className="popup-btn" onClick={confirmAddToken}>Add</button>
            <button className="popup-btn" onClick={() => setShowAddTokenPopup(false)}>Cancel</button>
          </div>
        </div>
      )}
      {showRemoveTokenPopup && (
        <div className="confirmation-popup">
          <div className="popup-content">
            <p>Are you sure you want to remove the token "{selectedToken}"?</p>
            <button className="popup-btn" onClick={confirmRemoveToken}>Remove</button>
            <button className="popup-btn" onClick={() => setShowRemoveTokenPopup(false)}>Cancel</button>
          </div>
        </div>
      )}

      <BotLogs logs={logs} />
      <BotStatistics stats={botStatistics} status={loadingStatus} error={errorMessage} onRefresh={refreshBotStatistics} />
    </div>
  );
};

export default Management;
