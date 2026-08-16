import React from 'react';
import { Activity, CheckCircle2, AlertTriangle, RefreshCw } from 'lucide-react';

export default function HealthStatusBadge({ health, loading, onRefresh }) {
  if (loading && !health) {
    return (
      <div className="health-badge-container health-loading">
        <RefreshCw size={14} className="animate-spin text-cyan-primary" />
        <span>Connecting to Backend...</span>
      </div>
    );
  }

  const isOnline = health && health.status === 'healthy';
  const dbConnected = health?.database_connected;
  const cnnStatus = health?.models?.image_custom_cnn?.status || 'Unknown';
  const latency = health?.latencyMs || 0;

  return (
    <div className={`health-badge-container ${isOnline ? 'health-online' : 'health-offline'}`}>
      <div className="health-dot-wrapper">
        <span className={`status-dot ${isOnline ? 'dot-online' : 'dot-offline'}`}></span>
      </div>
      
      <div className="health-info-text">
        <span className="health-title">
          {isOnline ? 'API Operational' : 'Backend Offline'}
        </span>
        {isOnline && (
          <span className="health-details">
            DB: {dbConnected ? 'Active' : 'Unreachable'} | CNN: {cnnStatus} | {latency}ms
          </span>
        )}
      </div>

      <button 
        className="health-refresh-btn" 
        onClick={onRefresh} 
        title="Check Backend Health & Ping"
        disabled={loading}
      >
        <RefreshCw size={13} className={loading ? 'animate-spin' : ''} />
      </button>
    </div>
  );
}
