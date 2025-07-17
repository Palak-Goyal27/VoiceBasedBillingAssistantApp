import AsyncStorage from '@react-native-async-storage/async-storage';
import { useLocalSearchParams, useRouter } from 'expo-router'; // Add this at top
import { useEffect, useRef, useState } from 'react';
import { Alert, Button, FlatList, Platform, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

let Voice;
if (Platform.OS !== 'web') {
  Voice = require('@react-native-voice/voice').default;
}

// --- Robust parsing: last number as price, rest as item, Hindi/English/₹, supports web/mobile ---
function parseItemsAndPrices(text) {
  // Expanded Hindi price words mapping with more variants
  const specialHindiNumbers = {
    'डाइशो': 250, 'डाईशो': 250, 'ढाई सौ': 250, 'ढाईसो': 250, 'ढाई सो': 250, 'ढईसो': 250, 'ढई सो': 250, 'ढई सौ': 250,
    'dhaiso': 250, 'dhaiso rupee': 250, 'dhai sau': 250, 'dhai so': 250, 'dhaai sau': 250, 'dhaai so': 250, 'dhaai': 250,
    'डेढ़ सौ': 150, 'डेड़ सौ': 150, 'डेढ़ सो': 150, 'डेड़ सो': 150, 'डेढ सौ': 150, 'डेढ सो': 150,
    'darso': 150, 'darso rupee': 150, 'dedh sau': 150, 'dedh so': 150, 'derh sau': 150, 'derh so': 150, 'dedh': 150,
    'dairso': 150, 'dairso rupee': 150, 'dair sau': 150, 'dair so': 150, 'dair': 150,
  };

  // Fuzzy match for Hindi price words (returns the best match if within threshold)
  function fuzzyMatchHindiWord(line) {
    const threshold = 2; // Allow up to 2 character differences
    let best = null, bestDist = 99;
    for (let word in specialHindiNumbers) {
      if (line.includes(word)) return word; // exact match
      // Fuzzy: check each word in line
      for (let token of line.split(/\s+/)) {
        let dist = levenshtein(token.toLowerCase(), word.toLowerCase());
        if (dist < bestDist && dist <= threshold) {
          best = word;
          bestDist = dist;
        }
      }
    }
    return best;
  }

  // Levenshtein distance for fuzzy matching
  function levenshtein(a, b) {
    const dp = Array(a.length + 1).fill().map(() => Array(b.length + 1).fill(0));
    for (let i = 0; i <= a.length; i++) dp[i][0] = i;
    for (let j = 0; j <= b.length; j++) dp[0][j] = j;
    for (let i = 1; i <= a.length; i++) {
      for (let j = 1; j <= b.length; j++) {
        if (a[i - 1] === b[j - 1]) dp[i][j] = dp[i - 1][j - 1];
        else dp[i][j] = 1 + Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1]);
      }
    }
    return dp[a.length][b.length];
  }

  function hindiWordToNumber(word) {
    word = word.trim();
    if (specialHindiNumbers[word]) return specialHindiNumbers[word];
    const hindiDigits = '०१२३४५६७८९';
    if ([...word].every(ch => hindiDigits.includes(ch))) {
      return Number([...word].map(ch => hindiDigits.indexOf(ch)).join(''));
    }
    return null;
  }

  // Clean and split input into lines, remove empty lines
  let lines = text.split(/\n/).map(l => l.trim()).filter(Boolean);

  // Merge price-only lines with the previous item line, but only if previous line doesn't already have a price
  let merged = [];
  for (let i = 0; i < lines.length; ++i) {
    let line = lines[i];
    const isPriceOnly =
      /^₹?\d+(\.\d+)?\s*(rupees|rs|rupaye|रुपये|रुपया|रुपय|₹)?$/i.test(line) ||
      Object.keys(specialHindiNumbers).some(w => line === w);

    if (isPriceOnly) {
      if (
        merged.length > 0 &&
        !(
          /(\d{1,6}(?:\.\d+)?\s*(rupees|rs|rupaye|रुपये|रुपया|रुपय|₹)?$)/i.test(merged[merged.length - 1]) ||
          Object.keys(specialHindiNumbers).some(w => merged[merged.length - 1].includes(w))
        )
      ) {
        merged[merged.length - 1] += ' ' + line;
      } else {
        merged.push(line);
      }
    } else {
      merged.push(line);
    }
  }

  merged = merged.filter((l, i, arr) => l && arr.indexOf(l) === i);

  const results = [];
  for (let line of merged) {
    let price = '';
    let item = '';
    let found = false;

    // Tokenize line
    let tokens = line.split(/\s+/).filter(Boolean);

    // Find all numbers and Hindi price words in tokens
    let priceIdx = -1, priceValue = null, priceToken = null;
    let quantityIdx = -1, quantityValue = null, quantityToken = null;

    // 1. Find last price (number or Hindi price word) for price
    for (let i = tokens.length - 1; i >= 0; --i) {
      let t = tokens[i];
      // Check for Hindi price word (exact or fuzzy)
      let matchedWord = specialHindiNumbers[t];
      if (!matchedWord) {
        let fuzzy = fuzzyMatchHindiWord(t);
        if (fuzzy) matchedWord = specialHindiNumbers[fuzzy];
      }
      if (matchedWord) {
        priceIdx = i;
        priceValue = matchedWord;
        priceToken = tokens[i];
        break;
      }
      // Check for Hindi digits
      if (/^[०१२३४५६७८९]+$/.test(t)) {
        priceIdx = i;
        priceValue = hindiWordToNumber(t);
        priceToken = tokens[i];
        break;
      }
      // Check for number (possibly with ₹ or currency)
      let numMatch = t.replace(/₹|rs|rupees|rupaye|रुपये|रुपया|रुपय/gi, '');
      if (/^\d+(\.\d+)?$/.test(numMatch)) {
        priceIdx = i;
        priceValue = Number(numMatch);
        priceToken = tokens[i];
        break;
      }
    }

    // 2. Find first number (if before any non-number token) for quantity
    for (let i = 0; i < tokens.length; ++i) {
      let t = tokens[i];
      // Only consider as quantity if it's before any non-number token (i.e., at the start)
      if (i === 0) {
        // Hindi digits
        if (/^[०१२३४५६७८९]+$/.test(t)) {
          quantityIdx = i;
          quantityValue = hindiWordToNumber(t);
          quantityToken = tokens[i];
          break;
        }
        // Number
        let numMatch = t.replace(/₹|rs|rupees|rupaye|रुपये|रुपया|रुपय/gi, '');
        if (/^\d+(\.\d+)?$/.test(numMatch)) {
          quantityIdx = i;
          quantityValue = Number(numMatch);
          quantityToken = tokens[i];
          break;
        }
      }
    }

    // 3. Build item name
    let itemTokens = [];
    if (quantityIdx === 0 && priceIdx > 0 && priceIdx !== 0) {
      // Quantity at start, price at end, item is everything in between
      itemTokens = tokens.slice(0, priceIdx);
    } else if (priceIdx >= 0) {
      // No quantity, price at end, item is everything before price
      itemTokens = tokens.slice(0, priceIdx);
    } else {
      // No price, item is whole line
      itemTokens = tokens;
    }

    // If quantity at start, include it in item name
    if (quantityIdx === 0) {
      // Already included in itemTokens above
    }

    // Remove currency words from itemTokens
    item = itemTokens
      .filter(
        t =>
          !/^₹$|^rs$|^rupees$|^rupaye$|^रुपये$|^रुपया$|^रुपय$/i.test(t) &&
          !Object.keys(specialHindiNumbers).includes(t)
      )
      .join(' ')
      .trim();

    // If quantity at start, ensure it's included in item
    if (quantityIdx === 0 && item && !item.startsWith(tokens[0])) {
      item = tokens[0] + ' ' + item;
    }

    // Set price
    if (priceIdx >= 0 && priceValue !== null) {
      price = '₹' + priceValue;
      found = true;
    } else {
      price = '₹0';
    }

    // If line is just a price, skip
    if (
      item === '' &&
      (priceIdx === 0 || priceIdx === tokens.length - 1) &&
      (priceValue !== null)
    ) {
      continue;
    }

    // Clean up item
    item = item.replace(/₹|रुपये|रुपया|rs|rupees|rupaye/gi, '').trim();

    if (item || price) results.push({ item, price });
  }
  return results;
}

export default function BillingScreen({ navigation, route, autoStart, goHome }) {
  const [isListening, setIsListening] = useState(false);
  const [items, setItems] = useState([]); // For list mode
  const [mode] = useState('list'); // 'list' or 'amount'
  const [editIndex, setEditIndex] = useState(null);
  const [editPrice, setEditPrice] = useState('');
  const [savedLists, setSavedLists] = useState([]);
  const [showSavedLists, setShowSavedLists] = useState(false);
  const [selectedBillIndex, setSelectedBillIndex] = useState(null);
  const recognitionRef = useRef(null);
  const router = useRouter();
  const webParams = useLocalSearchParams ? useLocalSearchParams() : {};

  // Load saved lists on mount
  useEffect(() => {
    loadSavedLists();
  }, []);

  // When loading a saved bill or draft, also set its index and source
  useEffect(() => {
    let selected = route?.params?.selectedBill || webParams.selectedBill;
    let index = route?.params?.selectedBillIndex || webParams.selectedBillIndex;
    let source = route?.params?.source || webParams.source; // 'saved' or 'draft'
    if (selected) {
      if (typeof selected === 'string') {
        try { selected = JSON.parse(selected); } catch (e) { selected = null; }
      }
      if (selected && selected.items) {
        setItems(selected.items);
        if (source === 'saved') {
          setSelectedBillIndex(index !== undefined ? Number(index) : null);
        } else {
          setSelectedBillIndex(null);
        }
      }
      if (navigation && typeof navigation.setParams === 'function') {
        navigation.setParams({ selectedBill: undefined, selectedBillIndex: undefined, source: undefined });
      }
    }
  }, [route?.params?.selectedBill, webParams.selectedBill]);



  // Drafts state
  // Removed drafts state and related UI as per user request

  // Load drafts from AsyncStorage
  // Removed loadDrafts function as no UI for drafts here


  // Save draft to AsyncStorage
  const saveDraft = async (draft) => {
    try {
      console.log('Saving draft:', draft);
      // Save single draft object, not array
      await AsyncStorage.setItem('draft_bills', JSON.stringify(draft));
    } catch (e) {
      console.error('Error saving draft:', e);
    }
  };

  // Remove draft from AsyncStorage
  const removeDraft = async () => {
    try {
      await AsyncStorage.removeItem('draft_bills');
    } catch (e) {
      console.error('Error removing draft:', e);
    }
  };


  // Remove autosave draft on items change to avoid multiple drafts
  // Draft will be saved only on Clear Bill List and New Bill button clicks



  // Save Bill (always creates new)
  const saveCurrentList = async () => {
    if (items.length === 0) {
      Alert.alert('Nothing to save', 'Your bill is empty.');
      return;
    }
    let name = prompt('Enter a name for this bill:');
    if (!name) return;
    const newList = { name, items, date: new Date().toISOString() };
    let allLists = [];
    try {
      const data = await AsyncStorage.getItem('saved_bills');
      if (data) allLists = JSON.parse(data);
      allLists.push(newList);
      await AsyncStorage.setItem('saved_bills', JSON.stringify(allLists));
      setSavedLists(allLists);
      setSelectedBillIndex(null); // reset after save
      Alert.alert('Saved!', 'Your bill has been saved.');
      // Remove draft since this is a permanent save
      await removeDraft();
    } catch (e) {
      Alert.alert('Error', 'Could not save the bill.');
    }
  };


  // Update Bill (only if editing an existing bill)
  const updateCurrentBill = async () => {
    if (selectedBillIndex === null || selectedBillIndex === undefined) return;
    let allLists = [];
    try {
      const data = await AsyncStorage.getItem('saved_bills');
      if (data) allLists = JSON.parse(data);
      allLists[selectedBillIndex] = {
        ...allLists[selectedBillIndex],
        items,
        date: new Date().toISOString(),
      };
      await AsyncStorage.setItem('saved_bills', JSON.stringify(allLists));
      setSavedLists(allLists);
      Alert.alert('Updated!', 'Your bill has been updated.');
      // Remove draft since this is a permanent update
      await removeDraft();
    } catch (e) {
      Alert.alert('Error', 'Could not update the bill.');
    }
  };

  // Load all saved lists
  const loadSavedLists = async () => {
    try {
      const data = await AsyncStorage.getItem('saved_bills');
      if (data) setSavedLists(JSON.parse(data));
      else setSavedLists([]);
    } catch (e) {
      setSavedLists([]);
    }
  };

  // Delete a saved list
  const deleteSavedList = async (index) => {
    let allLists = [...savedLists];
    allLists.splice(index, 1);
    await AsyncStorage.setItem('saved_bills', JSON.stringify(allLists));
    setSavedLists(allLists);
  };

  useEffect(() => {
    if (Platform.OS === 'web' && !recognitionRef.current) {
      if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        const recognition = new SpeechRecognition();
        recognition.lang = 'hi-IN,en-IN';
        recognition.interimResults = false;
        recognition.maxAlternatives = 1;
        recognition.continuous = true;
        recognitionRef.current = recognition;
      }
    }
  }, []);

  // Native setup
  useEffect(() => {
    if (Platform.OS !== 'web') {
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
    }
  }, []);

  // Update stopListening to set stopRequestedRef
  const stopListening = async () => {
    if (Platform.OS === 'web') {
      const recognition = recognitionRef.current;
      if (recognition) {
        recognition.onend = () => {
          setIsListening(false);
          recognition.onend = null;
        };
        recognition.stop();
      }
    } else {
      try {
        await Voice.stop();
        setIsListening(false);
      } catch (e) {
        console.error('Error stopping Voice:', e);
        Alert.alert('Stop Error', JSON.stringify(e));
      }
    }
  };

  const startListening = async () => {
    if (isListening) return;
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
      billText += `${item.item}  Price: ${item.price || ''}\n`;
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
              }, 200); // 0.2s pause
            }
          }
        };
      }
      return () => { if (pauseTimeout) clearTimeout(pauseTimeout); };
    }
  }, [isListening]);

  // Web recognition handler
  useEffect(() => {
    if (Platform.OS === 'web' && recognitionRef.current) {
      const recognition = recognitionRef.current;
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
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
      };
      recognition.onend = () => {
        setIsListening(false);
      };
    }
  }, [isListening]);

  useEffect(() => {
    if (autoStart && !isListening) {
      startListening();
    }
    // Only run on mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <View style={styles.container}>
      <Button title="Back to Home" onPress={goHome} color="#888" />
      <Text style={styles.title}>Voice Based Billing</Text>
      <View style={{ flexDirection: 'row', marginBottom: 10 }}>
        <Button
          title="List"
          onPress={() => {}}
          color={'#117bff'}
          disabled={true}
        />
      </View>
      {/* Start and Stop buttons side by side */}
      <View style={{ flexDirection: 'row', marginBottom: 10, gap: 10 }}>
        <Button
          title="Start"
          onPress={startListening}
          disabled={isListening}
        />
        <Button
          title="Stop"
          onPress={stopListening}
          disabled={!isListening}
          color="#d9534f"
        />
      </View>
      <Button
        title="Clear Bill List"
        onPress={async () => {
          if (items.length > 0) {
            const draft = { items, date: new Date().toISOString() };
            await saveDraft(draft);
          }
          setItems([]);
        }}
        color="#d9534f"
      />
      <Button
        title="Undo"
        onPress={() => setItems((prev) => prev.slice(0, -1))}
        color="#007bff"
      />
      <Button
        title="New Bill"
        onPress={async () => {
          if (items.length > 0) {
            const itemsCopy = [...items];
            const draft = { items: itemsCopy, date: new Date().toISOString() };
            await saveDraft(draft);
          }
          setItems([]);
        }}
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

      {/* Save/Update buttons fixed at bottom right */}
      <View style={{
        position: 'absolute',
        bottom: 24,
        right: 24,
        alignItems: 'flex-end',
        zIndex: 10,
      }}>
        {/* Show Update Bill only if editing a saved bill */}
        {selectedBillIndex !== null && selectedBillIndex !== undefined && (
          <Button
            title="Update Bill"
            onPress={updateCurrentBill}
            color="#007bff"
          />
        )}
        <View style={{ height: 10 }} />
        <Button
          title="Save Bill"
          onPress={saveCurrentList}
          color="#28a745"
        />
      </View>

      {/* Saved Lists Modal/Section */}
      {showSavedLists && (
        <View style={{
          position: 'absolute',
          bottom: 90,
          right: 24,
          width: 260,
          backgroundColor: '#f9f9f9',
          padding: 10,
          borderRadius: 8,
          shadowColor: '#000',
          shadowOpacity: 0.1,
          shadowRadius: 8,
          elevation: 4,
        }}>
          <Text style={{ fontWeight: 'bold', marginBottom: 8 }}>Saved Bills:</Text>
          {savedLists.length === 0 && <Text>No saved bills.</Text>}
          <FlatList
            data={savedLists}
            keyExtractor={(_, i) => i.toString()}
            renderItem={({ item, index }) => (
              <View style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 6 }}>
                <TouchableOpacity
                  style={{ flex: 1 }}
                  onPress={() => {
                    setItems(item.items);
                    setShowSavedLists(false);
                  }}
                >
                  <Text>{item.name} ({new Date(item.date).toLocaleString()})</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => deleteSavedList(index)}>
                  <Text style={{ color: 'red', marginLeft: 10 }}>Delete</Text>
                </TouchableOpacity>
              </View>
            )}
          />
          <Button title="Close" onPress={() => setShowSavedLists(false)} />
        </View>
      )}
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
