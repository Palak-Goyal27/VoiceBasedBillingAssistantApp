import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Button, FlatList, Text, TextInput, TouchableOpacity, View } from 'react-native';

// Natural sort function (numbers before letters, case-insensitive)
function naturalSort(a, b) {
  return a.name.localeCompare(b.name, undefined, { numeric: true, sensitivity: 'base' });
}

export default function SavedBillsScreen({ navigation, route }) {
  const [savedLists, setSavedLists] = useState([]);
  const [search, setSearch] = useState('');
  const router = useRouter();

  useEffect(() => {
    const loadSavedLists = async () => {
      try {
        const data = await AsyncStorage.getItem('saved_bills');
        if (data) setSavedLists(JSON.parse(data));
        else setSavedLists([]);
      } catch (e) {
        setSavedLists([]);
      }
    };
    loadSavedLists();
    if (navigation && typeof navigation.addListener === 'function') {
      const unsubscribe = navigation.addListener('focus', loadSavedLists);
      return unsubscribe;
    }
    // For web: listen to router change
    if (router && typeof router.events?.addListener === 'function') {
      const unsubscribe = router.events.addListener('routeChangeComplete', loadSavedLists);
      return () => unsubscribe();
    }
    return undefined;
  }, [navigation, router]);

  const deleteSavedList = async (index) => {
    let allLists = [...savedLists];
    allLists.splice(index, 1);
    await AsyncStorage.setItem('saved_bills', JSON.stringify(allLists));
    setSavedLists(allLists);
  };

  // Navigation helper
  const goToBilling = (item, index) => {
    if (navigation && typeof navigation.navigate === 'function') {
      navigation.navigate('Billing', { selectedBill: item, selectedBillIndex: index });
    } else if (router && typeof router.push === 'function') {
      router.push({
        pathname: '/billing',
        params: { selectedBill: JSON.stringify(item), selectedBillIndex: index }
      });
    } else {
      if (typeof window !== 'undefined') {
        window.location.href = '/billing';
      }
    }
  };

  // Filter and sort bills
  const filteredSortedLists = savedLists
    .filter(bill =>
      bill.name &&
      bill.name.toLowerCase().includes(search.toLowerCase())
    )
    .sort(naturalSort);

  return (
    <View style={{ flex: 1, padding: 20 }}>
      <Text style={{ fontWeight: 'bold', fontSize: 20, marginBottom: 16 }}>Saved Bills</Text>
      {/* Search box */}
      <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
        <Text style={{ fontWeight: 'bold', marginRight: 8 }}>Search:</Text>
        <TextInput
          style={{
            borderWidth: 1,
            borderColor: '#aaa',
            borderRadius: 6,
            paddingHorizontal: 10,
            paddingVertical: 4,
            flex: 1,
            minWidth: 120,
          }}
          placeholder="Type bill name..."
          value={search}
          onChangeText={setSearch}
        />
      </View>
      {filteredSortedLists.length === 0 && <Text>No saved bills.</Text>}
      <FlatList
        data={filteredSortedLists}
        keyExtractor={(_, i) => i.toString()}
        renderItem={({ item, index }) => (
          <View style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 8 }}>
            {/* S.No. */}
            <Text style={{ width: 32, textAlign: 'center', fontWeight: 'bold' }}>{index + 1}.</Text>
            <TouchableOpacity
              style={{ flex: 1 }}
              onPress={() => goToBilling(item, savedLists.findIndex(b => b === item))}
            >
              <Text>{item.name} ({new Date(item.date).toLocaleString()})</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => deleteSavedList(savedLists.findIndex(b => b === item))}>
              <Text style={{ color: 'red', marginLeft: 10 }}>Delete</Text>
            </TouchableOpacity>
          </View>
        )}
      />
      <Button
        title="Back to Billing"
        onPress={() => {
          if (navigation && typeof navigation.goBack === 'function') {
            navigation.goBack();
          } else if (router && typeof router.back === 'function') {
            router.back();
          } else if (typeof window !== 'undefined') {
            window.history.back();
          }
        }}
      />
    </View>
  );
}