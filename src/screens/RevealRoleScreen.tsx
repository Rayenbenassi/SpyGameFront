import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Easing } from 'react-native';
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
  
  // Animation values
  const progress = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const glowAnim = useRef(new Animated.Value(0)).current;
  const flashAnim = useRef(new Animated.Value(0)).current;

  // Parse spy data for Multi-Spy mode
  const getSpyIds = (): number[] => {
    try {
      if (session.gameMode === 'MULTI_SPY' && round.spyData) {
        const spyData = JSON.parse(round.spyData);
        return spyData.spyIds || [];
      }
      // For Classic mode or fallback
      return round.spy?.id ? [round.spy.id] : [];
    } catch (error) {
      console.error('Error parsing spy data:', error);
      return round.spy?.id ? [round.spy.id] : [];
    }
  };

  const spyIds = getSpyIds();
  const currentPlayer = players[currentIndex];
  const isSpy = spyIds.includes(currentPlayer.id);

  // Get game mode specific text
  const getGameModeText = () => {
    if (session.gameMode === 'MULTI_SPY') {
      return {
        operativeType: 'COVERT OPERATIVE',
        operativeCount: `${spyIds.length} OPERATIVES`,
        teamText: 'TEAM INFILTRATION',
        spyColor: '#FF4444'
      };
    } else {
      return {
        operativeType: 'UNDERCOVER OPERATIVE',
        operativeCount: '1 OPERATIVE',
        teamText: 'SINGLE INFILTRATOR',
        spyColor: '#FF3366'
      };
    }
  };

  const modeText = getGameModeText();

  // Pulse animation for current player
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
  }, [currentIndex]);

  // Slide in animation for new player
  useEffect(() => {
    if (!revealed) {
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 600,
          easing: Easing.out(Easing.back(1.5)),
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [currentIndex, revealed]);

  // Progress animation and visual effects for reveal
  useEffect(() => {
    if (revealed) {
      // Flash effect on reveal
      Animated.sequence([
        Animated.timing(flashAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(flashAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();

      // Start progress bar
      Animated.timing(progress, {
        toValue: 1,
        duration: 2500,
        useNativeDriver: false,
        easing: Easing.out(Easing.ease),
      }).start();

      // Spy-specific glow effect
      if (isSpy) {
        Animated.timing(glowAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }).start();
      }
    } else {
      progress.setValue(0);
      glowAnim.setValue(0);
    }
  }, [revealed]);

  const handleReveal = () => {
    // Enhanced visual feedback instead of vibration
    Animated.sequence([
      Animated.timing(flashAnim, {
        toValue: 1,
        duration: 150,
        useNativeDriver: true,
      }),
      Animated.timing(flashAnim, {
        toValue: 0,
        duration: 150,
        useNativeDriver: true,
      }),
    ]).start();
    
    setRevealed(true);
  };

  const handleNext = () => {
    // Visual feedback for next action
    Animated.sequence([
      Animated.timing(flashAnim, {
        toValue: 0.5,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(flashAnim, {
        toValue: 0,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();

    setRevealed(false);
    slideAnim.setValue(50);
    fadeAnim.setValue(0);
    
    if (currentIndex < players.length - 1) {
      setTimeout(() => setCurrentIndex(currentIndex + 1), 300);
    } else {
      setTimeout(() => navigation.navigate('Discussion', { round, session }), 300);
    }
  };

  const progressWidth = progress.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
  });

  // Get spy count text for display
  const getSpyCountText = () => {
    if (session.gameMode === 'MULTI_SPY') {
      return `${spyIds.length} COVERT OPERATIVES`;
    }
    return '1 COVERT OPERATIVE';
  };

  return (
    <LinearGradient 
      colors={['#0a0a0a', '#001122', '#002244']} 
      style={styles.container}
    >
      {/* Flash overlay for visual feedback */}
      <Animated.View 
        style={[
          styles.flashOverlay,
          {
            opacity: flashAnim,
            backgroundColor: 'rgba(255, 255, 255, 0.2)'
          }
        ]} 
      />

      {/* Spy danger glow overlay */}
      <Animated.View 
        style={[
          styles.spyGlow,
          {
            opacity: glowAnim,
            backgroundColor: isSpy ? 'rgba(255, 0, 0, 0.1)' : 'rgba(0, 255, 136, 0.05)'
          }
        ]} 
      />

      {!revealed ? (
        <Animated.View 
          style={[
            styles.passContainer,
            {
              opacity: fadeAnim,
              transform: [
                { translateY: slideAnim },
                { scale: pulseAnim }
              ]
            }
          ]}
        >
          {/* Header Section */}
          <View style={styles.header}>
            <Text style={styles.agencyTitle}>CENTRAL INTELLIGENCE</Text>
            <Text style={styles.subtitle}>OPERATION: {modeText.teamText}</Text>
            <View style={styles.separator} />
          </View>

          {/* Game Mode Indicator */}
          <View style={styles.modeIndicator}>
            <Text style={styles.modeText}>
              {getSpyCountText()} ACTIVE
            </Text>
          </View>

          {/* Device Handoff Terminal */}
          <View style={styles.terminal}>
            <Text style={styles.terminalHeader}>DEVICE HANDOFF PROTOCOL</Text>
            <Text style={styles.terminalText}>
              AGENT IDENTIFICATION REQUIRED
            </Text>
          </View>

          <Text style={styles.prompt}>PASS DEVICE TO OPERATIVE:</Text>
          
          <View style={styles.agentCard}>
            <Text style={styles.agentBadge}>👤</Text>
            <Text style={styles.agentName}>{currentPlayer.name}</Text>
            <Text style={styles.agentStatus}>AWAITING CLEARANCE...</Text>
          </View>

          <Text style={styles.progressText}>
            AGENT {currentIndex + 1} OF {players.length}
          </Text>

          <NeonButton 
            title="🔓 REVEAL CLASSIFIED ROLE" 
            onPress={handleReveal} 
            color="#00FFFF"
            size="large"
          />
        </Animated.View>
      ) : (
        <View style={styles.roleContainer}>
          {/* Header Section */}
          <View style={styles.header}>
            <Text style={styles.agencyTitle}>CENTRAL INTELLIGENCE</Text>
            <Text style={styles.subtitle}>CLASSIFIED BRIEFING</Text>
            <View style={styles.separator} />
          </View>

          {isSpy ? (
            // SPY REVEAL
            <View style={styles.spyContainer}>
              <Text style={styles.alertLevel}>🚨 ALERT LEVEL: MAXIMUM</Text>
              <Text style={styles.spyText}>{modeText.operativeType}</Text>
              
              {/* Multi-Spy team info */}
              {session.gameMode === 'MULTI_SPY' && (
                <Text style={styles.teamInfo}>
                  TEAM SIZE: {spyIds.length} OPERATIVES
                </Text>
              )}
              
              <Text style={styles.warningText}>YOUR COVER IS ACTIVE</Text>

              <View style={styles.missionBrief}>
                <Text style={styles.briefHeader}>COVERT MISSION:</Text>
                <Text style={styles.spyQuestion}>
                  {round.question.altText || 'What is the secret location?'}
                </Text>
                
                {/* Multi-Spy specific instructions */}
                {session.gameMode === 'MULTI_SPY' && (
                  <View style={styles.teamInstructions}>
                    <Text style={styles.teamInstructionText}>
                      • Work with your {spyIds.length - 1} fellow operative{spyIds.length > 2 ? 's' : ''}
                    </Text>
                    <Text style={styles.teamInstructionText}>
                      • Eliminate agents through voting
                    </Text>
                    <Text style={styles.teamInstructionText}>
                      • Win by outnumbering remaining agents
                    </Text>
                  </View>
                )}
              </View>

              <Text style={styles.decryptLabel}>DECRYPTING INTELLIGENCE...</Text>
              <View style={styles.progressBar}>
                <Animated.View style={[styles.progressFillRed, { width: progressWidth }]} />
              </View>

              <View style={styles.statusPanel}>
                <Text style={styles.statusCritical}>⚠️ ACCESS: TOP SECRET</Text>
                <Text style={styles.statusCritical}>🚨 TRACE RISK: ACTIVE</Text>
                <Text style={styles.statusCritical}>🔓 ENCRYPTION: VERIFIED</Text>
                {session.gameMode === 'MULTI_SPY' && (
                  <Text style={styles.statusCritical}>👥 TEAM OPERATION: ACTIVE</Text>
                )}
              </View>
            </View>
          ) : (
            // CIVILIAN REVEAL
            <View style={styles.civilianContainer}>
              <Text style={styles.clearanceLevel}>✅ CLEARANCE: STANDARD</Text>
              <Text style={styles.civilianText}>FIELD AGENT</Text>
              
              {/* Multi-Spy threat info */}
              {session.gameMode === 'MULTI_SPY' && (
                <Text style={styles.threatInfo}>
                  THREAT LEVEL: {spyIds.length} OPERATIVES DETECTED
                </Text>
              )}
              
              <Text style={styles.safeText}>YOUR IDENTITY IS SECURE</Text>

              <View style={styles.missionBrief}>
                <Text style={styles.briefHeader}>MISSION BRIEFING:</Text>
                <Text style={styles.civilianQuestion}>
                  {round.question.text}
                </Text>
                
                {/* Multi-Spy specific instructions */}
                {session.gameMode === 'MULTI_SPY' && (
                  <View style={styles.agentInstructions}>
                    <Text style={styles.agentInstructionText}>
                      • Identify and eliminate {spyIds.length} covert operative{spyIds.length > 1 ? 's' : ''}
                    </Text>
                    <Text style={styles.agentInstructionText}>
                      • Vote to eliminate one suspect each round
                    </Text>
                    <Text style={styles.agentInstructionText}>
                      • Win by identifying all operatives
                    </Text>
                  </View>
                )}
              </View>

              <Text style={styles.syncLabel}>SYNCING INTELLIGENCE...</Text>
              <View style={styles.progressBar}>
                <Animated.View style={[styles.progressFillGreen, { width: progressWidth }]} />
              </View>

              <View style={styles.statusPanel}>
                <Text style={styles.statusSafe}>✅ ACCESS: CONFIDENTIAL</Text>
                <Text style={styles.statusSafe}>🛡️ TRACE RISK: LOW</Text>
                <Text style={styles.statusSafe}>🔒 ENCRYPTION: VERIFIED</Text>
                {session.gameMode === 'MULTI_SPY' && (
                  <Text style={styles.statusSafe}>🎯 TARGETS: {spyIds.length} OPERATIVES</Text>
                )}
              </View>
            </View>
          )}

          <View style={styles.nextButton}>
            <NeonButton
              title={
                currentIndex < players.length - 1 
                  ? "🔄 NEXT OPERATIVE" 
                  : " INITIATE DISCUSSION"
              }
              onPress={handleNext}
              color={isSpy ? modeText.spyColor : '#00FF88'}
              size="large"
            />
          </View>

          <Text style={styles.footerText}>
            {currentIndex + 1} of {players.length} agents processed
          </Text>
        </View>
      )}
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  flashOverlay: {
    ...StyleSheet.absoluteFillObject,
  },
  spyGlow: {
    ...StyleSheet.absoluteFillObject,
  },
  passContainer: {
    alignItems: 'center',
    width: '100%',
  },
  roleContainer: {
    alignItems: 'center',
    width: '100%',
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
    color: '#FFD700',
    fontSize: 12,
    letterSpacing: 2,
    marginTop: 5,
  },
  separator: {
    width: '60%',
    height: 1,
    backgroundColor: '#00FFFF',
    marginTop: 10,
    opacity: 0.5,
  },
  modeIndicator: {
    backgroundColor: 'rgba(255, 68, 68, 0.1)',
    borderWidth: 1,
    borderColor: '#FF4444',
    borderRadius: 8,
    padding: 8,
    marginBottom: 10,
  },
  modeText: {
    color: '#FF4444',
    fontSize: 12,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  terminal: {
    backgroundColor: 'rgba(0, 20, 40, 0.8)',
    borderWidth: 1,
    borderColor: '#00FFFF',
    borderRadius: 8,
    padding: 12,
    marginVertical: 15,
    width: '90%',
  },
  terminalHeader: {
    color: '#00FF88',
    fontSize: 11,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  terminalText: {
    color: '#00FFFF',
    fontSize: 10,
    fontFamily: 'monospace',
  },
  prompt: {
    color: '#FFFFFF',
    fontSize: 18,
    marginBottom: 15,
    textAlign: 'center',
  },
  agentCard: {
    backgroundColor: 'rgba(0, 255, 255, 0.1)',
    borderWidth: 2,
    borderColor: '#00FFFF',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    width: '80%',
    marginBottom: 15,
  },
  agentBadge: {
    fontSize: 24,
    marginBottom: 8,
  },
  agentName: {
    color: '#00FF88',
    fontSize: 24,
    fontWeight: 'bold',
    textShadowColor: '#00FF88',
    textShadowRadius: 8,
  },
  agentStatus: {
    color: '#00FFFF',
    fontSize: 12,
    marginTop: 5,
    fontStyle: 'italic',
  },
  progressText: {
    color: '#AAA',
    fontSize: 12,
    marginBottom: 20,
    letterSpacing: 1,
  },
  spyContainer: {
    alignItems: 'center',
    width: '100%',
  },
  civilianContainer: {
    alignItems: 'center',
    width: '100%',
  },
  alertLevel: {
    color: '#FF4444',
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 10,
    textShadowColor: '#FF4444',
    textShadowRadius: 5,
  },
  clearanceLevel: {
    color: '#00FF88',
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 10,
    textShadowColor: '#00FF88',
    textShadowRadius: 5,
  },
  spyText: {
    color: '#FF0033',
    fontSize: 28,
    fontWeight: 'bold',
    letterSpacing: 2,
    marginBottom: 8,
    textShadowColor: '#FF0033',
    textShadowRadius: 15,
  },
  civilianText: {
    color: '#00FFAA',
    fontSize: 28,
    fontWeight: 'bold',
    letterSpacing: 1,
    marginBottom: 8,
    textShadowColor: '#00FFAA',
    textShadowRadius: 12,
  },
  teamInfo: {
    color: '#FF8888',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 5,
  },
  threatInfo: {
    color: '#FFAA00',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 5,
  },
  warningText: {
    color: '#FF6666',
    fontSize: 16,
    marginBottom: 20,
    fontStyle: 'italic',
  },
  safeText: {
    color: '#88FF88',
    fontSize: 16,
    marginBottom: 20,
    fontStyle: 'italic',
  },
  missionBrief: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: '#444',
    borderRadius: 10,
    padding: 15,
    marginBottom: 20,
    width: '90%',
  },
  briefHeader: {
    color: '#00FFFF',
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
  },
  spyQuestion: {
    color: '#FF8888',
    fontSize: 18,
    textAlign: 'center',
    fontWeight: '500',
    marginBottom: 10,
  },
  civilianQuestion: {
    color: '#FFFFFF',
    fontSize: 18,
    textAlign: 'center',
    fontWeight: '500',
    marginBottom: 10,
  },
  teamInstructions: {
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 68, 68, 0.3)',
  },
  agentInstructions: {
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0, 255, 136, 0.3)',
  },
  teamInstructionText: {
    color: '#FF8888',
    fontSize: 12,
    marginBottom: 4,
    textAlign: 'center',
  },
  agentInstructionText: {
    color: '#88FF88',
    fontSize: 12,
    marginBottom: 4,
    textAlign: 'center',
  },
  decryptLabel: {
    color: '#FF8888',
    fontSize: 13,
    marginBottom: 8,
    letterSpacing: 1,
  },
  syncLabel: {
    color: '#88FF88',
    fontSize: 13,
    marginBottom: 8,
    letterSpacing: 1,
  },
  progressBar: {
    width: '80%',
    height: 6,
    backgroundColor: '#1A1A1A',
    borderColor: '#333',
    borderWidth: 1,
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: 15,
  },
  progressFillRed: {
    height: '100%',
    backgroundColor: '#FF0033',
  },
  progressFillGreen: {
    height: '100%',
    backgroundColor: '#00FF99',
  },
  statusPanel: {
    marginBottom: 25,
  },
  statusCritical: {
    color: '#FF4444',
    fontSize: 12,
    letterSpacing: 1,
    marginBottom: 5,
    textAlign: 'center',
  },
  statusSafe: {
    color: '#00FFAA',
    fontSize: 12,
    letterSpacing: 1,
    marginBottom: 5,
    textAlign: 'center',
  },
  nextButton: {
    marginTop: 10,
    marginBottom: 15,
  },
  footerText: {
    color: '#666',
    fontSize: 11,
    letterSpacing: 1,
  },
});

export default RevealRoleScreen;