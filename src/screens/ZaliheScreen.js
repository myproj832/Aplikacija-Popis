import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { getZalihe } from '../services/api';

const ZaliheScreen = () => {
  const route = useRoute();
  const navigation = useNavigation();

  const { db_user, db_pass, db_sid, mg_sifra_mg } = route.params;

  const [artikli, setArtikli] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log('📦 Primljeni parametri za Zalihe:', {
      db_user,
      db_pass,
      db_sid,
      mg_sifra_mg,
    });

    const ucitajZalihe = async () => {
      try {
        const data = await getZalihe(db_user, db_pass, db_sid, mg_sifra_mg);
        setArtikli(data);
      } catch (error) {
        Alert.alert('Greška', error.message || 'Greška pri učitavanju zaliha.');
      } finally {
        setLoading(false);
      }
    };

    ucitajZalihe();
  }, []);

  const renderItem = ({ item }) => {
    const oznake = [];

    if (Number(item.ind_novo) === 1) oznake.push('NOVO');
    if (Number(item.ind_akcija) === 1 && item.proc_akc)
      oznake.push(`AKCIJA -${item.proc_akc}%`);
    else if (Number(item.ind_akcija) === 1) oznake.push('AKCIJA');

    if (Number(item.ind_bf) === 1 && item.proc_akc_bf)
      oznake.push(`BF -${item.proc_akc_bf}%`);
    else if (Number(item.ind_bf) === 1) oznake.push('BF');

    if (Number(item.ind_limit_cj) === 1) oznake.push('LIMIT');

    const regularnaCijena = parseFloat(item.cijena || 0).toFixed(2);
    const akcijskaCijena = item.cijena_akc ? parseFloat(item.cijena_akc).toFixed(2) : null;
    const bfCijena = item.cijena_bf ? parseFloat(item.cijena_bf).toFixed(2) : null;

    return (
      <View style={styles.card}>
        {item.url_slike ? (
          <Image source={{ uri: item.url_slike }} style={styles.image} />
        ) : (
          <View style={[styles.image, styles.placeholder]}>
            <Text style={styles.placeholderText}>Nema slike</Text>
          </View>
        )}

        <View style={styles.info}>
          <Text style={styles.title}>{item.naziv}</Text>
          <Text style={styles.text}>Stanje: {item.stanje}</Text>

       {/* Cijene */}
       {akcijskaCijena ? (
         <>
           <Text style={[styles.text, styles.strike]}>Cijena: {regularnaCijena} EUR</Text>
           <Text style={[styles.text, styles.akcija]}>Akcija: {akcijskaCijena} EUR</Text>
         </>
       ) : (
         <>
           <Text style={styles.text}>Cijena: {regularnaCijena} EUR</Text>
           {bfCijena && (
             <Text style={[styles.text, styles.bf]}>BF cijena: {bfCijena} EUR</Text>
           )}
         </>
       )}


          {/* Oznake */}
          <View style={styles.badgeContainer}>
            {oznake.map((oznaka, i) => (
              <View key={i} style={styles.badge}>
                <Text style={styles.badgeText}>{oznaka}</Text>
              </View>
            ))}
          </View>

          <TouchableOpacity
            style={styles.button}
            onPress={() => navigation.navigate('ArtikalDetalji', { artikal: item })}
          >
            <Text style={styles.buttonText}>Detalji</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  if (loading) {
    return <ActivityIndicator size="large" color="#6a0dad" style={{ marginTop: 40 }} />;
  }

  return (
    <FlatList
      data={artikli}
      keyExtractor={(item, index) => `${item.id_art}_${index}`}
      renderItem={renderItem}
      contentContainerStyle={styles.list}
    />
  );
};

const styles = StyleSheet.create({
  list: { padding: 16 },
  card: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 12,
    marginBottom: 16,
    elevation: 3,
  },
  image: {
    width: 90,
    height: 90,
    borderRadius: 8,
    marginRight: 12,
    backgroundColor: '#eee',
  },
  placeholder: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    fontSize: 12,
    color: '#999',
  },
  info: {
    flex: 1,
    justifyContent: 'space-between',
  },
  title: {
    fontWeight: 'bold',
    fontSize: 16,
    color: '#333',
  },
  text: {
    fontSize: 14,
    color: '#555',
    marginTop: 4,
  },
  strike: {
    textDecorationLine: 'line-through',
    color: '#888',
  },
  akcija: {
    color: '#e60000',
    fontWeight: 'bold',
  },
  bf: {
    color: '#006600',
    fontWeight: 'bold',
  },
  badgeContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 6,
  },
  badge: {
    backgroundColor: '#ffcc00',
    paddingVertical: 2,
    paddingHorizontal: 8,
    borderRadius: 12,
    marginRight: 6,
    marginBottom: 4,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#333',
  },
  button: {
    marginTop: 10,
    backgroundColor: '#6a0dad',
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
  },
});

export default ZaliheScreen;
