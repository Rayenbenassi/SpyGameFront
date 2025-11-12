import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import NeonButton from '../components/NeonButton';
import GameContainer from '../components/GameContainer';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';

type HomeScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'Home'
>;

type Props = {
  navigation: HomeScreenNavigationProp;
};

const HomeScreen: React.FC<Props> = ({ navigation }) => (
  <GameContainer>
    <Text style={styles.title}>🕵️‍♂️ Spy Game</Text>
    <NeonButton title="Start Game" onPress={() => navigation.navigate('CreateSession')} />
  </GameContainer>
);

const styles = StyleSheet.create({
  title: {
    color: '#00FFFF',
    fontSize: 36,
    fontWeight: 'bold',
    marginBottom: 40,
    textShadowColor: '#00FFFF',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 12,
  },
});

export default HomeScreen;
