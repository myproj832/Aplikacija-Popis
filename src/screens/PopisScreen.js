import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  FlatList,
  StyleSheet,
  Alert,
  Keyboard,
  TouchableOpacity,
  Animated,
  Dimensions,
  Image,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import {
  getPopis,
  saveToTempPopis,
  finalSavePopis,
  resetTempPopis,
} from '../services/api';

const { width: W, height: H } = Dimensions.get('window');

const PopisScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const fade = useRef(new Animated.Value(0)).current;

  const {
    id,
    korisnik,
    sifra_mg,
    link,
    nastavak,
    id_popisa = id,
    naziv_mag,
    ind_zal,
    ind_sif,
  } = route.params;

  const [popisani, setPopisani] = useState([]);
  const [zaliha, setZaliha] = useState([]);
  const [barkod, setBarkod] = useState('');
  const [unosKolicine, setUnosKolicine] = useState('1');
  const [searchText, setSearchText] = useState('');
  const [searchVisible, setSearchVisible] = useState(false);
  const [activeTab, setActiveTab] = useState('popisano');
  const [barkodFocused, setBarkodFocused] = useState(false);
  const [keyboardVisible, setKeyboardVisible] = useState(false);

  const inputRefs = useRef({});
  const barkodInputRef = useRef(null);

  const loadData = async () => {
    try {
      const data = await getPopis(id, sifra_mg, link);
      setPopisani(data.artikli_aktivni || []);
      setZaliha(data.artikli_sacuvani || []);
    } catch (error) {
      Alert.alert('Greška', error.message || 'Greška prilikom učitavanja podataka.');
    }
  };

  const handleBarkodFocus = () => {
    setBarkodFocused(true);
    if (barkodInputRef.current) {
      barkodInputRef.current.focus();
    }
  };

  useEffect(() => {
    loadData();

    Animated.timing(fade, {
      toValue: 1,
      duration: 600,
      useNativeDriver: true,
    }).start();

    // Keyboard listeners
    const keyboardDidShowListener = Keyboard.addListener('keyboardDidShow', () => {
      setKeyboardVisible(true);
    });
    const keyboardDidHideListener = Keyboard.addListener('keyboardDidHide', () => {
      setKeyboardVisible(false);
    });

    return () => {
      keyboardDidShowListener?.remove();
      keyboardDidHideListener?.remove();
    };
  }, []);

  // Poseban useEffect za fokus koji se pokreće svaki put kada se vrati na tab "popisano"
  useEffect(() => {
    if (activeTab === 'popisano') {
      const timer = setTimeout(() => {
        handleBarkodFocus();
      }, 300);

      return () => clearTimeout(timer);
    }
  }, [activeTab]);

  // useEffect koji se pokreće kad se vrati na screen
  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      if (activeTab === 'popisano') {
        setTimeout(() => {
          handleBarkodFocus();
        }, 400);
      }
    });

    return unsubscribe;
  }, [navigation, activeTab]);

  const handleScan = async () => {
    const found = zaliha.find((a) => a.bar_code?.trim() === barkod.trim());
    if (found) {
      const novaKolicina = parseFloat(unosKolicine.replace(',', '.')) || 1;
      const postoji = popisani.find((a) => a.bar_code === barkod.trim());

      if (postoji) {
        const novaLista = popisani.map((item) =>
          item.bar_code === barkod.trim()
            ? { ...item, kol: parseFloat(item.kol || 0) + novaKolicina }
            : item
        );
        setPopisani(novaLista);
      } else {
        setPopisani([...popisani, { ...found, kol: novaKolicina }]);
      }

      try {
        await saveToTempPopis(id, id_popisa, { bar_code: barkod, kol: novaKolicina });
      } catch (error) {
        Alert.alert('Greška', 'Neuspešno privremeno snimanje.');
      }
    } else {
      Alert.alert('Upozorenje', 'Barkod nije pronađen.');
    }

    setBarkod('');
    setUnosKolicine('1');
    // Vraća fokus na barkod bez tastature
    setTimeout(() => {
      handleBarkodFocus();
    }, 100);
  };

  const updateKol = (index, value) => {
    const novaLista = [...popisani];
    novaLista[index].kol = value;
    setPopisani(novaLista);
  };

  const handleSave = async () => {
    try {
      await finalSavePopis(id, id_popisa, link);
      Alert.alert('Uspjeh', 'Podaci su uspješno sačuvani.');
      await loadData();
      // Vraća fokus na barkod nakon snimanja
      setTimeout(() => {
        handleBarkodFocus();
      }, 500);
    } catch (error) {
      Alert.alert('Greška', error.message || 'Greška pri finalnom čuvanju.');
    }
  };

  const handleReset = async () => {
    Alert.alert('Potvrda', 'Da li želite da obrišete trenutne unose?', [
      { text: 'Otkaži', style: 'cancel' },
      {
        text: 'Obriši',
        style: 'destructive',
        onPress: async () => {
          try {
            await resetTempPopis(id, id_popisa);
            Alert.alert('Obrisano', 'Unosi su obrisani.');
            await loadData();
            // Vraća fokus na barkod nakon resetovanja
            setTimeout(() => {
              handleBarkodFocus();
            }, 500);
          } catch (error) {
            Alert.alert('Greška', error.message || 'Neuspješno resetovanje.');
          }
        },
      },
    ]);
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);

    // Kada se prebaci na "popisano" tab, fokusira barkod bez tastature
    if (tab === 'popisano') {
      setTimeout(() => {
        handleBarkodFocus();
      }, 100);
    }
    // Kada se prebaci na "sve" tab, ne fokusira pretragu
  };

  const filtriraniArtikli =
    activeTab === 'sve'
      ? zaliha.filter(
          (a) =>
            a.naziv_art?.toLowerCase().includes(searchText.toLowerCase()) ||
            a.bar_code?.toLowerCase().includes(searchText.toLowerCase()) ||
            (ind_sif === 1 && a.int_sif?.toLowerCase().includes(searchText.toLowerCase()))
        )
      : popisani;

  const ukupnoArtikala = filtriraniArtikli.length;
  const ukupnaKolicina = filtriraniArtikli.reduce(
    (sum, item) => sum + (parseFloat(item.kol) || 0),
    0
  );

  const ukupnaZaliha =
    ind_zal === 1
      ? filtriraniArtikli.reduce((sum, item) => sum + (parseFloat(item.zalihe) || 0), 0)
      : null;

  const renderArtikal = ({ item, index }) => (
    <View style={styles.artikal}>
      <View style={styles.artikalHeader}>
        <View style={styles.artikalInfo}>
          <Text style={styles.artikalText}>
            {item.rbs}. {item.naziv_art || 'Naziv nedostaje'}
          </Text>
          <Text style={styles.barcode}>Barkod: {item.bar_code || 'N/A'}</Text>
          {ind_sif === 1 && (
            <Text style={styles.barcode}>Interna šifra: {item.int_sif || '-'}</Text>
          )}
        </View>
        {activeTab === 'popisano' && (
          <TextInput
            style={[styles.input, styles.kolicinaInputInline]}
            placeholder="Kol."
            keyboardType="numeric"
            value={item.kol?.toString() || ''}
            onChangeText={(text) => updateKol(index, text)}
            ref={(el) => (inputRefs.current[index] = el)}
            returnKeyType="done"
          />
        )}
      </View>
      {activeTab === 'sve' && (
        <View style={styles.artikalDetails}>
          <Text style={styles.kolicinaText}>Popisana količina: {item.kol}</Text>
          {ind_zal === 1 && item.zalihe != null && (
            <Text style={styles.zaliheText}>Zalihe: {item.zalihe}</Text>
          )}
        </View>
      )}
    </View>
  );

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <Animated.View style={[styles.animatedContainer, { opacity: fade }]}>
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
                db_sid: link,
                nastavak,
                ind_zal,
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

        <Text style={styles.headerTitle}>Popis</Text>
        <Text style={styles.magacinNaziv}>{naziv_mag}</Text>

        <View style={styles.tabBar}>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'popisano' && styles.tabActive]}
            onPress={() => handleTabChange('popisano')}
          >
            <Text style={[styles.tabText, activeTab === 'popisano' && styles.tabTextActive]}>
              Popisujem
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'sve' && styles.tabActive]}
            onPress={() => handleTabChange('sve')}
          >
            <Text style={[styles.tabText, activeTab === 'sve' && styles.tabTextActive]}>
              Pregled
            </Text>
          </TouchableOpacity>
        </View>

        {activeTab === 'sve' && (
          <View style={styles.searchRow}>
            <TextInput
              style={styles.searchInput}
              placeholder="🔍Pretraga po barkodu, nazivu, robnoj marki..."
              placeholderTextColor="#ffffff80"
              value={searchText}
              onChangeText={setSearchText}
              // Ne automatski fokusira pretragu
            />
          </View>
        )}

        {activeTab === 'popisano' && (
          <View style={styles.inputRow}>
            <TextInput
              style={[styles.input, styles.kolicinaInput]}
              placeholder="Količina"
              value={unosKolicine}
              onChangeText={setUnosKolicine}
              keyboardType="numeric"
              returnKeyType="done"
            />
            <TextInput
              ref={barkodInputRef}
              style={[styles.input, styles.barkodInput, barkodFocused && styles.barkodFocused]}
              placeholder="Skeniraj barkod"
              value={barkod}
              onChangeText={setBarkod}
              onSubmitEditing={handleScan}
              onFocus={() => setBarkodFocused(true)}
              onBlur={() => setBarkodFocused(false)}
              returnKeyType="search"
            />
            <TouchableOpacity onPress={handleScan} style={styles.upisiButton}>
              <Text style={styles.upisiButtonText}>Upiši</Text>
            </TouchableOpacity>
          </View>
        )}

        <View style={styles.statistikaContainer}>
          <Text style={styles.statistikaText}>
            Artikala: <Text style={styles.statistikaBroj}>{ukupnoArtikala}</Text> |
            Popisano: <Text style={styles.statistikaBroj}>{ukupnaKolicina}</Text>
            {ind_zal === 1 && ukupnaZaliha != null && (
              <> | Zaliha: <Text style={styles.statistikaBroj}>{ukupnaZaliha}</Text></>
            )}
          </Text>
        </View>

        <View style={styles.listContainer}>
          <FlatList
            data={filtriraniArtikli}
            keyExtractor={(item, index) => `${item.rbs || index}_${index}`}
            renderItem={renderArtikal}
            contentContainerStyle={[
              styles.listContent,
              // Dinamički padding na osnovu toga da li je tastatura otvorena i da li je "popisano" tab
              { paddingBottom: activeTab === 'popisano' ? (keyboardVisible ? 20 : 160) : 100 }
            ]}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          />
        </View>

        {/* Fixed Footer Logo - UVEK na dnu, ali SAMO kada tastatura nije vidljiva */}
        {!keyboardVisible && (
          <View style={styles.fixedFooterLogo}>
            <Text style={styles.poweredByText}>Powered by</Text>
            <Image
              source={require('../assets/logoBlipko.png')}
              style={styles.footerLogo}
              resizeMode="contain"
            />
          </View>
        )}
      </Animated.View>

      {/* Fixed Footer Buttons - SAMO za "popisano" tab i SAMO kada tastatura nije vidljiva */}
      {activeTab === 'popisano' && !keyboardVisible && (
        <View style={styles.fixedFooterButtons}>
          <TouchableOpacity
            style={[styles.footerBtn, styles.resetButton]}
            onPress={handleReset}
          >
            <Text style={styles.footerText}>Poništi</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.footerBtn, styles.saveButton]}
            onPress={handleSave}
          >
            <Text style={styles.footerText}>Sačuvaj</Text>
          </TouchableOpacity>
        </View>
      )}
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  animatedContainer: {
    flex: 1,
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
    paddingTop: 20,
    paddingHorizontal: 20,
    paddingBottom: 15,
    zIndex: 9999,
    backgroundColor: 'transparent',
  },
  backButtonContainer: {
    zIndex: 9999,
    elevation: 9999,
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
    marginTop: H * 0.05,
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
  magacinNaziv: {
    textAlign: 'center',
    color: 'white',
    marginVertical: 10,
    fontSize: 16,
    zIndex: 50,
    fontWeight: 'bold',
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  tabBar: {
    flexDirection: 'row',
    marginHorizontal: 20,
    marginBottom: 15,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 25,
    padding: 4,
    zIndex: 50,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 20,
  },
  tabActive: {
    backgroundColor: 'white',
  },
  tabText: {
    fontSize: 16,
    color: 'white',
    fontWeight: '500',
  },
  tabTextActive: {
    color: '#ff6b6b',
    fontWeight: 'bold',
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 10,
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
  inputRow: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginBottom: 15,
    alignItems: 'center',
    zIndex: 50,
  },
  kolicinaInput: {
    flex: 1,
    marginRight: 8,
  },
  barkodInput: {
    flex: 2,
    marginRight: 8,
  },
  barkodFocused: {
    backgroundColor: '#fff3cd',
    borderColor: '#ff6b6b',
    borderWidth: 2,
  },
  input: {
    backgroundColor: 'white',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#ff6b6b',
  },
  upisiButton: {
    backgroundColor: '#ff6b6b',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 10,
    shadowColor: '#ff6b6b',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 2,
  },
  upisiButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  statistikaContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    marginHorizontal: 20,
    borderRadius: 12,
    padding: 12,
    marginBottom: 15,
    zIndex: 50,
  },
  statistikaText: {
    textAlign: 'center',
    fontSize: 14,
    color: '#333',
  },
  statistikaBroj: {
    fontWeight: 'bold',
    color: '#ff6b6b',
  },
  listContainer: {
    flex: 1,
    paddingHorizontal: 20,
    zIndex: 50,
  },
  listContent: {
    // Dinamički paddingBottom se postavlja u komponenti
  },
  artikal: {
    padding: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 8,
    marginBottom: 4,
    shadowColor: '#ff6b6b',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  artikalHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  artikalInfo: {
    flex: 1,
    marginRight: 8,
  },
  artikalText: {
    fontWeight: 'bold',
    fontSize: 13,
    marginBottom: 2,
    color: '#333',
    lineHeight: 15,
  },
  barcode: {
    fontSize: 11,
    color: '#666',
    marginBottom: 1,
    lineHeight: 13,
  },
  artikalDetails: {
    marginTop: 4,
  },
  kolicinaText: {
    fontSize: 13,
    color: '#333',
    marginBottom: 2,
    lineHeight: 15,
  },
  zaliheText: {
    fontSize: 13,
    color: '#ff6b6b',
    fontWeight: '500',
    lineHeight: 15,
  },
  kolicinaInputInline: {
    paddingVertical: 6,
    paddingHorizontal: 8,
    fontSize: 14,
    width: 60,
    borderRadius: 8,
    textAlign: 'center',
    fontWeight: 'bold',
    color: '#ff6b6b',
  },
  // Footer buttons - SAMO kada tastatura nije vidljiva
  fixedFooterButtons: {
    position: 'absolute',
    bottom: 50, // postavi malo iznad logoa
    left: 0,
    right: 0,
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: 'transparent',
    gap: 12,
    zIndex: 1000,
  },
  footerBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 4,
  },
  resetButton: {
    backgroundColor: '#f44336',
  },
  saveButton: {
    backgroundColor: '#4CAF50',
  },
  footerText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  // Footer logo - UVEK na dnu ali SAMO kada tastatura nije vidljiva
  fixedFooterLogo: {
    position: 'absolute',
    bottom: 30,
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 1,
    pointerEvents: 'none',
  },
  poweredByText: {
    fontSize: 12,
    color: 'white',
    marginBottom: 4,
    opacity: 0.8,
  },
  footerLogo: {
    width: W * 0.25,
    height: 40,
  },
});

export default PopisScreen;