import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';

interface NeonButtonProps {
  title: string;
  onPress: () => void;
  color?: string;
  disabled?: boolean; // ✅ Added this line
}

const NeonButton: React.FC<NeonButtonProps> = ({ title, onPress, color = '#00FFFF', disabled = false }) => {
  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled}
      style={[
        styles.button,
        { borderColor: color, opacity: disabled ? 0.5 : 1 }, // ✅ Make it visually dim when disabled
      ]}
    >
      <Text style={[styles.text, { color }]}>{title}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    borderWidth: 2,
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 5,
    shadowColor: '#00FFFF',
    shadowOpacity: 0.8,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 0 },
  },
  text: {
    fontSize: 18,
    fontWeight: 'bold',
    textShadowColor: '#00FFFF',
    textShadowRadius: 8,
  },
});

export default NeonButton;
