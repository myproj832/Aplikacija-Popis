import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  Animated,
  Dimensions,
  Image,
} from 'react-native';
import { useNavigation, useRoute, CommonActions } from '@react-navigation/native';
import { getDozvole } from '../services/api';

const { width: W, height: H } = Dimensions.get('window');

const MeniScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const fade = useState(new Animated.Value(0))[0];

  const { korisnik, id, db_sid } = route.params;
  const [dozvole, setDozvole] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', async () => {
      if (!id) {
        Alert.alert('Greška', 'ID korisnika nije prosleđen.');
        return;
      }

      setLoading(true);
      try {
        const data = await getDozvole(id);
        setDozvole(data);
      } catch (error) {
        Alert.alert('Greška', 'Nije moguće učitati dozvole.');
      } finally {
        setLoading(false);
      }
    });

    Animated.timing(fade, {
      toValue: 1,
      duration: 600,
      useNativeDriver: true,
    }).start();

    return unsubscribe;
  }, [navigation, id]);

  const handleNavigate = (naziv) => {
    let screen = null;

    switch (naziv) {
      case 'Popis':
      case 'Zalihe':
      case 'Zalihe i Cijene':
        screen = 'MagacinSelect';
        break;
      default:
        Alert.alert('Nepoznata opcija', naziv);
        return;
    }

    const { ind_zal = 0, ind_sif = 0 } = dozvole[naziv] || {};

    navigation.navigate(screen, {
      id,
      korisnik,
      nastavak: naziv,
      ind_zal,
      ind_sif,
    });
  };

  const handleLogout = () => {
    Alert.alert(
      'Odjava',
      'Da li ste sigurni da se želite odjaviti?',
      [
        {
          text: 'Otkaži',
          style: 'cancel',
        },
        {
          text: 'Odjavite se',
          style: 'destructive',
          onPress: () => {
            navigation.dispatch(
              CommonActions.reset({
                index: 0,
                routes: [{ name: 'Login' }],
              })
            );
          },
        },
      ],
      {
        cancelable: true,
        userInterfaceStyle: 'light',
      }
    );
  };

  return (
    <Animated.View style={[styles.container, { opacity: fade }]}>
      {/* Pozadina */}
      <View style={styles.background}>
        <View style={styles.curveTop} />
        <View style={styles.curveMiddle} />
        <View style={styles.curveBottom} />
      </View>

      {/* Gornji navigacioni bar - PREMEŠTEN NA VRH */}
      <View style={styles.topBar}>
        <TouchableOpacity
          style={styles.backButtonContainer}
          onPress={() => navigation.navigate('Login')}
        >
          <Text style={styles.backButton}>←</Text>
        </TouchableOpacity>

        <View style={styles.userInfo}>
          <Text style={styles.userName}>{korisnik}</Text>
          <TouchableOpacity
            style={styles.logoutButtonContainer}
            onPress={handleLogout}
          >
            <Image
              source={require('../assets/signout.png')}
              style={styles.logoutIcon}
            />
          </TouchableOpacity>
        </View>
      </View>

      {/* Logo Cosmetics */}
      <View style={styles.logoContainer}>
        <Image
          source={require('../assets/LogoCosmetics.png')}
          style={styles.logo}
          resizeMode="contain"
        />
      </View>

      {/* Naslov */}
      <Text style={styles.menuTitle}>Meni</Text>

      {/* Opcije */}
      <View style={styles.optionsContainer}>
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#ff6b6b" />
            <Text style={styles.loadingText}>Učitavanje dozvola...</Text>
          </View>
        ) : Object.keys(dozvole).length > 0 ? (
          Object.entries(dozvole).map(([naziv], idx) => (
            <TouchableOpacity
              key={idx}
              style={styles.optionButton}
              onPress={() => handleNavigate(naziv)}
              activeOpacity={0.8}
            >
              <View style={styles.optionContent}>
                <Text style={styles.optionText}>{naziv}</Text>
              </View>
            </TouchableOpacity>
          ))
        ) : (
          <View style={styles.noOptionsContainer}>
            <Text style={styles.noOptionsText}>😔 Nema dostupnih opcija</Text>
            <Text style={styles.noOptionsSubtext}>Kontaktirajte administratora</Text>
          </View>
        )}
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
    paddingTop: 30, // Safe area padding
    paddingHorizontal: 20,
    paddingBottom: 15,
    zIndex: 200,
    backgroundColor: 'transparent',
  },
  backButtonContainer: {
    zIndex: 100,
    elevation: 100,
    padding: 8,
   // backgroundColor: 'rgba(255, 255, 255, 0.2)',
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
    marginRight: 10,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  logoutButtonContainer: {
    zIndex: 100,
    elevation: 100,
    padding: 5,
  },
  logoutIcon: {
    width: 24,
    height: 24,
    tintColor: 'white',
  },
  logoContainer: {
    alignItems: 'center',
    marginTop: H * 0.12, // Povećano zbog top bara
    zIndex: 50,
  },
  logo: {
    width: W * 0.7,
    height: 250,
  },
  menuTitle: {
    fontSize: 30,
    color: 'white',
    textAlign: 'center',
    marginBottom: 20,
    marginTop: 20, // Smanjeno
    fontWeight: 'bold',
    zIndex: 50,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  optionsContainer: {
    flex: 1,
    justifyContent: 'flex-start',
    paddingTop: 10,
    paddingHorizontal: 20,
    paddingBottom: 100, // Prostor za footer
    zIndex: 50,
  },
  optionButton: {
    backgroundColor: '#ff6b6b',
    paddingVertical: 20,
    borderRadius: 20,
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: '#ff6b6b',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 6,
  },
  optionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  optionIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  optionText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    letterSpacing: 0.5,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  loadingContainer: {
    alignItems: 'center',
    marginTop: 50,
  },
  loadingText: {
    color: 'white',
    fontSize: 16,
    marginTop: 15,
    fontStyle: 'italic',
    opacity: 0.8,
  },
  noOptionsContainer: {
    alignItems: 'center',
    marginTop: 50,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    padding: 30,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  noOptionsText: {
    textAlign: 'center',
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  noOptionsSubtext: {
    textAlign: 'center',
    color: 'white',
    fontSize: 14,
    opacity: 0.7,
    fontStyle: 'italic',
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

export default MeniScreen;