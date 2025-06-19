// Preloader.js
import React, { useEffect, useRef } from 'react';
import {
  View,
  Image,
  Animated,
  StyleSheet,
  Dimensions,
} from 'react-native';

const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get('window');
const PORUKA = 'Dobrodošli';
const RASPOREĐENJE_SLOVA = 3;

export default function Preloader({ onFinish }) {
  // Animacija za logo: početna Y pozicija i providnost
  const logoTranslate = useRef(new Animated.Value(SCREEN_H * 0.3)).current;
  const logoOpacity = useRef(new Animated.Value(0)).current;
  const logoScale = useRef(new Animated.Value(0.8)).current;

  // Niz Animated.Value za svako slovo poruke
  const letterAnims = useRef(
    PORUKA.split('').map(() => new Animated.Value(0))
  ).current;

  // Animacije za background elemente
  const bgOpacity = useRef(new Animated.Value(0)).current;
  const floatingAnim1 = useRef(new Animated.Value(0)).current;
  const floatingAnim2 = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Pokreni background animaciju odmah
    Animated.timing(bgOpacity, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true,
    }).start();

    // Floating elements animacija (beskonačno)
    Animated.loop(
      Animated.sequence([
        Animated.timing(floatingAnim1, {
          toValue: 1,
          duration: 3000,
          useNativeDriver: true,
        }),
        Animated.timing(floatingAnim1, {
          toValue: 0,
          duration: 3000,
          useNativeDriver: true,
        }),
      ])
    ).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(floatingAnim2, {
          toValue: 1,
          duration: 4000,
          useNativeDriver: true,
        }),
        Animated.timing(floatingAnim2, {
          toValue: 0,
          duration: 4000,
          useNativeDriver: true,
        }),
      ])
    ).start();

    // 1) Animiraj logo da "ispliva" odozdo i postane vidljiv
    setTimeout(() => {
      Animated.parallel([
        Animated.timing(logoTranslate, {
          toValue: 0,
          duration: 1200,
          useNativeDriver: true,
        }),
        Animated.timing(logoOpacity, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.spring(logoScale, {
          toValue: 1,
          friction: 6,
          tension: 100,
          useNativeDriver: true,
        }),
      ]).start(() => {
        // 2) Kada logo završi, animiraj slova jedan po jedan
        Animated.stagger(
          120, // vremenska razlika između pokretanja animacija pojedinačnih slova (ms)
          letterAnims.map(anim =>
            Animated.spring(anim, {
              toValue: 1,
              friction: 5,
              tension: 120,
              useNativeDriver: true,
            })
          )
        ).start(() => {
          // 3) Po završetku animacije slova, pozovi onFinish posle kratke pauze
          setTimeout(() => {
            if (onFinish) onFinish();
          }, 1000);
        });
      });
    }, 300);
  }, []);

  return (
    <View style={styles.container}>
      {/* Background sa curve elementima */}
      <Animated.View style={[styles.background, { opacity: bgOpacity }]}>
        <View style={styles.curveTop} />
        <View style={styles.curveMiddle} />
        <View style={styles.curveBottom} />
        <View style={styles.curveAccent1} />
        <View style={styles.curveAccent2} />
      </Animated.View>

      {/* Floating elements */}
      <Animated.View
        style={[
          styles.floatingElement1,
          {
            opacity: floatingAnim1.interpolate({
              inputRange: [0, 1],
              outputRange: [0.3, 0.8],
            }),
            transform: [
              {
                translateY: floatingAnim1.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0, -20],
                }),
              },
              {
                scale: floatingAnim1.interpolate({
                  inputRange: [0, 1],
                  outputRange: [1, 1.2],
                }),
              },
            ],
          },
        ]}
      />

      <Animated.View
        style={[
          styles.floatingElement2,
          {
            opacity: floatingAnim2.interpolate({
              inputRange: [0, 1],
              outputRange: [0.4, 0.9],
            }),
            transform: [
              {
                translateX: floatingAnim2.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0, 15],
                }),
              },
            ],
          },
        ]}
      />

      {/* Logo sa "izranjanjem" odozdo i spring efektom */}
      <Animated.View style={styles.logoContainer}>
        <Animated.Image
          source={require('../assets/logoBlipko.png')}
          style={[
            styles.logo,
            {
              opacity: logoOpacity,
              transform: [
                { translateY: logoTranslate },
                { scale: logoScale },
              ],
            },
          ]}
        />
        <View style={styles.logoGlow} />
      </Animated.View>

      {/* Kontejner za slova sa glassmorphism efektom */}
      <View style={styles.textContainer}>
        <View style={styles.textBackground} />
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
                      outputRange: [30, 0], // slovo "izranja" iz dole
                    }),
                  },
                  {
                    scale: letterAnims[i].interpolate({
                      inputRange: [0, 1],
                      outputRange: [0.8, 1], // dodaje "pop" efekat
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

      {/* Subtil loading indicator */}
      <Animated.View style={[styles.loadingContainer, { opacity: bgOpacity }]}>
        <View style={styles.loadingDots}>
          <Animated.View
            style={[
              styles.dot,
              {
                transform: [
                  {
                    scale: floatingAnim1.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0.8, 1.2],
                    }),
                  },
                ],
              },
            ]}
          />
          <Animated.View
            style={[
              styles.dot,
              {
                transform: [
                  {
                    scale: floatingAnim2.interpolate({
                      inputRange: [0, 1],
                      outputRange: [1.2, 0.8],
                    }),
                  },
                ],
              },
            ]}
          />
          <Animated.View
            style={[
              styles.dot,
              {
                transform: [
                  {
                    scale: floatingAnim1.interpolate({
                      inputRange: [0, 1],
                      outputRange: [1, 0.8],
                    }),
                  },
                ],
              },
            ]}
          />
        </View>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  background: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 1,
  },
  curveTop: {
    position: 'absolute',
    top: -SCREEN_H * 0.15,
    left: -SCREEN_W * 0.4,
    width: SCREEN_W * 1.8,
    height: SCREEN_H * 0.6,
    backgroundColor: '#ffffff',
    borderBottomRightRadius: SCREEN_W,
    borderBottomLeftRadius: SCREEN_W,
    transform: [{ rotate: '-5deg' }],
  },
  curveMiddle: {
    position: 'absolute',
    top: -SCREEN_H * 0.2,
    right: -SCREEN_W * 0.4,
    width: SCREEN_W * 1.4,
    height: SCREEN_W * 1.4,
    backgroundColor: '#ff8a80',
    borderRadius: SCREEN_W * 0.7,
    transform: [{ rotate: '-20deg' }],
    opacity: 0.8,
  },
  curveBottom: {
    position: 'absolute',
    top: SCREEN_H * 0.1,
    left: -SCREEN_W * 0.2,
    width: SCREEN_W * 1.3,
    height: SCREEN_W * 1.3,
    backgroundColor: '#ffab91',
    borderRadius: SCREEN_W * 0.65,
    transform: [{ rotate: '25deg' }],
    opacity: 0.6,
  },
  curveAccent1: {
    position: 'absolute',
    bottom: -50,
    right: -100,
    width: 200,
    height: 200,
    backgroundColor: '#ff6b6b',
    borderRadius: 100,
    opacity: 0.1,
  },
  curveAccent2: {
    position: 'absolute',
    bottom: -30,
    left: -80,
    width: 150,
    height: 150,
    backgroundColor: '#ff8a80',
    borderRadius: 75,
    opacity: 0.15,
  },
  floatingElement1: {
    position: 'absolute',
    top: SCREEN_H * 0.2,
    right: 40,
    width: 12,
    height: 12,
    backgroundColor: '#ff6b6b',
    borderRadius: 6,
    zIndex: 10,
  },
  floatingElement2: {
    position: 'absolute',
    top: SCREEN_H * 0.7,
    left: 60,
    width: 8,
    height: 8,
    backgroundColor: '#ffab91',
    borderRadius: 4,
    zIndex: 10,
  },
  logoContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 50,
    marginBottom: 40,
  },
  logo: {
    width: SCREEN_W * 0.6,
    height: SCREEN_W * 0.4,
    resizeMode: 'contain',
    borderRadius: 25,
    shadowColor: '#ff6b6b',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 15,
    elevation: 10,
  },
  logoGlow: {
    position: 'absolute',
    width: SCREEN_W * 0.65,
    height: SCREEN_W * 0.45,
    backgroundColor: 'rgba(255, 107, 107, 0.1)',
    borderRadius: 30,
    zIndex: -1,
  },
  textContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 30,
    paddingHorizontal: 20,
    paddingVertical: 15,
    zIndex: 50,
    position: 'relative',
  },
  textBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    backdropFilter: 'blur(10px)',
  },
  letter: {
    fontSize: 36,
    color: 'white',
    fontWeight: 'bold',
    marginHorizontal: RASPOREĐENJE_SLOVA,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
    letterSpacing: 1,
  },
  loadingContainer: {
    position: 'absolute',
    bottom: 80,
    alignItems: 'center',
    zIndex: 50,
  },
  loadingDots: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  dot: {
    width: 8,
    height: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    borderRadius: 4,
  },
});