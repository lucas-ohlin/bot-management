import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSyncAlt } from '@fortawesome/free-solid-svg-icons';

export interface BotStatistics {
  totalServers: number;
  totalMembers: number;
}

interface BotStatisticsProps {
	stats: BotStatistics | null;
	status: 'loading' | 'failed' | 'loaded';
	error: string | null;
  onRefresh: () => void;
}

const BotStatistics: React.FC<BotStatisticsProps> = ({ stats, status, error, onRefresh }) => (
  <div className="bot-statistics">
    <div className="bot-statistics-header">
      <h3>Bot Statistics</h3>
      <button className="refresh-btn" onClick={onRefresh}>
        <FontAwesomeIcon icon={faSyncAlt} />
      </button>
    </div>
    {status === 'loading' && <p>Loading...</p>}
    {status === 'failed' && error && <p>{error}</p>}
    {status === 'loaded' && stats && (
      <>
        <p>Total Servers: {stats.totalServers}</p>
        <p>Total Members: {stats.totalMembers}</p>
      </>
    )}
  </div>
);

export default BotStatistics;
