import { StyleSheet, Text, View } from 'react-native';

export default function BillingScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Billing Screen</Text>
      <Text style={styles.subtitle}>This is where you will handle all billing-related functionalities.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
});
