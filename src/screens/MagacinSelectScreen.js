import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  Button,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { getMagacini, getPopis } from '../services/api';

const MagacinSelectScreen = () => {
  const [magacini, setMagacini] = useState([]);
  const [loading, setLoading] = useState(true);
  const [zaglavlje, setZaglavlje] = useState(null);
  const [selectedMagacin, setSelectedMagacin] = useState(null);

  const navigation = useNavigation();
  const route = useRoute();
  const { id, korisnik, nastavak } = route.params;

  useEffect(() => {
    const fetchMagacini = async () => {
      try {
        const data = await getMagacini(id);
        setMagacini(data.filter(m => m.id_mag && m.naziv_mag));
      } catch (err) {
        Alert.alert('Greška', err.message || 'Neuspješno učitavanje magacina.');
      } finally {
        setLoading(false);
      }
    };

    fetchMagacini();
  }, []);

  const handleSelect = async (magacin) => {
    setSelectedMagacin(magacin);

    if (nastavak === 'Popis') {
      try {
        const response = await getPopis(13, magacin.db_user, magacin.db_pass, magacin.db_sid); // test ID
        setZaglavlje(response.zaglavlje);
      } catch (err) {
        Alert.alert('Greška', err.message || 'Greška prilikom učitavanja zaglavlja.');
      }
    } else if (nastavak === 'Zalihe i Cijene') {
      navigation.navigate('Zalihe', {
        db_user: magacin.db_user,
        db_pass: magacin.db_pass,
        db_sid: magacin.db_sid,
        mg_sifra_mg: magacin.id_mag,
        korisnik,
        id
      });
    }
  };

  const idiNaArtikle = () => {
    if (!zaglavlje || !selectedMagacin) return;
    navigation.navigate('Popis', {
      id: zaglavlje.id_pop,
      korisnik,
      db_user: selectedMagacin.db_user,
      db_pass: selectedMagacin.db_pass,
      db_sid: selectedMagacin.db_sid,
    });
  };

  if (loading) return <ActivityIndicator style={{ marginTop: 50 }} size="large" />;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Izaberite magacin</Text>

      <FlatList
        data={magacini}
        keyExtractor={(item, index) => (item?.id_mag ? item.id_mag.toString() : `magacin-${index}`)}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[
              styles.item,
              selectedMagacin?.id_mag === item.id_mag && styles.selectedItem,
            ]}
            onPress={() => handleSelect(item)}
          >
            <Text style={styles.text}>{item.naziv_mag}</Text>
          </TouchableOpacity>
        )}
      />

      {zaglavlje && nastavak === 'Popis' && (
        <View style={styles.zaglavljeBox}>
          <Text style={styles.headerText}>Zaglavlje popisa:</Text>
          <Text style={styles.zaglavljeText}>Datum od: {zaglavlje.dod}</Text>
          <Text style={styles.zaglavljeText}>Datum do: {zaglavlje.ddo}</Text>
          <Button title="Nastavi na artikle" onPress={idiNaArtikle} color="#6a0dad" />
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#fff' },
  title: { fontSize: 18, fontWeight: 'bold', textAlign: 'center', marginBottom: 20 },
  item: {
    padding: 16,
    backgroundColor: '#eee',
    borderRadius: 10,
    marginBottom: 12,
  },
  selectedItem: {
    backgroundColor: '#dcd0ff',
  },
  text: { fontSize: 16 },
  zaglavljeBox: {
    marginTop: 20,
    padding: 16,
    backgroundColor: '#f5f5f5',
    borderRadius: 10,
  },
  zaglavljeText: {
    fontSize: 14,
    color: '#333',
    marginBottom: 6,
  },
  headerText: {
    fontWeight: 'bold',
    fontSize: 16,
    marginBottom: 8,
  },
});

export default MagacinSelectScreen;
