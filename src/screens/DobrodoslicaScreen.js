import React from 'react';
import { View, Text, TouchableOpacity, Image, SafeAreaView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import styles from './dobrodoslicaStyles';

const DobrodoslicaScreen = () => {
  const navigation = useNavigation();

  return (
    <SafeAreaView style={styles.container}>
      {/* Top image */}

      {/* Text section */}
      <Text style={styles.title}>Dobrodošli u Popis aplikaciju</Text>
      <Text style={styles.message}>
        Hvala što koristite našu aplikaciju. Pritisnite dugme ispod da započnete popis.
      </Text>

      {/* Start button */}
      <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('Login')}>
        <Text style={styles.buttonText}>Započni</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
};

export default DobrodoslicaScreen;
