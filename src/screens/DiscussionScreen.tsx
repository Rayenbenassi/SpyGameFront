import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Easing } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { useNavigation, useRoute } from '@react-navigation/native';
import NeonButton from '../components/NeonButton';
import { RootStackParamList } from '../navigation/types';
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/native';

type DiscussionRouteProp = RouteProp<RootStackParamList, 'Discussion'>;
type NavProp = StackNavigationProp<RootStackParamList, 'Discussion'>;

const SPEAK_TIME = 20; // seconds per player

const DiscussionScreen = () => {
  const navigation = useNavigation<NavProp>();
  const route = useRoute<DiscussionRouteProp>();
  const { round, session } = route.params;

  const [currentIndex, setCurrentIndex] = useState(0);
  const [timer, setTimer] = useState(SPEAK_TIME);
  const [isCritical, setIsCritical] = useState(false);

  const players = session.players;
  const currentPlayer = players[currentIndex];
  const isLastPlayer = currentIndex === players.length - 1;

  // Animation values
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const glowAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  // Terminal typing effect for mission briefing
  const [displayedText, setDisplayedText] = useState('');
  const fullText = `MISSION: ${round.question.text}\nLOCATION: CLASSIFIED\nAGENTS: ${players.length}\nTIME PER AGENT: ${SPEAK_TIME}S`;

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
      // Intense red glow
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
    if (currentIndex < players.length - 1) {
      // Reset animations for next player
      slideAnim.setValue(50);
      fadeAnim.setValue(0);
      
      setCurrentIndex(currentIndex + 1);
      setTimer(SPEAK_TIME);
      setIsCritical(false);
    }
  };

  const forceStartVoting = () => {
    console.log('🚨 FORCE STARTING VOTING PHASE');
    navigation.navigate('Vote', { round, session });
  };

  const getTimerColor = () => {
    if (timer <= 5) return '#FF4444';
    if (timer <= 10) return '#FFAA00';
    return '#00FF88';
  };

  const getTimerSize = () => {
    if (timer <= 5) return 80;
    if (timer <= 10) return 70;
    return 60;
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
            backgroundColor: 'rgba(255, 0, 0, 0.1)'
          }
        ]} 
      />

      <View style={styles.container}>
        {/* Header Section */}
        <View style={styles.header}>
          <Text style={styles.agencyTitle}>CENTRAL INTELLIGENCE</Text>
          <Text style={styles.subtitle}>OPERATION: SPYFALL</Text>
          <View style={styles.separator} />
        </View>

        {/* Mission Briefing Terminal */}
        <View style={styles.terminal}>
          <Text style={styles.terminalHeader}> MISSION BRIEFING</Text>
          <Text style={styles.terminalText}>{displayedText}</Text>
          <Text style={styles.terminalCursor}>_</Text>
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
          <View style={styles.agentCard}>
            <Text style={styles.agentBadge}>👤</Text>
            <Text style={styles.agentName}>{currentPlayer.name}</Text>
            <Text style={styles.agentStatus}>
              {isLastPlayer ? 'FINAL TRANSMISSION...' : 'TRANSMITTING...'}
            </Text>
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
            <Text style={styles.finalAgentText}>🎯 FINAL AGENT - PREPARE FOR VOTING</Text>
          )}
        </View>

        {/* Progress Indicator */}
        <View style={styles.progressSection}>
          <Text style={styles.progressLabel}>
            AGENT {currentIndex + 1} OF {players.length}
          </Text>
          <View style={styles.progressBar}>
            {players.map((_: any, index: number) => (
              <View 
                key={index}
                style={[
                  styles.progressDot,
                  index <= currentIndex && styles.progressDotActive,
                  index === currentIndex && styles.progressDotCurrent
                ]}
              />
            ))}
          </View>
        </View>

        {/* Control Panel */}
        <View style={styles.controls}>
          {/* Force Next Agent Button (for non-last players) */}
          {currentIndex < players.length - 1 && (
            <NeonButton
              title="⏭ FORCE NEXT AGENT"
              onPress={goToNextPlayer}
              color={isCritical ? '#FF4444' : '#00FF88'}
              size="medium"
            />
          )}

          {/* Force Start Voting Button (for last player) */}
          {isLastPlayer && timer > 0 && (
            <NeonButton
              title="🚨 FORCE START VOTING"
              onPress={forceStartVoting}
              color="#FF4444"
              size="large"
            />
          )}

          {/* Auto Voting Button (when timer reaches 0 for last player) */}
          {isLastPlayer && timer === 0 && (
            <NeonButton
              title="🚨 INITIATE VOTING PROTOCOL"
              color="#FFD700"
              onPress={() => navigation.navigate('Vote', { round, session })}
              size="large"
            />
          )}
        </View>

        {/* Footer Status */}
        <View style={styles.footer}>
          <Text style={styles.statusText}>
            {isCritical ? '🚨 CRITICAL: TIME EXPIRING' : 
             isLastPlayer ? '🎯 FINAL AGENT: PREPARE TO VOTE' : '✅ COMMS: SECURE'}
          </Text>
          <Text style={styles.encryptionText}>🔒 ENCRYPTION: AES-256 ACTIVE</Text>
        </View>
      </View>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
  },
  container: {
    flex: 1,
    padding: 20,
    justifyContent: 'space-between',
  },
  criticalOverlay: {
    ...StyleSheet.absoluteFillObject,
  },
  header: {
    alignItems: 'center',
    marginTop: 10,
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
    width: '80%',
    height: 1,
    backgroundColor: '#00FFFF',
    marginTop: 10,
    opacity: 0.5,
  },
  terminal: {
    backgroundColor: 'rgba(0, 20, 40, 0.8)',
    borderWidth: 1,
    borderColor: '#00FFFF',
    borderRadius: 8,
    padding: 15,
    marginVertical: 10,
  },
  terminalHeader: {
    color: '#00FF88',
    fontSize: 12,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  terminalText: {
    color: '#00FFFF',
    fontSize: 11,
    fontFamily: 'monospace',
    lineHeight: 16,
  },
  terminalCursor: {
    color: '#00FF88',
    fontSize: 12,
    fontFamily: 'monospace',
  },
  agentSection: {
    alignItems: 'center',
    marginVertical: 10,
  },
  sectionLabel: {
    color: '#888',
    fontSize: 10,
    letterSpacing: 1,
    marginBottom: 8,
  },
  agentCard: {
    backgroundColor: 'rgba(0, 255, 255, 0.1)',
    borderWidth: 1,
    borderColor: '#00FFFF',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    width: '80%',
  },
  agentBadge: {
    fontSize: 24,
    marginBottom: 8,
  },
  agentName: {
    color: '#00FF88',
    fontSize: 22,
    fontWeight: 'bold',
    textShadowColor: '#00FF88',
    textShadowRadius: 10,
  },
  agentStatus: {
    color: '#00FFFF',
    fontSize: 12,
    marginTop: 5,
    fontStyle: 'italic',
  },
  timerSection: {
    alignItems: 'center',
    marginVertical: 10,
  },
  timerLabel: {
    color: '#888',
    fontSize: 10,
    letterSpacing: 1,
    marginBottom: 5,
  },
  timer: {
    fontWeight: 'bold',
    textShadowColor: '#00FF88',
    textShadowRadius: 20,
    marginVertical: 10,
  },
  timerSubtext: {
    color: '#AAA',
    fontSize: 10,
    letterSpacing: 1,
  },
  finalAgentText: {
    color: '#FFD700',
    fontSize: 12,
    fontWeight: 'bold',
    marginTop: 5,
    textShadowColor: '#FFD700',
    textShadowRadius: 5,
  },
  progressSection: {
    alignItems: 'center',
    marginVertical: 10,
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
    backgroundColor: '#00FF88',
    borderColor: '#00FF88',
  },
  progressDotCurrent: {
    backgroundColor: '#FFD700',
    borderColor: '#FFD700',
    transform: [{ scale: 1.2 }],
  },
  controls: {
    alignItems: 'center',
    marginVertical: 10,
    gap: 10,
  },
  footer: {
    alignItems: 'center',
    marginBottom: 10,
  },
  statusText: {
    color: '#00FF88',
    fontSize: 12,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  encryptionText: {
    color: '#666',
    fontSize: 10,
    letterSpacing: 1,
  },
});

export default DiscussionScreen;