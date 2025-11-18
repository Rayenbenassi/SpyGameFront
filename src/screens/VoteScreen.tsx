import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Alert, Animated, Easing, Modal, TouchableOpacity } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { useNavigation, useRoute } from '@react-navigation/native';
import NeonButton from '../components/NeonButton';
import { RootStackParamList } from '../navigation/types';
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/native';
import { gameAPI } from '../services/gameAPI';

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
  const [selectedPlayer, setSelectedPlayer] = useState<number | null>(null);
  const [showResultsModal, setShowResultsModal] = useState(false);

  const currentVoter = players[currentVoterIndex];

  // Animation values
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scanAnim = useRef(new Animated.Value(0)).current;
  const modalScaleAnim = useRef(new Animated.Value(0.8)).current;
  const modalOpacityAnim = useRef(new Animated.Value(0)).current;

  // Pulse animation for current voter
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.05,
          duration: 800,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 800,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, [currentVoterIndex]);

  // Scan animation effect
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(scanAnim, {
          toValue: 1,
          duration: 2000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(scanAnim, {
          toValue: 0,
          duration: 0,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  // Slide in animation for new voter
  useEffect(() => {
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 500,
        easing: Easing.out(Easing.back(1.2)),
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
    ]).start();
  }, [currentVoterIndex]);

  // Modal animation
  const showModal = () => {
    setShowResultsModal(true);
    Animated.parallel([
      Animated.timing(modalScaleAnim, {
        toValue: 1,
        duration: 400,
        easing: Easing.out(Easing.back(1.2)),
        useNativeDriver: true,
      }),
      Animated.timing(modalOpacityAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const hideModal = () => {
    Animated.parallel([
      Animated.timing(modalScaleAnim, {
        toValue: 0.8,
        duration: 300,
        easing: Easing.in(Easing.ease),
        useNativeDriver: true,
      }),
      Animated.timing(modalOpacityAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setShowResultsModal(false);
    });
  };

  const proceedToResults = () => {
    hideModal();
    setTimeout(() => {
      navigation.navigate('RoundSummary', { round, session });
    }, 300);
  };

  const submitVote = async (targetPlayer: any) => {
    try {
      setLoading(true);
      setSelectedPlayer(targetPlayer.id);

      console.log('🗳️ Submitting vote:', {
        roundId: round.id,
        voterId: currentVoter.id,
        votedForId: targetPlayer.id
      });

      // Use the gameAPI service
      const voteResult = await gameAPI.castVote(round.id, currentVoter.id, targetPlayer.id);

      console.log('✅ Vote submitted successfully:', voteResult);

      setVotes((prev) => [
        ...prev,
        { voterId: currentVoter.id, votedForId: targetPlayer.id }
      ]);

      if (currentVoterIndex < players.length - 1) {
        // Reset for next voter
        setSelectedPlayer(null);
        slideAnim.setValue(30);
        fadeAnim.setValue(0);
        
        setTimeout(() => {
          setCurrentVoterIndex(currentVoterIndex + 1);
        }, 500);
      } else {
        // All votes complete - show modern spy alert
        setTimeout(() => {
          showModal();
        }, 1000);
      }
    } catch (err: any) {
      console.error('❌ Vote submission error:', err);
      
      Alert.alert('🚨 TRANSMISSION FAILED', err.message || 'Could not secure vote transmission');
    } finally {
      setLoading(false);
    }
  };

  const getVoterStatus = () => {
    const votedCount = votes.filter(vote => 
      players.some((p: { id: number; }) => p.id === vote.voterId)
    ).length;
    return `${votedCount + 1}/${players.length}`;
  };

  return (
    <LinearGradient
      colors={['#0a0a0a', '#001122', '#002244']}
      style={styles.gradient}
    >
      {/* Scanning overlay effect */}
      <Animated.View 
        style={[
          styles.scanOverlay,
          {
            opacity: scanAnim.interpolate({
              inputRange: [0, 0.5, 1],
              outputRange: [0, 0.3, 0]
            }),
            transform: [{
              translateY: scanAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [0, 600]
              })
            }]
          }
        ]} 
      />

      <View style={styles.container}>
        {/* Header Section */}
        <View style={styles.header}>
          <Text style={styles.agencyTitle}>CENTRAL INTELLIGENCE</Text>
          <Text style={styles.subtitle}>VOTING PROTOCOL - ACTIVE</Text>
          <View style={styles.separator} />
        </View>

        {/* Mission Info */}
        <View style={styles.missionTerminal}>
          <Text style={styles.terminalHeader}> VOTING DIRECTIVE</Text>
          <Text style={styles.terminalText}>
            SPY IDENTIFICATION
          </Text>
          <Text style={styles.terminalText}>
            VOTE SECURITY: ENCRYPTED
          </Text>
        </View>

        {/* Current Voter Section */}
        <Animated.View 
          style={[
            styles.voterSection,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }]
            }
          ]}
        >
          <Text style={styles.sectionLabel}>ACTIVE VOTER</Text>
          <Animated.View 
            style={[
              styles.voterCard,
              {
                transform: [{ scale: pulseAnim }]
              }
            ]}
          >
            <Text style={styles.voterBadge}>👤</Text>
            <Text style={styles.voterName}>{currentVoter.name}</Text>
            <Text style={styles.voterStatus}>AWAITING INPUT...</Text>
          </Animated.View>
          <Text style={styles.progressText}>
            AGENT {getVoterStatus()} - SECURE CHANNEL ACTIVE
          </Text>
        </Animated.View>

        {/* Voting Instructions */}
        <View style={styles.instructionsSection}>
          <Text style={styles.instructionsTitle}>DIRECTIVE</Text>
          <Text style={styles.instructionsText}>
            Identify the suspected operative. Select with caution.
          </Text>
        </View>

        {/* Player Selection Grid */}
        <View style={styles.playersGrid}>
          {players.map((p: any) => {
            const alreadyVoted = votes.find((v) => v.voterId === currentVoter.id)?.votedForId === p.id;
            const isCurrentVoter = p.id === currentVoter.id;
            const isSelected = selectedPlayer === p.id;

            return (
              <View key={p.id} style={styles.playerItem}>
                <NeonButton
                  title={
                    isCurrentVoter
                      ? `🛡️ ${p.name} (SELF)`
                      : alreadyVoted
                      ? `✅ ${p.name}`
                      : isSelected
                      ? `🎯 ${p.name}`
                      : `👁️ ${p.name}`
                  }
                  disabled={loading || isCurrentVoter || alreadyVoted}
                  color={
                    isCurrentVoter ? '#666' :
                    alreadyVoted ? '#00FF88' :
                    isSelected ? '#FFD700' :
                    '#00FFFF'
                  }
                  onPress={() => submitVote(p)}
                  size="medium"
                />
                {isSelected && loading && (
                  <Text style={styles.transmittingText}>🔒 TRANSMITTING...</Text>
                )}
              </View>
            );
          })}
        </View>

        {/* Voting Progress */}
        <View style={styles.progressSection}>
          <Text style={styles.progressLabel}>VOTE PROGRESSION</Text>
          <View style={styles.progressBar}>
            {players.map((_:any, index:number) => (
              <View 
                key={index}
                style={[
                  styles.progressDot,
                  index <= currentVoterIndex && styles.progressDotActive,
                  index === currentVoterIndex && styles.progressDotCurrent
                ]}
              />
            ))}
          </View>
          <Text style={styles.progressStats}>
            {votes.length} / {players.length} VOTES SECURED
          </Text>
        </View>

        {/* Footer Status */}
        <View style={styles.footer}>
          <Text style={styles.statusText}>
            {loading ? '🔒 SECURING TRANSMISSION...' : '✅ READY FOR INPUT'}
          </Text>
          <Text style={styles.encryptionText}>🔒 AES-256 ENCRYPTION ACTIVE</Text>
        </View>
      </View>

      {/* Modern Spyfall Results Modal */}
      <Modal
        visible={showResultsModal}
        transparent={true}
        animationType="none"
        onRequestClose={hideModal}
      >
        <View style={styles.modalOverlay}>
          <Animated.View 
            style={[
              styles.modalContainer,
              {
                opacity: modalOpacityAnim,
                transform: [{ scale: modalScaleAnim }]
              }
            ]}
          >
            {/* Animated background effects */}
            <View style={styles.modalGlow} />
            <View style={styles.modalScanLines} />
            
            {/* Modal Content */}
            <LinearGradient
              colors={['#001122', '#002244', '#003366']}
              style={styles.modalContent}
            >
              {/* Header */}
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>🎯 VOTING COMPLETE</Text>
                <Text style={styles.modalSubtitle}>ALL INTELLIGENCE GATHERED</Text>
                <View style={styles.modalSeparator} />
              </View>

              {/* Mission Status */}
              <View style={styles.statusSection}>
                <Text style={styles.statusLabel}>OPERATION STATUS</Text>
                <View style={styles.statusBadge}>
                  <Text style={styles.statusValue}> MISSION DATA SECURED</Text>
                </View>
              </View>

              {/* Intelligence Report */}
              <View style={styles.reportSection}>
                <Text style={styles.reportTitle}>INTELLIGENCE BRIEFING</Text>
                <View style={styles.reportCard}>
                  <Text style={styles.reportText}>• {votes.length} VOTES PROCESSED</Text>
                  <Text style={styles.reportText}>• ENCRYPTION: AES-256 ACTIVE</Text>
                  <Text style={styles.reportText}>• DATA INTEGRITY: 100%</Text>
                </View>
              </View>

              {/* Action Buttons */}
              <View style={styles.modalButtons}>
                <TouchableOpacity 
                  style={[styles.modalButton, styles.analyzeButton]}
                  onPress={proceedToResults}
                >
                  <Text style={styles.analyzeButtonText}> ANALYZE RESULTS</Text>
                  <Text style={styles.buttonSubtext}>DECRYPT INTELLIGENCE DATA</Text>
                </TouchableOpacity>

                <TouchableOpacity 
                  style={[styles.modalButton, styles.cancelButton]}
                  onPress={hideModal}
                >
                  <Text style={styles.cancelButtonText}>⏸️ REVIEW DATA</Text>
                  <Text style={styles.buttonSubtext}>ADDITIONAL ANALYSIS</Text>
                </TouchableOpacity>
              </View>

              {/* Footer */}
              <View style={styles.modalFooter}>
                <Text style={styles.footerText}>CLASSIFIED: LEVEL ALPHA</Text>
                <Text style={styles.footerSubtext}>🔒 SECURE TRANSMISSION VERIFIED</Text>
              </View>
            </LinearGradient>
          </Animated.View>
        </View>
      </Modal>
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
  scanOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#00FFFF',
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
  missionTerminal: {
    backgroundColor: 'rgba(0, 20, 40, 0.8)',
    borderWidth: 1,
    borderColor: '#00FFFF',
    borderRadius: 8,
    padding: 12,
    marginVertical: 10,
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
    lineHeight: 14,
  },
  voterSection: {
    alignItems: 'center',
    marginVertical: 10,
  },
  sectionLabel: {
    color: '#888',
    fontSize: 10,
    letterSpacing: 1,
    marginBottom: 8,
  },
  voterCard: {
    backgroundColor: 'rgba(0, 255, 255, 0.1)',
    borderWidth: 2,
    borderColor: '#00FFFF',
    borderRadius: 12,
    padding: 15,
    alignItems: 'center',
    width: '70%',
  },
  voterBadge: {
    fontSize: 20,
    marginBottom: 6,
  },
  voterName: {
    color: '#00FF88',
    fontSize: 18,
    fontWeight: 'bold',
    textShadowColor: '#00FF88',
    textShadowRadius: 8,
  },
  voterStatus: {
    color: '#00FFFF',
    fontSize: 10,
    marginTop: 4,
    fontStyle: 'italic',
  },
  progressText: {
    color: '#AAA',
    fontSize: 10,
    marginTop: 8,
    letterSpacing: 1,
  },
  instructionsSection: {
    alignItems: 'center',
    marginVertical: 5,
  },
  instructionsTitle: {
    color: '#FFD700',
    fontSize: 12,
    fontWeight: 'bold',
    letterSpacing: 2,
    marginBottom: 4,
  },
  instructionsText: {
    color: '#CCC',
    fontSize: 11,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  playersGrid: {
    flex: 1,
    justifyContent: 'center',
    marginVertical: 10,
  },
  playerItem: {
    marginVertical: 6,
    alignItems: 'center',
  },
  transmittingText: {
    color: '#FFD700',
    fontSize: 10,
    marginTop: 4,
    fontWeight: 'bold',
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
    marginBottom: 8,
  },
  progressDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#333',
    marginHorizontal: 3,
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
    transform: [{ scale: 1.3 }],
  },
  progressStats: {
    color: '#00FFFF',
    fontSize: 10,
    fontWeight: 'bold',
  },
  footer: {
    alignItems: 'center',
    marginBottom: 10,
  },
  statusText: {
    color: '#00FF88',
    fontSize: 11,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  encryptionText: {
    color: '#666',
    fontSize: 9,
    letterSpacing: 1,
  },
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContainer: {
    width: '90%',
    maxWidth: 400,
    borderRadius: 20,
    overflow: 'hidden',
  },
  modalGlow: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#00FFFF',
    opacity: 0.1,
  },
  modalScanLines: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'transparent',
    opacity: 0.05,
  },
  modalContent: {
    padding: 25,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: '#00FFFF',
  },
  modalHeader: {
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    color: '#00FFFF',
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    textShadowColor: '#00FFFF',
    textShadowRadius: 10,
    marginBottom: 5,
  },
  modalSubtitle: {
    color: '#FFD700',
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 10,
  },
  modalSeparator: {
    width: '60%',
    height: 2,
    backgroundColor: '#00FFFF',
    opacity: 0.5,
  },
  statusSection: {
    alignItems: 'center',
    marginBottom: 20,
  },
  statusLabel: {
    color: '#888',
    fontSize: 12,
    letterSpacing: 1,
    marginBottom: 8,
  },
  statusBadge: {
    backgroundColor: 'rgba(0, 255, 136, 0.1)',
    borderWidth: 1,
    borderColor: '#00FF88',
    borderRadius: 8,
    paddingHorizontal: 15,
    paddingVertical: 8,
  },
  statusValue: {
    color: '#00FF88',
    fontSize: 14,
    fontWeight: 'bold',
  },
  reportSection: {
    marginBottom: 25,
  },
  reportTitle: {
    color: '#FFD700',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 10,
  },
  reportCard: {
    backgroundColor: 'rgba(0, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: '#00FFFF',
    borderRadius: 8,
    padding: 15,
  },
  reportText: {
    color: '#00FFFF',
    fontSize: 12,
    marginBottom: 5,
    fontFamily: 'monospace',
  },
  modalButtons: {
    gap: 12,
  },
  modalButton: {
    borderRadius: 12,
    padding: 18,
    alignItems: 'center',
    borderWidth: 2,
  },
  analyzeButton: {
    backgroundColor: 'rgba(0, 255, 136, 0.1)',
    borderColor: '#00FF88',
  },
  cancelButton: {
    backgroundColor: 'rgba(0, 255, 255, 0.1)',
    borderColor: '#00FFFF',
  },
  analyzeButtonText: {
    color: '#00FF88',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  cancelButtonText: {
    color: '#00FFFF',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  buttonSubtext: {
    color: '#888',
    fontSize: 10,
    letterSpacing: 1,
  },
  modalFooter: {
    alignItems: 'center',
    marginTop: 20,
  },
  footerText: {
    color: '#00FF88',
    fontSize: 11,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  footerSubtext: {
    color: '#666',
    fontSize: 9,
    letterSpacing: 1,
  },
});

export default VoteScreen;