import React from 'react';
import { View, Text, StyleSheet, Animated, Dimensions } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import SpyGameButton from '../components/SpyGameButton';

const { width } = Dimensions.get('window');

const HomeScreen = ({ navigation }: { navigation: any }) => {
  const pulseAnim = new Animated.Value(1);

  React.useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.2, duration: 1200, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 1200, useNativeDriver: true }),
      ])
    ).start();
  }, []);

  return (
    <LinearGradient colors={['#010101', '#050505']} style={styles.container}>
      <Text style={styles.title}>SPY GAME</Text>

      <View style={styles.radarContainer}>
        <Animated.View style={[styles.radarCircle, { transform: [{ scale: pulseAnim }] }]} />
        <View style={styles.innerCircle} />
      </View>

      {/* Use the new component */}
      <SpyGameButton onPress={() => navigation.navigate('CreateSession')} />

      <Text style={styles.subtitle}>Tap to initiate</Text>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
     backgroundColor: 'rgba(0, 255, 200, 0.03)',
    alignItems: 'center',
    justifyContent: 'center',
  },

  title: {
    color: '#C7D0D9',
    fontSize: 42,
    fontWeight: '700',
    letterSpacing: 3,
    marginBottom: 60,
  },
  radarContainer: {
    width: width * 0.6,
    height: width * 0.6,
    borderRadius: width * 0.3,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 80,
  },
  radarCircle: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    borderRadius: width * 0.3,
    borderWidth: 2,
    borderColor: '#00FFCC33',
  },
  innerCircle: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#FF0000',
    shadowColor: '#FF0000',
    shadowOpacity: 0.8,
    shadowRadius: 12,
  },
  subtitle: {
    color: '#C7D0D9AA',
    marginTop: 8,
    fontSize: 16,
    letterSpacing: 1,
  },
});

export default HomeScreen;

