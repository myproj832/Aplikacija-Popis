// App.js
import React, { useState } from 'react';
import { View, StatusBar } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createDrawerNavigator } from '@react-navigation/drawer';

// Komponente
import Preloader from './src/screens/Preloader'; // <- tvoj splash ekran

// 📦 Svi tvoji ekrani
import LoginScreen from './src/screens/LoginScreen';
import MeniScreen from './src/screens/MeniScreen';
import MagacinSelectScreen from './src/screens/MagacinSelectScreen';
import ZaliheScreen from './src/screens/ZaliheScreen';
import PopisScreen from './src/screens/PopisScreen';
import ArtikalDetaljiScreen from './src/screens/ArtikalDetaljiScreen';
import OstaliMarketiScreen from './src/screens/OstaliMarketiScreen';

const Drawer = createDrawerNavigator();

export default function App() {
  const [loading, setLoading] = useState(true);

  if (loading) {
    return (
      <View style={{ flex: 1 }}>
        <StatusBar barStyle="dark-content" backgroundColor="#fff" />
        <Preloader onFinish={() => setLoading(false)} />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      <Drawer.Navigator
        initialRouteName="Login"
        screenOptions={{
          headerShown: false,
        }}
      >
        <Drawer.Screen name="Login" component={LoginScreen} options={{ title: 'Prijava' }} />
        <Drawer.Screen name="Meni" component={MeniScreen} options={{ title: 'Meni' }} />
        <Drawer.Screen name="MagacinSelect" component={MagacinSelectScreen} options={{ drawerItemStyle: { display: 'none' } }} />
        <Drawer.Screen name="Zalihe" component={ZaliheScreen} options={{ drawerItemStyle: { display: 'none' } }} />
        <Drawer.Screen name="Popis" component={PopisScreen} options={{ drawerItemStyle: { display: 'none' } }} />
        <Drawer.Screen name="ArtikalDetalji" component={ArtikalDetaljiScreen} options={{ drawerItemStyle: { display: 'none' } }} />
        <Drawer.Screen
          name="OstaliMarketi"
          component={OstaliMarketiScreen}
          options={{
            drawerItemStyle: { display: 'none' },
            title: 'Zalihe u drugim marketima',
          }}
        />
      </Drawer.Navigator>
    </NavigationContainer>
  );
}
