import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, ScrollView, Alert } from 'react-native';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import LinearGradient from 'react-native-linear-gradient';
import { RootStackParamList } from '../navigation/types';
import NeonButton from '../components/NeonButton';
import GameContainer from '../components/GameContainer';

type SummaryRouteProp = RouteProp<RootStackParamList, 'RoundSummary'>;
type SummaryNavProp = StackNavigationProp<RootStackParamList, 'RoundSummary'>;

const RoundSummaryScreen = () => {
  const route = useRoute<SummaryRouteProp>();
  const navigation = useNavigation<SummaryNavProp>();
  const { round, session } = route.params;

  const [votes, setVotes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchVotes = async () => {
      try {
        const res = await fetch(`https://spyback.onrender.com/api/votes/round/${round.id}`);
        if (!res.ok) throw new Error('Failed to fetch votes');
        const data = await res.json();
        setVotes(data);
      } catch (err) {
        console.error(err);
        Alert.alert('Error fetching votes');
      } finally {
        setLoading(false);
      }
    };

    fetchVotes();
  }, [round.id]);

  const startNextRound = async () => {
    try {
      const response = await fetch(
        `https://spyback.onrender.com/api/game/${session.id}/round`,
        { method: 'POST' }
      );
      if (!response.ok) throw new Error('Failed to start next round');
      const data = await response.json();
      navigation.navigate('RevealRole', { round: data, session, players: session.players });
    } catch (error) {
      console.error(error);
      Alert.alert('Error starting next round');
    }
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#00FFFF" />
      </View>
    );
  }

  const spyCaught = votes.some((v) => v.votedFor.id === round.spy.id);

  return (
    <LinearGradient colors={['#0f2027', '#203a43', '#2c5364']} style={{ flex: 1 }}>
      <ScrollView contentContainerStyle={styles.container}>
        <GameContainer>
          <Text style={styles.title}>🕵️ Round Summary</Text>

          <Text style={styles.info}>Question: {round.question.text}</Text>
          <Text style={styles.spy}>Spy: {round.spy.name}</Text>

          <Text style={[styles.result, { color: spyCaught ? '#00FF99' : '#FF4444' }]}>
            {spyCaught ? '✅ The Spy was caught!' : '😎 The Spy escaped!'}
          </Text>

          <Text style={styles.subtitle}>Votes:</Text>
          {votes.map((v) => (
            <Text key={v.id} style={styles.voteLine}>
              🗳️ {v.voter.name} voted for {v.votedFor.name}
            </Text>
          ))}

          <View style={{ marginTop: 30 }}>
            <NeonButton title="🚀 Start Next Round" onPress={startNextRound} />
          </View>
        </GameContainer>
      </ScrollView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    padding: 20,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#1a1a1a',
  },
  title: {
    color: '#00FFFF',
    fontSize: 26,
    fontWeight: 'bold',
    marginBottom: 15,
    textShadowColor: '#00FFFF',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 10,
  },
  info: {
    color: '#ccc',
    fontSize: 18,
    marginBottom: 10,
    textAlign: 'center',
  },
  spy: {
    color: '#ff6666',
    fontSize: 20,
    fontWeight: 'bold',
    marginVertical: 10,
  },
  result: {
    fontSize: 20,
    marginVertical: 20,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  subtitle: {
    color: '#fff',
    fontSize: 18,
    marginTop: 20,
  },
  voteLine: {
    color: '#aaa',
    fontSize: 16,
    marginVertical: 3,
  },
});

export default RoundSummaryScreen;
