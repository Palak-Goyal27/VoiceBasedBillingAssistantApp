import { useState } from 'react';
import { Button, StyleSheet, Text, View } from 'react-native';
import BillingScreen from './billing';
import CreateListScreen from './CreateListScreen';

export default function HomeScreen() {
  const [screen, setScreen] = useState('Home');

  if (screen === 'Billing') return <BillingScreen />;
  if (screen === 'CreateList') return <CreateListScreen onBackHome={() => setScreen('Home')} />;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome to Voice Based Billing Assistant!</Text>
      <Text style={styles.subtitle}>Bol Kar Bill Banao – Smart Billing Made Simple by Speech</Text>
      <View style={{ height: 30 }} />
      <Button title="Start Billing" onPress={() => setScreen('Billing')} />
      <View style={{ height: 20 }} />
      <Button title="Create List" onPress={() => setScreen('CreateList')} />
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

