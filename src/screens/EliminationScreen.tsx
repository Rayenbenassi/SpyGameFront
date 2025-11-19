import React, { useState, useEffect, useRef } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  Animated, 
  Easing, 
  ScrollView,
  TouchableOpacity,
  Modal,
  Dimensions 
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { useNavigation, useRoute } from '@react-navigation/native';
import { RootStackParamList } from '../navigation/types';
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/native';
import { gameAPI } from '../services/gameAPI';

// Define proper TypeScript interfaces
interface Player {
  id: number;
  name: string;
  isEliminated: boolean;
  eliminatedInRoundId?: number;
  score?: number;
}

interface Round {
  id: number;
  spyData?: string;
  spy?: {
    id: number;
  };
}

interface Session {
  id: number;
  gameMode: 'CLASSIC' | 'MULTI_SPY';
  players: Player[];
  currentRound: number;
  numberOfRounds: number;
  finished?: boolean;
}

interface SpyData {
  spyIds: number[];
}

interface EliminationResult {
  title: string;
  message: string;
  color: string;
}

type EliminationRouteProp = RouteProp<RootStackParamList, 'Elimination'>;
type NavProp = StackNavigationProp<RootStackParamList, 'Elimination'>;

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

const EliminationScreen = () => {
  const navigation = useNavigation<NavProp>();
  const route = useRoute<EliminationRouteProp>();
  const { round, session } = route.params as { round: Round; session: Session };

  const [players, setPlayers] = useState<Player[]>(session.players || []);
  const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null);
  const [showConfirmModal, setShowConfirmModal] = useState<boolean>(false);
  const [eliminating, setEliminating] = useState<boolean>(false);
  const [eliminationResult, setEliminationResult] = useState<any>(null);

  // Animation values
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const glowAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  // Parse spy data for Multi-Spy mode
  const getSpyData = (): SpyData => {
    try {
      if (session.gameMode === 'MULTI_SPY' && round.spyData) {
        return JSON.parse(round.spyData) as SpyData;
      }
      return { spyIds: round.spy?.id ? [round.spy.id] : [] }; // Classic mode fallback
    } catch (error) {
      console.error('Error parsing spy data:', error);
      return { spyIds: round.spy?.id ? [round.spy.id] : [] };
    }
  };

  const spyData = getSpyData();
  const spyIds = spyData.spyIds || [];
  const isMultiSpy = session.gameMode === 'MULTI_SPY';

  // Filter out eliminated players
  const activePlayers = players.filter((player: Player) => !player.isEliminated);

  // Get remaining spies count
  const remainingSpies = spyIds.filter((spyId: number) => {
    const spyPlayer = players.find((p: Player) => p.id === spyId);
    return spyPlayer && !spyPlayer.isEliminated;
  }).length;

  // Get remaining agents count
  const remainingAgents = activePlayers.length - remainingSpies;

  // Pulse animation for critical situation
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.05,
          duration: 1000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  // Check if game should end after elimination
  useEffect(() => {
    if (eliminationResult) {
      const timer = setTimeout(() => {
        checkGameState();
      }, 3000);
      
      return () => clearTimeout(timer);
    }
  }, [eliminationResult]);

  const checkGameState = () => {
    // Check win conditions
    if (remainingSpies === 0) {
      // Agents win - all spies eliminated
      navigation.navigate('GameCompleted', { 
        session, 
        round,
        winners: 'AGENTS',
        message: 'ALL COVERT OPERATIVES IDENTIFIED AND ELIMINATED'
      });
    } else if (remainingSpies >= remainingAgents) {
      // Spies win - outnumber agents
      navigation.navigate('GameCompleted', { 
        session, 
        round,
        winners: 'SPIES',
        message: 'COVERT OPERATIVES OUTNUMBER REMAINING AGENTS'
      });
    } else if (session.currentRound >= session.numberOfRounds) {
      // Agents win - survived all rounds
      navigation.navigate('GameCompleted', { 
        session, 
        round,
        winners: 'AGENTS',
        message: 'SURVIVED ALL ROUNDS - MISSION ACCOMPLISHED'
      });
    } else {
      // Continue to next round
      startNextRound();
    }
  };

  const startNextRound = async () => {
    try {
      const nextRound = await gameAPI.nextRound(session.id, round.id);
      navigation.navigate('RevealRole', {
        session: { ...session, players },
        round: nextRound,
        players: players.filter((p: Player) => !p.isEliminated)
      });
    } catch (error) {
      console.error('Failed to start next round:', error);
    }
  };

  const handlePlayerSelect = (player: Player) => {
    if (player.isEliminated) return; // Can't select eliminated players
    
    setSelectedPlayer(player);
    setShowConfirmModal(true);
  };

  const confirmElimination = async () => {
    if (!selectedPlayer) return;
    
    setEliminating(true);
    setShowConfirmModal(false);

    try {
      // Call backend to eliminate player
      const result = await gameAPI.eliminatePlayer(round.id, selectedPlayer.id);
      
      // Update local state
      const updatedPlayers = players.map((p: Player) => 
        p.id === selectedPlayer.id 
          ? { ...p, isEliminated: true, eliminatedInRoundId: round.id }
          : p
      );
      
      setPlayers(updatedPlayers);
      setEliminationResult(result);

      console.log('✅ Player eliminated:', selectedPlayer.name);
      console.log('🕵️ Was spy:', spyIds.includes(selectedPlayer.id));

    } catch (error) {
      console.error('❌ Failed to eliminate player:', error);
      setEliminating(false);
    }
  };

  const cancelElimination = () => {
    setSelectedPlayer(null);
    setShowConfirmModal(false);
  };

  const isPlayerSpy = (player: Player): boolean => {
    return spyIds.includes(player.id);
  };

  const getGameStatus = (): string => {
    if (remainingSpies === 0) return '🎯 ALL SPIES ELIMINATED';
    if (remainingSpies >= remainingAgents) return '🚨 SPIES OUTNUMBER AGENTS';
    return `🕵️ ${remainingSpies} OPERATIVE${remainingSpies > 1 ? 'S' : ''} REMAINING`;
  };

  const getEliminationResultText = (): EliminationResult | null => {
    if (!eliminationResult || !selectedPlayer) return null;
    
    const wasSpy = spyIds.includes(selectedPlayer.id);
    
    if (wasSpy) {
      return {
        title: '✅ COVERT OPERATIVE ELIMINATED',
        message: 'A spy has been removed from the game!',
        color: '#00FF88'
      };
    } else {
      return {
        title: '💀 FIELD AGENT ELIMINATED',
        message: 'An innocent agent has been lost...',
        color: '#FF4444'
      };
    }
  };

  const resultText = getEliminationResultText();

  return (
    <LinearGradient
      colors={['#0a0a0a', '#001122', '#002244']}
      style={styles.gradient}
    >
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header Section */}
        <View style={styles.header}>
          <Text style={styles.agencyTitle}>CENTRAL INTELLIGENCE</Text>
          <Text style={[styles.subtitle, { color: '#FF4444' }]}>
            ELIMINATION PHASE - TEAM INFILTRATION
          </Text>
          <View style={[styles.separator, { backgroundColor: '#FF4444' }]} />
        </View>

        {/* Game Status */}
        <View style={[styles.statusIndicator, { backgroundColor: 'rgba(255, 68, 68, 0.1)' }]}>
          <Animated.Text 
            style={[
              styles.statusText,
              {
                color: '#FF4444',
                transform: [{ scale: pulseAnim }]
              }
            ]}
          >
            {getGameStatus()}
          </Animated.Text>
          <Text style={styles.statusSubtext}>
            AGENTS: {remainingAgents} | OPERATIVES: {remainingSpies}
          </Text>
        </View>

        {/* Elimination Instructions */}
        <View style={styles.instructions}>
          <Text style={styles.instructionsTitle}>ELIMINATION PROTOCOL</Text>
          <Text style={styles.instructionsText}>
            • Select one agent to eliminate this round{'\n'}
            • Eliminate all covert operatives to win{'\n'}
            • Operatives win if they outnumber agents{'\n'}
            • Choose carefully - wrong eliminations help the spies
          </Text>
        </View>

        {/* Player Grid */}
        <View style={styles.playersSection}>
          <Text style={styles.sectionLabel}>SELECT AGENT TO ELIMINATE</Text>
          
          <View style={styles.playersGrid}>
            {activePlayers.map((player: Player) => (
              <TouchableOpacity
                key={player.id}
                style={[
                  styles.playerCard,
                  selectedPlayer?.id === player.id && styles.playerCardSelected,
                  eliminating && styles.playerCardDisabled
                ]}
                onPress={() => handlePlayerSelect(player)}
                disabled={eliminating}
              >
                <Text style={styles.playerBadge}>
                  {player.isEliminated ? '💀' : '👤'}
                </Text>
                <Text style={[
                  styles.playerName,
                  selectedPlayer?.id === player.id && styles.playerNameSelected
                ]}>
                  {player.name}
                </Text>
                <Text style={styles.playerStatus}>
                  {player.isEliminated ? 'ELIMINATED' : 'ACTIVE'}
                </Text>
                
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Eliminated Players */}
        {players.some((p: Player) => p.isEliminated) && (
          <View style={styles.eliminatedSection}>
            <Text style={styles.sectionLabel}>ELIMINATED AGENTS</Text>
            <View style={styles.eliminatedList}>
              {players.filter((p: Player) => p.isEliminated).map((player: Player) => (
                <View key={player.id} style={styles.eliminatedPlayer}>
                  <Text style={styles.eliminatedBadge}>💀</Text>
                  <Text style={styles.eliminatedName}>{player.name}</Text>
                  <Text style={styles.eliminatedStatus}>
                    {isPlayerSpy(player) ? 'COVERT OPERATIVE' : 'FIELD AGENT'}
                  </Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            {eliminating ? 'PROCESSING ELIMINATION...' : 'SELECT AN AGENT TO ELIMINATE'}
          </Text>
          <Text style={styles.encryptionText}>🔒 ELIMINATION PROTOCOL: ACTIVE</Text>
        </View>

        {/* Bottom Spacer */}
        <View style={styles.bottomSpacer} />
      </ScrollView>

      {/* Elimination Confirmation Modal */}
      <Modal
        visible={showConfirmModal}
        transparent={true}
        animationType="fade"
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>CONFIRM ELIMINATION</Text>
            <Text style={styles.modalText}>
              Eliminate agent {'"'}
              <Text style={styles.modalPlayerName}>{selectedPlayer?.name}</Text>
              {'"'} from the game?
            </Text>
            <Text style={styles.modalWarning}>
              This action cannot be undone. The agent will be permanently removed from this session.
            </Text>
            
            <View style={styles.modalButtons}>
              <TouchableOpacity 
                style={[styles.modalButton, styles.cancelButton]}
                onPress={cancelElimination}
              >
                <Text style={styles.cancelButtonText}>CANCEL</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.modalButton, styles.confirmButton]}
                onPress={confirmElimination}
              >
                <Text style={styles.confirmButtonText}>CONFIRM ELIMINATION</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Elimination Result Modal */}
      {resultText && (
        <Modal
          visible={!!eliminationResult}
          transparent={true}
          animationType="fade"
        >
          <View style={styles.modalOverlay}>
            <View style={[styles.modalContent, { backgroundColor: '#1a0000' }]}>
              <Text style={[styles.modalTitle, { color: resultText.color }]}>
                {resultText.title}
              </Text>
              
              <Text style={styles.modalText}>
                Agent {'"'}
                <Text style={[styles.modalPlayerName, { color: resultText.color }]}>
                  {selectedPlayer?.name}
                </Text>
                {'"'} has been eliminated.
              </Text>
              
              <Text style={styles.modalMessage}>
                {resultText.message}
              </Text>

              <View style={styles.gameStatusUpdate}>
                <Text style={styles.statusUpdateText}>
                  REMAINING OPERATIVES: {remainingSpies}
                </Text>
                <Text style={styles.statusUpdateText}>
                  REMAINING AGENTS: {remainingAgents}
                </Text>
              </View>

              <Text style={styles.continueText}>
                Continuing to next round...
              </Text>
            </View>
          </View>
        </Modal>
      )}
    </LinearGradient>
  );
};

// ... styles remain the same ...
const styles = StyleSheet.create({
  gradient: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    padding: 20,
    minHeight: SCREEN_HEIGHT,
  },
  header: {
    alignItems: 'center',
    marginBottom: 20,
  },
  agencyTitle: {
    color: '#00FFFF',
    fontSize: 16,
    fontWeight: 'bold',
    letterSpacing: 3,
    textShadowColor: '#00FFFF',
    textShadowRadius: 10,
  },
  subtitle: {
    fontSize: 14,
    letterSpacing: 2,
    marginTop: 5,
    fontWeight: 'bold',
  },
  separator: {
    width: '80%',
    height: 1,
    marginTop: 10,
    opacity: 0.5,
  },
  statusIndicator: {
    borderWidth: 1,
    borderColor: '#FF4444',
    borderRadius: 8,
    padding: 15,
    marginVertical: 10,
    alignItems: 'center',
  },
  statusText: {
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 5,
  },
  statusSubtext: {
    color: '#FF8888',
    fontSize: 12,
    textAlign: 'center',
  },
  instructions: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: '#444',
    borderRadius: 8,
    padding: 15,
    marginVertical: 10,
  },
  instructionsTitle: {
    color: '#FFD700',
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
  },
  instructionsText: {
    color: '#C7D0D9',
    fontSize: 12,
    lineHeight: 18,
    textAlign: 'center',
  },
  playersSection: {
    marginVertical: 20,
  },
  sectionLabel: {
    color: '#888',
    fontSize: 12,
    letterSpacing: 1,
    marginBottom: 15,
    textAlign: 'center',
  },
  playersGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 12,
  },
  playerCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 2,
    borderColor: '#00FFFF',
    borderRadius: 12,
    padding: 15,
    alignItems: 'center',
    width: '45%',
    minHeight: 100,
    justifyContent: 'center',
  },
  playerCardSelected: {
    borderColor: '#FF4444',
    backgroundColor: 'rgba(255, 68, 68, 0.1)',
  },
  playerCardDisabled: {
    opacity: 0.5,
  },
  playerBadge: {
    fontSize: 20,
    marginBottom: 8,
  },
  playerName: {
    color: '#00FFFF',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 4,
  },
  playerNameSelected: {
    color: '#FF4444',
  },
  playerStatus: {
    color: '#888',
    fontSize: 10,
    textAlign: 'center',
  },
  spyIndicator: {
    position: 'absolute',
    top: 5,
    right: 5,
    fontSize: 12,
  },
  eliminatedSection: {
    marginVertical: 20,
  },
  eliminatedList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 10,
  },
  eliminatedPlayer: {
    backgroundColor: 'rgba(255, 0, 0, 0.1)',
    borderWidth: 1,
    borderColor: '#FF0000',
    borderRadius: 8,
    padding: 10,
    alignItems: 'center',
    minWidth: 100,
  },
  eliminatedBadge: {
    fontSize: 16,
    marginBottom: 5,
  },
  eliminatedName: {
    color: '#FF8888',
    fontSize: 12,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 2,
  },
  eliminatedStatus: {
    color: '#FF6666',
    fontSize: 9,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  footer: {
    alignItems: 'center',
    marginVertical: 20,
  },
  footerText: {
    color: '#00FF88',
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
  },
  encryptionText: {
    color: '#666',
    fontSize: 10,
    letterSpacing: 1,
  },
  bottomSpacer: {
    height: 20,
  },
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#001122',
    borderWidth: 2,
    borderColor: '#FF4444',
    borderRadius: 12,
    padding: 25,
    width: '90%',
    maxWidth: 400,
  },
  modalTitle: {
    color: '#FF4444',
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 15,
  },
  modalText: {
    color: '#FFFFFF',
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 10,
    lineHeight: 22,
  },
  modalPlayerName: {
    color: '#FF4444',
    fontWeight: 'bold',
  },
  modalWarning: {
    color: '#FFAA00',
    fontSize: 12,
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 16,
  },
  modalMessage: {
    color: '#FFFFFF',
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 15,
    lineHeight: 20,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
  },
  modalButton: {
    flex: 1,
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderWidth: 1,
    borderColor: '#666',
  },
  confirmButton: {
    backgroundColor: 'rgba(255, 68, 68, 0.3)',
    borderWidth: 1,
    borderColor: '#FF4444',
  },
  cancelButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: 'bold',
  },
  confirmButtonText: {
    color: '#FF4444',
    fontSize: 14,
    fontWeight: 'bold',
  },
  gameStatusUpdate: {
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    borderRadius: 6,
    padding: 10,
    marginVertical: 10,
  },
  statusUpdateText: {
    color: '#00FF88',
    fontSize: 12,
    textAlign: 'center',
    marginBottom: 4,
  },
  continueText: {
    color: '#888',
    fontSize: 11,
    textAlign: 'center',
    marginTop: 10,
    fontStyle: 'italic',
  },
});

export default EliminationScreen;