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


// import Voice, { SpeechResultsEvent } from '@react-native-voice/voice';
// import React, { useEffect, useState } from 'react';
// import { Button, StyleSheet, Text, View } from 'react-native';

// export default function BillingScreen() {
//   const [result, setResult] = useState<string>('');
//   const [isListening, setIsListening] = useState<boolean>(false);

//   useEffect(() => {
//     const onSpeechResultsHandler = (e: SpeechResultsEvent) => {
//       if (e.value && e.value.length > 0) {
//         setResult(e.value[0]);
//       }
//     };

//     Voice.onSpeechResults = onSpeechResultsHandler;

//     return () => {
//       Voice.destroy().then(Voice.removeAllListeners);
//     };
//   }, []);

//   const startListening = async () => {
//     try {
//       await Voice.start('en-US');
//       setIsListening(true);
//     } catch (e) {
//       console.error('Error starting Voice:', e);
//     }
//   };

//   const stopListening = async () => {
//     try {
//       await Voice.stop();
//       setIsListening(false);
//     } catch (e) {
//       console.error('Error stopping Voice:', e);
//     }
//   };

//   return (
//     <View style={styles.container}>
//       <Text style={styles.title}>Voice Based Billing</Text>
//       <Button
//         title={isListening ? 'Stop Listening' : 'Start Billing by Voice'}
//         onPress={isListening ? stopListening : startListening}
//       />
//       <Text style={styles.output}>You said: {result}</Text>
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   container: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
//   title: { fontSize: 20, fontWeight: 'bold', marginBottom: 20 },
//   output: { fontSize: 16, marginTop: 20 }
// });


import { Audio } from 'expo-av';
import React, { useEffect, useState } from 'react';
import { Button, StyleSheet, Text, View, Alert } from 'react-native';
import Voice, { SpeechResultsEvent } from '@react-native-voice/voice';

const BillingScreen = () => {
  const [result, setResult] = useState('');
  const [isListening, setIsListening] = useState(false);

  // ✅ Microphone permission check on screen load
  useEffect(() => {
    requestMicPermission();
  }, []);

  const requestMicPermission = async () => {
    const { status } = await Audio.requestPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Required', 'Please grant microphone permissions to use voice billing.');
    }
  };

  const startListening = async () => {
    try {
      await Voice.start('en-US');
      setIsListening(true);
    } catch (e) {
      console.error('Start Error:', e);
    }
  };

  const stopListening = async () => {
    try {
      await Voice.stop();
      setIsListening(false);
    } catch (e) {
      console.error('Stop Error:', e);
    }
  };

  // 🔍 Correct typing and check for undefined
  const onSpeechResultsHandler = (e: SpeechResultsEvent) => {
    if (e.value && e.value.length > 0) {
      setResult(e.value[0]);
    }
  };

  // ✅ Register event handler
  useEffect(() => {
    Voice.onSpeechResults = onSpeechResultsHandler;

    // Cleanup on unmount
    return () => {
      Voice.destroy().then(Voice.removeAllListeners);
    };
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Voice Based Billing</Text>
      <Button
        title={isListening ? 'Stop Listening' : 'Start Billing by Voice'}
        onPress={isListening ? stopListening : startListening}
      />
      <Text style={styles.output}>You said: {result}</Text>
    </View>
  );
};

export default BillingScreen;

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  title: { fontSize: 20, fontWeight: 'bold', marginBottom: 20 },
  output: { fontSize: 16, marginTop: 20 }
});
