import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import SpyGameButton from '../components/SpyGameButton';
import Radar from '../components/Radar';

const { width } = Dimensions.get('window');

const HomeScreen = ({ navigation }: { navigation: any }) => {
  return (
    <LinearGradient colors={['#010101', '#050505']} style={styles.container}>
      
      <Text style={styles.title}>SPY GAME</Text>

      {/* Modern Radar */}
      <View style={{ marginBottom: 80 }}>
        <Radar />
      </View>

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

  subtitle: {
    color: '#C7D0D9AA',
    marginTop: 8,
    fontSize: 16,
    letterSpacing: 1,
  },
});

export default HomeScreen;
