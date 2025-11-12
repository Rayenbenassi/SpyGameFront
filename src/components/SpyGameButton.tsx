import React from 'react';
import { Pressable, Text, View, StyleSheet } from 'react-native';

interface SpyGameButtonProps {
  title?: string;
  onPress: () => void;
}

const SpyGameButton: React.FC<SpyGameButtonProps> = ({ title = 'START MISSION', onPress }) => {
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.container, pressed && { opacity: 0.8 }]}>
      <View style={styles.buttonBorder}>
        <Text style={styles.buttonText}>{title}</Text>
      </View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 20,
  },
  buttonBorder: {
    borderWidth: 2,
    borderColor: '#00FFF0',
    borderRadius: 8,
    paddingVertical: 14,
    paddingHorizontal: 40,
    backgroundColor: '#3904fa0e',
    shadowColor: '#00FFF0',
    shadowOpacity: 0.9,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 0 },
  },
  buttonText: {
    color: '#00FFF0',
    fontSize: 20,
    fontWeight: 'bold',
    letterSpacing: 1.5,
    textAlign: 'center',
  },
});

export default SpyGameButton;
