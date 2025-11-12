import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
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
  const [progress] = useState(new Animated.Value(0));

  const currentPlayer = players[currentIndex];
  const isSpy = currentPlayer.name === round.spy.name;

  useEffect(() => {
    if (revealed) {
      Animated.timing(progress, {
        toValue: 1,
        duration: 2500,
        useNativeDriver: false,
      }).start();
    } else {
      progress.setValue(0);
    }
  }, [revealed]);

  const handleReveal = () => setRevealed(true);

  const handleNext = () => {
    setRevealed(false);
    if (currentIndex < players.length - 1) {
      setTimeout(() => setCurrentIndex(currentIndex + 1), 300);
    } else {
      navigation.navigate('Discussion', { round, session });
    }
  };

  const progressWidth = progress.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
  });

  return (
    <LinearGradient colors={['#000000', '#041016', '#0C0F16']} style={styles.container}>
      {!revealed ? (
        <>
          <Text style={styles.title}>SPY GAME</Text>
          <Text style={styles.prompt}>Pass the device to:</Text>
          <Text style={styles.playerName}>{currentPlayer.name}</Text>
          <NeonButton title="REVEAL MY ROLE" onPress={handleReveal} color="#00FFFF" />
        </>
      ) : (
        <View style={styles.roleContainer}>
          <Text style={styles.title}>SPY GAME</Text>

          {isSpy ? (
            <>
              <Text style={styles.spyText}>YOU ARE THE SPY</Text>
              <Text style={styles.subText}>MISSION QUESTION:</Text>
              <Text style={styles.question}>
                {round.question.altText || 'What is the secret location?'}
              </Text>

              <Text style={styles.decryptLabel}>DECRYPTING FILE...</Text>
              <View style={styles.progressBar}>
                <Animated.View style={[styles.progressFill, { width: progressWidth }]} />
              </View>
              <Text style={styles.statusText}>ACCESS LEVEL: TOP SECRET</Text>
              <Text style={styles.statusText}>TRACE RISK: ACTIVE</Text>
              <Text style={styles.statusText}>ENCRYPTION KEY VERIFIED</Text>
            </>
          ) : (
            <>
              <Text style={styles.civilianText}>YOU ARE NOT THE SPY</Text>
              <Text style={styles.subText}>MISSION QUESTION:</Text>
              <Text style={styles.question}>{round.question.text}</Text>

              <Text style={styles.decryptLabel}>FILE SYNC COMPLETE</Text>
              <View style={styles.progressBar}>
                <Animated.View style={[styles.progressFillGreen, { width: progressWidth }]} />
              </View>
              <Text style={styles.statusTextGreen}>ACCESS LEVEL: CONFIDENTIAL</Text>
              <Text style={styles.statusTextGreen}>TRACE RISK: LOW</Text>
              <Text style={styles.statusTextGreen}>ENCRYPTION KEY VERIFIED</Text>
            </>
          )}

          <View style={{ marginTop: 40 }}>
            <NeonButton
              title={currentIndex < players.length - 1 ? 'CONTINUE' : 'START DISCUSSION'}
              onPress={handleNext}
              color={isSpy ? '#FF0033' : '#00FF99'}
            />
          </View>
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
    padding: 24,
  },
  title: {
    color: '#00FFFF',
    fontSize: 26,
    letterSpacing: 3,
    marginBottom: 20,
    textShadowColor: '#00FFFF88',
    textShadowRadius: 10,
    fontWeight: '700',
  },
  prompt: {
    color: '#FFFFFF',
    fontSize: 20,
    marginBottom: 10,
  },
  playerName: {
    color: '#00FFFF',
    fontSize: 34,
    fontWeight: 'bold',
    marginBottom: 40,
    textShadowColor: '#00FFFFAA',
    textShadowRadius: 12,
  },
  roleContainer: {
    alignItems: 'center',
    width: '100%',
  },
  spyText: {
    color: '#FF0033',
    fontSize: 36,
    fontWeight: 'bold',
    letterSpacing: 2,
    marginBottom: 20,
    textShadowColor: '#FF003377',
    textShadowRadius: 12,
  },
  civilianText: {
    color: '#00FFAA',
    fontSize: 34,
    fontWeight: 'bold',
    letterSpacing: 1,
    marginBottom: 20,
    textShadowColor: '#00FFAA77',
    textShadowRadius: 12,
  },
  subText: {
    color: '#00FFFF',
    fontSize: 16,
    letterSpacing: 2,
    marginBottom: 8,
  },
  question: {
    color: '#FFFFFF',
    fontSize: 20,
    marginBottom: 25,
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  decryptLabel: {
    color: '#888',
    fontSize: 14,
    marginBottom: 8,
    letterSpacing: 2,
  },
  progressBar: {
    width: '80%',
    height: 8,
    backgroundColor: '#1A1A1A',
    borderColor: '#333',
    borderWidth: 1,
    borderRadius: 5,
    overflow: 'hidden',
    marginBottom: 15,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#FF0033',
  },
  progressFillGreen: {
    height: '100%',
    backgroundColor: '#00FF99',
  },
  statusText: {
    color: '#FF4444',
    fontSize: 14,
    letterSpacing: 1,
  },
  statusTextGreen: {
    color: '#00FFAA',
    fontSize: 14,
    letterSpacing: 1,
  },
});

export default RevealRoleScreen;
