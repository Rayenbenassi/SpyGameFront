import React, { useState } from 'react';
import { View, Text, TextInput, FlatList, Alert, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import LinearGradient from 'react-native-linear-gradient';
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

  const addPlayer = () => setPlayers([...players, '']);

  const updatePlayer = (text: string, index: number) => {
    const updated = [...players];
    updated[index] = text;
    setPlayers(updated);
  };

  const createGame = async () => {
    const trimmed = players.map(p => p.trim()).filter(p => p !== '');
    if (trimmed.length === 0) {
      Alert.alert('Please enter at least one player name');
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
    <LinearGradient
      colors={['#0f2027', '#203a43', '#2c5364']}
      style={styles.gradient}
    >
      <GameContainer>
        <Text style={styles.title}>🕵️ Create a New Game</Text>

        <FlatList
          data={players}
          keyExtractor={(_, index) => index.toString()}
          renderItem={({ item, index }: { item: string; index: number }) => (
            <TextInput
              style={styles.input}
              placeholder={`Player ${index + 1}`}
              placeholderTextColor="#aaa"
              value={item}
              onChangeText={text => updatePlayer(text, index)}
            />
          )}
        />

        <View style={{ marginVertical: 20 }}>
          <NeonButton title="➕ Add Player" onPress={addPlayer} />
          <View style={{ height: 15 }} />
          <NeonButton title="🚀 Start Game" onPress={createGame} />
        </View>
      </GameContainer>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
  },
  title: {
    color: '#00FFFF',
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 30,
    textShadowColor: '#00FFFF',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 12,
  },
  input: {
    backgroundColor: '#222',
    borderWidth: 1,
    borderColor: '#00FFFF',
    borderRadius: 10,
    color: '#fff',
    padding: 12,
    marginBottom: 12,
    fontSize: 16,
  },
});

export default CreateSessionScreen;
