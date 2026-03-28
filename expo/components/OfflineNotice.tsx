import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Wifi, WifiOff, RefreshCw } from 'lucide-react-native';
import Colors from '@/constants/colors';
import { useNetwork } from '@/context/NetworkContext';

export default function OfflineNotice() {
  const { isOffline, retryConnection } = useNetwork();

  if (!isOffline) {
    return null;
  }

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <WifiOff size={20} color={Colors.white} />
        <Text style={styles.text}>No Internet Connection</Text>
        <TouchableOpacity style={styles.retryButton} onPress={retryConnection}>
          <RefreshCw size={16} color={Colors.white} />
          <Text style={styles.retryText}>Retry</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.error,
    paddingVertical: 12,
    paddingHorizontal: 16,
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 1000,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  text: {
    color: Colors.white,
    fontSize: 14,
    fontWeight: '500',
    flex: 1,
    textAlign: 'center',
  },
  retryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 6,
  },
  retryText: {
    color: Colors.white,
    fontSize: 12,
    fontWeight: '500',
  },
});
