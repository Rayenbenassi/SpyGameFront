import React, { useState } from 'react';
import { View, Text, StyleSheet, Alert } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { useNavigation, useRoute } from '@react-navigation/native';
import NeonButton from '../components/NeonButton';
import { RootStackParamList } from '../navigation/types';
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/native';

type VoteRouteProp = RouteProp<RootStackParamList, 'Vote'>;
type NavProp = StackNavigationProp<RootStackParamList, 'Vote'>;

const VoteScreen = () => {
  const navigation = useNavigation<NavProp>();
  const route = useRoute<VoteRouteProp>();

  const { round, session } = route.params;
  const players = session.players;

  const [currentVoterIndex, setCurrentVoterIndex] = useState(0);
  const [loading, setLoading] = useState(false);
  const [votes, setVotes] = useState<{ voterId: number; votedForId: number }[]>([]);

  const currentVoter = players[currentVoterIndex];

  const submitVote = async (targetPlayer: any) => {
    try {
      setLoading(true);

      const response = await fetch(`https://spyback.onrender.com/api/votes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          roundId: round.id,
          voterId: currentVoter.id,
          votedForId: targetPlayer.id,
        }),
      });

      if (!response.ok) throw new Error('Vote submission failed');

      await response.json();

      setVotes((prev) => [
        ...prev,
        { voterId: currentVoter.id, votedForId: targetPlayer.id }
      ]);

      if (currentVoterIndex < players.length - 1) {
        setCurrentVoterIndex(currentVoterIndex + 1);
      } else {
        Alert.alert(
          'Voting Complete',
          'Proceed to round summary?',
          [
            {
              text: 'OK',
              onPress: () =>
                navigation.navigate('RoundSummary', { round, session }),
            },
          ]
        );
      }
    } catch (err) {
      console.error(err);
      Alert.alert('Error', 'Could not send vote');
    } finally {
      setLoading(false);
    }
  };

  return (
    <LinearGradient
      colors={['#000000', '#051021', '#002240']}
      style={styles.gradient}
    >
      <View style={styles.container}>
        <Text style={styles.title}>🔐 Voting Phase</Text>

        <Text style={styles.subtitle}>
          Current Voter:
          <Text style={styles.voterName}> {currentVoter.name}</Text>
        </Text>

        <Text style={styles.instructions}>
          Select the player you suspect is the spy:
        </Text>

        <View style={{ marginTop: 20, width: '100%' }}>
          {players.map((p: any) => {
            const alreadyVoted =
              votes.find((v) => v.voterId === currentVoter.id)?.votedForId === p.id;

            return (
              <View key={p.id} style={{ marginVertical: 8 }}>
                <NeonButton
                  title={
                    p.id === currentVoter.id
                      ? `${p.name} (Yourself)`
                      : alreadyVoted
                      ? `🗳️ ${p.name} (Voted)`
                      : p.name
                  }
                  disabled={loading || p.id === currentVoter.id}
                  color={alreadyVoted ? '#FF4444' : '#00FFFF'}
                  onPress={() => submitVote(p)}
                />
              </View>
            );
          })}
        </View>
      </View>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  gradient: { flex: 1 },
  container: {
    flex: 1,
    padding: 22,
    justifyContent: 'center',
  },
  title: {
    color: '#00FFFF',
    fontSize: 30,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 15,
    textShadowColor: '#00FFFF',
    textShadowRadius: 15,
  },
  subtitle: {
    color: '#fff',
    fontSize: 22,
    textAlign: 'center',
    marginBottom: 10,
  },
  voterName: {
    color: '#00FF88',
    fontWeight: 'bold',
  },
  instructions: {
    color: '#AAAAAA',
    fontSize: 16,
    textAlign: 'center',
    marginTop: 10,
  },
});

export default VoteScreen;
