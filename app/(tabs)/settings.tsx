// import { StyleSheet, Text, View } from 'react-native';

// export default function SettingsScreen() {
//   return (
//     <View style={styles.container}>
//       <Text style={styles.title}>Settings Screen</Text>
//       <Text style={styles.subtitle}>You can configure your app settings here.</Text>
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


import { useColorScheme } from 'nativewind'; // optional for theme toggle
import React from 'react';
import { StyleSheet, Switch, Text, View } from 'react-native';

export default function SettingsScreen() {
  const { colorScheme, setColorScheme } = useColorScheme();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Settings</Text>
      <View style={styles.row}>
        <Text>Dark Mode</Text>
        <Switch
          value={colorScheme === 'dark'}
          onValueChange={() => setColorScheme(colorScheme === 'dark' ? 'light' : 'dark')}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  title: { fontSize: 20, fontWeight: 'bold', marginBottom: 20 },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }
});
