import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createDrawerNavigator } from '@react-navigation/drawer';
import DobrodoslicaScreen from './src/screens/DobrodoslicaScreen';
import LoginScreen from './src/screens/LoginScreen';
import MeniScreen from './src/screens/MeniScreen';
import PopisScreen from './src/screens/PopisScreen';
import ZaliheScreen from './src/screens/ZaliheScreen';
import MagacinSelectScreen from './src/screens/MagacinSelectScreen';

const Drawer = createDrawerNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Drawer.Navigator initialRouteName="Dobrodošlica">
        <Drawer.Screen name="Dobrodošlica" component={DobrodoslicaScreen} />
        <Drawer.Screen name="Login" component={LoginScreen} />
        <Drawer.Screen name="Meni" component={MeniScreen} />
         <Drawer.Screen name="MagacinSelect" component={MagacinSelectScreen} />
        <Drawer.Screen name="Popis" component={PopisScreen} />
        <Drawer.Screen name="Zalihe i Cijene" component={ZaliheScreen} />
      </Drawer.Navigator>
    </NavigationContainer>
  );
}
