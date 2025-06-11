import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';

const DobrodoslicaScreen = () => {
  const navigation = useNavigation();  // Get navigation object for navigating to other screens

  return (
    <View style={styles.container}>
      {/* Title */}
      <Text style={styles.title}>Dobrodošli u Popis aplikaciju</Text>

      {/* Welcome message */}
      <Text style={styles.message}>
        Hvala što koristite Popis aplikaciju. Pritisnite dugme ispod da započnete.
      </Text>

      {/* Start button */}
      <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('Login')}>
        <Text style={styles.buttonText}>Započni</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',        // white background for a clean look
    justifyContent: 'center',          // center vertically
    alignItems: 'center',              // center horizontally
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,                 // space below title
    color: '#000000',                 // black text for title
  },
  message: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 32,                 // extra space below message before the button
    color: '#333333',                 // dark gray text for readability
  },
  button: {
    backgroundColor: '#800080',       // purple background for the button
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',            // center the text inside
  },
  buttonText: {
    color: '#FFFFFF',                // white text for contrast on purple
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default DobrodoslicaScreen;
