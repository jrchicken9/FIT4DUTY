import { StyleSheet } from 'react-native';
import Colors from '@/constants/colors';
import { typography } from '@/constants/designSystem';

export default function WorkoutAnalyticsScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <PoliceThemeBackground>
        <View />
      </PoliceThemeBackground>
      
      <View style={styles.content}>
        <Text style={styles.title}>Workout Analytics</Text>
        <Text style={styles.subtitle}>Coming soon...</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    ...typography.headingLarge,
    color: Colors.text,
    marginBottom: 10,
  },
  subtitle: {
    ...typography.bodyMedium,
    color: Colors.textSecondary,
  },
});
