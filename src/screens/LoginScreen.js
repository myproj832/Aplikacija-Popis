import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { login } from '../services/api';

const LoginScreen = () => {
  const navigation = useNavigation();
  const [korisnik, setKorisnik] = useState('');
  const [lozinka, setLozinka] = useState('');

  const handleLogin = async () => {
    if (!korisnik || !lozinka) {
      Alert.alert('Greška', 'Unesite korisničko ime i lozinku.');
      return;
    }

    try {
    console.log(' poziv servisa korisnik',korisnik);
     console.log(' poziv servisa lozinka',lozinka);
      const data = await login(korisnik, lozinka);

      console.log(' poziv servisa ',data);

      navigation.navigate('Meni', {
        korisnik,
        db_user: data.DB_USER,
        db_pass: data.DB_PASS,
        db_sid: data.DB_SID,
        id: data.ID,
      });

    } catch (error) {
      Alert.alert('Greška', error.message);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Prijava</Text>

      <TextInput placeholder="Korisničko ime" style={styles.input} value={korisnik} onChangeText={setKorisnik} />
      <TextInput placeholder="Lozinka" secureTextEntry style={styles.input} value={lozinka} onChangeText={setLozinka} />

      <TouchableOpacity style={styles.button} onPress={handleLogin}>
        <Text style={styles.buttonText}>Prijavi se</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 16 },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 24 },
  input: { width: '100%', borderWidth: 1, borderColor: '#ccc', padding: 12, borderRadius: 8, marginBottom: 12 },
  button: { backgroundColor: '#800080', paddingVertical: 12, paddingHorizontal: 32, borderRadius: 8 },
  buttonText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
});

export default LoginScreen;
