import React, { useEffect, useState, useRef } from 'react';
import { View, StyleSheet, TouchableOpacity, Text, Dimensions, Animated } from 'react-native';
import { accelerometer, setUpdateIntervalForType, SensorTypes } from 'react-native-sensors';
import ReactNativeHapticFeedback from "react-native-haptic-feedback";
import UdpClient from '../utils/UdpClient';
import SensorFusion from '../utils/SensorFusion';

// 60Hz update rate (~16ms)
setUpdateIntervalForType(SensorTypes.accelerometer, 16);

export default function ControllerWorkspace() {
    const [gas, setGas] = useState(0.0);
    const [brake, setBrake] = useState(0.0);
    const [steer, setSteer] = useState(0.0);
    
    const wheelRot = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        // We use accelerometer to estimate roll (tilt left/right).
        // For full 3D rotation, gyroscope fusion is better, but this demonstrates the logic.
        const subscription = accelerometer.subscribe(({ x, y, z }) => {
            // Calculate roll angle in radians based on gravity vector
            // Depending on device orientation, the axis mapping might need swapping (x vs y)
            const rollRaw = Math.atan2(y, Math.sqrt(x * x + z * z));
            
            // Normalize it using our fusion module
            const normalizedSteer = SensorFusion.normalizeSteering(rollRaw);
            setSteer(normalizedSteer);

            // Dispatch via UDP at high frequency
            UdpClient.sendTelemetry(normalizedSteer, gas, brake);

            // Animate local UI steering wheel
            // normalizedSteer is -1 to 1. Map to -90 to 90 degrees visually
            Animated.timing(wheelRot, {
                toValue: normalizedSteer * 90, 
                duration: 16, // match 60Hz
                useNativeDriver: true
            }).start();
        });

        return () => subscription.unsubscribe();
    }, [gas, brake]);

    const triggerHaptic = () => {
        const options = {
            enableVibrateFallback: true,
            ignoreAndroidSystemSettings: false,
        };
        ReactNativeHapticFeedback.trigger("impactMedium", options);
    };

    return (
        <View style={styles.container}>
            {/* Gear Down (Left Top) */}
            <TouchableOpacity style={styles.gearBtnLeft} onPress={triggerHaptic}>
                <Text style={styles.gearText}>-</Text>
            </TouchableOpacity>

            {/* Gear Up (Right Top) */}
            <TouchableOpacity style={styles.gearBtnRight} onPress={triggerHaptic}>
                <Text style={styles.gearText}>+</Text>
            </TouchableOpacity>

            <View style={styles.matrix}>
                {/* Brake Pedal (Left 35%) */}
                <View 
                    style={styles.pedalArea}
                    onTouchStart={() => { setBrake(1.0); triggerHaptic(); }}
                    onTouchEnd={() => setBrake(0.0)}
                >
                    <View style={[styles.pedalVisual, { backgroundColor: brake > 0 ? '#FF1744' : '#222' }]} />
                </View>

                {/* Center Steering Wheel (30%) */}
                <View style={styles.centerArea}>
                    <Animated.View style={[
                        styles.steeringWheel,
                        {
                            transform: [
                                {
                                    rotateZ: wheelRot.interpolate({
                                        inputRange: [-90, 90],
                                        outputRange: ['-90deg', '90deg']
                                    })
                                }
                            ]
                        }
                    ]}>
                        <View style={styles.wheelSpokeHorizontal} />
                        <View style={styles.wheelSpokeVertical} />
                    </Animated.View>
                </View>

                {/* Gas Pedal (Right 35%) */}
                <View 
                    style={styles.pedalArea}
                    onTouchStart={() => { setGas(1.0); triggerHaptic(); }}
                    onTouchEnd={() => setGas(0.0)}
                >
                    <View style={[styles.pedalVisual, { backgroundColor: gas > 0 ? '#00E5FF' : '#222' }]} />
                </View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#000000', // Pitch Black AMOLED
        flexDirection: 'column',
    },
    gearBtnLeft: {
        position: 'absolute', top: 20, left: 20, zIndex: 10,
        backgroundColor: '#121212', width: 60, height: 60, borderRadius: 30,
        justifyContent: 'center', alignItems: 'center',
    },
    gearBtnRight: {
        position: 'absolute', top: 20, right: 20, zIndex: 10,
        backgroundColor: '#121212', width: 60, height: 60, borderRadius: 30,
        justifyContent: 'center', alignItems: 'center',
    },
    gearText: { color: '#FFF', fontSize: 30, fontWeight: 'bold' },
    matrix: {
        flex: 1,
        flexDirection: 'row',
    },
    pedalArea: {
        width: '35%',
        height: '100%',
        justifyContent: 'center',
        alignItems: 'center',
    },
    pedalVisual: {
        width: '80%',
        height: '80%',
        borderRadius: 20,
    },
    centerArea: {
        width: '30%',
        height: '100%',
        justifyContent: 'center',
        alignItems: 'center',
    },
    steeringWheel: {
        width: 150,
        height: 150,
        borderRadius: 75,
        borderWidth: 8,
        borderColor: '#333',
        justifyContent: 'center',
        alignItems: 'center',
    },
    wheelSpokeHorizontal: {
        position: 'absolute', width: '100%', height: 8, backgroundColor: '#333',
    },
    wheelSpokeVertical: {
        position: 'absolute', width: 8, height: '50%', backgroundColor: '#333', top: '50%',
    }
});
