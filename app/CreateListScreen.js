import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect, useRef, useState } from 'react';
import { Alert, Button, FlatList, Platform, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

let Voice;
if (Platform.OS !== 'web') {
  Voice = require('@react-native-voice/voice').default;
}

export default function CreateListScreen({ onBackHome }) {
  const [input, setInput] = useState('');
  const [list, setList] = useState([]);
  const [isListening, setIsListening] = useState(false);
  const [lang, setLang] = useState('en-IN'); // ya 'hi-IN'
  const recognitionRef = useRef(null);

  // Load list from AsyncStorage on mount
  useEffect(() => {
    AsyncStorage.getItem('my_list').then(data => {
      if (data) setList(JSON.parse(data));
    });
  }, []);

  // Save list to AsyncStorage whenever it changes
  useEffect(() => {
    AsyncStorage.setItem('my_list', JSON.stringify(list));
  }, [list]);

  // Voice input logic
  const startListening = () => {
    setIsListening(true);
    if (Platform.OS === 'web') {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (!SpeechRecognition) {
        Alert.alert('Not supported', 'Speech recognition is not supported in this browser.');
        setIsListening(false);
        return;
      }
      const recognition = new SpeechRecognition();
      recognition.lang = lang; // use selected language
      recognition.onresult = (event) => {
        const text = event.results[0][0].transcript;
        setInput(text);
        setIsListening(false);
      };
      recognition.onerror = () => setIsListening(false);
      recognitionRef.current = recognition;
      recognition.start();
    } else {
      Voice.onSpeechResults = (e) => {
        if (e.value && e.value.length > 0) setInput(e.value[0]);
        setIsListening(false);
      };
      Voice.onSpeechError = () => setIsListening(false);
      Voice.start(lang); // use selected language
    }
  };

  const stopListening = () => {
    setIsListening(false);
    if (Platform.OS === 'web') {
      recognitionRef.current && recognitionRef.current.stop();
    } else {
      Voice.stop();
    }
  };

  const addItem = () => {
    if (input.trim()) {
      setList([...list, input.trim()]);
      setInput('');
    }
  };

  const deleteItem = (index) => {
    setList(list.filter((_, i) => i !== index));
  };

  const clearList = () => setList([]);

  const editItem = (index, newValue) => {
    const updated = [...list];
    updated[index] = newValue;
    setList(updated);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Create Your List</Text>
      <View style={styles.inputRow}>
        <TextInput
          style={styles.input}
          placeholder="Add item"
          value={input}
          onChangeText={setInput}
        />
        <Button title="Add" onPress={addItem} />
        <Button title={isListening ? "Stop" : "🎤"} onPress={isListening ? stopListening : startListening} />
      </View>
      <View style={{ flexDirection: 'row', marginBottom: 10 }}>
        <Button title="English" onPress={() => setLang('en-IN')} color={lang === 'en-IN' ? '#007bff' : '#ccc'} />
        <View style={{ width: 10 }} />
        <Button title="हिंदी" onPress={() => setLang('hi-IN')} color={lang === 'hi-IN' ? '#007bff' : '#ccc'} />
      </View>
      <FlatList
        data={list}
        keyExtractor={(_, i) => i.toString()}
        renderItem={({ item, index }) => (
          <View style={styles.listItem}>
            <TextInput
              style={styles.listInput}
              value={item}
              onChangeText={text => editItem(index, text)}
            />
            <TouchableOpacity onPress={() => deleteItem(index)}>
              <Text style={{ color: 'red', marginLeft: 10 }}>Delete</Text>
            </TouchableOpacity>
          </View>
        )}
        ListEmptyComponent={<Text style={{ color: '#888', marginTop: 20 }}>No items yet.</Text>}
      />
      {list.length > 0 && (
        <Button title="Clear List" onPress={clearList} color="#d9534f" />
      )}
      <View style={{ height: 20 }} />
      <Button title="Back to Home" onPress={onBackHome} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#fff' },
  title: { fontSize: 22, fontWeight: 'bold', marginBottom: 20, textAlign: 'center' },
  inputRow: { flexDirection: 'row', marginBottom: 20, alignItems: 'center' },
  input: { flex: 1, borderWidth: 1, borderColor: '#ccc', borderRadius: 5, padding: 10, marginRight: 10 },
  listItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 8, borderBottomWidth: 1, borderColor: '#eee' },
  listInput: { flex: 1, borderWidth: 0, fontSize: 16, padding: 0 },
});