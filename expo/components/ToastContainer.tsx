import { View, StyleSheet } from 'react-native';
import { useToast } from '@/context/ToastContext';
import ToastNotification from './ToastNotification';

export default function ToastContainer() {
  const { toasts, dismissToast } = useToast();

  return (
    <View style={styles.container} pointerEvents="box-none">
      {toasts.map((toast: any, index: number) => (
        <ToastNotification
          key={toast.id}
          visible={true}
          type={toast.type}
          title={toast.title}
          message={toast.message}
          duration={toast.duration}
          onPress={toast.onPress}
          actionText={toast.actionText}
          onDismiss={() => dismissToast(toast.id)}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 9999,
  },
});
