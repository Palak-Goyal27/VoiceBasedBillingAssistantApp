
import { StyleSheet, Text, View } from 'react-native';

export default function HomeScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome to Voice Based Billing Assistant!</Text>
      <Text style={styles.subtitle}>Navigate to Billing or Settings using the Tabs below.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#ADD8E6', // light blue color
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#555', // black text
  },
  subtitle: {
    fontSize: 16,
    color: '#333', // slightly dark text
    textAlign: 'center',
  },
});

