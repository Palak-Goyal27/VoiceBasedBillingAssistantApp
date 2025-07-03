
import * as React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import BillingScreen from './app/billing';
import SavedBillsScreen from './app/SavedBillsScreen';

const Stack = createStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Billing">
        <Stack.Screen name="Billing" component={BillingScreen} />
        <Stack.Screen name="SavedBills" component={SavedBillsScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
