// src/screens/GameCompletedScreen.tsx
import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Animated,
} from 'react-native';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import LinearGradient from 'react-native-linear-gradient';
import { RootStackParamList } from '../navigation/types';
import NeonButton from '../components/NeonButton';
import { Player, GameSession, gameAPI } from '../services/gameAPI'; // Import gameAPI

type GameCompletedRouteProp = RouteProp<RootStackParamList, 'GameCompleted'>;
type GameCompletedNavProp = StackNavigationProp<RootStackParamList, 'GameCompleted'>;

interface SessionWithPlayers extends GameSession {
  players: Player[];
}

const GameCompletedScreen: React.FC = () => {
  const route = useRoute<GameCompletedRouteProp>();
  const navigation = useNavigation<GameCompletedNavProp>();
  const { session: initialSession } = route.params as { session: SessionWithPlayers };

  const [session, setSession] = useState<SessionWithPlayers>(initialSession);
  const [refreshing, setRefreshing] = useState(false);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
      }),
    ]).start();

    // Refresh session data to ensure we have the latest scores
    refreshSessionData();
  }, []);

  const refreshSessionData = async () => {
    try {
      setRefreshing(true);
      console.log('🔄 Refreshing session data for ID:', session.id);
      
      const updatedSession = await gameAPI.getSessionStatus(session.id);
      console.log('✅ Refreshed session data:', updatedSession);
      console.log('📊 Player scores after refresh:');
      updatedSession.players?.forEach((player: Player) => {
        console.log(`   ${player.name}: ${player.score} | Eliminated: ${player.isEliminated}`);
      });
      
      setSession(updatedSession as SessionWithPlayers);
    } catch (error) {
      console.error('❌ Failed to refresh session data:', error);
    } finally {
      setRefreshing(false);
    }
  };

  // Calculate winner(s) - FIXED: Use the current session state
  const calculateWinners = (): Player[] => {
    if (!session.players || session.players.length === 0) {
      console.log('⚠️ No players found in session');
      return [];
    }

    console.log('🎯 Calculating winners from players:', session.players);
    
    const maxScore = Math.max(...session.players.map((p: Player) => p.score));
    console.log('📈 Max score found:', maxScore);
    
    const winners = session.players.filter((player: Player) => player.score === maxScore);
    console.log('🏆 Winners:', winners.map(w => `${w.name} (${w.score})`));
    
    return winners;
  };

  const winners = calculateWinners();
  const isTie = winners.length > 1;

  console.log('🎊 Final game state:', {
    totalPlayers: session.players?.length,
    winnersCount: winners.length,
    isTie,
    allScores: session.players?.map(p => `${p.name}: ${p.score}`)
  });

  const startNewGame = () => {
    navigation.navigate('CreateSession');
  };

  // Sort players by score for the leaderboard - FIXED: Use current session state
  const sortedPlayers = session.players?.sort((a: Player, b: Player) => b.score - a.score) || [];

  return (
    <LinearGradient
      colors={['#000000', '#0a1f2e', '#003366']}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Animated.View 
          style={[
            styles.content,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }]
            }
          ]}
        >
          {/* Mission Complete Header */}
          <View style={styles.header}>
            <Text style={styles.title}>MISSION COMPLETE</Text>
            <Text style={styles.subtitle}>OPERATION SUCCESSFUL</Text>
            
            {/* Refresh Button */}
            <NeonButton
              title={refreshing ? "🔄 REFRESHING..." : "🔄 REFRESH SCORES"}
              onPress={refreshSessionData}
              color="#FFD700"
              size="small"
              disabled={refreshing}
            />
          </View>

          {/* Debug Info - Remove in production */}
          <View style={styles.debugInfo}>
            <Text style={styles.debugText}>
              Session ID: {session.id} | Players: {session.players?.length} | Rounds: {session.currentRound}/{session.numberOfRounds}
            </Text>
            <Text style={styles.debugText}>
              Game Mode: {session.gameMode} | Spies Count: {session.spiesCount}
            </Text>
          </View>

          {/* Winners Section */}
          <View style={styles.winnersCard}>
            <Text style={styles.winnersTitle}>
              {isTie ? '🏆 TOP AGENTS 🏆' : '🏆 WINNING AGENT 🏆'}
            </Text>
            
            {winners.length > 0 ? (
              winners.map((winner: Player) => (
                <View key={winner.id} style={styles.winnerItem}>
                  <Text style={styles.winnerName}>{winner.name}</Text>
                  <Text style={styles.winnerScore}>Score: {winner.score}</Text>
                  {!isTie && <Text style={styles.championText}>👑 CHAMPION</Text>}
                </View>
              ))
            ) : (
              <Text style={styles.noWinnersText}>No winners calculated</Text>
            )}

            {isTie && (
              <Text style={styles.tieText}>TIE GAME! IMPRESSIVE TEAMWORK</Text>
            )}
          </View>

          {/* Final Scores */}
          <View style={styles.scoresCard}>
            <Text style={styles.scoresTitle}>FINAL SCORES</Text>
            {sortedPlayers.length > 0 ? (
              sortedPlayers.map((player: Player, index: number) => (
                <View 
                  key={player.id} 
                  style={[
                    styles.scoreItem,
                    winners.some(w => w.id === player.id) && styles.winnerScoreItem,
                    player.isEliminated && styles.eliminatedPlayerItem
                  ]}
                >
                  <Text style={styles.rank}>#{index + 1}</Text>
                  <View style={styles.playerInfo}>
                    <Text style={styles.playerName}>
                      {player.name} 
                      {player.isEliminated && ' 💀'}
                    </Text>
                    <Text style={styles.playerStatus}>
                      {player.isEliminated ? 'ELIMINATED' : 'ACTIVE'}
                    </Text>
                  </View>
                  <Text style={[
                    styles.playerScore,
                    winners.some(w => w.id === player.id) && styles.winnerScoreText
                  ]}>
                    {player.score} pts
                  </Text>
                </View>
              ))
            ) : (
              <Text style={styles.noPlayersText}>No players found</Text>
            )}
          </View>

          {/* Game Statistics */}
          <View style={styles.statsCard}>
            <Text style={styles.statsTitle}>MISSION STATS</Text>
            <View style={styles.statsRow}>
              <Text style={styles.stat}>Total Rounds: {session.numberOfRounds}</Text>
              <Text style={styles.stat}>Completed: {session.currentRound}</Text>
            </View>
            <View style={styles.statsRow}>
              <Text style={styles.stat}>Players: {session.players?.length || 0}</Text>
              <Text style={styles.stat}>Active: {session.players?.filter(p => !p.isEliminated).length || 0}</Text>
            </View>
            <View style={styles.statsRow}>
              <Text style={styles.stat}>Game Mode: {session.gameMode}</Text>
              <Text style={styles.stat}>Date: {new Date().toLocaleDateString()}</Text>
            </View>
          </View>

          {/* Action Buttons */}
          <View style={styles.actions}>
            <NeonButton
              title="🔄 NEW MISSION"
              onPress={startNewGame}
              color="#00FF99"
            />
            <NeonButton
              title="🏠 MAIN MENU"
              onPress={() => navigation.navigate('Home')}
              color="#00FFFF"
            />
          </View>

          {/* Celebration Message */}
          <Text style={styles.celebrationText}>
            {winners.length === 0 
              ? "Game completed! 🎉"
              : isTie 
                ? "Outstanding performance from all top agents! 🎉"
                : "Exceptional work, agent! Mission accomplished! 🎊"
            }
          </Text>
        </Animated.View>
      </ScrollView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    padding: 20,
  },
  content: {
    alignItems: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: 30,
  },
  title: {
    color: '#FFD700',
    fontSize: 36,
    fontWeight: 'bold',
    textAlign: 'center',
    letterSpacing: 3,
    textShadowColor: '#FFD700',
    textShadowRadius: 15,
    marginBottom: 10,
  },
  subtitle: {
    color: '#00FFFF',
    fontSize: 18,
    letterSpacing: 2,
    textAlign: 'center',
    marginBottom: 15,
  },
  debugInfo: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    padding: 10,
    borderRadius: 8,
    marginBottom: 15,
    width: '100%',
  },
  debugText: {
    color: '#888',
    fontSize: 10,
    textAlign: 'center',
    fontFamily: 'monospace',
  },
  winnersCard: {
    backgroundColor: 'rgba(255, 215, 0, 0.1)',
    borderWidth: 2,
    borderColor: '#FFD700',
    borderRadius: 20,
    padding: 25,
    marginBottom: 20,
    width: '100%',
    alignItems: 'center',
  },
  winnersTitle: {
    color: '#FFD700',
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 15,
    textAlign: 'center',
  },
  winnerItem: {
    alignItems: 'center',
    marginBottom: 15,
  },
  winnerName: {
    color: '#FFFFFF',
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  winnerScore: {
    color: '#00FFFF',
    fontSize: 18,
    marginBottom: 5,
  },
  championText: {
    color: '#FFD700',
    fontSize: 16,
    fontWeight: 'bold',
  },
  tieText: {
    color: '#00FF99',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
    marginTop: 10,
  },
  noWinnersText: {
    color: '#FF6666',
    fontSize: 16,
    fontStyle: 'italic',
    textAlign: 'center',
  },
  scoresCard: {
    backgroundColor: 'rgba(0, 255, 255, 0.1)',
    borderWidth: 1,
    borderColor: '#00FFFF',
    borderRadius: 15,
    padding: 20,
    marginBottom: 20,
    width: '100%',
  },
  scoresTitle: {
    color: '#00FFFF',
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
    textAlign: 'center',
  },
  scoreItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  winnerScoreItem: {
    backgroundColor: 'rgba(255, 215, 0, 0.1)',
    borderRadius: 8,
    paddingHorizontal: 10,
  },
  eliminatedPlayerItem: {
    backgroundColor: 'rgba(255, 0, 0, 0.1)',
    opacity: 0.7,
  },
  rank: {
    color: '#00FFFF',
    fontSize: 16,
    fontWeight: 'bold',
    width: 30,
  },
  playerInfo: {
    flex: 1,
    marginLeft: 10,
  },
  playerName: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  playerStatus: {
    color: '#888',
    fontSize: 12,
    fontStyle: 'italic',
  },
  playerScore: {
    color: '#00FF99',
    fontSize: 16,
    fontWeight: 'bold',
  },
  winnerScoreText: {
    color: '#FFD700',
  },
  noPlayersText: {
    color: '#FF6666',
    fontSize: 16,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  statsCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: '#666',
    borderRadius: 15,
    padding: 20,
    marginBottom: 30,
    width: '100%',
  },
  statsTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    textAlign: 'center',
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  stat: {
    color: '#CCCCCC',
    fontSize: 14,
  },
  actions: {
    width: '100%',
    gap: 15,
    marginBottom: 20,
  },
  celebrationText: {
    color: '#00FF99',
    fontSize: 16,
    textAlign: 'center',
    fontStyle: 'italic',
    marginTop: 10,
  },
});

export default GameCompletedScreen;