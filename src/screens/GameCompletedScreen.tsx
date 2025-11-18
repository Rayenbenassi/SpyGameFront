// src/screens/GameCompletedScreen.tsx
import React, { useEffect, useRef } from 'react';
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
import { Player, GameSession } from '../services/gameAPI';

type GameCompletedRouteProp = RouteProp<RootStackParamList, 'GameCompleted'>;
type GameCompletedNavProp = StackNavigationProp<RootStackParamList, 'GameCompleted'>;

interface SessionWithPlayers extends GameSession {
  players: Player[];
}

const GameCompletedScreen: React.FC = () => {
  const route = useRoute<GameCompletedRouteProp>();
  const navigation = useNavigation<GameCompletedNavProp>();
  const { session } = route.params as { session: SessionWithPlayers };

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
  }, []);

  // Calculate winner(s)
  const calculateWinners = (): Player[] => {
    if (!session.players || session.players.length === 0) return [];

    const maxScore = Math.max(...session.players.map((p: Player) => p.score));
    return session.players.filter((player: Player) => player.score === maxScore);
  };

  const winners = calculateWinners();
  const isTie = winners.length > 1;

  const startNewGame = () => {
    navigation.navigate('CreateSession');
  };

  // Sort players by score for the leaderboard
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
          </View>

          {/* Winners Section */}
          <View style={styles.winnersCard}>
            <Text style={styles.winnersTitle}>
              {isTie ? '🏆 TOP AGENTS 🏆' : '🏆 WINNING AGENT 🏆'}
            </Text>
            
            {winners.map((winner: Player) => (
              <View key={winner.id} style={styles.winnerItem}>
                <Text style={styles.winnerName}>{winner.name}</Text>
                <Text style={styles.winnerScore}>Score: {winner.score}</Text>
                {!isTie && <Text style={styles.championText}>👑 CHAMPION</Text>}
              </View>
            ))}

            {isTie && (
              <Text style={styles.tieText}>TIE GAME! IMPRESSIVE TEAMWORK</Text>
            )}
          </View>

          {/* Final Scores */}
          <View style={styles.scoresCard}>
            <Text style={styles.scoresTitle}>FINAL SCORES</Text>
            {sortedPlayers.map((player: Player, index: number) => (
              <View 
                key={player.id} 
                style={[
                  styles.scoreItem,
                  winners.some(w => w.id === player.id) && styles.winnerScoreItem
                ]}
              >
                <Text style={styles.rank}>#{index + 1}</Text>
                <Text style={styles.playerName}>{player.name}</Text>
                <Text style={styles.playerScore}>{player.score} pts</Text>
              </View>
            ))}
          </View>

          {/* Game Statistics */}
          <View style={styles.statsCard}>
            <Text style={styles.statsTitle}>MISSION STATS</Text>
            <View style={styles.statsRow}>
              <Text style={styles.stat}>Total Rounds: {session.numberOfRounds}</Text>
              <Text style={styles.stat}>Category: {session.category?.name}</Text>
            </View>
            <View style={styles.statsRow}>
              <Text style={styles.stat}>Players: {session.players?.length}</Text>
              <Text style={styles.stat}>Completed: {new Date().toLocaleDateString()}</Text>
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
            {isTie 
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
  rank: {
    color: '#00FFFF',
    fontSize: 16,
    fontWeight: 'bold',
    width: 30,
  },
  playerName: {
    color: '#FFFFFF',
    fontSize: 16,
    flex: 1,
  },
  playerScore: {
    color: '#00FF99',
    fontSize: 16,
    fontWeight: 'bold',
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