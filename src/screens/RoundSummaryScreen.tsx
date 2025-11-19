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
import { gameAPI } from '../services/gameAPI';

type SummaryRouteProp = RouteProp<RootStackParamList, 'RoundSummary'>;
type SummaryNavProp = StackNavigationProp<RootStackParamList, 'RoundSummary'>;

const RoundSummaryScreen = () => {
  const route = useRoute<SummaryRouteProp>();
  const navigation = useNavigation<SummaryNavProp>();
  const { round, session } = route.params;

  const [votes, setVotes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentSession, setCurrentSession] = useState(session);
  const [startingNextRound, setStartingNextRound] = useState(false);

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
          `http://192.168.100.37:8080/api/votes/round/${round.id}`
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
    refreshSessionStatus();
  }, [round.id]);

  const refreshSessionStatus = async () => {
    try {
      console.log('🔄 Refreshing session status for ID:', session.id);
      const updatedSession = await gameAPI.getSessionStatus(session.id);
      console.log('✅ Updated session:', {
        id: updatedSession.id,
        currentRound: updatedSession.currentRound,
        numberOfRounds: updatedSession.numberOfRounds,
        finished: updatedSession.finished
      });
      setCurrentSession(updatedSession);
    } catch (error) {
      console.error('Failed to refresh session status:', error);
    }
  };

const isGameCompleted = () => {
  console.log('🎯 Checking if game completed:', {
    currentRound: currentSession.currentRound,
    numberOfRounds: currentSession.numberOfRounds,
    finished: currentSession.finished
  });
  
  // FIXED LOGIC: 
  // currentRound represents the number of rounds COMPLETED
  // So if currentRound (completed rounds) equals numberOfRounds (total rounds), game is done
  // OR if the session is explicitly marked as finished
  const completed = 
    currentSession.currentRound >= currentSession.numberOfRounds ||
    currentSession.finished;
  
  console.log('🎯 Game completed?', completed);
  return completed;
};

const startNextRound = async () => {
  try {
    setStartingNextRound(true);
    
    // Double check if game is completed
    await refreshSessionStatus();
    
    console.log('🎯 PRE-NEXTROUND CHECK:', {
      isGameCompleted: isGameCompleted(),
      currentRound: currentSession.currentRound,
      numberOfRounds: currentSession.numberOfRounds,
      shouldStartNext: !isGameCompleted()
    });
    
    if (isGameCompleted()) {
      console.log('🏆 Game completed, navigating to GameCompleted');
      navigation.navigate('GameCompleted', { session: currentSession });
      return;
    }

    console.log(' Calling nextRound API:', {
      sessionId: session.id,
      currentRoundId: round.id
    });

    // Use the nextRound API endpoint
    const nextRound = await gameAPI.nextRound(session.id, round.id);
    
    console.log('✅ Next round API response:', {
      nextRoundId: nextRound.id,
      nextRoundNumber: nextRound.roundNumber,
      nextRoundSpy: nextRound.spy?.name,
      nextRoundQuestion: nextRound.question?.text
    });

    // Refresh session to get updated round count
    await refreshSessionStatus();
    
    console.log('🔄 After refresh - Navigation state:', {
      currentSessionRounds: currentSession.currentRound,
      isGameCompletedNow: isGameCompleted(),
      navigatingTo: 'RevealRole'
    });
    
    navigation.navigate('RevealRole', {
      round: nextRound,
      session: currentSession,
      players: currentSession.players,
    });
    
  } catch (error: any) {
    console.error('❌ Error starting next round:', error);
    Alert.alert(
      'Error', 
      error.message || 'Failed to start next round. Please try again.'
    );
  } finally {
    setStartingNextRound(false);
  }
};

  const finishGame = () => {
    console.log('🎊 Finishing game, navigating to GameCompleted');
    navigation.navigate('GameCompleted', { session: currentSession });
  };

const viewFinalResults = () => {
  console.log('📊 FORCE NAVIGATION TO GAME COMPLETED');
  
  // Force a fresh session check right before navigation
  refreshSessionStatus().then(() => {
    // Small delay to ensure state is updated
    setTimeout(() => {
      console.log('📊 Navigating with confirmed state:', {
        currentRound: currentSession.currentRound,
        numberOfRounds: currentSession.numberOfRounds
      });
      navigation.reset({
        index: 0,
        routes: [{ name: 'GameCompleted', params: { session: currentSession } }],
      });
    }, 100);
  });
};

  if (loading) {
    return (
      <LinearGradient
        colors={['#0a0f13', '#0f1c24', '#112b36']}
        style={styles.center}
      >
        <ActivityIndicator size="large" color="#00FFFF" />
        <Text style={styles.loadingText}>Analyzing mission data...</Text>
      </LinearGradient>
    );
  }

  if (error) {
    return (
      <LinearGradient
        colors={['#0a0f13', '#0f1c24', '#112b36']}
        style={styles.center}
      >
        <Text style={styles.errorTitle}>⚠️ INTELLIGENCE FAILURE</Text>
        <Text style={styles.errorText}>{error}</Text>
        <NeonButton 
          title="🔄 RETRY TRANSMISSION" 
          onPress={() => { setLoading(true); setError(null); }} 
          color="#00FFFF"
        />
      </LinearGradient>
    );
  }

  if (votes.length === 0) {
    return (
      <LinearGradient
        colors={['#0a0f13', '#0f1c24', '#112b36']}
        style={styles.center}
      >
        <Text style={styles.noVotesTitle}> NO VOTES RECORDED</Text>
        <Text style={styles.noVotesText}>
          No voting intelligence was gathered for this operation.
        </Text>
      </LinearGradient>
    );
  }

  // Count votes safely
  const voteCount: Record<number, number> = {};
  votes.forEach((v) => {
    if (!v.votedFor) return;
    const id = v.votedFor.id;
    voteCount[id] = (voteCount[id] || 0) + 1;
  });

  const maxVotes = Math.max(...Object.values(voteCount));
  const topPlayers = Object.keys(voteCount)
    .filter((id) => voteCount[Number(id)] === maxVotes)
    .map(Number);

  const spyCaught = topPlayers.length === 1 && topPlayers[0] === round.spy.id;
  const isLastRound = isGameCompleted();

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
              <Text style={styles.title}>👤 MISSION DEBRIEF</Text>

              {/* Round Progress */}
              <View style={styles.roundProgress}>
                <Text style={styles.roundProgressText}>
                  PHASE {currentSession.currentRound} OF {currentSession.numberOfRounds}
                </Text>
                {isLastRound && (
                  <Text style={styles.finalRoundText}>🎯 FINAL PHASE COMPLETE</Text>
                )}
              </View>

              <Text style={styles.label}>OPERATION QUESTION</Text>
              <Text style={styles.info}>{round.question.text}</Text>

              <Text style={styles.label}>UNDERCOVER OPERATIVE</Text>
              <Text style={styles.spy}>{round.spy.name}</Text>

              <Text
                style={[
                  styles.result,
                  { color: spyCaught ? '#00FF99' : '#FF5757' },
                ]}
              >
                {spyCaught ? '✅ OPERATIVE COMPROMISED' : '🎭 OPERATIVE ESCAPED'}
              </Text>

              <Text style={styles.label}>VOTE INTELLIGENCE</Text>

              <View style={styles.voteBox}>
                {votes.map((v) => (
                  <Text key={v.id} style={styles.voteLine}>
                    <Text style={{ color: '#00FFFF' }}>
                      🗳 {v.voter?.name ?? "Unknown Agent"}
                    </Text>
                    <Text style={{ color: '#aaa' }}> → </Text>
                    {v.votedFor?.name ?? "Unknown Target"}
                  </Text>
                ))}
              </View>

              <View style={styles.actionSection}>
                {isLastRound ? (
                  <>
                    <NeonButton
                      title="🏆 VIEW FINAL INTELLIGENCE"
                      onPress={viewFinalResults}
                      color="#FFD700"
                      size="large"
                    />
                    <Text style={styles.finalRoundNote}>
                      Mission accomplished. All phases complete.
                    </Text>
                  </>
                ) : (
                  <>
                    <NeonButton
                      title={
                        startingNextRound 
                          ? "🔄 INITIATING NEXT PHASE..." 
                          : ` LAUNCH PHASE ${currentSession.currentRound + 1}`
                      }
                      onPress={startNextRound}
                      disabled={startingNextRound}
                      color="#00FF88"
                      size="large"
                    />
                    {startingNextRound && (
                      <ActivityIndicator size="small" color="#00FFFF" style={styles.loadingIndicator} />
                    )}
                  </>
                )}
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
    padding: 20,
  },
  loadingText: {
    color: '#00FFFF',
    marginTop: 20,
    fontSize: 16,
  },
  errorTitle: {
    color: '#FF4444',
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  errorText: {
    color: '#FF8888',
    fontSize: 16,
    marginBottom: 30,
    textAlign: 'center',
  },
  noVotesTitle: {
    color: '#00FFFF',
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  noVotesText: {
    color: '#AAAAAA',
    fontSize: 16,
    textAlign: 'center',
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
  roundProgress: {
    backgroundColor: 'rgba(0, 255, 255, 0.1)',
    padding: 12,
    borderRadius: 10,
    marginBottom: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(0, 255, 255, 0.3)',
  },
  roundProgressText: {
    color: '#00FFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  finalRoundText: {
    color: '#FFD700',
    fontSize: 14,
    fontWeight: 'bold',
    marginTop: 5,
  },
  finalRoundNote: {
    color: '#FFD700',
    textAlign: 'center',
    marginTop: 10,
    fontSize: 14,
    fontStyle: 'italic',
  },
  label: {
    color: '#8eeeff',
    fontSize: 14,
    marginTop: 20,
    fontWeight: '700',
    letterSpacing: 1,
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
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  voteLine: {
    fontSize: 16,
    color: '#fff',
    marginVertical: 4,
  },
  actionSection: {
    marginTop: 40,
    alignItems: 'center',
  },
  loadingIndicator: {
    marginTop: 10,
  },
});

export default RoundSummaryScreen;