import React, { ReactNode } from 'react';
import { View, StyleSheet } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';

type GameContainerProps = {
  children: ReactNode;
};

const GameContainer: React.FC<GameContainerProps> = ({ children }) => (

    <View style={styles.inner}>{children}</View>

);

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  inner: {
    width: '90%',
    backgroundColor: 'rgba(0, 255, 255, 0.05)',
    borderColor: '#00FFFF55',
    borderWidth: 1,
    borderRadius: 16,
    paddingVertical: 30,
    paddingHorizontal: 20,
    shadowColor: '#00FFFF',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
  },
});

export default GameContainer;
