import React, { useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../navigation/types';
import LinearGradient from 'react-native-linear-gradient';
import NeonButton from '../components/NeonButton';

type RevealRoleScreenRouteProp = RouteProp<RootStackParamList, 'RevealRole'>;
type RevealRoleScreenNavProp = StackNavigationProp<RootStackParamList, 'RevealRole'>;

const RevealRoleScreen: React.FC = () => {
  const route = useRoute<RevealRoleScreenRouteProp>();
  const navigation = useNavigation<RevealRoleScreenNavProp>();
  const { round, players, session } = route.params;

  const [currentIndex, setCurrentIndex] = useState(0);
  const [revealed, setRevealed] = useState(false);

  const currentPlayer = players[currentIndex];
  const isSpy = currentPlayer.name === round.spy.name;

  const handleReveal = () => setRevealed(true);

  const handleNext = () => {
    setRevealed(false);
    if (currentIndex < players.length - 1) {
      setTimeout(() => setCurrentIndex(currentIndex + 1), 300);
    } else {
      // ✅ After last player, go to discussion
      navigation.navigate('Discussion', { round, session });
    }
  };

  return (
    <LinearGradient colors={['#0f0c29', '#302b63', '#24243e']} style={styles.container}>
      {!revealed ? (
        <>
          <Text style={styles.prompt}>Pass the phone to:</Text>
          <Text style={styles.playerName}>{currentPlayer.name}</Text>
          <NeonButton title="Reveal My Role" onPress={handleReveal} color="#00BFFF" />
        </>
      ) : (
        <>
          {isSpy ? (
            <View style={styles.roleContainer}>
              <Text style={styles.spyText}>🕵️ You are the SPY!</Text>
              <Text style={styles.question}>
                Question: {round.question.altText || 'Try to blend in!'}
              </Text>
            </View>
          ) : (
            <View style={styles.roleContainer}>
              <Text style={styles.normalText}>You are NOT the spy</Text>
              <Text style={styles.question}>Question: {round.question.text}</Text>
            </View>
          )}
          <NeonButton
            title={currentIndex < players.length - 1 ? 'Next Player' : 'Start Discussion'}
            onPress={handleNext}
            color={isSpy ? '#FF4444' : '#00FF7F'}
          />
        </>
      )}
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  prompt: {
    color: '#fff',
    fontSize: 22,
    marginBottom: 10,
  },
  playerName: {
    color: '#00BFFF',
    fontSize: 30,
    fontWeight: 'bold',
    marginBottom: 30,
  },
  roleContainer: {
    alignItems: 'center',
    marginBottom: 30,
  },
  spyText: {
    color: '#FF4444',
    fontSize: 28,
    fontWeight: 'bold',
  },
  normalText: {
    color: '#00FF7F',
    fontSize: 26,
    fontWeight: 'bold',
  },
  question: {
    color: '#ccc',
    fontSize: 18,
    marginTop: 15,
    textAlign: 'center',
    maxWidth: 300,
  },
});

export default RevealRoleScreen;
