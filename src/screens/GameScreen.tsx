import React, { useState } from 'react';
import { View, Text, ActivityIndicator, StyleSheet, Alert } from 'react-native';
import { RouteProp, useRoute, useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import LinearGradient from 'react-native-linear-gradient';
import { RootStackParamList } from '../navigation/types';
import NeonButton from '../components/NeonButton';
import GameContainer from '../components/GameContainer';

type GameScreenRouteProp = RouteProp<RootStackParamList, 'Game'>;
type GameScreenNavProp = StackNavigationProp<RootStackParamList, 'Game'>;

const GameScreen: React.FC = () => {
  const route = useRoute<GameScreenRouteProp>();
  const navigation = useNavigation<GameScreenNavProp>();
  const { session } = route.params;

  const [round, setRound] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);

  const startRound = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `https://spyback.onrender.com/api/game/${session.id}/round`,
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
    <LinearGradient colors={['#0f2027', '#203a43', '#2c5364']} style={styles.gradient}>
      <GameContainer>
        <Text style={styles.title}>🎮 Game Session</Text>
        <Text style={styles.sessionInfo}>Session ID: {session.id}</Text>

        <Text style={styles.subtitle}>👥 Players</Text>
        {session.players.map((p: any) => (
          <Text key={p.id} style={styles.playerName}>
            {p.name}
          </Text>
        ))}

        <View style={{ marginTop: 30 }}>
          <NeonButton
            title={loading ? 'Starting...' : '🚀 Start Round'}
            onPress={startRound}
          />
          {loading && <ActivityIndicator size="large" color="#00FFFF" style={{ marginTop: 15 }} />}
        </View>

        {round && (
          <View style={styles.roundContainer}>
            <Text style={styles.roundText}>Round #{round.roundNumber}</Text>
            <Text style={styles.questionText}>Question: {round.question.text}</Text>
            <Text style={styles.spyText}>Spy: {round.spy.name}</Text>
          </View>
        )}
      </GameContainer>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
  },
  title: {
    color: '#00FFFF',
    fontSize: 32,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 10,
    textShadowColor: '#00FFFF',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 12,
  },
  sessionInfo: {
    color: '#ccc',
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 15,
  },
  subtitle: {
    color: '#00FFFF',
    fontSize: 20,
    marginTop: 10,
    marginBottom: 10,
    fontWeight: '600',
    textAlign: 'center',
  },
  playerName: {
    color: '#fff',
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 4,
  },
  roundContainer: {
    marginTop: 40,
    backgroundColor: '#111',
    borderColor: '#00FFFF',
    borderWidth: 1,
    borderRadius: 12,
    padding: 20,
    width: '100%',
    shadowColor: '#00FFFF',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.9,
    shadowRadius: 10,
  },
  roundText: {
    color: '#00FFFF',
    fontSize: 22,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  questionText: {
    color: '#fff',
    fontSize: 18,
    marginTop: 10,
    textAlign: 'center',
  },
  spyText: {
    color: '#ff4d4d',
    fontSize: 18,
    marginTop: 10,
    textAlign: 'center',
    fontWeight: 'bold',
  },
});

export default GameScreen;
