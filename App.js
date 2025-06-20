import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useState } from 'react';
import BillingScreen from './app/billing';
import CreateListScreen from './app/CreateListScreen';
import LandingScreen from './app/LandingScreen';
import SettingsScreen from './app/SettingsScreen';

const Stack = createNativeStackNavigator();

export default function App() {
  const [screen, setScreen] = useState('Landing');

  if (screen === 'Billing') return <BillingScreen />;
  if (screen === 'CreateList') return <CreateListScreen />;
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Landing" screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Landing">
          {(props) => <LandingScreen {...props} onStartBilling={() => setScreen('Billing')} onCreateList={() => setScreen('CreateList')} />}
        </Stack.Screen>
        <Stack.Screen name="Billing" component={BillingScreen} />
        <Stack.Screen name="Settings" component={SettingsScreen} />
        <Stack.Screen name="CreateList" component={CreateListScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
