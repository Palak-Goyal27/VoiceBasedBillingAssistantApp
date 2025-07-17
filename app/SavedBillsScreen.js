
import AsyncStorage from '@react-native-async-storage/async-storage';

import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Button, FlatList, Text, TextInput, TouchableOpacity, View } from 'react-native';


function naturalSort(a, b) {
  return a.name.localeCompare(b.name, undefined, { numeric: true, sensitivity: 'base' });
}

export default function SavedBillsScreen({ navigation, route }) {
  const [savedLists, setSavedLists] = useState([]);
  const [draft, setDraft] = useState(null);
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
    const loadDraft = async () => {
      try {
        const data = await AsyncStorage.getItem('draft_bills');
        if (data) {
          const parsed = JSON.parse(data);
          if (parsed && typeof parsed === 'object') {
            setDraft(parsed);
          } else {
            setDraft(null);
          }
        } else {
          setDraft(null);
        }
      } catch (e) {
        setDraft(null);
      }
    };
    loadSavedLists();
    loadDraft();
    if (navigation && typeof navigation.addListener === 'function') {
      const unsubscribeSaved = navigation.addListener('focus', loadSavedLists);
      const unsubscribeDraft = navigation.addListener('focus', loadDraft);
      return () => {
        unsubscribeSaved();
        unsubscribeDraft();
      };
    }
    if (router && typeof router.events?.addListener === 'function') {
      const unsubscribeSaved = router.events.addListener('routeChangeComplete', loadSavedLists);
      const unsubscribeDraft = router.events.addListener('routeChangeComplete', loadDraft);
      return () => {
        unsubscribeSaved();
        unsubscribeDraft();
      };
    }
    return undefined;
  }, [navigation, router]);

  const deleteSavedList = async (index) => {
    let allLists = [...savedLists];
    allLists.splice(index, 1);
    await AsyncStorage.setItem('saved_bills', JSON.stringify(allLists));
    setSavedLists(allLists);
  };

  const deleteDraft = async () => {
    await AsyncStorage.removeItem('draft_bills');
    setDraft(null);
  };

  // Navigation helper
  const goToBilling = (item, index, source) => {
    if (navigation && typeof navigation.navigate === 'function') {
      navigation.navigate('Billing', { selectedBill: item, selectedBillIndex: index, source });
    } else if (router && typeof router.push === 'function') {
      router.push({
        pathname: '/billing',
        params: { selectedBill: JSON.stringify(item), selectedBillIndex: index, source }
      });
    } else {
      if (typeof window !== 'undefined') {
        window.location.href = '/billing';
      }
    }
  };

  // Filter and sort bills
  const filteredSortedSavedLists = savedLists
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
      {filteredSortedSavedLists.length === 0 && <Text>No saved bills.</Text>}
      <FlatList
        data={filteredSortedSavedLists}
        keyExtractor={(_, i) => i.toString()}
        renderItem={({ item, index }) => (
          <View style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 8 }}>
            {/* S.No. */}
            <Text style={{ width: 32, textAlign: 'center', fontWeight: 'bold' }}>{index + 1}.</Text>
            <TouchableOpacity
              style={{ flex: 1 }}
              onPress={() => goToBilling(item, savedLists.findIndex(b => b === item), 'saved')}
            >
              <Text>{item.name} ({new Date(item.date).toLocaleString()})</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => deleteSavedList(savedLists.findIndex(b => b === item))}>
              <Text style={{ color: 'red', marginLeft: 10 }}>Delete</Text>
            </TouchableOpacity>
          </View>
        )}
      />
      <Text style={{ fontWeight: 'bold', fontSize: 20, marginVertical: 16 }}>Draft Bill</Text>
      {!draft && <Text>No draft bill.</Text>}
      {draft && (
        <View style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 8 }}>
          <Text style={{ width: 32, textAlign: 'center', fontWeight: 'bold' }}>1.</Text>
          <TouchableOpacity
            style={{ flex: 1 }}
            onPress={() => goToBilling(draft, null, 'draft')}
          >
            <Text>Draft ({new Date(draft.date).toLocaleString()})</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={deleteDraft}>
            <Text style={{ color: 'red', marginLeft: 10 }}>Delete</Text>
          </TouchableOpacity>
        </View>
      )}
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
