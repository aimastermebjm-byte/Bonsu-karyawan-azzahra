import React from 'react';
import { Wifi, WifiOff, Loader2 } from 'lucide-react';
import { useFirebase } from '../context/FirebaseContext';

export default function ConnectionStatus() {
  const { connectionStatus } = useFirebase();

  const getStatusConfig = () => {
    switch (connectionStatus) {
      case 'connected':
        return {
          icon: <Wifi className="w-4 h-4" />,
          text: 'Online',
          bgColor: 'bg-green-100',
          textColor: 'text-green-800',
          dotColor: 'bg-green-500'
        };
      case 'error':
        return {
          icon: <WifiOff className="w-4 h-4" />,
          text: 'Offline',
          bgColor: 'bg-red-100',
          textColor: 'text-red-800',
          dotColor: 'bg-red-500'
        };
      default:
        return {
          icon: <Loader2 className="w-4 h-4 animate-spin" />,
          text: 'Connecting...',
          bgColor: 'bg-yellow-100',
          textColor: 'text-yellow-800',
          dotColor: 'bg-yellow-500'
        };
    }
  };

  const config = getStatusConfig();

  return (
    <div className={`inline-flex items-center space-x-2 px-3 py-1.5 rounded-full text-sm font-medium ${config.bgColor} ${config.textColor}`}>
      <div className={`w-2 h-2 rounded-full ${config.dotColor} ${connectionStatus === 'connecting' ? 'animate-pulse' : ''}`} />
      {config.icon}
      <span>{config.text}</span>
    </div>
  );
}