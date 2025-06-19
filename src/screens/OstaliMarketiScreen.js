import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Modal,
  TextInput,
  Image,
  Dimensions,
  Animated,
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { getOstaliZalihe } from '../services/api';

const { width: W, height: H } = Dimensions.get('window');

const OstaliMarketiScreen = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const fade = useState(new Animated.Value(0))[0];

  const {
    db_sid,
    sifra,
    mg_sifra_mg,
    naziv_artikla,
    id,
    korisnik,
    nastavak,
    ind_sif,
    naziv_mag
  } = route.params;

  const [data, setData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedMagacin, setSelectedMagacin] = useState(null);
  const [searchText, setSearchText] = useState('');
  const [searchVisible, setSearchVisible] = useState(false);
  const [sortAsc, setSortAsc] = useState(true);

  useEffect(() => {
    const fetchZalihe = async () => {
      try {
        const response = await getOstaliZalihe(db_sid, sifra, mg_sifra_mg);
        setData(response);
        setFilteredData(response);
      } catch (error) {
        Alert.alert('Greška', error.message || 'Neuspješan dohvat zaliha');
      }
    };

    fetchZalihe();

    Animated.timing(fade, {
      toValue: 1,
      duration: 600,
      useNativeDriver: true,
    }).start();
  }, []);

  useEffect(() => {
    let filtrirano = data.filter((item) =>
      item.naziv_magacina?.toLowerCase().includes(searchText.toLowerCase())
    );

    filtrirano.sort((a, b) =>
      sortAsc ? a.zalihe - b.zalihe : b.zalihe - a.zalihe
    );

    setFilteredData([...filtrirano]);
  }, [searchText, sortAsc, data]);

  const openModal = (magacin) => {
    setSelectedMagacin(magacin);
    setModalVisible(true);
  };

  const handleGoBack = () => {
    navigation.navigate('Zalihe', {
      korisnik,
      id,
      db_sid,
      nastavak,
      mg_sifra_mg,
      ind_sif,
      naziv_mag
    });
  };

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
          onPress={handleGoBack}
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

      <Text style={styles.headerTitle}>Zalihe na ostalim marketima</Text>
      <Text style={styles.subtitle}>{naziv_artikla}</Text>

      <View style={styles.searchRow}>
        <TextInput
          placeholder="🔍Pretraga po nazivu magacina..."
          placeholderTextColor="#ffffff80"
          value={searchText}
          onChangeText={setSearchText}
          style={styles.searchInput}
        />
        <TouchableOpacity
          style={styles.sortButton}
          onPress={() => setSortAsc(!sortAsc)}
        >
          <Text style={styles.sortIcon}>{sortAsc ? '↑' : '↓'}</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.listContainer}>
        <FlatList
          data={filteredData}
          keyExtractor={(item, index) => `${item.mg_sifra_mg}_${index}`}
          renderItem={({ item }) => (
            <TouchableOpacity style={styles.card} onPress={() => openModal(item)}>
              <View style={styles.cardRow}>
                <Image source={require('../assets/cos.png')} style={styles.icon} />
                <View style={{ flex: 1 }}>
                  <Text style={styles.magacin}>{item.naziv_magacina}</Text>
                  <Text style={styles.adresa}>{item.adresa}</Text>
                  <Text style={styles.zalihaText}>
                    Zalihe: <Text style={styles.zalihaNumber}>{item.zalihe}</Text>
                  </Text>
                </View>
              </View>
            </TouchableOpacity>
          )}
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

      <Modal visible={modalVisible} transparent animationType="fade">
        <View style={styles.modalBackground}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>{selectedMagacin?.naziv_magacina}</Text>
            <Text style={styles.modalText}>Adresa: {selectedMagacin?.adresa}</Text>
            <Text style={styles.modalText}>Telefon: {selectedMagacin?.tel}</Text>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setModalVisible(false)}
            >
              <Text style={styles.closeButtonText}>Zatvori</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
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
    marginTop: -20,
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
  searchRow: {
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
    marginRight: 10,
  },
  sortButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 8,
    padding: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sortIcon: {
    fontSize: 20,
    color: 'white',
    fontWeight: 'bold',
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
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 15,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#ff6b6b',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  cardRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  icon: {
    width: 40,
    height: 40,
    marginRight: 12,
    resizeMode: 'contain',
  },
  magacin: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#ff6b6b',
    marginBottom: 2,
  },
  adresa: {
    fontSize: 13,
    color: '#666',
    marginBottom: 4,
  },
  zalihaText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#333',
  },
  zalihaNumber: {
    color: '#ff6b6b',
    fontWeight: 'bold',
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
  modalBackground: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.6)',
  },
  modalContent: {
    margin: 20,
    padding: 24,
    backgroundColor: 'white',
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#ff6b6b',
    textAlign: 'center',
  },
  modalText: {
    fontSize: 16,
    color: '#333',
    marginBottom: 8,
  },
  closeButton: {
    marginTop: 20,
    backgroundColor: '#ff6b6b',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 20,
    alignSelf: 'center',
  },
  closeButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
});

export default OstaliMarketiScreen;