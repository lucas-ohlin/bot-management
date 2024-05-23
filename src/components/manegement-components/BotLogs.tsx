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

  return (
    <div className="bot-logs">
      <div className="log-window" ref={logWindowRef}>
        {logs.map((log, index) => (
          <p key={index}>{log}</p>
        ))}
      </div>
      <div className="bot-stats">
        <div className="stat">
          <h3>CPU Usage</h3>
          <p>{Math.round(cpuUsage)}%</p>
          {/* <p>Uptime: {uptime}s</p> */}
        </div>
        <div className="stat">
          <h3>Memory</h3>
          <p>{Math.round(memoryUsage)} MB</p>
          {/* <p>Uptime: {uptime}s</p> */}
        </div>
      </div>
    </div>
  );
};

export default BotLogs;
