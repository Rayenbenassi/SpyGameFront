// src/screens/GameLobbyScreen.tsx
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Alert,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../navigation/types';
import NeonButton from '../components/NeonButton';
import { gameAPI, GameMode } from '../services/gameAPI';

type GameLobbyScreenNavigationProp = StackNavigationProp<
  RootStackParamList,
  'GameLobby'
>;

type GameLobbyScreenRouteProp = RouteProp<RootStackParamList, 'GameLobby'>;

const GameLobbyScreen: React.FC = () => {
  const navigation = useNavigation<GameLobbyScreenNavigationProp>();
  const route = useRoute<GameLobbyScreenRouteProp>();
  const { sessionId } = route.params;
  
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    loadSessionStatus();
  }, [sessionId]);

  const loadSessionStatus = async () => {
    try {
      const sessionData = await gameAPI.getSessionStatus(sessionId);
      setSession(sessionData);
    } catch (error) {
      console.error('Failed to load session:', error);
      Alert.alert('Connection Lost', 'Unable to establish secure link to mission control.');
    } finally {
      setLoading(false);
    }
  };

  const startFirstRound = async () => {
    try {
      setLoading(true);
      const round = await gameAPI.startRound(sessionId);
      
      // Navigate to RevealRole with the proper parameters
      navigation.navigate('RevealRole', {
        session: session,
        round: round,
        players: session.players,
      });
    } catch (error) {
      console.error('Failed to start round:', error);
      Alert.alert('Launch Failed', 'Unable to initiate mission sequence.');
    } finally {
      setLoading(false);
    }
  };

  // Get game mode display information
  const getGameModeInfo = () => {
    const mode = session?.gameMode || 'CLASSIC';
    const spiesCount = session?.spiesCount || 1;
    
    switch (mode) {
      case 'MULTI_SPY':
        return {
          title: 'TEAM INFILTRATION',
          subtitle: `${spiesCount} COVERT OPERATIVE${spiesCount > 1 ? 'S' : ''}`,
          color: '#FF4444',
          bgColor: 'rgba(255, 68, 68, 0.1)'
        };
      case 'CLASSIC':
      default:
        return {
          title: 'SINGLE INFILTRATOR',
          subtitle: '1 COVERT OPERATIVE',
          color: '#00FFF0',
          bgColor: 'rgba(0, 255, 255, 0.1)'
        };
    }
  };

  // Get protocol text based on game mode
  const getProtocolText = () => {
    const mode = session?.gameMode || 'CLASSIC';
    const spiesCount = session?.spiesCount || 1;
    
    if (mode === 'MULTI_SPY') {
      return [
        `• ${spiesCount} AGENT${spiesCount > 1 ? 'S ARE' : ' IS'} DESIGNATED AS COVERT OPERATIVE${spiesCount > 1 ? 'S' : ''}`,
        '• OPERATIVES WORK TOGETHER TO ELIMINATE FIELD AGENTS',
        '• EACH ROUND: VOTE TO ELIMINATE ONE SUSPECTED OPERATIVE',
        '• OPERATIVES WIN IF THEY OUTNUMBER REMAINING AGENTS',
        '• AGENTS WIN BY IDENTIFYING ALL OPERATIVES'
      ];
    } else {
      return [
        '• ONE AGENT IS DESIGNATED AS THE COVERT OPERATIVE',
        '• FIELD AGENTS RECEIVE IDENTICAL INTEL',
        '• THE OPERATIVE RECEIVES ALTERNATIVE INTEL',
        '• IDENTIFY THE OPERATIVE THROUGH DEBRIEFING',
        '• SCORE POINTS BASED ON ACCURATE IDENTIFICATION'
      ];
    }
  };

  if (loading) {
    return (
      <LinearGradient colors={['#000000', '#041016', '#050A0C']} style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#00FFFF" />
        <Text style={styles.loadingText}>ESTABLISHING SECURE CONNECTION...</Text>
      </LinearGradient>
    );
  }

  if (!session) {
    return (
      <LinearGradient colors={['#000000', '#041016', '#050A0C']} style={styles.centerContainer}>
        <Text style={styles.errorText}>MISSION CONTROL OFFLINE</Text>
        <TouchableOpacity 
          onPress={loadSessionStatus}
          style={styles.retryButton}
        >
          <Text style={styles.retryButtonText}>RETRY CONNECTION</Text>
        </TouchableOpacity>
      </LinearGradient>
    );
  }

  const modeInfo = getGameModeInfo();
  const protocolText = getProtocolText();

  return (
    <LinearGradient colors={['#000000', '#041016', '#050A0C']} style={styles.gradient}>
      <View style={styles.overlay} />
      
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.title}>MISSION BRIEFING</Text>

        {/* Game Mode Banner */}
        <View style={[styles.modeBanner, { backgroundColor: modeInfo.bgColor, borderColor: modeInfo.color }]}>
          <Text style={[styles.modeTitle, { color: modeInfo.color }]}>
            {modeInfo.title}
          </Text>
          <Text style={[styles.modeSubtitle, { color: modeInfo.color }]}>
            {modeInfo.subtitle}
          </Text>
        </View>

        {/* Mission Intel Card */}
        <View style={styles.intelCard}>
          <Text style={styles.intelTitle}>OPERATION PARAMETERS</Text>
          <View style={styles.intelRow}>
            <Text style={styles.intelLabel}>MISSION TYPE:</Text>
            <Text style={[styles.intelValue, { color: modeInfo.color }]}>
              {session.gameMode === 'MULTI_SPY' ? 'TEAM INFILTRATION' : 'SINGLE INFILTRATOR'}
            </Text>
          </View>
          <View style={styles.intelRow}>
            <Text style={styles.intelLabel}>CATEGORY:</Text>
            <Text style={styles.intelValue}>{session.category?.name || 'CLASSIFIED'}</Text>
          </View>
          <View style={styles.intelRow}>
            <Text style={styles.intelLabel}>OPERATIVES:</Text>
            <Text style={[styles.intelValue, { color: modeInfo.color }]}>
              {session.spiesCount || 1}
            </Text>
          </View>
          <View style={styles.intelRow}>
            <Text style={styles.intelLabel}>PHASES:</Text>
            <Text style={styles.intelValue}>{session.currentRound || 0}/{session.numberOfRounds || 0}</Text>
          </View>
          <View style={styles.intelRow}>
            <Text style={styles.intelLabel}>ACTIVE AGENTS:</Text>
            <Text style={styles.intelValue}>{session.players?.length || 0}</Text>
          </View>
        </View>

        {/* Agent Roster */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>FIELD AGENTS</Text>
          {session.players?.map((player: any, index: number) => (
            <View key={player.id} style={styles.agentCard}>
              <Text style={styles.agentName}>👤 {player.name}</Text>
              <Text style={styles.agentStatus}>
                CLEARANCE: {player.score || 0}
                {player.isEliminated && (
                  <Text style={styles.eliminatedText}> • ELIMINATED</Text>
                )}
              </Text>
            </View>
          ))}
        </View>

        {/* Mission Protocol */}
        <View style={styles.protocolSection}>
          <Text style={styles.protocolTitle}>MISSION PROTOCOL</Text>
          {protocolText.map((text, index) => (
            <Text key={index} style={styles.protocolText}>
              {text}
            </Text>
          ))}
          
          {/* Additional Multi-Spy specific info */}
          {session.gameMode === 'MULTI_SPY' && (
            <View style={styles.multiSpyInfo}>
              <Text style={styles.multiSpyTitle}>ELIMINATION PROTOCOL</Text>
              <Text style={styles.multiSpyText}>
                • Each round concludes with one agent elimination
              </Text>
              <Text style={styles.multiSpyText}>
                • Game ends when operatives outnumber agents or all operatives are identified
              </Text>
              <Text style={styles.multiSpyText}>
                • Final scoring includes elimination bonuses
              </Text>
            </View>
          )}
        </View>

        {/* Launch Button */}
        <View style={styles.launchSection}>
          <NeonButton
            title={loading ? "INITIATING..." : "LAUNCH MISSION"}
            onPress={startFirstRound}
            disabled={loading}
          />
        </View>
      </ScrollView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 255, 200, 0.03)',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingVertical: 30,
  },
  title: {
    color: '#C7D0D9',
    fontSize: 32,
    fontWeight: '700',
    letterSpacing: 3,
    textAlign: 'center',
    marginBottom: 20,
  },
  loadingText: {
    color: '#00FFFF',
    marginTop: 20,
    fontSize: 14,
    letterSpacing: 1,
  },
  errorText: {
    color: '#FF4444',
    fontSize: 20,
    marginBottom: 20,
    textAlign: 'center',
  },
  retryButton: {
    backgroundColor: 'rgba(255, 68, 68, 0.2)',
    borderColor: '#FF4444',
    borderWidth: 2,
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  retryButtonText: {
    color: '#FF4444',
    fontSize: 18,
    fontWeight: 'bold',
    textShadowColor: '#FF4444',
    textShadowRadius: 8,
  },
  // Game Mode Banner
  modeBanner: {
    borderWidth: 2,
    borderRadius: 12,
    padding: 15,
    marginBottom: 20,
    alignItems: 'center',
  },
  modeTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 5,
    textShadowColor: 'currentColor',
    textShadowRadius: 8,
  },
  modeSubtitle: {
    fontSize: 14,
    textAlign: 'center',
    opacity: 0.9,
  },
  intelCard: {
    backgroundColor: 'rgba(0, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: '#00FFF0',
    borderRadius: 12,
    padding: 20,
    marginBottom: 25,
  },
  intelTitle: {
    color: '#00FFF0',
    fontSize: 16,
    fontWeight: '600',
    letterSpacing: 1,
    marginBottom: 15,
    textAlign: 'center',
  },
  intelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  intelLabel: {
    color: '#C7D0D9',
    fontSize: 14,
  },
  intelValue: {
    color: '#00FFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  section: {
    marginBottom: 25,
  },
  sectionTitle: {
    color: '#00FFF0',
    fontSize: 18,
    fontWeight: '600',
    letterSpacing: 1,
    marginBottom: 15,
  },
  agentCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: '#00FFF0',
    borderRadius: 8,
    padding: 15,
    marginBottom: 10,
  },
  agentName: {
    color: '#00FFFF',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 5,
  },
  agentStatus: {
    color: '#C7D0D9',
    fontSize: 14,
  },
  eliminatedText: {
    color: '#FF4444',
    fontWeight: 'bold',
  },
  protocolSection: {
    backgroundColor: 'rgba(0, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: '#00FFF0',
    borderRadius: 12,
    padding: 20,
    marginBottom: 25,
  },
  protocolTitle: {
    color: '#00FFF0',
    fontSize: 16,
    fontWeight: '600',
    letterSpacing: 1,
    marginBottom: 15,
    textAlign: 'center',
  },
  protocolText: {
    color: '#C7D0D9',
    fontSize: 14,
    marginBottom: 8,
    letterSpacing: 0.5,
  },
  // Multi-Spy specific styles
  multiSpyInfo: {
    marginTop: 15,
    paddingTop: 15,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 68, 68, 0.3)',
  },
  multiSpyTitle: {
    color: '#FF4444',
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  multiSpyText: {
    color: '#FF8888',
    fontSize: 12,
    marginBottom: 6,
    letterSpacing: 0.5,
  },
  launchSection: {
    marginTop: 20,
  },
});

export default GameLobbyScreen;