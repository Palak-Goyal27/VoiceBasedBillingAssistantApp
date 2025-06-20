import { useEffect, useRef, useState } from 'react';
import { Alert, Button, FlatList, Platform, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

let Voice;
if (Platform.OS !== 'web') {
  Voice = require('@react-native-voice/voice').default;
}

// --- Robust parsing: last number as price, rest as item, Hindi/English/₹, supports web/mobile ---
function parseItemsAndPrices(text) {
  // Remove extra spaces, normalize
  text = text.trim().replace(/\s+/g, ' ');
  // Voice commands
  if (/^new bill$/i.test(text) || /नया बिल|नया बिल$/i.test(text)) return [{ command: 'newBill' }];
  if (/^remove last item$/i.test(text) || /पिछला|पिछला आइटम|आखिरी|हटाओ|हटा दो$/i.test(text)) return [{ command: 'undo' }];
  // Extract price (last number with/without currency)
  const priceRegex = /(\d+(?:\.\d+)?)(\s*(?:rupees|rs|rupaye|रुपये|रुपया|रुपय|₹)|\s*₹)?\s*$/i;
  const match = text.match(priceRegex);
  if (match) {
    let price = match[0].replace(/\s+/, '');
    if (!/₹|rs|rupees|rupaye|रुपये|रुपया|रुपय/i.test(price)) price = '₹' + match[1];
    let item = text.slice(0, match.index).replace(/₹|rs|rupees|rupaye|रुपये|रुपया|रुपय/gi, '').trim();
    if (!item) item = '—';
    return [{ item, price }];
  }
  // No price, treat all as item
  return [{ item: text, price: '' }];
}

export default function BillingScreen() {
  const [isListening, setIsListening] = useState(false);
  const [items, setItems] = useState([]); // For list mode
  const [mode] = useState('list'); // 'list' or 'amount'
  const [editIndex, setEditIndex] = useState(null);
  const [editPrice, setEditPrice] = useState('');
  const recognitionRef = useRef(null);
  // Track if user requested stop
  const stopRequestedRef = useRef(false);

  useEffect(() => {
    if (Platform.OS === 'web') {
      if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        const recognition = new SpeechRecognition();
        recognition.lang = 'hi-IN,en-IN';
        recognition.interimResults = false; // Only process finalized, accurate results
        recognition.maxAlternatives = 1;
        recognition.continuous = true; // Keep listening until stopped
        recognition.onresult = (event) => {
          let text = '';
          for (let i = event.resultIndex; i < event.results.length; ++i) {
            text = event.results[i][0].transcript;
            if (event.results[i].isFinal) {
              processBillingCommand(text);
            }
          }
        };
        recognition.onerror = (event) => {
          Alert.alert('Speech Error', event.error);
        };
        recognition.onend = () => {
          setIsListening(false); // Always set to false on end
        };
        recognitionRef.current = recognition;
      } else {
        Alert.alert('Not Supported', 'Speech recognition is not supported in this browser.');
      }
    } else {
      // Native setup
      const requestPermissions = async () => {
        const { Audio } = require('expo-av');
        const { status } = await Audio.requestPermissionsAsync();
        if (status !== 'granted') {
          Alert.alert('Permission Required', 'Please allow microphone access.');
        }
        if (Platform.OS === 'android') {
          const { PermissionsAndroid } = require('react-native');
          const ok = await PermissionsAndroid.request(
            PermissionsAndroid.PERMISSIONS.RECORD_AUDIO
          );
          if (ok !== PermissionsAndroid.RESULTS.GRANTED) {
            Alert.alert('Permission Required', 'Microphone permission is required.');
          }
        }
      };
      requestPermissions();
      const onSpeechStart = (e) => {
        console.log('Speech recognition started:', e);
      };
      const onSpeechEnd = (e) => {
        console.log('Speech recognition ended:', e);
        setIsListening(false);
      };
      const onSpeechResults = (e) => {
        console.log('Speech results event:', e);
        if (e.value?.length) {
          const text = e.value[0];
          setResult((prev) => [...prev, text]);
          processBillingCommand(text);
        }
      };
      const onSpeechError = (e) => {
        console.warn('Speech error:', e.error);
        Alert.alert('Speech Error', JSON.stringify(e.error));
        setIsListening(false);
      };
      Voice.onSpeechStart = onSpeechStart;
      Voice.onSpeechEnd = onSpeechEnd;
      Voice.onSpeechResults = onSpeechResults;
      Voice.onSpeechError = onSpeechError;
      return () => {
        Voice.destroy().then(() => Voice.removeAllListeners());
      };
    }
  }, [isListening]);

  // Use a persistent recognitionRef for the browser
  if (Platform.OS === 'web') {
    if (!window._persistentRecognition) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (SpeechRecognition) {
        const recognition = new SpeechRecognition();
        recognition.lang = 'hi-IN,en-IN';
        recognition.interimResults = false;
        recognition.maxAlternatives = 1;
        recognition.continuous = true;
        window._persistentRecognition = recognition;
      }
    }
  }

  // Update stopListening to set stopRequestedRef
  const stopListening = async () => {
    if (Platform.OS === 'web') {
      const recognition = window._persistentRecognition;
      if (recognition) {
        recognition.onend = () => {
          setIsListening(false);
          // Remove the onend handler after stop to avoid double-calling
          recognition.onend = null;
        };
        recognition.stop();
      }
    } else {
      try {
        console.log('Requesting to stop voice recognition...');
        await Voice.stop();
        setIsListening(false);
      } catch (e) {
        console.error('Error stopping Voice:', e);
        Alert.alert('Stop Error', JSON.stringify(e));
      }
    }
  };

  const startListening = async () => {
    if (isListening) return; // Prevent double start
    if (Platform.OS === 'web') {
      const recognition = recognitionRef.current;
      if (recognition) {
        try {
          recognition.start();
          setIsListening(true);
        } catch (e) {
          setIsListening(true);
        }
      } else {
        Alert.alert('Not Supported', 'Speech recognition is not supported in this browser.');
      }
    } else {
      try {
        console.log('Requesting to start voice recognition...');
        await Voice.start('en-IN');
        setIsListening(true);
      } catch (e) {
        console.error('Error starting Voice:', e);
        Alert.alert('Start Error', JSON.stringify(e));
      }
    }
  };

  // Helper to handle mode switch
  const handleModeSwitch = (newMode) => {
    if (isListening) {
      stopListening();
    }
    setMode(newMode);
    // Optionally clear the other list for clarity
    // setItems([]); setAmounts([]);
  };

  // Only process voice input in the current mode
  const processBillingCommand = (text) => {
    const parsed = parseItemsAndPrices(text);
    if (parsed[0]?.command === 'newBill') {
      setItems([]);
      return;
    }
    if (parsed[0]?.command === 'undo') {
      setItems((prev) => prev.slice(0, -1));
      return;
    }
    if (mode === 'list') {
      setItems((prev) => [...prev, ...parsed.filter(x => !x.command)]);
    }
  };

  const total = items.reduce((sum, item) => {
    // Extract number from price string
    const match = item.price.match(/\d+(\.\d+)?/);
    return sum + (match ? parseFloat(match[0]) : 0);
  }, 0);

  // WhatsApp sharing (for list mode)
  const shareBill = () => {
    let billText = 'Bill:\n';
    items.forEach(item => {
      billText += `${item.name || item.raw}  Qty: ${item.quantity || 1}  Price: ${item.price || ''}  Amt: ${item.price ? item.price : ''}\n`;
    });
    billText += `Total: ${total}`;
    const url = `https://wa.me/?text=${encodeURIComponent(billText)}`;
    window.open(url, '_blank');
  };

  // --- Web: Pause detection for auto-separating entries ---
  useEffect(() => {
    if (Platform.OS === 'web') {
      let pauseTimeout = null;
      if (recognitionRef.current) {
        recognitionRef.current.onresult = (event) => {
          let text = '';
          for (let i = event.resultIndex; i < event.results.length; ++i) {
            text = event.results[i][0].transcript;
            if (event.results[i].isFinal) {
              if (pauseTimeout) clearTimeout(pauseTimeout);
              processBillingCommand(text);
            } else {
              // If interim, wait for pause
              if (pauseTimeout) clearTimeout(pauseTimeout);
              pauseTimeout = setTimeout(() => {
                processBillingCommand(text);
              }, 1500); // 1.5s pause
            }
          }
        };
      }
      return () => { if (pauseTimeout) clearTimeout(pauseTimeout); };
    }
  }, [isListening]);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Voice Based Billing</Text>
      <View style={{ flexDirection: 'row', marginBottom: 10 }}>
        <Button
          title="List"
          onPress={() => handleModeSwitch('list')}
          color={'#117bff'}
          disabled={true}
        />
      </View>
      <Button
        title="Start"
        onPress={startListening}
        disabled={isListening} // Only disable if already listening
      />
      <Button
        title="Stop"
        onPress={stopListening}
        disabled={!isListening} // Only disable if not listening
        color="#d9534f"
      />
      <Button
        title="Clear Bill List"
        onPress={() => { setItems([]); }}
        color="#d9534f"
      />
      <Button
        title="Undo"
        onPress={() => setItems((prev) => prev.slice(0, -1))}
        color="#007bff"
      />
      <Button
        title="New Bill"
        onPress={() => setItems([])}
        color="#007bff"
      />
      <View style={styles.tableHeader}>
        <Text style={[styles.tableCellHeader, styles.snCell]}>S.No.</Text>
        <Text style={[styles.tableCellHeader, styles.itemCell]}>Item</Text>
        <Text style={[styles.tableCellHeader, styles.priceCell]}>Price</Text>
        <Text style={styles.tableCellHeader}></Text>
        <Text style={styles.tableCellHeader}></Text>
      </View>
      <FlatList
        data={items}
        keyExtractor={(_, i) => i.toString()}
        renderItem={({ item, index }) => (
          <View style={styles.tableRow}>
            <Text style={[styles.tableCell, styles.snCell]}>{index + 1}</Text>
            <Text style={[styles.tableCell, styles.itemCell]}>{item.item}</Text>
            {editIndex === index ? (
              <TextInput
                style={[styles.tableCell, styles.priceCell, { borderWidth: 1, borderColor: '#007bff', borderRadius: 4, padding: 2 }]}
                value={editPrice}
                onChangeText={setEditPrice}
                keyboardType="numeric"
                onBlur={() => setEditIndex(null)}
                onSubmitEditing={() => {
                  const newItems = [...items];
                  newItems[index].price = editPrice + ' rs';
                  setItems(newItems);
                  setEditIndex(null);
                }}
                autoFocus
              />
            ) : (
              <Text style={[styles.tableCell, styles.priceCell]}>{item.price}</Text>
            )}
            <TouchableOpacity
              onPress={() => {
                const newItems = items.filter((_, i) => i !== index);
                setItems(newItems);
              }}
              style={{ marginHorizontal: 4 }}
            >
              <Text style={{ color: '#d9534f', fontWeight: 'bold' }}>Delete</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => {
                          setEditIndex(index);
                          setEditPrice((item.price || '').replace(/[^\d.]/g, ''));
                        }}
              style={{ marginHorizontal: 4 }}
            >
              <Text style={{ color: '#007bff', fontWeight: 'bold' }}>Modify</Text>
            </TouchableOpacity>
          </View>
        )}
        style={{ width: '100%' }}
      />
      <View style={styles.tableFooter}>
        <Text style={[styles.tableCellHeader, styles.snCell]}>Total</Text>
        <Text style={[styles.tableCell, styles.itemCell]}></Text>
        <Text style={[styles.tableCellHeader, styles.priceCell]}>{total} rs</Text>
      </View>
      <Button title="Share Bill on WhatsApp" onPress={shareBill} color="#25D366" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  title: { fontSize: 20, fontWeight: 'bold', marginBottom: 20 },
  tableHeader: { flexDirection: 'row', width: '100%', borderBottomWidth: 2, borderColor: '#888', marginTop: 10, backgroundColor: '#f0f0f0' },
  tableFooter: { flexDirection: 'row', width: '100%', borderTopWidth: 2, borderColor: '#888', marginTop: 10, backgroundColor: '#f0f0f0' },
  tableRow: { flexDirection: 'row', width: '100%', borderBottomWidth: 1, borderColor: '#bbb', minHeight: 24, alignItems: 'center', paddingVertical: 0 },
  tableCellHeader: { textAlign: 'center', fontWeight: 'bold', fontSize: 14, paddingVertical: 4, paddingHorizontal: 2, borderRightWidth: 1, borderColor: '#bbb', backgroundColor: '#e6e6e6' },
  tableCell: { textAlign: 'center', fontSize: 13, paddingVertical: 4, paddingHorizontal: 2, borderRightWidth: 1, borderColor: '#bbb', backgroundColor: '#fff' },
  snCell: { width: 36, minWidth: 36, maxWidth: 36 },
  itemCell: { flex: 2 },
  priceCell: { flex: 1 },
});

