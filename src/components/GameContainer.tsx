import React, { ReactNode } from 'react';
import { View, StyleSheet } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';

type GameContainerProps = {
  children: ReactNode;
};

const GameContainer: React.FC<GameContainerProps> = ({ children }) => (
  <LinearGradient colors={['#0D0D0D', '#1A0033']} style={styles.gradient}>
    <View style={styles.inner}>{children}</View>
  </LinearGradient>
);

const styles = StyleSheet.create({
  gradient: { flex: 1 },
  inner: {
    flex: 1,
    alignItems: 'center',
    padding: 20,
  },
});

export default GameContainer;
