import { useState } from 'react';
import { Image, StyleSheet, Switch, Text, View } from 'react-native';

export default function SettingsScreen() {
  const [isDarkMode, setIsDarkMode] = useState(false);

  const toggleSwitch = () => setIsDarkMode(previousState => !previousState);

  return (
    <View style={[styles.container, { backgroundColor: isDarkMode ? '#000' : '#fff' }]}>
      {/* User Profile Section */}
      <View style={styles.profileContainer}>
        <Image
          source={{ uri: 'https://i.pravatar.cc/150?img=3' }} // Example Profile Pic
          style={styles.profileImage}
        />
        <View>
          <Text style={[styles.name, { color: isDarkMode ? '#fff' : '#000' }]}>John Doe</Text>
          <Text style={[styles.email, { color: isDarkMode ? '#ddd' : '#555' }]}>johndoe@example.com</Text>
        </View>
      </View>

      {/* Settings Title */}
      <Text style={[styles.title, { color: isDarkMode ? '#fff' : '#000' }]}>Settings</Text>

      {/* Dark Mode Toggle */}
      <View style={styles.row}>
        <Text style={{ color: isDarkMode ? '#fff' : '#000' }}>Dark Mode</Text>
        <Switch
          value={isDarkMode}
          onValueChange={toggleSwitch}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  title: { fontSize: 20, fontWeight: 'bold', marginVertical: 20 },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  profileContainer: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    marginBottom: 20 
  },
  profileImage: { 
    width: 60, 
    height: 60, 
    borderRadius: 30, 
    marginRight: 15 
  },
  name: { 
    fontSize: 18, 
    fontWeight: 'bold' 
  },
  email: { 
    fontSize: 14 
  }
});

