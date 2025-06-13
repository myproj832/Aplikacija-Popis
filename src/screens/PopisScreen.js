import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  FlatList,
  StyleSheet,
  Alert,
  Keyboard,
  Button,
} from 'react-native';
import { useRoute } from '@react-navigation/native';
import { getPopis, updateKolicine } from '../services/api';

const PopisScreen = () => {
  const route = useRoute();
  const { id, korisnik, db_user, db_pass, db_sid } = route.params;

  const [artikli, setArtikli] = useState([]);
  const [sviArtikli, setSviArtikli] = useState([]);
  const [barkod, setBarkod] = useState('');
  const [unosKolicine, setUnosKolicine] = useState('');
  const [filterAktivan, setFilterAktivan] = useState(false);
  const inputRefs = useRef({});

  useEffect(() => {
    const loadData = async () => {
      try {
        const data = await getPopis(id, db_user, db_pass, db_sid);
        setArtikli(data.artikli || []);
        setSviArtikli(data.artikli || []);
      } catch (error) {
        Alert.alert('Greška', error.message || 'Došlo je do greške prilikom učitavanja podataka.');
      }
    };

    loadData();
  }, []);

  const handleScan = () => {
    const indeks = sviArtikli.findIndex((a) => a.bar_code?.trim() === barkod.trim());
    if (indeks >= 0) {
      const novaKolicina = parseFloat(unosKolicine.replace(',', '.')) || 1;
      const noviArtikli = [...sviArtikli];
      const staraKol = parseFloat(noviArtikli[indeks].kol) || 0;
      noviArtikli[indeks].kol = staraKol + novaKolicina;

      setArtikli([noviArtikli[indeks]]);
      setSviArtikli(noviArtikli);
      setFilterAktivan(true);
      inputRefs.current[0]?.focus();
    } else {
      Alert.alert('Upozorenje', 'Barkod nije pronađen u artiklima.');
    }

    setBarkod('');
    setUnosKolicine('');
    Keyboard.dismiss();
  };

  const prikaziSveArtikle = () => {
    setArtikli([...sviArtikli]);
    setFilterAktivan(false);
    Keyboard.dismiss();
  };

  const updateKol = (index, value) => {
    const novaLista = [...artikli];
    novaLista[index].kol = value;
    setArtikli(novaLista);

    const original = [...sviArtikli];
    const rbs = artikli[index].rbs;
    const idx = original.findIndex((a) => a.rbs === rbs);
    if (idx >= 0) original[idx].kol = value;
    setSviArtikli(original);
  };

  const handleSave = async () => {
    try {
      await updateKolicine(db_user, db_pass, db_sid, id, sviArtikli);
      Alert.alert('Uspjeh', 'Količine su sačuvane.');
    } catch (error) {
      Alert.alert('Greška', error.message);
    }
  };

  const renderArtikal = ({ item, index }) => (
    <View style={styles.artikal}>
      <Text style={styles.artikalText}>
        {item.rbs}. {item.naziv_art || 'Naziv nedostaje'}
      </Text>
      <Text style={styles.barcode}>Barkod: {item.bar_code || 'N/A'}</Text>
      <TextInput
        style={styles.input}
        placeholder="Količina"
        keyboardType="numeric"
        value={item.kol?.toString() || ''}
        onChangeText={(text) => updateKol(index, text)}
        ref={(el) => (inputRefs.current[index] = el)}
        returnKeyType="done"
      />
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Popis za korisnika: {korisnik}</Text>

      <View style={styles.row}>
        <TextInput
          style={[styles.barkodInput, { flex: 2, marginRight: 8 }]}
          placeholder="Barkod"
          value={barkod}
          onChangeText={setBarkod}
          onSubmitEditing={handleScan}
          returnKeyType="search"
        />
        <TextInput
          style={[styles.barkodInput, { flex: 1 }]}
          placeholder="+/- Kol."
          value={unosKolicine}
          onChangeText={setUnosKolicine}
          keyboardType="numeric"
          returnKeyType="done"
        />
      </View>

      {filterAktivan && (
        <View style={styles.showAllBtn}>
          <Button title="Prikaži sve artikle" onPress={prikaziSveArtikle} />
        </View>
      )}

      <FlatList
        data={artikli}
        keyExtractor={(item, index) => `${item.rbs || index}_${index}`}
        renderItem={renderArtikal}
        contentContainerStyle={{ paddingBottom: 100 }}
        keyboardShouldPersistTaps="handled"
      />

      <Button title="Sačuvaj" onPress={handleSave} color="#6a0dad" />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#fff' },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 16,
    color: '#333',
  },
  row: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  barkodInput: {
    borderWidth: 1,
    borderColor: '#800080',
    borderRadius: 8,
    padding: 10,
    fontSize: 16,
  },
  showAllBtn: {
    marginBottom: 12,
    alignItems: 'center',
  },
  artikal: {
    padding: 12,
    backgroundColor: '#f9f9f9',
    borderRadius: 10,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  artikalText: {
    fontWeight: 'bold',
    fontSize: 16,
    marginBottom: 4,
    color: '#333',
  },
  barcode: {
    fontSize: 14,
    color: '#666',
    marginBottom: 6,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 6,
    padding: 8,
    fontSize: 16,
    backgroundColor: '#fff',
  },
});

export default PopisScreen;
