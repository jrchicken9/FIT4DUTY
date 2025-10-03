import React, { createContext, useContext, useState, useEffect } from 'react';
import { Platform } from 'react-native';

type NetworkState = {
  isConnected: boolean;
  isOnline: boolean;
  connectionType: 'wifi' | 'cellular' | 'ethernet' | 'unknown' | null;
};

const NetworkContext = createContext<{
  networkState: NetworkState;
  isOffline: boolean;
  retryConnection: () => void;
}>({
  networkState: {
    isConnected: true,
    isOnline: true,
    connectionType: null,
  },
  isOffline: false,
  retryConnection: () => {},
});

export const NetworkProvider = ({ children }: { children: React.ReactNode }) => {
  const [networkState, setNetworkState] = useState<NetworkState>({
    isConnected: true,
    isOnline: true,
    connectionType: null,
  });

  const checkConnectivity = async () => {
    try {
      if (Platform.OS === 'web') {
        // Web platform - use navigator.onLine
        const isOnline = navigator.onLine;
        setNetworkState(prev => ({
          ...prev,
          isConnected: isOnline,
          isOnline: isOnline,
        }));
        return isOnline;
      } else {
        // React Native - use NetInfo if available
        const NetInfo = require('@react-native-community/netinfo');
        const state = await NetInfo.fetch();
        setNetworkState({
          isConnected: state.isConnected ?? false,
          isOnline: state.isInternetReachable ?? false,
          connectionType: state.type as any,
        });
        return state.isConnected && state.isInternetReachable;
      }
    } catch (error) {
      console.log('Network check failed:', error);
      // Assume offline if check fails
      setNetworkState(prev => ({
        ...prev,
        isConnected: false,
        isOnline: false,
      }));
      return false;
    }
  };

  const retryConnection = async () => {
    await checkConnectivity();
  };

  useEffect(() => {
    // Initial check
    checkConnectivity();

    if (Platform.OS === 'web') {
      // Web platform - listen to online/offline events
      const handleOnline = () => {
        setNetworkState(prev => ({
          ...prev,
          isConnected: true,
          isOnline: true,
        }));
      };

      const handleOffline = () => {
        setNetworkState(prev => ({
          ...prev,
          isConnected: false,
          isOnline: false,
        }));
      };

      window.addEventListener('online', handleOnline);
      window.addEventListener('offline', handleOffline);

      return () => {
        window.removeEventListener('online', handleOnline);
        window.removeEventListener('offline', handleOffline);
      };
    } else {
      // React Native - use NetInfo listener
      try {
        const NetInfo = require('@react-native-community/netinfo');
        const unsubscribe = NetInfo.addEventListener((state: any) => {
          setNetworkState({
            isConnected: state.isConnected ?? false,
            isOnline: state.isInternetReachable ?? false,
            connectionType: state.type as any,
          });
        });

        return unsubscribe;
      } catch (error) {
        console.log('NetInfo not available:', error);
      }
    }
  }, []);

  const isOffline = !networkState.isConnected || !networkState.isOnline;

  return (
    <NetworkContext.Provider value={{
      networkState,
      isOffline,
      retryConnection,
    }}>
      {children}
    </NetworkContext.Provider>
  );
};

export const useNetwork = () => {
  const context = useContext(NetworkContext);
  if (!context) {
    throw new Error('useNetwork must be used within a NetworkProvider');
  }
  return context;
};
