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


// import Voice, { SpeechResultsEvent } from '@react-native-voice/voice';
// import React, { useState, useEffect } from 'react';
// import { Button, StyleSheet, Text, View, FlatList, Alert } from 'react-native';
// import { Audio } from 'expo-av';

// // ✅ Function to request microphone permission
// const requestMicPermission = async () => {
//   const { status } = await Audio.requestPermissionsAsync();
//   if (status !== 'granted') {
//     Alert.alert('Permission Required', 'Please grant microphone permissions to use voice billing.');
//   }
// };

// interface Item {
//   name: string;
//   quantity: number;
// }

// export default function BillingScreen() {
//   const [result, setResult] = useState<string>('');            // What the user said
//   const [isListening, setIsListening] = useState<boolean>(false);  // Mic state
//   const [items, setItems] = useState<Item[]>([]);              // Billing items list

//   useEffect(() => {
//     // Ask for mic permission on screen load
//     requestMicPermission();

//     // Voice result handler
//     const onSpeechResultsHandler = (e: SpeechResultsEvent) => {
//       if (e.value && e.value.length > 0) {
//         const spokenText = e.value[0];      // Get spoken text
//         setResult(spokenText);              // Show it on screen
//         processBillingCommand(spokenText);  // Convert speech into item + qty
//       }
//     };

//     // Set the voice result listener
//     Voice.onSpeechResults = onSpeechResultsHandler;

//     // Cleanup listeners on unmount
//     return () => {
//       Voice.destroy().then(Voice.removeAllListeners);
//     };
//   }, []);

//   // ✅ Start mic
//   const startListening = async () => {
//     try {
//       await Voice.start('en-US');
//       setIsListening(true);
//     } catch (e) {
//       console.error('Error starting Voice:', e);
//     }
//   };

//   // ✅ Stop mic
//   const stopListening = async () => {
//     try {
//       await Voice.stop();
//       setIsListening(false);
//     } catch (e) {
//       console.error('Error stopping Voice:', e);
//     }
//   };

//   // ✅ Process speech to add items
//   const processBillingCommand = (text: string) => {
//     const words = text.toLowerCase().split(' ');
//     const addIndex = words.indexOf('add');
//     if (addIndex !== -1 && words.length >= addIndex + 3) {
//       const quantity = parseInt(words[addIndex + 1]);
//       const itemName = words[addIndex + 2];
//       if (!isNaN(quantity) && itemName) {
//         const newItem: Item = { name: itemName, quantity: quantity };
//         setItems((prevItems) => [...prevItems, newItem]);
//       }
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

//       {/* Show Billing Items */}
//       <FlatList
//         data={items}
//         keyExtractor={(_, index) => index.toString()}
//         renderItem={({ item }) => (
//           <Text style={styles.item}>{item.quantity} x {item.name}</Text>
//         )}
//       />
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   container: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
//   title: { fontSize: 20, fontWeight: 'bold', marginBottom: 20 },
//   output: { fontSize: 16, marginTop: 20 },
//   item: { fontSize: 16, marginTop: 10 }
// });

import Voice, { SpeechErrorEvent, SpeechResultsEvent } from '@react-native-voice/voice';
import { Audio } from 'expo-av';
import React, { useEffect, useState } from 'react';
import {
  Alert,
  Button,
  FlatList,
  PermissionsAndroid,
  Platform,
  StyleSheet,
  Text,
  View
} from 'react-native';

interface Item {
  name: string;
  quantity: number;
}

export default function BillingScreen() {
  const [result, setResult] = useState<string>('');
  const [isListening, setIsListening] = useState<boolean>(false);
  const [items, setItems] = useState<Item[]>([]);

  // 1️⃣ Ask for mic perms, including Android RECORD_AUDIO
  const requestPermissions = async () => {
    // Expo AV
    const { status } = await Audio.requestPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Required', 'Please allow microphone access.');
    }
    // Android explicit RECORD_AUDIO
    if (Platform.OS === 'android') {
      const ok = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
        {
          title: 'Microphone Permission',
          message: 'This app needs access to your microphone to bill by voice.',
          buttonPositive: 'OK',
        }
      );
      if (ok !== PermissionsAndroid.RESULTS.GRANTED) {
        Alert.alert('Permission Required', 'Microphone permission is required.');
      }
    }
  };

  useEffect(() => {
    requestPermissions();

    // 2️⃣ Bind handlers
    const onSpeechResults = (e: SpeechResultsEvent) => {
      if (e.value?.length) {
        const text = e.value[0];
        setResult(text);
        processBillingCommand(text);
      }
    };
    const onSpeechError = (e: SpeechErrorEvent) => {
      console.warn('Speech error:', e.error);
      Alert.alert('Speech Error', JSON.stringify(e.error));
      setIsListening(false);
    };
    const onSpeechStart = () => {
      console.log('Speech recognition started');
    };

    Voice.onSpeechResults = onSpeechResults;
    Voice.onSpeechError   = onSpeechError;
    Voice.onSpeechStart   = onSpeechStart;

    return () => {
      Voice.destroy().then(() => Voice.removeAllListeners());
    };
  }, []);

  // 3️⃣ Start / Stop with locale that matches your test
  const startListening = async () => {
    try {
      await Voice.start('en-IN');   // or 'hi-IN' for Hindi, or 'en-US' for testing
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

  // Parse “Add X item”
  const processBillingCommand = (text: string) => {
    const words = text.toLowerCase().split(' ');
    const addIdx = words.indexOf('add');
    if (addIdx > -1 && words.length >= addIdx + 3) {
      const qty = parseInt(words[addIdx + 1], 10);
      const name = words[addIdx + 2];
      if (!isNaN(qty) && name) {
        setItems(prev => [...prev, { name, quantity: qty }]);
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
  container: { flex:1, justifyContent:'center', alignItems:'center', padding:20 },
  title:     { fontSize:20, fontWeight:'bold', marginBottom:20 },
  output:    { fontSize:16, marginVertical:20 },
  item:      { fontSize:16, marginTop:10 }
});
