import React, { useState, useEffect, useRef } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  Animated, 
  Easing, 
  ScrollView,
  Dimensions 
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { useNavigation, useRoute } from '@react-navigation/native';
import NeonButton from '../components/NeonButton';
import { RootStackParamList } from '../navigation/types';
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/native';

type DiscussionRouteProp = RouteProp<RootStackParamList, 'Discussion'>;
type NavProp = StackNavigationProp<RootStackParamList, 'Discussion'>;

const { height: SCREEN_HEIGHT } = Dimensions.get('window');
const SPEAK_TIME = 20; // seconds per player

const DiscussionScreen = () => {
  const navigation = useNavigation<NavProp>();
  const route = useRoute<DiscussionRouteProp>();
  const { round, session } = route.params;

  // 🎯 FIX: Filter out eliminated players for discussion
  const activePlayers = session.players.filter((player: any) => !player.isEliminated);
  
  const [currentIndex, setCurrentIndex] = useState(0);
  const [timer, setTimer] = useState(SPEAK_TIME);
  const [isCritical, setIsCritical] = useState(false);

  const currentPlayer = activePlayers[currentIndex];
  const isLastPlayer = currentIndex === activePlayers.length - 1;

  // Animation values
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const glowAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  // Parse spy data for Multi-Spy mode
  const getSpyCount = () => {
    try {
      if (session.gameMode === 'MULTI_SPY' && round.spyData) {
        const spyData = JSON.parse(round.spyData);
        return spyData.spyIds?.length || 1;
      }
      return 1; // Classic mode
    } catch (error) {
      console.error('Error parsing spy data:', error);
      return 1;
    }
  };

  const spyCount = getSpyCount();
  const isMultiSpy = session.gameMode === 'MULTI_SPY';

  // 🎯 FIX: Get eliminated players count for display
  const eliminatedPlayers = session.players.filter((player: any) => player.isEliminated);
  const eliminatedCount = eliminatedPlayers.length;

  // Get game mode specific text
  const getGameModeText = () => {
    if (isMultiSpy) {
      return {
        missionType: 'TEAM INFILTRATION',
        objective: `IDENTIFY ${spyCount} COVERT OPERATIVE${spyCount > 1 ? 'S' : ''}`,
        instructions: `• ${spyCount} agents are covert operatives\n• Operatives work together\n• Eliminate one suspect per round\n• Win by outnumbering or eliminating all operatives`,
        color: '#FF4444',
        bgColor: 'rgba(255, 68, 68, 0.1)'
      };
    } else {
      return {
        missionType: 'SINGLE INFILTRATOR',
        objective: 'IDENTIFY THE COVERT OPERATIVE',
        instructions: '• One agent is the covert operative\n• Field agents receive identical intel\n• The operative receives alternative intel\n• Identify the operative through discussion',
        color: '#00FFFF',
        bgColor: 'rgba(0, 255, 255, 0.1)'
      };
    }
  };

  const modeText = getGameModeText();

  // Terminal typing effect for mission briefing
  const [displayedText, setDisplayedText] = useState('');
  const fullText = `MISSION: ***********\nMODE: ${modeText.missionType}\nOPERATIVES: ${spyCount}\nACTIVE AGENTS: ${activePlayers.length}\nELIMINATED: ${eliminatedCount}\nTIME PER AGENT: ${SPEAK_TIME}S`;

  // Pulse animation for timer
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.1,
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

  // Critical time warning
  useEffect(() => {
    if (timer <= 5 && timer > 0) {
      setIsCritical(true);
      // Intense glow based on game mode
      Animated.timing(glowAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }).start();
    } else {
      setIsCritical(false);
      Animated.timing(glowAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }).start();
    }
  }, [timer]);

  // Terminal typing effect
  useEffect(() => {
    let index = 0;
    const typingInterval = setInterval(() => {
      if (index <= fullText.length) {
        setDisplayedText(fullText.slice(0, index));
        index++;
      } else {
        clearInterval(typingInterval);
      }
    }, 50);

    return () => clearInterval(typingInterval);
  }, []);

  // Slide in animation for new player
  useEffect(() => {
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 500,
        easing: Easing.out(Easing.back(1.5)),
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();
  }, [currentIndex]);

  // TIMER EFFECT
  useEffect(() => {
    if (timer === 0) {
      setTimeout(() => goToNextPlayer(), 1000);
      return;
    }

    const interval = setInterval(() => {
      setTimer((t) => t - 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [timer]);

  const goToNextPlayer = () => {
    if (currentIndex < activePlayers.length - 1) {
      // Reset animations for next player
      slideAnim.setValue(50);
      fadeAnim.setValue(0);
      
      setCurrentIndex(currentIndex + 1);
      setTimer(SPEAK_TIME);
      setIsCritical(false);
    }
  };

  const forceStartNextPhase = () => {
    console.log('🚨 FORCE STARTING NEXT PHASE');
    
    if (isMultiSpy) {
      // Navigate to Elimination screen for Multi-Spy mode
      console.log('🎯 Navigating to Elimination screen');
      navigation.navigate('Elimination', { round, session });
    } else {
      // Navigate to Vote screen for Classic mode
      console.log('🗳️ Navigating to Vote screen');
      navigation.navigate('Vote', { round, session });
    }
  };

  const getTimerColor = () => {
    if (timer <= 5) return '#FF4444';
    if (timer <= 10) return '#FFAA00';
    return isMultiSpy ? '#FF6666' : '#00FF88';
  };

  const getTimerSize = () => {
    if (timer <= 5) return 80;
    if (timer <= 10) return 70;
    return 60;
  };

  // Get next phase description
  const getNextPhaseText = () => {
    if (isMultiSpy) {
      return `ELIMINATE 1 SUSPECT\n${spyCount} OPERATIVE${spyCount > 1 ? 'S' : ''} REMAINING`;
    } else {
      return 'VOTE TO IDENTIFY THE OPERATIVE';
    }
  };

  // Get button title based on game mode
  const getButtonTitle = () => {
    if (isMultiSpy) {
      return timer > 0 ? "🚨 INITIATE ELIMINATION" : "🚨 BEGIN ELIMINATION PHASE";
    } else {
      return timer > 0 ? "🚨 INITIATE VOTING" : "🚨 INITIATE VOTING PROTOCOL";
    }
  };

  return (
    <LinearGradient
      colors={['#0a0a0a', '#001122', '#002244']}
      style={styles.gradient}
    >
      {/* Animated critical time overlay */}
      <Animated.View 
        style={[
          styles.criticalOverlay,
          {
            opacity: glowAnim,
            backgroundColor: isMultiSpy ? 'rgba(255, 68, 68, 0.1)' : 'rgba(255, 0, 0, 0.1)'
          }
        ]} 
      />

      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header Section */}
        <View style={styles.header}>
          <Text style={styles.agencyTitle}>CENTRAL INTELLIGENCE</Text>
          <Text style={[styles.subtitle, { color: modeText.color }]}>
            OPERATION: {modeText.missionType}
          </Text>
          <View style={[styles.separator, { backgroundColor: modeText.color }]} />
        </View>

        {/* Game Mode Indicator */}
        <View style={[styles.modeIndicator, { backgroundColor: modeText.bgColor, borderColor: modeText.color }]}>
          <Text style={[styles.modeText, { color: modeText.color }]}>
            {modeText.objective}
          </Text>
        </View>

        {/* Mission Briefing Terminal */}
        <View style={[styles.terminal, { borderColor: modeText.color }]}>
          <Text style={[styles.terminalHeader, { color: modeText.color }]}>
            MISSION BRIEFING
          </Text>
          <Text style={[styles.terminalText, { color: modeText.color }]}>
            {displayedText}
          </Text>
          <Text style={[styles.terminalCursor, { color: modeText.color }]}>_</Text>
        </View>

        {/* Eliminated Players Section - NEW */}
        {eliminatedCount > 0 && (
          <View style={styles.eliminatedSection}>
            <Text style={styles.eliminatedTitle}>ELIMINATED AGENTS</Text>
            <View style={styles.eliminatedList}>
              {eliminatedPlayers.map((player: any) => (
                <Text key={player.id} style={styles.eliminatedPlayer}>
                  💀 {player.name}
                </Text>
              ))}
            </View>
          </View>
        )}

        {/* Game Instructions */}
        <View style={styles.instructions}>
          <Text style={styles.instructionsTitle}>MISSION PROTOCOL</Text>
          <Text style={styles.instructionsText}>
            {modeText.instructions}
          </Text>
        </View>

        {/* Current Agent Section */}
        <Animated.View 
          style={[
            styles.agentSection,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }]
            }
          ]}
        >
          <Text style={styles.sectionLabel}>ACTIVE AGENT</Text>
          <View style={[styles.agentCard, { borderColor: modeText.color }]}>
            <Text style={styles.agentBadge}>👤</Text>
            <Text style={[styles.agentName, { color: modeText.color }]}>
              {currentPlayer?.name || 'Unknown Agent'}
            </Text>
            <Text style={[styles.agentStatus, { color: modeText.color }]}>
              {isLastPlayer ? 'FINAL TRANSMISSION...' : 'TRANSMITTING...'}
            </Text>
            {isMultiSpy && (
              <Text style={styles.multiSpyHint}>
                {spyCount} OPERATIVE{spyCount > 1 ? 'S' : ''} AMONG US
              </Text>
            )}
          </View>
        </Animated.View>

        {/* Countdown Timer */}
        <View style={styles.timerSection}>
          <Text style={styles.timerLabel}>COMMS TIMER</Text>
          <Animated.Text 
            style={[
              styles.timer,
              {
                color: getTimerColor(),
                fontSize: getTimerSize(),
                transform: [{ scale: pulseAnim }]
              }
            ]}
          >
            {timer.toString().padStart(2, '0')}
          </Animated.Text>
          <Text style={styles.timerSubtext}>SECONDS REMAINING</Text>
          {isLastPlayer && (
            <Text style={[styles.finalAgentText, { color: modeText.color }]}>
              🎯 FINAL AGENT - {getNextPhaseText()}
            </Text>
          )}
        </View>

        {/* Progress Indicator */}
        <View style={styles.progressSection}>
          <Text style={styles.progressLabel}>
            ACTIVE AGENT {currentIndex + 1} OF {activePlayers.length}
          </Text>
          <View style={styles.progressBar}>
            {activePlayers.map((_: any, index: number) => (
              <View 
                key={index}
                style={[
                  styles.progressDot,
                  index <= currentIndex && [styles.progressDotActive, { backgroundColor: modeText.color, borderColor: modeText.color }],
                  index === currentIndex && styles.progressDotCurrent
                ]}
              />
            ))}
          </View>
        </View>

        {/* Control Panel */}
        <View style={styles.controls}>
          {/* Force Next Agent Button (for non-last players) */}
          {currentIndex < activePlayers.length - 1 && (
            <NeonButton
              title="⏭ FORCE NEXT AGENT"
              onPress={goToNextPlayer}
              color={isCritical ? '#FF4444' : modeText.color}
              size="medium"
            />
          )}

          {/* Force Start Next Phase Button (for last player) */}
          {isLastPlayer && timer > 0 && (
            <NeonButton
              title={getButtonTitle()}
              onPress={forceStartNextPhase}
              color="#FF4444"
              size="large"
            />
          )}

          {/* Auto Next Phase Button (when timer reaches 0 for last player) */}
          {isLastPlayer && timer === 0 && (
            <NeonButton
              title={getButtonTitle()}
              color="#FFD700"
              onPress={forceStartNextPhase}
              size="large"
            />
          )}
        </View>

        {/* Footer Status */}
        <View style={styles.footer}>
          <Text style={[styles.statusText, { color: modeText.color }]}>
            {isCritical ? '🚨 CRITICAL: TIME EXPIRING' : 
             isLastPlayer ? `🎯 FINAL AGENT: ${getNextPhaseText()}` : '✅ COMMS: SECURE'}
          </Text>
          <Text style={styles.encryptionText}>
            {isMultiSpy ? `👥 ${activePlayers.length} ACTIVE AGENTS | 💀 ${eliminatedCount} ELIMINATED` : '🔒 ENCRYPTION: AES-256 ACTIVE'}
          </Text>
        </View>
        
        {/* Add some extra space at the bottom for better scrolling */}
        <View style={styles.bottomSpacer} />
      </ScrollView>
    </LinearGradient>
  );
};

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
  criticalOverlay: {
    ...StyleSheet.absoluteFillObject,
  },
  header: {
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 15,
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
    fontSize: 12,
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
  modeIndicator: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 10,
    marginVertical: 5,
    alignItems: 'center',
    marginBottom: 15,
  },
  modeText: {
    fontSize: 14,
    fontWeight: 'bold',
    textAlign: 'center',
    textShadowColor: 'currentColor',
    textShadowRadius: 5,
  },
  terminal: {
    backgroundColor: 'rgba(0, 20, 40, 0.8)',
    borderWidth: 1,
    borderRadius: 8,
    padding: 15,
    marginVertical: 10,
  },
  terminalHeader: {
    fontSize: 12,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  terminalText: {
    fontSize: 11,
    fontFamily: 'monospace',
    lineHeight: 16,
  },
  terminalCursor: {
    fontSize: 12,
    fontFamily: 'monospace',
  },
  eliminatedSection: {
    backgroundColor: 'rgba(255, 0, 0, 0.1)',
    borderWidth: 1,
    borderColor: '#FF4444',
    borderRadius: 8,
    padding: 10,
    marginVertical: 5,
  },
  eliminatedTitle: {
    color: '#FF4444',
    fontSize: 12,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 5,
  },
  eliminatedList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 8,
  },
  eliminatedPlayer: {
    color: '#FF8888',
    fontSize: 10,
    fontStyle: 'italic',
  },
  instructions: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: '#444',
    borderRadius: 8,
    padding: 12,
    marginVertical: 10,
  },
  instructionsTitle: {
    color: '#FFD700',
    fontSize: 12,
    fontWeight: 'bold',
    marginBottom: 5,
    textAlign: 'center',
  },
  instructionsText: {
    color: '#C7D0D9',
    fontSize: 10,
    lineHeight: 14,
    textAlign: 'center',
  },
  agentSection: {
    alignItems: 'center',
    marginVertical: 15,
  },
  sectionLabel: {
    color: '#888',
    fontSize: 10,
    letterSpacing: 1,
    marginBottom: 8,
  },
  agentCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 2,
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    width: '80%',
    minHeight: 120,
    justifyContent: 'center',
  },
  agentBadge: {
    fontSize: 24,
    marginBottom: 8,
  },
  agentName: {
    fontSize: 22,
    fontWeight: 'bold',
    textShadowRadius: 10,
    marginBottom: 5,
    textAlign: 'center',
  },
  agentStatus: {
    fontSize: 12,
    marginTop: 5,
    fontStyle: 'italic',
    opacity: 0.8,
    textAlign: 'center',
  },
  multiSpyHint: {
    color: '#FFAA00',
    fontSize: 10,
    marginTop: 8,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  timerSection: {
    alignItems: 'center',
    marginVertical: 15,
    minHeight: 120,
    justifyContent: 'center',
  },
  timerLabel: {
    color: '#888',
    fontSize: 10,
    letterSpacing: 1,
    marginBottom: 5,
  },
  timer: {
    fontWeight: 'bold',
    textShadowRadius: 20,
    marginVertical: 10,
  },
  timerSubtext: {
    color: '#AAA',
    fontSize: 10,
    letterSpacing: 1,
  },
  finalAgentText: {
    fontSize: 12,
    fontWeight: 'bold',
    marginTop: 5,
    textShadowRadius: 5,
    textAlign: 'center',
    lineHeight: 16,
  },
  progressSection: {
    alignItems: 'center',
    marginVertical: 15,
  },
  progressLabel: {
    color: '#888',
    fontSize: 10,
    letterSpacing: 1,
    marginBottom: 8,
  },
  progressBar: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  progressDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#333',
    marginHorizontal: 4,
    borderWidth: 1,
    borderColor: '#666',
  },
  progressDotActive: {
    borderColor: 'currentColor',
  },
  progressDotCurrent: {
    transform: [{ scale: 1.2 }],
  },
  controls: {
    alignItems: 'center',
    marginVertical: 15,
    gap: 10,
  },
  footer: {
    alignItems: 'center',
    marginVertical: 15,
  },
  statusText: {
    fontSize: 12,
    fontWeight: 'bold',
    marginBottom: 5,
    textAlign: 'center',
    textShadowRadius: 5,
  },
  encryptionText: {
    color: '#666',
    fontSize: 10,
    letterSpacing: 1,
  },
  bottomSpacer: {
    height: 20,
  },
});

export default DiscussionScreen;