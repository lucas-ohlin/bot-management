import React, { useState, useEffect, useRef } from 'react';

interface BotLogsProps {
  logs: string[];
}

const BotLogs: React.FC<BotLogsProps> = ({ logs }) => {
  const [cpuUsage, setCpuUsage] = useState<number>(0);
  const [memoryUsage, setMemoryUsage] = useState<number>(0);
  const [uptime, setUptime] = useState<number>(0);
  const logWindowRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleUsageUpdate = (_event: any, usage: { cpu: number, memory: number, uptime: number }) => {
      setCpuUsage(usage.cpu);
      setMemoryUsage(usage.memory);
      setUptime(usage.uptime);
    };

    window.ipcRenderer.on('bot-usage-update', handleUsageUpdate);

    return () => {
      window.ipcRenderer.off('bot-usage-update', handleUsageUpdate);
    };
  }, []);

  useEffect(() => {
    if (logWindowRef.current) {
      logWindowRef.current.scrollTop = logWindowRef.current.scrollHeight;
    }
  }, [logs]);

  const formatUptime = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = Math.floor(seconds % 60);
    return `${h}h ${m}m ${s}s`;
  };

  return (
    <div className="bot-logs">
      <div className="log-window" ref={logWindowRef}>
        {logs.map((log, index) => (
          <p key={index}>{log}</p>
        ))}
      </div>
      <div className="bot-stats">
        <div className="stat">
          <h3>CPU</h3>
          <p>Usage : {Math.round(cpuUsage)}%</p>
          <p>Uptime : {formatUptime(uptime)}</p>
        </div>
        <div className="stat">
          <h3>RAM </h3>
          <p>Usage : {Math.round(memoryUsage)} MB</p>
          <p>Uptime : {formatUptime(uptime)}</p>
        </div>
      </div>
    </div>
  );
};

export default BotLogs;
