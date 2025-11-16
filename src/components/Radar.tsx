import React, { useEffect, useRef } from 'react';
import { View, Animated, StyleSheet, Easing, Dimensions } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';

const { width } = Dimensions.get('window');
const RADAR_SIZE = width * 0.65;

const Radar = () => {
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const blipPulse = useRef(new Animated.Value(0)).current;

  // --- ROTATION (360° sweep) ---
  useEffect(() => {
    Animated.loop(
      Animated.timing(rotateAnim, {
        toValue: 1,
        duration: 3500,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    ).start();
  }, []);

  // --- BLIP PULSE ---
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(blipPulse, {
          toValue: 1,
          duration: 1200,
          useNativeDriver: true,
        }),
        Animated.timing(blipPulse, {
          toValue: 0,
          duration: 1200,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  // Sweep rotation
  const rotation = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  // Blip pulsing
  const pulseScale = blipPulse.interpolate({
    inputRange: [0, 1],
    outputRange: [0.7, 1.3],
  });
  const pulseOpacity = blipPulse.interpolate({
    inputRange: [0, 1],
    outputRange: [0.4, 1],
  });

  return (
    <View style={styles.container}>
      
      {/* Outer Glow */}
      <View style={styles.glow} />

      {/* Radar Background */}
      <LinearGradient
        colors={['rgba(0,255,150,0.12)', 'rgba(0,60,40,0.05)']}
        style={styles.radar}
      >

        {/* Concentric Circles */}
        {[1, 0.75, 0.5, 0.25].map((scale, i) => (
          <View
            key={i}
            style={[
              styles.circle,
              { width: RADAR_SIZE * scale, height: RADAR_SIZE * scale },
            ]}
          />
        ))}

        {/* Crosshair Lines */}
        <View style={styles.verticalLine} />
        <View style={styles.horizontalLine} />

        {/* Sweep Arm */}
        <Animated.View
          style={[styles.sweep, { transform: [{ rotate: rotation }] }]}
        >
          <LinearGradient
            colors={['rgba(0,255,200,0.40)', 'transparent']}
            style={styles.sweepGradient}
          />
        </Animated.View>
      </LinearGradient>

      {/* MOVING REALISTIC BLIPS */}
      <Animated.View
        style={[
          styles.blip,
          {
            top: RADAR_SIZE * 0.22,
            left: RADAR_SIZE * 0.55,
            opacity: pulseOpacity,
            transform: [{ scale: pulseScale }],
          },
        ]}
      />

      <Animated.View
        style={[
          styles.blip,
          {
            top: RADAR_SIZE * 0.62,
            left: RADAR_SIZE * 0.28,
            opacity: pulseOpacity,
            transform: [{ scale: pulseScale }],
          },
        ]}
      />

      <Animated.View
        style={[
          styles.blip,
          {
            top: RADAR_SIZE * 0.40,
            left: RADAR_SIZE * 0.40,
            opacity: pulseOpacity,
            transform: [{ scale: pulseScale }],
          },
        ]}
      />

    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: RADAR_SIZE,
    height: RADAR_SIZE,
    alignItems: 'center',
    justifyContent: 'center',
  },

  radar: {
    width: RADAR_SIZE,
    height: RADAR_SIZE,
    borderRadius: RADAR_SIZE / 2,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: 'rgba(0,255,200,0.45)',
  },

  glow: {
    position: 'absolute',
    width: RADAR_SIZE + 50,
    height: RADAR_SIZE + 50,
    borderRadius: (RADAR_SIZE + 50) / 2,
    backgroundColor: 'rgba(0,255,200,0.15)',
    shadowColor: '#00FFCC',
    shadowOpacity: 0.65,
    shadowRadius: 30,
  },

  circle: {
    position: 'absolute',
    borderRadius: 999,
    borderWidth: 1,
    borderColor: 'rgba(0,255,200,0.24)',
  },

  verticalLine: {
    position: 'absolute',
    width: 1,
    height: '100%',
    backgroundColor: 'rgba(0,255,200,0.2)',
  },

  horizontalLine: {
    position: 'absolute',
    width: '100%',
    height: 1,
    backgroundColor: 'rgba(0,255,200,0.2)',
  },

  sweep: {
    position: 'absolute',
    width: RADAR_SIZE,
    height: RADAR_SIZE,
  },

  sweepGradient: {
    width: '100%',
    height: '100%',
    borderRadius: RADAR_SIZE / 2,
  },

  blip: {
    position: 'absolute',
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#00FFCC',
    shadowColor: '#00FFCC',
    shadowOpacity: 1,
    shadowRadius: 10,
  },
});

export default Radar;
