// src/screens/CreateSessionScreen.tsx
import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  FlatList,
  StyleSheet,
  Animated,
  Easing,
  Image,
  ScrollView,
  TouchableOpacity,
  Modal,
  Dimensions,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../navigation/types';
import NeonButton from '../components/NeonButton';
import { gameAPI } from '../services/gameAPI'; // FIXED: Remove separate testBackendConnection import

const { width, height } = Dimensions.get('window');

type CreateSessionScreenNavigationProp = StackNavigationProp<
  RootStackParamList,
  'CreateSession'
>;

// Game mode types
type GameMode = 'CLASSIC' | 'MULTI_SPY';

const CreateSessionScreen: React.FC = () => {
  const navigation = useNavigation<CreateSessionScreenNavigationProp>();
  const [players, setPlayers] = useState<string[]>(['']);
  const [selectedCategory, setSelectedCategory] = useState<string>('Locations');
  const [totalRounds, setTotalRounds] = useState<number>(3);
  const [gameMode, setGameMode] = useState<GameMode>('CLASSIC');
  const [spiesCount, setSpiesCount] = useState<number>(1);
  const [backendConnected, setBackendConnected] = useState<boolean | null>(null);
  const [showAlert, setShowAlert] = useState(false);
  const [alertConfig, setAlertConfig] = useState({
    title: '',
    message: '',
    type: 'warning' as 'warning' | 'error' | 'success'
  });

  const pulseAnim = useRef(new Animated.Value(1)).current;
  const alertScaleAnim = useRef(new Animated.Value(0.8)).current;
  const alertOpacityAnim = useRef(new Animated.Value(0)).current;
  const scanLineAnim = useRef(new Animated.Value(0)).current;

  // Calculate recommended spies count based on player count
  const calculateRecommendedSpies = (playerCount: number): number => {
    if (playerCount <= 4) return 1;
    if (playerCount <= 6) return 2;
    if (playerCount <= 8) return 3;
    return 4;
  };

  // Update spies count when players change or game mode changes
  useEffect(() => {
    const activePlayers = players.filter(p => p.trim() !== '').length;
    if (activePlayers >= 3 && gameMode === 'MULTI_SPY') {
      const recommended = calculateRecommendedSpies(activePlayers);
      setSpiesCount(recommended);
    } else if (gameMode === 'CLASSIC') {
      setSpiesCount(1);
    }
  }, [players.length, gameMode]);

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.2,
          duration: 1200,
          easing: Easing.ease,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1200,
          easing: Easing.ease,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, [pulseAnim]);

  // Scan line animation for alerts
  useEffect(() => {
    if (showAlert) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(scanLineAnim, {
            toValue: 1,
            duration: 2000,
            easing: Easing.linear,
            useNativeDriver: true,
          }),
          Animated.timing(scanLineAnim, {
            toValue: 0,
            duration: 0,
            useNativeDriver: true,
          }),
        ])
      ).start();
    }
  }, [showAlert]);

  // Test backend connection on component mount - FIXED
  useEffect(() => {
    const testConnection = async () => {
      console.log('🔗 Testing backend connection...');
      const isConnected = await gameAPI.testBackendConnection(); // FIXED: Use gameAPI.testBackendConnection
      console.log('🔗 Backend connection status:', isConnected);
      setBackendConnected(isConnected);
    };
    testConnection();
  }, []);

  // ... rest of your component code remains exactly the same ...
  const showMissionAlert = (title: string, message: string, type: 'warning' | 'error' | 'success' = 'warning') => {
    setAlertConfig({ title, message, type });
    setShowAlert(true);
    
    // Animate alert in
    Animated.parallel([
      Animated.timing(alertScaleAnim, {
        toValue: 1,
        duration: 400,
        easing: Easing.out(Easing.back(1.2)),
        useNativeDriver: true,
      }),
      Animated.timing(alertOpacityAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const hideAlert = () => {
    Animated.parallel([
      Animated.timing(alertScaleAnim, {
        toValue: 0.8,
        duration: 300,
        easing: Easing.in(Easing.ease),
        useNativeDriver: true,
      }),
      Animated.timing(alertOpacityAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setShowAlert(false);
    });
  };

  const addPlayer = () => setPlayers([...players, '']);

  const updatePlayer = (text: string, index: number) => {
    const updated = [...players];
    updated[index] = text;
    setPlayers(updated);
  };

  const removePlayer = (index: number) => {
    if (players.length > 1) {
      const updated = players.filter((_, i) => i !== index);
      setPlayers(updated);
    }
  };

  const getCategoryId = (categoryName: string): number => {
    const categories: { [key: string]: number } = {
      'Locations': 1,
      'Dates': 2,
      'Movies': 3,
      'Food': 4
    };
    return categories[categoryName] || 1;
  };

  const createGame = async () => {
    const trimmed = players.map(p => p.trim()).filter(p => p !== '');
    const activePlayersCount = trimmed.length;

    if (activePlayersCount < 3) {
      showMissionAlert(
        '🚨 MISSION REQUIREMENTS',
        'MINIMUM 3 AGENTS REQUIRED FOR COVERT OPERATIONS\n\n• Field Operations: 3+ Agents\n• Intelligence Gathering: Active\n• Mission Security: Compromised',
        'warning'
      );
      return;
    }

    // Validate spies count for multi-spy mode
    if (gameMode === 'MULTI_SPY') {
      const maxPossibleSpies = Math.max(1, Math.floor(activePlayersCount / 2));
      if (spiesCount >= activePlayersCount) {
        showMissionAlert(
          '🕵️ SPY COUNT ERROR',
          `TOO MANY SPIES CONFIGURED\n\n• Available Agents: ${activePlayersCount}\n• Configured Spies: ${spiesCount}\n• Maximum Allowed: ${maxPossibleSpies}\n\nAdjust spy count to continue.`,
          'error'
        );
        return;
      }

      if (spiesCount < 1) {
        showMissionAlert(
          '🕵️ SPY COUNT ERROR',
          'AT LEAST 1 SPY REQUIRED\n\n• Covert Operations: Requires infiltration\n• Mission parameters: Invalid\n• Adjust spy count to continue.',
          'error'
        );
        return;
      }
    }

    // Check for duplicate agent names
    const uniqueNames = new Set(trimmed);
    if (uniqueNames.size !== trimmed.length) {
      showMissionAlert(
        '👤 IDENTITY CONFLICT',
        'DUPLICATE AGENT IDENTITIES DETECTED\n\n• Each operative must have unique cover\n• Identity verification failed\n• Security protocol violation',
        'error'
      );
      return;
    }

    // Check backend connection first
    if (backendConnected === false) {
      showMissionAlert(
        '📡 COMMUNICATIONS FAILURE',
        'BACKEND SERVER OFFLINE\n\n• Secure channel: Compromised\n• Encryption: Failed\n• Mission status: ABORTED\n\nVerify server connection and retry.',
        'error'
      );
      return;
    }

    try {
      const sessionConfig = {
        categoryId: getCategoryId(selectedCategory),
        totalRounds: totalRounds,
        gameMode: gameMode,
        spiesCount: gameMode === 'MULTI_SPY' ? spiesCount : 1,
      };

      console.log('🔍 Final request data:', {
        playerNames: trimmed,
        sessionConfigDto: sessionConfig
      });

      const session = await gameAPI.createSession(trimmed, sessionConfig);
      navigation.navigate('GameLobby', { sessionId: session.id });

    } catch (error) {
      console.error('Mission deployment failed:', error);
      showMissionAlert(
        '💥 DEPLOYMENT FAILED',
        'MISSION LAUNCH SEQUENCE ABORTED\n\n• Secure connection: Failed\n• Intelligence network: Offline\n• Encryption protocol: Breached\n\nStandby for retry sequence.',
        'error'
      );
    }
  };

  const categories: string[] = ['Locations', 'Dates', 'Movies', 'Food'];
  const roundOptions: number[] = [1, 2, 3, 4, 5];
  
  // Spy count options for multi-spy mode
  const getSpyOptions = (): number[] => {
    const activePlayers = players.filter(p => p.trim() !== '').length;
    if (activePlayers < 3) return [1];
    
    const maxSpies = Math.max(1, Math.floor(activePlayers / 2));
    const options = [];
    for (let i = 1; i <= maxSpies; i++) {
      options.push(i);
    }
    return options;
  };

  const spyOptions = getSpyOptions();

  const getAlertColors = () => {
    switch (alertConfig.type) {
      case 'error':
        return {
          primary: '#FF4444',
          secondary: '#FF0000',
          glow: 'rgba(255, 0, 0, 0.3)',
          background: ['#1a0000', '#330000', '#4d0000']
        };
      case 'warning':
        return {
          primary: '#FFAA00',
          secondary: '#FF8800',
          glow: 'rgba(255, 170, 0, 0.3)',
          background: ['#1a1000', '#332200', '#4d3300']
        };
      case 'success':
        return {
          primary: '#00FF88',
          secondary: '#00FF00',
          glow: 'rgba(0, 255, 136, 0.3)',
          background: ['#001a00', '#003300', '#004d00']
        };
      default:
        return {
          primary: '#00FFFF',
          secondary: '#00FF88',
          glow: 'rgba(0, 255, 255, 0.3)',
          background: ['#001a1a', '#003333', '#004d4d']
        };
    }
  };

  const alertColors = getAlertColors();

  return (
    <LinearGradient colors={['#000000', '#041016', '#050A0C']} style={styles.gradient}>
      <View style={styles.overlay} />
      
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.header}>SPY GAME</Text>

        {/* Backend Connection Status */}
        {backendConnected !== null && (
          <View style={[
            styles.connectionStatus,
            backendConnected ? styles.connectionGood : styles.connectionBad
          ]}>
            <Text style={styles.connectionText}>
              {backendConnected ? '✅  CONNECTED to the Base' : '❌  OFFLINE'}
            </Text>
          </View>
        )}

        <View style={styles.centerContent}>
          <Text style={styles.subTitle}>MISSION CONFIGURATION</Text>
          <Animated.View style={[styles.fingerprintContainer, { transform: [{ scale: pulseAnim }] }]}>
            <Image
              source={require('../assets/fingerprint.png')}
              style={styles.fingerprint}
              resizeMode="contain"
            />
          </Animated.View>
          <Text style={styles.footerText}>SECURE CHANNEL ACTIVE</Text>
        </View>

        {/* Agent Roster */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>AGENT ROSTER</Text>
          <FlatList
            data={players}
            keyExtractor={(_, index) => index.toString()}
            scrollEnabled={false}
            renderItem={({ item, index }) => (
              <View style={styles.playerInputContainer}>
                <TextInput
                  style={styles.input}
                  placeholder={`Agent ${index + 1} Identity`}
                  placeholderTextColor="#00FFF0AA"
                  value={item}
                  onChangeText={text => updatePlayer(text, index)}
                />
                {players.length > 1 && (
                  <TouchableOpacity 
                    onPress={() => removePlayer(index)}
                    style={styles.removeButton}
                  >
                    <Text style={styles.removeButtonText}>×</Text>
                  </TouchableOpacity>
                )}
              </View>
            )}
          />
          <NeonButton title="+ ADD AGENT" onPress={addPlayer} />
        </View>

        {/* Mission Parameters */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>MISSION PARAMETERS</Text>
          
          {/* Game Mode Selection */}
          <Text style={styles.parameterLabel}>OPERATION MODE</Text>
          <View style={styles.optionsRow}>
            <TouchableOpacity
              onPress={() => setGameMode('CLASSIC')}
              style={[
                styles.modeButton,
                gameMode === 'CLASSIC' && styles.modeButtonSelected
              ]}
            >
              <Text style={[
                styles.modeButtonText,
                gameMode === 'CLASSIC' && styles.modeButtonTextSelected
              ]}>
                CLASSIC
              </Text>
              <Text style={styles.modeButtonSubtext}>
                Single Spy
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              onPress={() => setGameMode('MULTI_SPY')}
              style={[
                styles.modeButton,
                gameMode === 'MULTI_SPY' && styles.modeButtonSelected
              ]}
            >
              <Text style={[
                styles.modeButtonText,
                gameMode === 'MULTI_SPY' && styles.modeButtonTextSelected
              ]}>
                MULTI-SPY
              </Text>
              <Text style={styles.modeButtonSubtext}>
                Team Infiltration
              </Text>
            </TouchableOpacity>
          </View>

          {/* Spy Count Selection (only for Multi-Spy mode) */}
          {gameMode === 'MULTI_SPY' && (
            <>
              <Text style={styles.parameterLabel}>COVERT OPERATIVES</Text>
              <View style={styles.optionsRow}>
                {spyOptions.map(count => (
                  <TouchableOpacity
                    key={count}
                    onPress={() => setSpiesCount(count)}
                    style={[
                      styles.spyButton,
                      spiesCount === count && styles.spyButtonSelected
                    ]}
                  >
                    <Text style={[
                      styles.spyButtonText,
                      spiesCount === count && styles.spyButtonTextSelected
                    ]}>
                      {count}
                    </Text>
                    <Text style={styles.spyButtonSubtext}>
                      SPY{count > 1 ? 'IES' : ''}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
              <Text style={styles.recommendationText}>
                Recommended: {calculateRecommendedSpies(players.filter(p => p.trim() !== '').length)} spies for {players.filter(p => p.trim() !== '').length} agents
              </Text>
            </>
          )}

          {/* Category Selection */}
          <Text style={styles.parameterLabel}>INTEL CATEGORY</Text>
          <View style={styles.optionsRow}>
            {categories.map(category => (
              <TouchableOpacity
                key={category}
                onPress={() => setSelectedCategory(category)}
                style={[
                  styles.optionButton,
                  selectedCategory === category && styles.optionButtonSelected
                ]}
              >
                <Text style={[
                  styles.optionButtonText,
                  selectedCategory === category && styles.optionButtonTextSelected
                ]}>
                  {category}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Rounds Selection */}
          <Text style={styles.parameterLabel}>MISSION DURATION</Text>
          <View style={styles.optionsRow}>
            {roundOptions.map(rounds => (
              <TouchableOpacity
                key={rounds}
                onPress={() => setTotalRounds(rounds)}
                style={[
                  styles.roundButton,
                  totalRounds === rounds && styles.optionButtonSelected
                ]}
              >
                <Text style={[
                  styles.optionButtonText,
                  totalRounds === rounds && styles.optionButtonTextSelected
                ]}>
                  {rounds.toString()}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Mode Description */}
        <View style={styles.modeInfoContainer}>
          <Text style={styles.modeInfoTitle}>
            {gameMode === 'CLASSIC' ? 'CLASSIC MODE' : 'MULTI-SPY MODE'}
          </Text>
          <Text style={styles.modeInfoText}>
            {gameMode === 'CLASSIC' 
              ? '• 1 Spy among agents\n• Identify the spy each round\n• Score points per round'
              : `• ${spiesCount} Spies working together\n• Eliminate agents round by round\n• Final scoring with bonuses`
            }
          </Text>
        </View>

        {/* Deploy Mission Button */}
        <View style={styles.deploySection}>
          <NeonButton 
            title="DEPLOY MISSION" 
            onPress={createGame}
            disabled={backendConnected === false}
          />
        </View>
      </ScrollView>

      {/* Modern Spyfall Alert Modal */}
      <Modal
        visible={showAlert}
        transparent={true}
        animationType="none"
        onRequestClose={hideAlert}
      >
        <View style={styles.alertOverlay}>
          <Animated.View 
            style={[
              styles.alertContainer,
              {
                opacity: alertOpacityAnim,
                transform: [{ scale: alertScaleAnim }],
                borderColor: alertColors.primary,
                shadowColor: alertColors.secondary,
              }
            ]}
          >
            {/* Animated Scan Line */}
            <Animated.View 
              style={[
                styles.scanLine,
                {
                  backgroundColor: alertColors.primary,
                  transform: [{
                    translateY: scanLineAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0, 300]
                    })
                  }]
                }
              ]} 
            />

            {/* Alert Background */}
            <LinearGradient
              colors={alertColors.background}
              style={styles.alertBackground}
            >
              
              {/* Header */}
              <View style={styles.alertHeader}>
                <Text style={[styles.alertTitle, { color: alertColors.primary }]}>
                  {alertConfig.title}
                </Text>
                <View style={[styles.alertSeparator, { backgroundColor: alertColors.primary }]} />
              </View>

              {/* Message */}
              <View style={styles.alertMessageContainer}>
                <Text style={styles.alertMessage}>
                  {alertConfig.message}
                </Text>
              </View>

              {/* Status Indicators */}
              <View style={styles.statusContainer}>
                <View style={styles.statusItem}>
                  <Text style={[styles.statusDot, { color: alertColors.primary }]}>●</Text>
                  <Text style={styles.statusText}>SECURITY PROTOCOL</Text>
                </View>
                <View style={styles.statusItem}>
                  <Text style={[styles.statusDot, { color: alertColors.primary }]}>●</Text>
                  <Text style={styles.statusText}>INTELLIGENCE NETWORK</Text>
                </View>
                <View style={styles.statusItem}>
                  <Text style={[styles.statusDot, { color: alertColors.primary }]}>●</Text>
                  <Text style={styles.statusText}>FIELD OPERATIONS</Text>
                </View>
              </View>

              {/* Action Button */}
              <TouchableOpacity 
                style={[styles.alertButton, { borderColor: alertColors.primary }]}
                onPress={hideAlert}
              >
                <Text style={[styles.alertButtonText, { color: alertColors.primary }]}>
                   ACKNOWLEDGE
                </Text>
                <Text style={styles.alertButtonSubtext}>
                  CONFIRM RECEIPT OF TRANSMISSION
                </Text>
              </TouchableOpacity>

              {/* Footer */}
              <View style={styles.alertFooter}>
                <Text style={styles.alertFooterText}>
                  CLASSIFIED TRANSMISSION
                </Text>
                <Text style={styles.alertFooterSubtext}>
                  ENCRYPTION: AES-256 ACTIVE
                </Text>
              </View>
            </LinearGradient>
          </Animated.View>
        </View>
      </Modal>
    </LinearGradient>
  );
};

// ... your styles remain exactly the same ...
const styles = StyleSheet.create({
  gradient: {
    flex: 1,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 255, 200, 0.03)',
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingVertical: 30,
  },
  connectionStatus: {
    padding: 10,
    borderRadius: 8,
    marginBottom: 15,
    alignItems: 'center',
  },
  connectionGood: {
    backgroundColor: 'rgba(0, 255, 0, 0.1)',
    borderColor: '#00FF00',
    borderWidth: 1,
  },
  connectionBad: {
    backgroundColor: 'rgba(255, 0, 0, 0.1)',
    borderColor: '#FF0000',
    borderWidth: 1,
  },
  connectionText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  header: {
    color: '#C7D0D9',
    fontSize: 42,
    fontWeight: '700',
    letterSpacing: 3,
    textAlign: 'center',
    marginBottom: 10,
  },
  subTitle: {
    color: '#00FFF0',
    fontSize: 16,
    letterSpacing: 2,
    marginBottom: 10,
    textAlign: 'center',
  },
  centerContent: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 20,
  },
  fingerprintContainer: {
    width: 120,
    height: 120,
    justifyContent: 'center',
    alignItems: 'center',
  },
  fingerprint: {
    width: '100%',
    height: '100%',
    tintColor: '#00FFF0',
    opacity: 0.8,
  },
  footerText: {
    color: '#C7D0D9',
    marginTop: 15,
    fontSize: 14,
    letterSpacing: 2,
  },
  section: {
    marginBottom: 30,
  },
  sectionTitle: {
    color: '#00FFF0',
    fontSize: 18,
    fontWeight: '600',
    letterSpacing: 1,
    marginBottom: 15,
  },
  playerInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  input: {
    flex: 1,
    backgroundColor: 'rgba(0, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: '#00FFF0',
    borderRadius: 8,
    color: '#00FFF0',
    padding: 12,
    fontSize: 16,
    letterSpacing: 1,
    marginRight: 10,
  },
  removeButton: {
    backgroundColor: 'rgba(255, 0, 0, 0.3)',
    borderColor: '#FF0000',
    borderWidth: 2,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    minWidth: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  removeButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FF0000',
    textShadowColor: '#FF0000',
    textShadowRadius: 8,
  },
  parameterLabel: {
    color: '#C7D0D9',
    fontSize: 14,
    marginBottom: 8,
    marginTop: 15,
  },
  optionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  optionButton: {
    flex: 1,
    marginHorizontal: 4,
    paddingVertical: 10,
    borderWidth: 2,
    borderColor: '#00FFF0',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0, 255, 255, 0.05)',
  },
  optionButtonSelected: {
    backgroundColor: '#00FFF0',
  },
  optionButtonText: {
    fontSize: 12,
    color: '#00FFF0',
    fontWeight: '600',
    textShadowColor: '#00FFF0',
    textShadowRadius: 8,
  },
  optionButtonTextSelected: {
    color: '#000000',
    fontWeight: 'bold',
  },
  roundButton: {
    flex: 1,
    marginHorizontal: 4,
    paddingVertical: 12,
    borderWidth: 2,
    borderColor: '#00FFF0',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0, 255, 255, 0.05)',
  },
  deploySection: {
    marginTop: 20,
  },
  // New styles for game mode selection
  modeButton: {
    flex: 1,
    marginHorizontal: 4,
    paddingVertical: 15,
    borderWidth: 2,
    borderColor: '#00FFF0',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0, 255, 255, 0.05)',
  },
  modeButtonSelected: {
    backgroundColor: '#00FFF0',
  },
  modeButtonText: {
    fontSize: 14,
    color: '#00FFF0',
    fontWeight: 'bold',
    textShadowColor: '#00FFF0',
    textShadowRadius: 8,
  },
  modeButtonTextSelected: {
    color: '#000000',
    fontWeight: 'bold',
  },
  modeButtonSubtext: {
    fontSize: 10,
    color: '#00FFF0',
    marginTop: 4,
    opacity: 0.8,
  },
  // Spy button styles
  spyButton: {
    flex: 1,
    marginHorizontal: 4,
    paddingVertical: 12,
    borderWidth: 2,
    borderColor: '#FF4444',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 68, 68, 0.05)',
  },
  spyButtonSelected: {
    backgroundColor: '#FF4444',
  },
  spyButtonText: {
    fontSize: 16,
    color: '#FF4444',
    fontWeight: 'bold',
    textShadowColor: '#FF4444',
    textShadowRadius: 8,
  },
  spyButtonTextSelected: {
    color: '#000000',
    fontWeight: 'bold',
  },
  spyButtonSubtext: {
    fontSize: 9,
    color: '#FF4444',
    marginTop: 2,
    opacity: 0.8,
  },
  // Recommendation text
  recommendationText: {
    color: '#FFAA00',
    fontSize: 11,
    textAlign: 'center',
    marginTop: 8,
    fontStyle: 'italic',
  },
  // Mode info container
  modeInfoContainer: {
    backgroundColor: 'rgba(0, 255, 255, 0.08)',
    borderWidth: 1,
    borderColor: '#00FFF0',
    borderRadius: 12,
    padding: 15,
    marginBottom: 20,
  },
  modeInfoTitle: {
    color: '#00FFF0',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
  },
  modeInfoText: {
    color: '#C7D0D9',
    fontSize: 12,
    lineHeight: 18,
    textAlign: 'center',
  },
  // Alert Styles
  alertOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  alertContainer: {
    width: '90%',
    maxWidth: 400,
    borderRadius: 20,
    borderWidth: 3,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 20,
    elevation: 20,
    overflow: 'hidden',
  },
  scanLine: {
    position: 'absolute',
    width: '100%',
    height: 3,
    zIndex: 100,
    opacity: 0.6,
  },
  alertBackground: {
    padding: 25,
  },
  alertHeader: {
    alignItems: 'center',
    marginBottom: 20,
  },
  alertTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    textAlign: 'center',
    textShadowColor: 'currentColor',
    textShadowRadius: 10,
    marginBottom: 10,
  },
  alertSeparator: {
    width: '80%',
    height: 2,
    opacity: 0.6,
  },
  alertMessageContainer: {
    marginBottom: 25,
  },
  alertMessage: {
    color: '#FFFFFF',
    fontSize: 14,
    lineHeight: 20,
    textAlign: 'center',
    fontFamily: 'monospace',
  },
  statusContainer: {
    marginBottom: 25,
  },
  statusItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  statusDot: {
    fontSize: 12,
    marginRight: 10,
    textShadowColor: 'currentColor',
    textShadowRadius: 5,
  },
  statusText: {
    color: '#CCCCCC',
    fontSize: 11,
    letterSpacing: 1,
    fontFamily: 'monospace',
  },
  alertButton: {
    borderWidth: 2,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginBottom: 15,
  },
  alertButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
    textShadowColor: 'currentColor',
    textShadowRadius: 8,
  },
  alertButtonSubtext: {
    color: '#888888',
    fontSize: 10,
    letterSpacing: 1,
  },
  alertFooter: {
    alignItems: 'center',
  },
  alertFooterText: {
    color: '#00FF88',
    fontSize: 11,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  alertFooterSubtext: {
    color: '#666666',
    fontSize: 9,
    letterSpacing: 1,
  },
});

export default CreateSessionScreen;