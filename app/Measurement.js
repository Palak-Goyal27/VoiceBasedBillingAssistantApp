import React, { useState } from 'react';
import { Keyboard, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

export default function Measurement() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Manual Ready Reckoner</Text>
      <ManualReckoner />
    </View>
  );
}

function ManualReckoner() {
  const [baseRate, setBaseRate] = useState('');
  const [mode, setMode] = useState('grams');
  const [inputValue, setInputValue] = useState('');
  const [result, setResult] = useState('');
  const presetGrams = [100, 250, 500];

  React.useEffect(() => {
    const rate = parseFloat(baseRate) || 0;
    const value = parseFloat(inputValue) || 0;
    if (rate <= 0 || value < 0) {
      setResult('');
      return;
    }
    if (mode === 'grams') {
      const price = ((value / 1000) * rate).toFixed(2);
      setResult(value ? `₹${price}` : '');
    } else {
      const grams = ((value / rate) * 1000).toFixed(0);
      setResult(value ? `${grams} g` : '');
    }
  }, [baseRate, inputValue, mode]);

  return (
    <>
      <View style={styles.row}>
        <Text style={styles.label}>Price per kg (₹):</Text>
        <TextInput
          style={styles.input}
          keyboardType="numeric"
          value={baseRate}
          onChangeText={setBaseRate}
          placeholder="e.g. 45"
        />
      </View>
      <View style={styles.toggleRow}>
        <TouchableOpacity
          style={[styles.toggleBtn, mode === 'grams' && styles.toggleBtnActive]}
          onPress={() => { setMode('grams'); setInputValue(''); Keyboard.dismiss(); }}
        >
          <Text style={mode === 'grams' ? styles.toggleTextActive : styles.toggleText}>Grams → Price</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.toggleBtn, mode === 'rupees' && styles.toggleBtnActive]}
          onPress={() => { setMode('rupees'); setInputValue(''); Keyboard.dismiss(); }}
        >
          <Text style={mode === 'rupees' ? styles.toggleTextActive : styles.toggleText}>₹ Amount → Grams</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.row}>
        <Text style={styles.label}>
          {mode === 'grams' ? 'Enter grams:' : 'Enter ₹ amount:'}
        </Text>
        <TextInput
          style={styles.input}
          keyboardType="numeric"
          value={inputValue}
          onChangeText={setInputValue}
          placeholder={mode === 'grams' ? 'e.g. 250' : 'e.g. 10'}
        />
      </View>
      {mode === 'grams' && (
        <View style={styles.presetRow}>
          {presetGrams.map(g => (
            <TouchableOpacity
              key={g}
              style={styles.presetBtn}
              onPress={() => setInputValue(String(g))}
            >
              <Text style={styles.presetText}>{g}g</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}
      <View style={styles.resultBox}>
        <Text style={styles.resultLabel}>
          {mode === 'grams' ? 'Price:' : 'Quantity:'}
        </Text>
        <Text style={styles.resultValue}>{result}</Text>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#fff' },
  title: { fontSize: 22, fontWeight: 'bold', marginBottom: 20, textAlign: 'center' },
  input: { flex: 1, borderWidth: 1, borderColor: '#ccc', borderRadius: 5, padding: 10, marginRight: 10 },
  row: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  label: { fontSize: 16, width: 140 },
  toggleRow: { flexDirection: 'row', justifyContent: 'center', marginBottom: 16 },
  toggleBtn: { flex: 1, padding: 10, borderWidth: 1, borderColor: '#007bff', borderRadius: 5, marginHorizontal: 5, backgroundColor: '#f8f9fa' },
  toggleBtnActive: { backgroundColor: '#007bff' },
  toggleText: { textAlign: 'center', color: '#007bff', fontWeight: 'bold' },
  toggleTextActive: { textAlign: 'center', color: '#fff', fontWeight: 'bold' },
  presetRow: { flexDirection: 'row', justifyContent: 'center', marginBottom: 16 },
  presetBtn: { backgroundColor: '#eee', borderRadius: 5, paddingVertical: 8, paddingHorizontal: 16, marginHorizontal: 5 },
  presetText: { fontSize: 16, color: '#333' },
  resultBox: { alignItems: 'center', marginVertical: 24 },
  resultLabel: { fontSize: 18, color: '#555' },
  resultValue: { fontSize: 28, fontWeight: 'bold', color: '#007bff', marginTop: 8 },
});