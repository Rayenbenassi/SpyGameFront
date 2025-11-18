// src/components/NeonButton.tsx
import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ViewStyle, TextStyle } from 'react-native';

export interface NeonButtonProps {
  title: string;
  onPress: () => void;
  color?: string;
  size?: 'small' | 'medium' | 'large';
  disabled?: boolean;
}

const NeonButton: React.FC<NeonButtonProps> = ({ 
  title, 
  onPress, 
  color = '#00FFFF', 
  size = 'medium',
  disabled = false 
}) => {
  const getButtonStyle = (): ViewStyle => {
    const baseStyle = {
      backgroundColor: 'transparent',
      borderWidth: 2,
      borderColor: color,
      borderRadius: 8,
      paddingHorizontal: 20,
      paddingVertical: 12,
      alignItems: 'center' as const,
      justifyContent: 'center' as const,
      shadowColor: color,
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 0.8,
      shadowRadius: 10,
      elevation: 8,
      opacity: disabled ? 0.5 : 1,
    };

    switch (size) {
      case 'small':
        return { ...baseStyle, paddingHorizontal: 15, paddingVertical: 8 };
      case 'large':
        return { ...baseStyle, paddingHorizontal: 25, paddingVertical: 16 };
      default:
        return baseStyle;
    }
  };

  const getTextStyle = (): TextStyle => {
    const baseStyle = {
      color: color,
      fontSize: 16,
      fontWeight: 'bold' as const,
      textShadowColor: color,
      textShadowOffset: { width: 0, height: 0 },
      textShadowRadius: 10,
    };

    switch (size) {
      case 'small':
        return { ...baseStyle, fontSize: 14 };
      case 'large':
        return { ...baseStyle, fontSize: 18 };
      default:
        return baseStyle;
    }
  };

  return (
    <TouchableOpacity
      style={getButtonStyle()}
      onPress={onPress}
      disabled={disabled}
    >
      <Text style={getTextStyle()}>{title}</Text>
    </TouchableOpacity>
  );
};

export default NeonButton;