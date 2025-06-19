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
  TextInput,
  Dimensions,
  Animated,
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { getZalihe } from '../services/api';

const { width: W, height: H } = Dimensions.get('window');

const ZaliheScreen = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const fade = useState(new Animated.Value(0))[0];

  const {
    db_sid,
    mg_sifra_mg,
    id,
    korisnik,
    nastavak,
    naziv_mag,
    ind_sif,
  } = route.params;

  const [artikli, setArtikli] = useState([]);
  const [filtriraniArtikli, setFiltriraniArtikli] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchVisible, setSearchVisible] = useState(false);
  const [searchText, setSearchText] = useState('');

  useEffect(() => {
    const ucitajZalihe = async () => {
      try {
        const data = await getZalihe(db_sid, mg_sifra_mg);
        setArtikli(data);
        setFiltriraniArtikli(data);
      } catch (error) {
        Alert.alert('Greška', error.message || 'Greška pri učitavanju zaliha.');
      } finally {
        setLoading(false);
      }
    };

    ucitajZalihe();

    Animated.timing(fade, {
      toValue: 1,
      duration: 600,
      useNativeDriver: true,
    }).start();
  }, []);

  useEffect(() => {
    if (!searchText.trim()) {
      setFiltriraniArtikli(artikli);
    } else {
      const lower = searchText.toLowerCase();
      const filtrirano = artikli.filter((item) =>
        (item.naziv || '').toLowerCase().includes(lower) ||
        (item.bar_code || '').toLowerCase().includes(lower) ||
        (item.robna_marka || '').toLowerCase().includes(lower)
      );

      setFiltriraniArtikli(filtrirano);
    }
  }, [searchText, artikli]);

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
      <View style={[styles.card, Number(item.stanje) === 0 && styles.cardEmpty]}>
        {item.url_slike ? (
          <Image source={{ uri: item.url_slike }} style={styles.image} />
        ) : (
          <View style={[styles.image, styles.placeholder]}>
            <Text style={styles.placeholderText}>Nema slike</Text>
          </View>
        )}

        <View style={styles.info}>
          <Text style={styles.title}>{item.naziv}</Text>
          <Text style={styles.text}>Barkod: {item.bar_code}</Text>
          {ind_sif === 1 && (
            <Text style={styles.text}>Interna šifra: {item.int_sif || '-'}</Text>
          )}
          {Number(item.stanje) === 0 ? (
            <Text style={[styles.text, { color: 'red', fontWeight: 'bold' }]}>Nema zaliha</Text>
          ) : (
            <Text style={styles.text}>Stanje: {item.stanje}</Text>
          )}

          {akcijskaCijena ? (
            <>
              <Text style={[styles.text, styles.strike]}>Cijena: {regularnaCijena} EUR</Text>
              <Text style={[styles.text, styles.akcija]}>Akcija: {akcijskaCijena} EUR</Text>
            </>
          ) : (
            <>
              <Text style={styles.text}>Cijena: {regularnaCijena} EUR</Text>
              {bfCijena && <Text style={[styles.text, styles.bf]}>BF cijena: {bfCijena} EUR</Text>}
            </>
          )}

          <View style={styles.badgeContainer}>
            {oznake.map((oznaka, i) => (
              <View key={i} style={styles.badge}>
                <Text style={styles.badgeText}>{oznaka}</Text>
              </View>
            ))}
          </View>

          <View style={styles.buttonRow}>
            <TouchableOpacity
              style={[styles.button, { marginRight: 8 }]}
              onPress={() =>
                navigation.navigate('ArtikalDetalji', {
                  artikal: item,
                  db_sid,
                  mg_sifra_mg,
                  id,
                  korisnik,
                  nastavak,
                  ind_sif,
                  naziv_mag
                })
              }
            >
              <Text style={styles.buttonText}>Detalji</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.button, { backgroundColor: '#ff8a80' }]}
              onPress={() =>
                navigation.navigate('OstaliMarketi', {
                  sifra: item.bar_code,
                  db_sid,
                  mg_sifra_mg,
                  naziv_art: item.naziv,
                  ind_sif,
                  nastavak,
                  id,
                  naziv_mag,
                  korisnik
                })
              }
            >
              <Text style={styles.buttonText}>Ostali marketi</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  };

  if (loading) {
    return (
      <Animated.View style={[styles.container, { opacity: fade }]}>
        <View style={styles.background}>
          <View style={styles.curveTop} />
          <View style={styles.curveMiddle} />
          <View style={styles.curveBottom} />
        </View>
        <ActivityIndicator size="large" color="#ff6b6b" style={{ marginTop: H * 0.4 }} />
      </Animated.View>
    );
  }

  return (
    <Animated.View style={[styles.container, { opacity: fade }]}>
      <View style={styles.background}>
        <View style={styles.curveTop} />
        <View style={styles.curveMiddle} />
        <View style={styles.curveBottom} />
      </View>

      {/* Top Bar - NA SAMOM VRHU EKRANA */}
      <View style={styles.topBar}>
        <TouchableOpacity
          style={styles.backButtonContainer}
          onPress={() =>
            navigation.navigate('MagacinSelect', {
              korisnik,
              id,
              db_sid,
              nastavak,
              ind_sif,
            })
          }
        >
          <Text style={styles.backButton}>←</Text>
        </TouchableOpacity>

        <View style={styles.userInfo}>
          <Text style={styles.userName}>{korisnik}</Text>
        </View>
      </View>

      {/* Cosmetics logo */}
      <View style={styles.logoContainer}>
        <Image
          source={require('../assets/LogoCosmetics.png')}
          style={styles.logo}
          resizeMode="contain"
        />
      </View>

      <Text style={styles.headerTitle}>Zalihe i cijene</Text>
      <Text style={styles.magacinNaziv}>
        <Text style={{ fontWeight: 'bold' }}>{naziv_mag}</Text>
      </Text>

      <View style={styles.searchHeader}>
        <TextInput
          style={styles.searchInput}
          placeholder="🔍Pretraga po barkodu, nazivu, robnoj marki..."
          placeholderTextColor="#ffffff80"
          value={searchText}
          onChangeText={setSearchText}
        />
      </View>

      <View style={styles.listContainer}>
        <FlatList
          data={filtriraniArtikli}
          keyExtractor={(item, index) => `${item.id_art}_${index}`}
          renderItem={renderItem}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
        />
      </View>

      {/* Footer logo */}
      <View style={styles.footer}>
        <Image
          source={require('../assets/logoBlipko.png')}
          style={styles.footerLogo}
          resizeMode="contain"
        />
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  background: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 1,
  },
  curveTop: {
    position: 'absolute',
    top: -H * 0.15,
    left: -W * 0.4,
    width: W * 1.8,
    height: H * 0.6,
    backgroundColor: '#ffffff',
    borderBottomRightRadius: W,
    borderBottomLeftRadius: W,
    transform: [{ rotate: '-5deg' }],
  },
  curveMiddle: {
    position: 'absolute',
    top: -H * 0.2,
    right: -W * 0.4,
    width: W * 1.4,
    height: W * 1.4,
    backgroundColor: '#ff8a80',
    borderRadius: W * 0.7,
    transform: [{ rotate: '-20deg' }],
    opacity: 0.8,
  },
  curveBottom: {
    position: 'absolute',
    top: H * 0.1,
    left: -W * 0.2,
    width: W * 1.3,
    height: W * 1.3,
    backgroundColor: '#ffab91',
    borderRadius: W * 0.65,
    transform: [{ rotate: '25deg' }],
    opacity: 0.6,
  },
  topBar: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 20, // Smanjen padding - topbar je sada na vrhu
    paddingHorizontal: 20,
    paddingBottom: 15,
    zIndex: 200,
    backgroundColor: 'transparent',
  },
  backButtonContainer: {
    zIndex: 100,
    elevation: 100,
    padding: 8,
    borderRadius: 25,
  },
  backButton: {
    fontSize: 24,
    color: '#ff6b6b',
    fontWeight: '600',
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 25,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  userName: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  logoContainer: {
    alignItems: 'center',
    marginTop: H * 0.05, // Povećan margin da logo ne ide preko topbar-a
    zIndex: 50,
  },
  logo: {
    width: W * 0.6,
    height: 120,
  },
  headerTitle: {
    fontSize: 25,
    color: 'white',
    textAlign: 'center',
    marginTop: -30,
    fontWeight: 'bold',
    zIndex: 50,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  magacinNaziv: {
    textAlign: 'center',
    color: 'white',
    marginVertical: 10,
    fontSize: 16,
    zIndex: 50,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  searchHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 10,
    zIndex: 50,
  },
  searchInput: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 16,
    color: 'black',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  listContainer: {
    flex: 1,
    paddingHorizontal: 16,
    zIndex: 50,
  },
  list: {
    paddingBottom: 100, // Prostor za footer
  },
  card: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 15,
    padding: 12,
    marginBottom: 16,
    shadowColor: '#ff6b6b',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  cardEmpty: {
    backgroundColor: 'rgba(240, 224, 224, 0.95)',
    opacity: 0.7,
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
  buttonRow: {
    flexDirection: 'row',
    marginTop: 10,
  },
  button: {
    backgroundColor: '#ff6b6b',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    alignSelf: 'flex-start',
    shadowColor: '#ff6b6b',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 2,
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
  },
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 100,
  },
  footerLogo: {
    width: W * 0.25,
    height: 40,
  },
});

export default ZaliheScreen;