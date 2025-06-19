import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  Dimensions,
  Animated,
  Image,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { getMagacini, getPopis } from '../services/api';

const { width: W, height: H } = Dimensions.get('window');

const MagacinSelectScreen = () => {
  const [magacini, setMagacini] = useState([]);
  const [loading, setLoading] = useState(true);
  const [zaglavlje, setZaglavlje] = useState(null);
  const [selectedMagacin, setSelectedMagacin] = useState(null);
  const fade = useState(new Animated.Value(0))[0];

  const navigation = useNavigation();
  const route = useRoute();
  const {
    id,
    korisnik,
    nastavak,
    ind_zal = 0,
    ind_sif = 0,
  } = route.params;

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

    Animated.timing(fade, {
      toValue: 1,
      duration: 600,
      useNativeDriver: true,
    }).start();
  }, []);

  // Resetuje selekciju kada se vrati sa Zalihe ekrana
  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      // Resetuj selekciju svaki put kada se vrati na ekran
      setSelectedMagacin(null);
      setZaglavlje(null);
    });

    return unsubscribe;
  }, [navigation]);

  const handleSelect = async (magacin) => {
    setSelectedMagacin(magacin);

    if (nastavak === 'Popis') {
      try {
        const response = await getPopis(id, magacin.id_mag, magacin.db_sid);
        setZaglavlje({
          id_pop: response.id_pop,
          dod: response.dod,
          ddo: response.ddo,
        });
      } catch (err) {
        Alert.alert('Greška', err.message || 'Greška prilikom učitavanja zaglavlja.');
      }
    } else if (nastavak === 'Zalihe' || nastavak === 'Zalihe i Cijene') {
      navigation.navigate('Zalihe', {
        db_sid: magacin.db_sid,
        mg_sifra_mg: magacin.id_mag,
        korisnik,
        id,
        nastavak,
        naziv_mag: magacin.naziv_mag,
        ind_zal,
        ind_sif,
      });
    }
  };

  const idiNaArtikle = () => {
    if (!zaglavlje || !selectedMagacin) return;
    navigation.navigate('Popis', {
      id,
      id_popisa: zaglavlje.id_pop,
      korisnik,
      sifra_mg: selectedMagacin.id_mag,
      link: selectedMagacin.db_sid,
      nastavak,
      naziv_mag: selectedMagacin.naziv_mag,
      ind_zal,
      ind_sif,
    });
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
            navigation.navigate('Meni', {
              korisnik,
              id,
              db_sid: selectedMagacin?.db_sid || '',
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

      <Text style={styles.headerTitle}>Izaberite magacin</Text>
      <Text style={styles.subtitle}>za {nastavak}</Text>

      <View style={styles.listContainer}>
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
              <View style={styles.itemContent}>
                <Image source={require('../assets/cos.png')} style={styles.storeIcon} />
                <Text style={styles.itemText}>{item.naziv_mag}</Text>
                {selectedMagacin?.id_mag === item.id_mag && (
                  <View style={styles.checkmark}>
                    <Text style={styles.checkmarkText}>✓</Text>
                  </View>
                )}
              </View>
            </TouchableOpacity>
          )}
          contentContainerStyle={[
            styles.listContent,
            zaglavlje && nastavak === 'Popis' && styles.listContentWithZaglavlje
          ]}
          showsVerticalScrollIndicator={false}
        />
      </View>

      {/* Zaglavlje info */}
      {zaglavlje && nastavak === 'Popis' && (
        <View style={styles.zaglavljeBox}>
          <Text style={styles.zaglavljeTitle}>📋 Popis informacije</Text>
          <View style={styles.zaglavljeInfo}>
            <Text style={styles.zaglavljeText}>
              📅 Datum od: <Text style={styles.datumValue}>{zaglavlje.dod}</Text>
            </Text>
            <Text style={styles.zaglavljeText}>
              📅 Datum do: <Text style={styles.datumValue}>{zaglavlje.ddo}</Text>
            </Text>
          </View>
          <TouchableOpacity style={styles.continueBtn} onPress={idiNaArtikle}>
            <Text style={styles.continueText}>Nastavi na artikle</Text>
          </TouchableOpacity>
        </View>
      )}

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
    fontSize: 20,
    color: 'white',
    textAlign: 'center',
    marginTop: -40,
    fontWeight: 'bold',
    zIndex: 50,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  subtitle: {
    textAlign: 'center',
    color: 'white',
    marginVertical: 10,
    fontSize: 16,
    zIndex: 50,
    fontStyle: 'italic',
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  listContainer: {
    flex: 1,
    paddingHorizontal: 20,
    zIndex: 50,
    marginTop: 10,
    paddingBottom: 100, // Prostor za footer
  },
  listContent: {
    paddingBottom: 20,
  },
  listContentWithZaglavlje: {
    paddingBottom: 220, // Dodano više prostora kada se prikazuje zaglavlje
  },
  item: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 15,
    marginBottom: 12,
    shadowColor: '#ff6b6b',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  selectedItem: {
    borderColor: '#ff6b6b',
    backgroundColor: 'rgba(255, 107, 107, 0.1)',
  },
  itemContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  storeIcon: {
    width: 24,
    height: 24,
    marginRight: 12,
    tintColor: '#ff6b6b',
  },
  itemText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    flex: 1,
  },
  checkmark: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#4CAF50',
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkmarkText: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
  },
  zaglavljeBox: {
    position: 'absolute',
    bottom: 100,
    left: 20,
    right: 20,
    padding: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 20,
    shadowColor: '#ff6b6b',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
    zIndex: 150,
  },
  zaglavljeTitle: {
    fontWeight: 'bold',
    fontSize: 18,
    marginBottom: 12,
    color: '#ff6b6b',
    textAlign: 'center',
  },
  zaglavljeInfo: {
    marginBottom: 16,
  },
  zaglavljeText: {
    fontSize: 15,
    color: '#333',
    marginBottom: 8,
  },
  datumValue: {
    fontWeight: 'bold',
    color: '#ff6b6b',
  },
  continueBtn: {
    backgroundColor: '#ff6b6b',
    paddingVertical: 14,
    borderRadius: 20,
    alignItems: 'center',
    shadowColor: '#ff6b6b',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 4,
  },
  continueText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
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

export default MagacinSelectScreen;