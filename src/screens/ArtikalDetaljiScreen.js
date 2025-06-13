import React from 'react';
import { View, Text, Image, StyleSheet, ScrollView } from 'react-native';
import { useRoute } from '@react-navigation/native';

const ArtikalDetalji = () => {
  const route = useRoute();
  const { artikal } = route.params;

  const formatDate = (dateStr) => {
    if (!dateStr || typeof dateStr !== 'string') return null;
    const date = new Date(dateStr);
    return isNaN(date.getTime()) ? null : date.toLocaleDateString();
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {artikal.url_slike ? (
        <Image source={{ uri: artikal.url_slike }} style={styles.image} />
      ) : (
        <View style={[styles.image, styles.placeholder]}>
          <Text style={styles.placeholderText}>Nema slike</Text>
        </View>
      )}

      <Text style={styles.title}>{artikal.naziv}</Text>

      <Text style={styles.label}>Opis:</Text>
      <Text style={styles.text}>{artikal.opis || 'Opis nije dostupan.'}</Text>

      <Text style={styles.label}>Stanje:</Text>
      <Text style={styles.text}>{artikal.stanje}</Text>

      <Text style={styles.label}>Cijena:</Text>
      <Text style={styles.text}>{parseFloat(artikal.cijena || 0).toFixed(2)} EUR</Text>



      {/* Akcija */}
      {artikal.dat_od_akc && artikal.dat_do_akc && (
        <>
          <Text style={styles.label}>Akcija:</Text>
          <Text style={styles.text}>
            {formatDate(artikal.dat_od_akc)} do {formatDate(artikal.dat_do_akc)}
          </Text>
        </>
      )}

      {/* BF period */}
      {artikal.dat_od_bf && artikal.dat_do_bf && (
        <>
          <Text style={styles.label}>BF period:</Text>
          <Text style={styles.text}>
            {formatDate(artikal.dat_od_bf)} do {formatDate(artikal.dat_do_bf)}
          </Text>
        </>
      )}

      {/* Broj tačaka BF */}
      {artikal.broj_tacakabf != null && (
        <>
          <Text style={styles.label}>Broj tačaka BF:</Text>
          <Text style={styles.text}>{artikal.broj_tacakabf}</Text>
        </>
      )}

      {/* Preračun cijene */}
{artikal.preracun_cijene_jm && (
  <>
    <Text style={styles.label}>Preračun cijene JM:</Text>
    <Text style={styles.text}>{artikal.preracun_cijene_jm}</Text>
  </>
)}


    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: '#fff',
  },
  image: {
    width: '100%',
    height: 220,
    borderRadius: 12,
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
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  label: {
    fontSize: 16,
    marginTop: 12,
    fontWeight: '600',
    color: '#6a0dad',
  },
  text: {
    fontSize: 15,
    color: '#444',
    marginTop: 4,
  },
});

export default ArtikalDetalji;
