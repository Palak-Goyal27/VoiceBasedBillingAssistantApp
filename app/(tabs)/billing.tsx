// import { StyleSheet, Text, View } from 'react-native';

// export default function BillingScreen() {
//   return (
//     <View style={styles.container}>
//       <Text style={styles.title}>Billing Screen</Text>
//       <Text style={styles.subtitle}>This is where you will handle all billing-related functionalities.</Text>
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     justifyContent: 'center',
//     alignItems: 'center',
//     padding: 16,
//     backgroundColor: '#fff',
//   },
//   title: {
//     fontSize: 22,
//     fontWeight: 'bold',
//     marginBottom: 12,
//   },
//   subtitle: {
//     fontSize: 16,
//     color: '#666',
//     textAlign: 'center',
//   },
// });


import Voice from '@react-native-voice/voice';
import React, { useState } from 'react';
import { Button, StyleSheet, Text, View } from 'react-native';

export default function BillingScreen() {
  const [result, setResult] = useState('');
  const [isListening, setIsListening] = useState(false);

  const startListening = async () => {
    try {
      await Voice.start('en-US');
      setIsListening(true);
    } catch (e) {
      console.error(e);
    }
  };

  const stopListening = async () => {
    try {
      await Voice.stop();
      setIsListening(false);
    } catch (e) {
      console.error(e);
    }
  };

  Voice.onSpeechResults = (e) => {
    setResult(e.value[0]);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Voice Based Billing</Text>
      <Button title={isListening ? 'Stop Listening' : 'Start Billing by Voice'} onPress={isListening ? stopListening : startListening} />
      <Text style={styles.output}>You said: {result}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  title: { fontSize: 20, fontWeight: 'bold', marginBottom: 20 },
  output: { fontSize: 16, marginTop: 20 }
});
