import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  ActivityIndicator,
  StyleSheet,
  Alert,
  FlatList,
  Animated,
  Easing,
  Image,
} from 'react-native';
import { RouteProp, useRoute, useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import LinearGradient from 'react-native-linear-gradient';
import { RootStackParamList } from '../navigation/types';

import NeonButton from '../components/NeonButton';
import GameContainer from '../components/GameContainer';

import { playBackgroundMusic, stopBackgroundMusic } from '../utils/BackgroundMusic';

type GameScreenRouteProp = RouteProp<RootStackParamList, 'Game'>;
type GameScreenNavProp = StackNavigationProp<RootStackParamList, 'Game'>;

const GameScreen: React.FC = () => {
  const route = useRoute<GameScreenRouteProp>();
  const navigation = useNavigation<GameScreenNavProp>();
  const { session } = route.params;

  const [loading, setLoading] = useState(false);
  const [round, setRound] = useState<any | null>(null);

  const pulseAnim = useRef(new Animated.Value(1)).current;


  // Fingerprint animation
  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.2,
          duration: 1200,
          easing: Easing.ease,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1200,
          easing: Easing.ease,
          useNativeDriver: true,
        }),
      ])
    );
    animation.start();
    return () => animation.stop();
  }, [pulseAnim]);

  const startRound = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        `http://192.168.100.37:8080/api/game/${session.id}/round`,
        { method: 'POST' }
      );

      if (!response.ok) throw new Error('Failed to start new round');
      const data = await response.json();

      setRound(data);
      navigation.navigate('RevealRole', {
        round: data,
        players: session.players,
        session,
      });

    } catch (error) {
      console.error('Error starting round:', error);
      Alert.alert('Error', 'Could not start the round. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <LinearGradient colors={['#000000', '#041016', '#050A0C']} style={styles.gradient}>
      <View style={styles.overlay} />

      <Text style={styles.header}>SPY GAME</Text>
      <Text style={styles.timer}>MISSION ACTIVE</Text>

      <Animated.View style={[styles.fingerprintContainer, { transform: [{ scale: pulseAnim }] }]}>
        <Image
          source={require('../assets/fingerprint.png')}
          style={styles.fingerprint}
          resizeMode="contain"
        />
      </Animated.View>

      <Text style={styles.signalText}>SIGNAL VERIFIED</Text>

      <GameContainer>
        <Text style={styles.subtitle}>ACTIVE AGENTS</Text>

        <FlatList
          data={session.players}
          keyExtractor={(p) => p.id.toString()}
          renderItem={({ item }) => (
            <View style={styles.playerRow}>
              <Image
                source={require('../assets/spyicon.png')}
                style={styles.spyicon}
                resizeMode="contain"
              />
              <Text style={styles.playerName}>{item.name}</Text>
            </View>
          )}
        />

        <View style={{ marginTop: 30 }}>
          <NeonButton
            title={loading ? 'Deploying...' : 'Initiate Round'}
            onPress={startRound}
          />
          {loading && <ActivityIndicator size="large" color="#00FFFF" style={{ marginTop: 15 }} />}
        </View>

      </GameContainer>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  spyicon: {
    width: 24,
    height: 24,
    tintColor: '#00FFF0',
    opacity: 0.8,
  },
  playerRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  gradient: {
    flex: 1,
    paddingHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,255,255,0.02)',
  },
  header: {
    color: '#C7D0D9',
    fontSize: 42,
    fontWeight: '700',
    letterSpacing: 3,
    marginTop: 40,
  },
  timer: {
    color: '#FF4040',
    fontSize: 16,
    letterSpacing: 2,
    marginBottom: 15,
  },
  fingerprintContainer: {
    width: 180,
    height: 180,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  fingerprint: {
    width: '100%',
    height: '100%',
    tintColor: '#00FFF0',
    opacity: 0.8,
  },
  signalText: {
    color: '#00FFF0',
    fontSize: 18,
    letterSpacing: 2,
    marginBottom: 10,
  },
  subtitle: {
    color: '#00FFFF',
    fontSize: 20,
    fontWeight: '600',
    textAlign: 'center',
    marginVertical: 10,
  },
  playerName: {
    color: '#FFFFFF',
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 4,
  },
});

export default GameScreen;
