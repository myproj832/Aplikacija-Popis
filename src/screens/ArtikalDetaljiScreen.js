import React, { useState } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  Animated,
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';

const { width: W, height: H } = Dimensions.get('window');

const ArtikalDetalji = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const fade = useState(new Animated.Value(0))[0];

  const {
    mg_sifra_mg,
    artikal,
    id,
    korisnik,
    db_user,
    db_pass,
    db_sid,
    nastavak,
    ind_sif,
    naziv_mag,
    id_popisa = id,
  } = route.params;

  React.useEffect(() => {
    Animated.timing(fade, {
      toValue: 1,
      duration: 600,
      useNativeDriver: true,
    }).start();
  }, []);

  const formatDate = (dateStr) => {
    if (!dateStr || typeof dateStr !== 'string') return null;
    const date = new Date(dateStr);
    return isNaN(date.getTime()) ? null : date.toLocaleDateString();
  };

  const handleGoBack = () => {
    navigation.navigate('Zalihe', {
      korisnik,
      id,
      db_user,
      db_pass,
      db_sid,
      nastavak,
      mg_sifra_mg,
      ind_sif,
      naziv_mag
    });
  };

  const renderInfoRow = (label, value, isPrice = false, isDate = false) => {
    if (!value && value !== 0) return null;

    return (
      <View style={styles.infoRow}>
        <Text style={styles.label}>{label}:</Text>
        <Text style={[
          styles.value,
          isPrice && styles.priceValue,
          isDate && styles.dateValue
        ]}>
          {isPrice ? `${parseFloat(value).toFixed(2)} EUR` : value}
        </Text>
      </View>
    );
  };

  const renderBadges = () => {
    const badges = [];

    if (Number(artikal.ind_novo) === 1) badges.push({ text: 'NOVO', color: '#4CAF50' });
    if (Number(artikal.ind_akcija) === 1) badges.push({ text: 'AKCIJA', color: '#f44336' });
    if (Number(artikal.ind_bf) === 1) badges.push({ text: 'BF', color: '#FF9800' });
    if (Number(artikal.ind_limit_cj) === 1) badges.push({ text: 'LIMIT', color: '#9C27B0' });

    if (badges.length === 0) return null;

    return (
      <View style={styles.badgeContainer}>
        {badges.map((badge, index) => (
          <View key={index} style={[styles.badge, { backgroundColor: badge.color }]}>
            <Text style={styles.badgeText}>{badge.text}</Text>
          </View>
        ))}
      </View>
    );
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

      <Text style={styles.headerTitle}>Detalji artikla</Text>

      <ScrollView
        style={styles.scrollContainer}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.card}>
          {artikal.url_slike ? (
            <Image source={{ uri: artikal.url_slike }} style={styles.image} />
          ) : (
            <View style={[styles.image, styles.placeholder]}>
              <Text style={styles.placeholderText}>Nema slike</Text>
            </View>
          )}

          <Text style={styles.title}>{artikal.naziv}</Text>

          {renderBadges()}

          {/* Opis u crvenom okviru */}
          {(artikal.opis && artikal.opis !== 'Opis nije dostupan') && (
            <View style={styles.opisContainer}>
              <Text style={styles.opisText}>{artikal.opis}</Text>
            </View>
          )}

          <View style={styles.detailsContainer}>
            {renderInfoRow('Barkod', artikal.bar_code)}
            {ind_sif === 1 && renderInfoRow('Interna šifra', artikal.int_sif || '-')}
            {renderInfoRow('Stanje', artikal.stanje)}
            {renderInfoRow('Regularna cijena', artikal.cijena, true)}

            {artikal.cijena_akc && (
              renderInfoRow('Akcijska cijena', artikal.cijena_akc, true)
            )}

            {artikal.cijena_bf && (
              renderInfoRow('BF cijena', artikal.cijena_bf, true)
            )}

            {artikal.dat_od_akc && artikal.dat_do_akc && (
              renderInfoRow(
                'Akcija period',
                `${formatDate(artikal.dat_od_akc)} - ${formatDate(artikal.dat_do_akc)}`,
                false,
                true
              )
            )}

            {artikal.dat_od_bf && artikal.dat_do_bf && (
              renderInfoRow(
                'BF period',
                `${formatDate(artikal.dat_od_bf)} - ${formatDate(artikal.dat_do_bf)}`,
                false,
                true
              )
            )}

            {artikal.broj_tacakabf != null && (
              renderInfoRow('Broj tačaka BF', artikal.broj_tacakabf)
            )}

            {artikal.preracun_cijene_jm && (
              renderInfoRow('Preračun cijene JM', artikal.preracun_cijene_jm)
            )}

            {artikal.robna_marka && (
              renderInfoRow('Robna marka', artikal.robna_marka)
            )}
          </View>
        </View>
      </ScrollView>

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
    marginBottom: 20,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  scrollContainer: {
    flex: 1,
    zIndex: 50,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 100, // Prostor za footer
  },
  card: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 20,
    padding: 20,
    shadowColor: '#ff6b6b',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  image: {
    width: '100%',
    height: 220,
    borderRadius: 15,
    marginBottom: 16,
    backgroundColor: '#eee',
  },
  placeholder: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    fontSize: 14,
    color: '#999',
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
    textAlign: 'center',
  },
  badgeContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginBottom: 20,
  },
  badge: {
    paddingVertical: 4,
    paddingHorizontal: 12,
    borderRadius: 15,
    marginRight: 8,
    marginBottom: 8,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: 'white',
  },
  detailsContainer: {
    gap: 12,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ff6b6b',
    flex: 1,
  },
  value: {
    fontSize: 15,
    color: '#333',
    flex: 1.5,
    textAlign: 'right',
    flexWrap: 'wrap',
  },
  priceValue: {
    fontWeight: 'bold',
    color: '#ff6b6b',
    fontSize: 16,
  },
  dateValue: {
    color: '#666',
    fontStyle: 'italic',
  },
  opisContainer: {
    borderWidth: 3,
    borderColor: '#ff6b6b',
    borderRadius: 12,
    padding: 15,
    marginBottom: 20,
    backgroundColor: '#fff',
  },
  opisText: {
    fontSize: 15,
    color: '#333',
    lineHeight: 22,
    textAlign: 'left',
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

export default ArtikalDetalji;