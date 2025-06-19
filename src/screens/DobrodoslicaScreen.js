import React, { useEffect, useRef } from 'react';
import {
  View,
  Animated,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';

const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get('window');
const PORUKA = 'Dobrodošli';
const RAZMAK = 2;

const DobrodoslicaScreen = () => {
  const navigation = useNavigation();

  const logoTranslate = useRef(new Animated.Value(SCREEN_H)).current;
  const logoOpacity   = useRef(new Animated.Value(0)).current;
  const letterAnims = useRef(PORUKA.split('').map(() => new Animated.Value(0))).current;

  useEffect(() => {
    // 1. Animacija za logo
    Animated.parallel([
      Animated.timing(logoTranslate, {
        toValue: 0,
        duration: 1100,
        useNativeDriver: true,
      }),
      Animated.timing(logoOpacity, {
        toValue: 1,
        duration: 900,
        useNativeDriver: true,
      }),
    ]).start(() => {
      // 2. Animacija slova
      Animated.stagger(
        150,
        letterAnims.map(anim =>
          Animated.timing(anim, {
            toValue: 1,
            duration: 400,
            useNativeDriver: true,
          })
        )
      ).start(() => {
        setTimeout(() => {
          navigation.replace('Login');
        }, 800);
      });
    });
  }, []);

  return (
    <View style={styles.container}>
      <Animated.Image
        source={require('../assets/logoBlipko2.jpg')}
        style={[
          styles.logo,
          {
            opacity: logoOpacity,
            transform: [{ translateY: logoTranslate }],
          },
        ]}
      />
      <View style={styles.textContainer}>
        {PORUKA.split('').map((slovo, i) => (
          <Animated.Text
            key={i}
            style={[
              styles.letter,
              {
                opacity: letterAnims[i],
                transform: [
                  {
                    translateY: letterAnims[i].interpolate({
                      inputRange: [0, 1],
                      outputRange: [20, 0],
                    }),
                  },
                ],
              },
            ]}
          >
            {slovo}
          </Animated.Text>
        ))}
      </View>
    </View>
  );
};

export default DobrodoslicaScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9f5ee',
    justifyContent: 'center',
    alignItems: 'center',
  },
  logo: {
    width: SCREEN_W,
    height: SCREEN_W * 0.6,
    resizeMode: 'contain',
    marginBottom: 20,
    borderRadius: 20,
  },
  textContainer: {
    flexDirection: 'row',
    marginTop: 20,
  },
  letter: {
    fontSize: 34,
    color: '#333',
    fontWeight: '600',
    marginHorizontal: RAZMAK,
  },
});
