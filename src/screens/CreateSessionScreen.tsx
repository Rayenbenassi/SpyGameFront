import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  FlatList,
  Alert,
  StyleSheet,
  Animated,
  Easing,
  Image,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../navigation/types';
import NeonButton from '../components/NeonButton';
import GameContainer from '../components/GameContainer';

type CreateSessionScreenNavigationProp = StackNavigationProp<
  RootStackParamList,
  'CreateSession'
>;

const CreateSessionScreen = () => {
  const navigation = useNavigation<CreateSessionScreenNavigationProp>();
  const [players, setPlayers] = useState<string[]>(['']);

  const pulseAnim = useRef(new Animated.Value(1)).current;

  
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

  const addPlayer = () => setPlayers([...players, '']);

  const updatePlayer = (text: string, index: number) => {
    const updated = [...players];
    updated[index] = text;
    setPlayers(updated);
  };

const createGame = async () => {
  const trimmed = players.map(p => p.trim()).filter(p => p !== '');

  if (trimmed.length < 2) {
    Alert.alert('At least 2 agents are required to start the mission.');
    return;
  }

  try {
    const response = await fetch('https://spyback.onrender.com/api/game/session', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ playerNames: trimmed }),
    });

    if (!response.ok) throw new Error('Failed to create session');

    const session = await response.json();
    navigation.navigate('Game', { session });

  } catch (error) {
    console.error(error);
    Alert.alert('Error creating game session');
  }
};


  return (
    <LinearGradient colors={['#000000', '#041016', '#050A0C']} style={styles.gradient}>
      <View style={styles.overlay} />

      <Text style={styles.header}>SPY GAME</Text>

      <View style={styles.centerContent}>
        <Text style={styles.subTitle}>SIGNAL MATCH</Text>
        <Animated.View style={[styles.fingerprintContainer, { transform: [{ scale: pulseAnim }] }]}>
          <Image
            source={require('../assets/fingerprint.png')}
            style={styles.fingerprint}
            resizeMode="contain"
          />
        </Animated.View>
        <Text style={styles.footerText}>CLONE TARGET</Text>
      </View>

      <View style={styles.formContainer}>
        <FlatList
          data={players}
          keyExtractor={(_, index) => index.toString()}
          renderItem={({ item, index }) => (
            <TextInput
              style={styles.input}
              placeholder={`Player ${index + 1}`}
              placeholderTextColor="#00FFF0AA"
              value={item}
              onChangeText={text => updatePlayer(text, index)}
            />
          )}
        />

        <View style={styles.buttonGroup}>
          <NeonButton title="Add Agent" onPress={addPlayer} />
          <View style={{ height: 15 }} />
          <NeonButton title="Deploy Mission" onPress={createGame} />
        </View>
      </View>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 255, 200, 0.03)',
  },
  header: {
    color: '#C7D0D9',
    fontSize: 42,
    fontWeight: '700',
    letterSpacing: 3,
    marginBottom: 10,
  },
  subTitle: {
    color: '#00FFF0',
    fontSize: 20,
    letterSpacing: 2,
    marginBottom: 10,
  },
  centerContent: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 20,
  },
  fingerprintContainer: {
    width: 180,
    height: 180,
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
    fontSize: 18,
    letterSpacing: 2,
  },
  formContainer: {
    width: '100%',
    marginTop: 30,
  },
  input: {
    backgroundColor: 'rgba(0, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: '#00FFF0',
    borderRadius: 10,
    color: '#00FFF0',
    padding: 12,
    marginBottom: 12,
    fontSize: 16,
    letterSpacing: 1,
  },
  buttonGroup: {
    marginTop: 20,
  },
});

export default CreateSessionScreen;
