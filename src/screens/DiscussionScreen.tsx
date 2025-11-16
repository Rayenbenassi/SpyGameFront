import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { useNavigation, useRoute } from '@react-navigation/native';
import NeonButton from '../components/NeonButton';
import { RootStackParamList } from '../navigation/types';
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/native';

type DiscussionRouteProp = RouteProp<RootStackParamList, 'Discussion'>;
type NavProp = StackNavigationProp<RootStackParamList, 'Discussion'>;

const SPEAK_TIME = 20; // seconds per player

const DiscussionScreen = () => {
  const navigation = useNavigation<NavProp>();
  const route = useRoute<DiscussionRouteProp>();
  const { round, session } = route.params;

  const [currentIndex, setCurrentIndex] = useState(0);
  const [timer, setTimer] = useState(SPEAK_TIME);

  const players = session.players;
  const currentPlayer = players[currentIndex];
  

  // TIMER EFFECT
  useEffect(() => {
    if (timer === 0) {
      goToNextPlayer();
      return;
    }

    const interval = setInterval(() => {
      setTimer((t) => t - 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [timer]);

  const goToNextPlayer = () => {
    if (currentIndex < players.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setTimer(SPEAK_TIME);
    }
  };

  return (
    <LinearGradient
      colors={['#000000', '#0a0f1f', '#001f3f']}
      style={styles.gradient}
    >
      <View style={styles.container}>
        <Text style={styles.title}>🕵️‍♂️ Discussion Phase</Text>

        <Text style={styles.question}>
          QUESTION: {round.question.text}
        </Text>

        <View style={styles.playerBox}>
          <Text style={styles.playerLabel}>Speaking Now:</Text>
          <Text style={styles.playerName}>{currentPlayer.name}</Text>
        </View>

        <Text style={styles.timer}>{timer}s</Text>

        {currentIndex < players.length - 1 && (
          <NeonButton
            title="⏭ Skip to Next Player"
            onPress={goToNextPlayer}
            color="#00FF88"
          />
        )}

        {currentIndex === players.length - 1 && timer === 0 && (
          <View style={{ marginTop: 20 }}>
            <NeonButton
              title="🔐 Start Voting"
              color="#00FFFF"
              onPress={() =>
                navigation.navigate('Vote', { round, session })
              }
            />
          </View>
        )}
      </View>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  gradient: { flex: 1 },
  container: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
  },
  title: {
    color: '#00FFFF',
    fontSize: 30,
    textAlign: 'center',
    fontWeight: 'bold',
    textShadowColor: '#00FFFF',
    textShadowRadius: 15,
    marginBottom: 10,
  },
  question: {
    color: '#BBBBBB',
    fontSize: 18,
    textAlign: 'center',
    marginBottom: 30,
  },
  playerBox: {
    alignItems: 'center',
    marginBottom: 20,
  },
  playerLabel: {
    color: '#AAA',
    fontSize: 20,
  },
  playerName: {
    color: '#00FF88',
    fontSize: 28,
    fontWeight: 'bold',
    textShadowColor: '#00FF88',
    textShadowRadius: 15,
  },
  timer: {
    fontSize: 72,
    textAlign: 'center',
    color: '#FF3D3D',
    fontWeight: 'bold',
    marginBottom: 40,
    textShadowColor: '#FF0000',
    textShadowRadius: 20,
  },
});

export default DiscussionScreen;
