import { useState } from 'react';
import { Button, StyleSheet, Text, View } from 'react-native';
import BillingScreen from './billing';
import MeasurementScreen from './Measurement';
import SavedBillsScreen from './SavedBillsScreen'; // <-- Add this import

export default function HomeScreen() {
  const [screen, setScreen] = useState('Home');

  if (screen === 'Billing') return <BillingScreen />;
  if (screen === 'Measurement') return <MeasurementScreen onBackHome={() => setScreen('Home')} />;
  if (screen === 'SavedBills') return <SavedBillsScreen navigation={{ goBack: () => setScreen('Home') }} />; // <-- Add this

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome to Voice Based Billing Assistant!</Text>
      <Text style={styles.subtitle}>Bol Kar Bill Banao – Smart Billing Made Simple by Speech</Text>
      <View style={{ height: 30 }} />
      <Button title="Start Billing" onPress={() => setScreen('Billing')} />
      <View style={{ height: 20 }} />
      <Button title="Measurement" onPress={() => setScreen('Measurement')} />
      <View style={{ height: 20 }} />
      <Button title="Saved Bills" onPress={() => setScreen('SavedBills')} /> {/* <-- Add this */}
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

