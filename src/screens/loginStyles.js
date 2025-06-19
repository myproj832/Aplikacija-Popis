import { StyleSheet, Dimensions } from 'react-native';

const { width, height } = Dimensions.get('window');

export default StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    position: 'relative',
  },
  topShape: {
    position: 'absolute',
    top: -height * 0.25,
    left: -width * 0.5,
    width: width * 2,
    height: height * 0.6,
    backgroundColor: '#f7797d',
    borderBottomLeftRadius: width,
    borderBottomRightRadius: width,
    transform: [{ scaleX: 1.3 }],
    zIndex: -1,
  },
  inner: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: height * 0.25,
  },
  logo: {
    width: 220,   // uvećano
    height: 110,
    resizeMode: 'contain',
    marginBottom: 40,
  },
  inputContainer: {
    width: '100%',
    marginBottom: 16,
  },
  input: {
    borderBottomWidth: 1,
    borderBottomColor: '#b45fc9',
    fontSize: 16,
    color: '#333',
    paddingVertical: 10,
  },
  button: {
    width: '100%',
    backgroundColor: '#f77062',
    paddingVertical: 14,
    borderRadius: 30,
    alignItems: 'center',
    marginTop: 24,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  footer: {
    alignItems: 'center',
    justifyContent: 'flex-end',
    paddingBottom: 20,
  },
  footerLogo: {
    width: 120,
    height: 60,
    resizeMode: 'contain',
  },
});
