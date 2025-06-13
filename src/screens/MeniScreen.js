import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { getDozvole } from '../services/api';

const MeniScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();

  const { korisnik, id, db_user, db_pass, db_sid } = route.params || {};
  const [dozvole, setDozvole] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) {
      Alert.alert('Greška', 'ID korisnika nije prosleđen.');
      return;
    }

    const ucitajDozvole = async () => {
      try {
        const data = await getDozvole(id);
        setDozvole(data);
      } catch (error) {
        Alert.alert('Greška', 'Nije moguće učitati dozvole.');
      } finally {
        setLoading(false);
      }
    };

    ucitajDozvole();
  }, [id]);

  const handleNavigate = (naziv) => {
    let screen = null;

    switch (naziv) {
      case 'Popis':
      case 'Zalihe i Cijene':
        screen = 'MagacinSelect';
        break;
      default:
        Alert.alert('Nepoznata opcija', naziv);
        return;
    }

    navigation.navigate(screen, {
      id,
      korisnik,
      db_user,
      db_pass,
      db_sid,
      nastavak: naziv, // Prosleđujemo za dalje
    });
  };

  const handleLogout = () => {
    navigation.navigate('Login');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Dobrodošao, {korisnik}</Text>

      {loading ? (
        <ActivityIndicator size="large" style={{ marginVertical: 20 }} />
      ) : dozvole.length > 0 ? (
        <View style={styles.dozvoleBox}>
          {dozvole.map((naziv, idx) => (
            <TouchableOpacity
              key={idx}
              style={styles.optionButton}
              onPress={() => handleNavigate(naziv)}
            >
              <Text style={styles.optionText}>{naziv}</Text>
            </TouchableOpacity>
          ))}
        </View>
      ) : (
        <Text style={{ textAlign: 'center', marginTop: 20 }}>Nema dostupnih opcija</Text>
      )}

      <TouchableOpacity style={styles.logout} onPress={handleLogout}>
        <Text style={styles.logoutText}>Odjavi se</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, justifyContent: 'center' },
  header: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 24,
    textAlign: 'center',
  },
  dozvoleBox: { marginTop: 20 },
  optionButton: {
    backgroundColor: '#6a0dad',
    padding: 14,
    borderRadius: 8,
    marginBottom: 10,
  },
  optionText: {
    color: '#fff',
    fontSize: 16,
    textAlign: 'center',
  },
  logout: { marginTop: 30 },
  logoutText: { textAlign: 'center', color: 'red', fontSize: 16 },
});

export default MeniScreen;
