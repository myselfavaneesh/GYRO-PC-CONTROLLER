import React, { useRef } from 'react';
import { View, StyleSheet, TouchableOpacity, PanResponder } from 'react-native';

export default function Pedal({ type, color, onValueChange, hapticTrigger }) {
    const isAnalog = type === 'ANALOG_SLIDER';
    const sliderHeight = 150;
    
    // Analog specific state
    const [fillPercentage, setFillPercentage] = React.useState(0);

    const panResponder = useRef(
        PanResponder.create({
            onStartShouldSetPanResponder: () => true,
            onMoveShouldSetPanResponder: () => true,
            onPanResponderGrant: () => {
                hapticTrigger && hapticTrigger();
            },
            onPanResponderMove: (evt, gestureState) => {
                // dy is negative when moving up (towards 100%)
                // We use a sensitivity multiplier to make it easier to reach 100% without extreme thumb stretching
                let val = -gestureState.dy / (sliderHeight * 0.8);
                
                // Strict clamping
                val = Math.max(0, Math.min(1.0, val));
                setFillPercentage(val * 100);
                onValueChange(val);
            },
            onPanResponderRelease: () => {
                setFillPercentage(0);
                onValueChange(0.0);
            },
            onPanResponderTerminate: () => {
                setFillPercentage(0);
                onValueChange(0.0);
            }
        })
    ).current;

    // Analog UI
    if (isAnalog) {
        return (
            <View style={[styles.analogContainer, { borderColor: color }]} {...panResponder.panHandlers}>
                <View style={[styles.analogFill, { backgroundColor: color, height: `${fillPercentage}%` }]} />
            </View>
        );
    }

    // Digital Button UI
    const [isPressed, setIsPressed] = React.useState(false);

    return (
        <View 
            style={[styles.digitalButton, { borderColor: color, backgroundColor: isPressed ? color : '#222' }]}
            onTouchStart={() => {
                setIsPressed(true);
                onValueChange(1.0);
                hapticTrigger && hapticTrigger();
            }}
            onTouchEnd={() => {
                setIsPressed(false);
                onValueChange(0.0);
            }}
        />
    );
}

const styles = StyleSheet.create({
    digitalButton: {
        width: 100,
        height: 150,
        borderRadius: 20,
        borderWidth: 2,
    },
    analogContainer: {
        width: 100,
        height: 150,
        borderRadius: 20,
        borderWidth: 2,
        backgroundColor: '#222',
        justifyContent: 'flex-end',
        overflow: 'hidden',
    },
    analogFill: {
        width: '100%',
        bottom: 0,
    }
});
