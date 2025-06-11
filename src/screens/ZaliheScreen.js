import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import 'react-native-reanimated';


const ZaliheScreen = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Ovo je ekran za Provjeru zaliha</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  text: {
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default ZaliheScreen;
