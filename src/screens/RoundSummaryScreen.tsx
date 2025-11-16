import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
  Alert,
  Animated,
} from 'react-native';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import LinearGradient from 'react-native-linear-gradient';
import { RootStackParamList } from '../navigation/types';
import NeonButton from '../components/NeonButton';

type SummaryRouteProp = RouteProp<RootStackParamList, 'RoundSummary'>;
type SummaryNavProp = StackNavigationProp<RootStackParamList, 'RoundSummary'>;

const RoundSummaryScreen = () => {
  const route = useRoute<SummaryRouteProp>();
  const navigation = useNavigation<SummaryNavProp>();
  const { round, session } = route.params;

  const [votes, setVotes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fadeAnim = useRef(new Animated.Value(0)).current;


  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 700,
      useNativeDriver: true,
    }).start();
  }, []);

  useEffect(() => {
    const fetchVotes = async () => {
      try {
        console.log("🔍 Fetching votes for round:", round.id);

        const res = await fetch(
          `https://spyback.onrender.com/api/votes/round/${round.id}`
        );

        if (!res.ok) {
          setError("Server returned error status");
          throw new Error("Bad response");
        }

        const data = await res.json();
        console.log("📥 Votes received:", data);

        if (!Array.isArray(data)) {
          setError("Backend returned invalid format");
          console.log("❌ INVALID DATA:", data);
        } else {
          setVotes(data);
        }
      } catch (err) {
        console.log("❌ Fetch error:", err);
        setError("Could not load votes");
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

      const data = await response.json();
      navigation.navigate('RevealRole', {
        round: data,
        session,
        players: session.players,
      });
    } catch {
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

  // If an error occured → show message
  if (error) {
    return (
      <LinearGradient
        colors={['#0a0f13', '#0f1c24', '#112b36']}
        style={styles.center}
      >
        <Text style={{ color: "red", fontSize: 20, marginBottom: 20 }}>
          ⚠ {error}
        </Text>

        <NeonButton title="Retry" onPress={() => { setLoading(true); setError(null); }} />
      </LinearGradient>
    );
  }

  // If votes empty → display info
  if (votes.length === 0) {
    return (
      <LinearGradient
        colors={['#0a0f13', '#0f1c24', '#112b36']}
        style={styles.center}
      >
        <Text style={{ color: "#00FFFF", fontSize: 22 }}>
          No votes were found for this round.
        </Text>
      </LinearGradient>
    );
  }

  // --- COUNT VOTES SAFELY ---
  const voteCount: Record<number, number> = {};
  votes.forEach((v) => {
    if (!v.votedFor) return; // protect against null backend data
    const id = v.votedFor.id;
    voteCount[id] = (voteCount[id] || 0) + 1;
  });

  const maxVotes = Math.max(...Object.values(voteCount));
  const topPlayers = Object.keys(voteCount)
    .filter((id) => voteCount[Number(id)] === maxVotes)
    .map(Number);

  const spyCaught =
    topPlayers.length === 1 && topPlayers[0] === round.spy.id;

  return (
    <LinearGradient
      colors={['#0a0f13', '#0f1c24', '#112b36']}
      style={{ flex: 1 }}
    >
      <ScrollView contentContainerStyle={styles.container}>
        <Animated.View style={{ opacity: fadeAnim, width: '100%' }}>
          <LinearGradient
            colors={[
              'rgba(255,255,255,0.10)',
              'rgba(255,255,255,0.04)',
              'rgba(255,255,255,0.02)',
            ]}
            style={styles.glassWrapper}
          >
            <View style={styles.innerContent}>
              <Text style={styles.title}>🕵️ ROUND SUMMARY</Text>

              <Text style={styles.label}>QUESTION</Text>
              <Text style={styles.info}>{round.question.text}</Text>

              <Text style={styles.label}>SPY</Text>
              <Text style={styles.spy}>{round.spy.name}</Text>

              <Text
                style={[
                  styles.result,
                  { color: spyCaught ? '#00FF99' : '#FF5757' },
                ]}
              >
                {spyCaught ? '✔️ THE SPY WAS CAUGHT' : '😎 THE SPY ESCAPED'}
              </Text>

              <Text style={styles.label}>VOTES</Text>

              <View style={styles.voteBox}>
                {votes.map((v) => (
                  <Text key={v.id} style={styles.voteLine}>
                    <Text style={{ color: '#00FFFF' }}>
                      🗳 {v.voter?.name ?? "Unknown"}
                    </Text>
                    <Text style={{ color: '#aaa' }}> → </Text>
                    {v.votedFor?.name ?? "Unknown"}
                  </Text>
                ))}
              </View>

              <View style={{ marginTop: 40 }}>
                <NeonButton
                  title="🚀 START NEXT ROUND"
                  onPress={startNextRound}
                />
              </View>
            </View>
          </LinearGradient>
        </Animated.View>
      </ScrollView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    padding: 25,
  },

  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#0d0d0d',
  },

  glassWrapper: {
    width: '100%',
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
    marginBottom: 30,
  },

  innerContent: {
    padding: 25,
  },

  title: {
    color: '#00FFFF',
    fontSize: 28,
    fontWeight: '900',
    marginBottom: 20,
    textAlign: 'center',
    letterSpacing: 2,
  },

  label: {
    color: '#8eeeff',
    fontSize: 14,
    marginTop: 20,
    fontWeight: '700',
  },

  info: {
    color: '#e5e5e5',
    fontSize: 18,
    marginTop: 4,
  },

  spy: {
    color: '#FF5757',
    fontSize: 20,
    fontWeight: 'bold',
  },

  result: {
    marginTop: 25,
    fontSize: 22,
    fontWeight: 'bold',
    textAlign: 'center',
  },

  voteBox: {
    marginTop: 15,
    backgroundColor: 'rgba(255,255,255,0.06)',
    padding: 15,
    borderRadius: 15,
  },

  voteLine: {
    fontSize: 16,
    color: '#fff',
    marginVertical: 4,
  },
});

export default RoundSummaryScreen;
