import React, { useState } from 'react';
import { View, Text, StyleSheet, Alert } from 'react-native';
import { useRoute, useNavigation, RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import LinearGradient from 'react-native-linear-gradient';
import { RootStackParamList } from '../navigation/types';
import NeonButton from '../components/NeonButton';
import GameContainer from '../components/GameContainer';

type DiscussionRouteProp = RouteProp<RootStackParamList, 'Discussion'>;
type DiscussionNavProp = StackNavigationProp<RootStackParamList, 'Discussion'>;

const DiscussionScreen = () => {
  const route = useRoute<DiscussionRouteProp>();
  const navigation = useNavigation<DiscussionNavProp>();
  const { round, session } = route.params;

  const [votes, setVotes] = useState<{ voterId: number; votedForId: number }[]>([]);
  const [currentVoterIndex, setCurrentVoterIndex] = useState(0);
  const [loading, setLoading] = useState(false);

  const currentVoter = session.players[currentVoterIndex];

  const handleVote = async (votedFor: any) => {
    try {
      setLoading(true);

      const response = await fetch(`https://spyback.onrender.com/api/votes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          roundId: round.id,
          voterId: currentVoter.id,
          votedForId: votedFor.id,
        }),
      });

      if (!response.ok) throw new Error('Vote submission failed');
      await response.json();

      setVotes((prev) => [...prev, { voterId: currentVoter.id, votedForId: votedFor.id }]);

      if (currentVoterIndex < session.players.length - 1) {
        setCurrentVoterIndex(currentVoterIndex + 1);
      } else {
        Alert.alert('All votes submitted!', 'Proceed to summary?', [
          { text: 'OK', onPress: () => navigation.navigate('RoundSummary', { round, session }) },
        ]);
      }
    } catch (error) {
      console.error(error);
      Alert.alert('Error submitting vote');
    } finally {
      setLoading(false);
    }
  };

  const finishRound = async () => {
    try {
      const response = await fetch(
        `https://spyback.onrender.com/api/game/round/${round.id}/finish`,
        { method: 'POST' }
      );

      if (!response.ok) throw new Error('Failed to finish round');

      Alert.alert(
        `Round Over`,
        `🕵️ The spy was ${round.spy.name}!`,
        [{ text: 'OK', onPress: () => navigation.navigate('Game', { session }) }]
      );
    } catch (error) {
      console.error(error);
      Alert.alert('Error finishing round');
    }
  };

  return (
    <LinearGradient
      colors={['#0f2027', '#203a43', '#2c5364']}
      style={styles.gradient}
    >
      <GameContainer>
        <Text style={styles.title}>🕵️ Discussion Time</Text>
        <Text style={styles.question}>Question: {round.question.text}</Text>

        <Text style={styles.subtitle}>Now Voting: 
          <Text style={styles.voterName}> {currentVoter.name}</Text>
        </Text>

        {session.players.map((p: any) => {
          const alreadyVoted = votes.find(
            (v) => v.voterId === currentVoter.id && v.votedForId === p.id
          );
          const disabled = loading || p.id === currentVoter.id;

          return (
            <View key={p.id} style={{ marginVertical: 6 }}>
              <NeonButton
                title={
                  p.id === currentVoter.id
                    ? `${p.name} (You)`
                    : alreadyVoted
                    ? `🗳️ ${p.name} (Voted)`
                    : p.name
                }
                color={alreadyVoted ? '#FF4444' : '#00FFFF'}
                disabled={disabled}
                onPress={() => handleVote(p)}
              />
            </View>
          );
        })}

        {votes.length === session.players.length && (
          <View style={{ marginTop: 30 }}>
            <NeonButton title="✅ Finish Round" onPress={finishRound} />
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
    fontSize: 26,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 10,
    textShadowColor: '#00FFFF',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 10,
  },
  question: {
    color: '#ccc',
    fontSize: 18,
    textAlign: 'center',
    marginBottom: 20,
  },
  subtitle: {
    color: '#fff',
    fontSize: 20,
    marginVertical: 10,
    textAlign: 'center',
  },
  voterName: {
    color: '#00FFFF',
    fontWeight: 'bold',
  },
});

export default DiscussionScreen;
