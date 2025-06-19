import Voice from '@react-native-voice/voice';
import { Audio } from 'expo-av';
import { useEffect, useState } from 'react';
import { Alert, Button, FlatList, PermissionsAndroid, Platform, StyleSheet, Text, View } from 'react-native';

export default function BillingScreen() {
  const [result, setResult] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [items, setItems] = useState([]);

  const requestPermissions = async () => {
    const { status } = await Audio.requestPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Required', 'Please allow microphone access.');
    }
    if (Platform.OS === 'android') {
      const ok = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.RECORD_AUDIO
      );
      if (ok !== PermissionsAndroid.RESULTS.GRANTED) {
        Alert.alert('Permission Required', 'Microphone permission is required.');
      }
    }
  };

  useEffect(() => {
    requestPermissions();

    const onSpeechResults = (e) => {
      if (e.value?.length) {
        const text = e.value[0];
        setResult(text);
        processBillingCommand(text);
      }
    };

    const onSpeechError = (e) => {
      console.warn('Speech error:', e.error);
      Alert.alert('Speech Error', JSON.stringify(e.error));
      setIsListening(false);
    };

    Voice.onSpeechResults = onSpeechResults;
    Voice.onSpeechError = onSpeechError;

    return () => {
      Voice.destroy().then(() => Voice.removeAllListeners());
    };
  }, []);

  const startListening = async () => {
    try {
      await Voice.start('en-IN');
      setIsListening(true);
    } catch (e) {
      console.error('Error starting Voice:', e);
    }
  };

  const stopListening = async () => {
    try {
      await Voice.stop();
      setIsListening(false);
    } catch (e) {
      console.error('Error stopping Voice:', e);
    }
  };

  const processBillingCommand = (text) => {
    const words = text.toLowerCase().split(' ');
    const addIdx = words.indexOf('add');
    if (addIdx > -1 && words.length >= addIdx + 3) {
      const qty = parseInt(words[addIdx + 1], 10);
      const name = words[addIdx + 2];
      if (!isNaN(qty) && name) {
        setItems((prev) => [...prev, { name, quantity: qty }]);
      }
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Voice Based Billing</Text>
      <Button
        title={isListening ? 'Stop Listening' : 'Start Billing by Voice'}
        onPress={isListening ? stopListening : startListening}
      />
      <Text style={styles.output}>You said: {result}</Text>
      <FlatList
        data={items}
        keyExtractor={(_, i) => i.toString()}
        renderItem={({ item }) => (
          <Text style={styles.item}>{item.quantity} × {item.name}</Text>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  title: { fontSize: 20, fontWeight: 'bold', marginBottom: 20 },
  output: { fontSize: 16, marginVertical: 20 },
  item: { fontSize: 16, marginTop: 10 }
});
