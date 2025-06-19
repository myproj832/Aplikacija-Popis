import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  Animated,
  StyleSheet,
  Alert,
  Dimensions,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
  TouchableWithoutFeedback,
} from 'react-native';
import { useNavigation, CommonActions } from '@react-navigation/native';
import { login } from '../services/api';

const { width: W, height: H } = Dimensions.get('window');

const LoginScreen = () => {
  const [user, setUser] = useState('');
  const [pass, setPass] = useState('');
  const [loading, setLoading] = useState(false);
  const [keyboardVisible, setKeyboardVisible] = useState(false);

  const navigation = useNavigation();
  const fade = useState(new Animated.Value(0))[0];
  const slideUp = useState(new Animated.Value(50))[0];

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fade, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(slideUp, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  useEffect(() => {
    const showSub = Keyboard.addListener('keyboardDidShow', () =>
      setKeyboardVisible(true)
    );
    const hideSub = Keyboard.addListener('keyboardDidHide', () =>
      setKeyboardVisible(false)
    );
    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);

  const handleLogin = async () => {
    if (!user || !pass) {
      Alert.alert('Greška', 'Unesite korisničko ime i lozinku.');
      return;
    }

    setLoading(true);
    try {
      const data = await login(user, pass);
      console.log('data login', data);
      navigation.dispatch(
        CommonActions.reset({
          index: 0,
          routes: [{ name: 'Meni', params: { korisnik: data.ime, id: data.id } }],
        })
      );
    } catch (err) {
      Alert.alert('Greška', err.message || 'Neuspješna prijava.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <View style={styles.container}>
        {/* Background curves */}
        <View style={styles.background}>
          <View style={styles.curveTop} />
          <View style={styles.curveMiddle} />
          <View style={styles.curveBottom} />
          <View style={styles.curveAccent1} />
          <View style={styles.curveAccent2} />
        </View>

        {/* Logo */}
        <View style={styles.logoContainer}>
          <Image
            source={require('../assets/LogoCosmetics.png')}
            style={styles.logo}
            resizeMode="contain"
          />
        </View>

        {/* Login Form with Keyboard Avoid */}
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={{ flex: 1 }}
        >
          <Animated.View
            style={[styles.formContainer, { transform: [{ translateY: slideUp }] }]}
          >
            <View style={styles.form}>
              <View style={styles.inputContainer}>
                <View style={styles.inputWrapper}>
                  <TextInput
                    placeholder="Korisničko ime"
                    placeholderTextColor="#999"
                    style={styles.input}
                    value={user}
                    onChangeText={setUser}
                    autoCapitalize="none"
                  />
                </View>
              </View>

              <View style={styles.inputContainer}>
                <View style={styles.inputWrapper}>
                  <TextInput
                    placeholder="Lozinka"
                    placeholderTextColor="#999"
                    secureTextEntry
                    style={styles.input}
                    value={pass}
                    onChangeText={setPass}
                  />
                </View>
              </View>

              <TouchableOpacity
                style={[styles.loginButton, loading && styles.loginButtonDisabled]}
                onPress={handleLogin}
                disabled={loading}
              >
                <Text style={styles.loginText}>
                  {loading ? 'Prijavljivanje...' : 'PRIJAVITE SE'}
                </Text>
              </TouchableOpacity>
            </View>
          </Animated.View>
        </KeyboardAvoidingView>

        {/* Footer - samo ako tastatura nije vidljiva */}
        {!keyboardVisible && (
          <View style={styles.footer}>
            <Text style={styles.poweredByText}>Powered by</Text>
            <Image
              source={require('../assets/logoBlipko.png')}
              style={styles.footerLogo}
              resizeMode="contain"
            />
          </View>
        )}

        {/* Floating particles */}
        <View style={styles.floatingElement1} />
        <View style={styles.floatingElement2} />
        <View style={styles.floatingElement3} />
      </View>
    </TouchableWithoutFeedback>
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
    top: H * 0.15,
    right: 30,
    width: 8,
    height: 8,
    backgroundColor: '#ff6b6b',
    borderRadius: 4,
    opacity: 0.6,
    zIndex: 10,
  },
  floatingElement2: {
    position: 'absolute',
    top: H * 0.25,
    left: 50,
    width: 12,
    height: 12,
    backgroundColor: '#ffab91',
    borderRadius: 6,
    opacity: 0.5,
    zIndex: 10,
  },
  floatingElement3: {
    position: 'absolute',
    top: H * 0.35,
    right: 80,
    width: 6,
    height: 6,
    backgroundColor: '#ff8a80',
    borderRadius: 3,
    opacity: 0.7,
    zIndex: 10,
  },
  logoContainer: {
    alignItems: 'center',
    marginTop: H * 0.08,
    zIndex: 50,
  },
  logo: {
    width: W * 0.8,
    height: 300,
  },
  formContainer: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 30,
    zIndex: 50,
  },
  form: {
    backgroundColor: 'white',
    padding: 35,
    borderRadius: 30,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    shadowColor: '#ff6b6b',
    shadowOffset: { width: 0, height: 15 },
    shadowOpacity: 0.4,
    shadowRadius: 25,
    elevation: 15,
    overflow: 'hidden',
    marginTop: -170,
  },
  inputContainer: {
    marginBottom: 20,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 20,
    paddingHorizontal: 20,
    borderWidth: 2,
    borderColor: 'rgba(255, 107, 107, 0.3)',
    shadowColor: 'rgba(255, 107, 107, 0.5)',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  input: {
    flex: 1,
    paddingVertical: 18,
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
  loginButton: {
    backgroundColor: '#ff6b6b',
    paddingVertical: 18,
    borderRadius: 25,
    alignItems: 'center',
    marginTop: 15,
    shadowColor: '#ff6b6b',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.5,
    shadowRadius: 15,
    elevation: 10,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  loginButtonDisabled: {
    backgroundColor: '#ffab91',
    opacity: 0.7,
  },
  loginText: {
    color: '#fff',
    fontSize: 17,
    fontWeight: 'bold',
    letterSpacing: 1.5,
    textShadowColor: 'rgba(0, 0, 0, 0.2)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  footer: {
    position: 'absolute',
    bottom: 40,
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 50,
  },
  poweredByText: {
    fontSize: 12,
    color: 'white',
    marginBottom: 8,
    opacity: 0.8,
  },
  footerLogo: {
    width: W * 0.25,
    height: 35,
  },
});

export default LoginScreen;
