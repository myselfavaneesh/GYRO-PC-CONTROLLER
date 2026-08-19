import React, { useEffect, useState, useRef } from 'react';
import { View, StyleSheet, TouchableOpacity, Text, Dimensions, Animated, ActivityIndicator } from 'react-native';
import { accelerometer, setUpdateIntervalForType, SensorTypes } from 'react-native-sensors';
import ReactNativeHapticFeedback from "react-native-haptic-feedback";
import UdpClient from '../utils/UdpClient';
import SensorFusion from '../utils/SensorFusion';

import { loadLayoutProfile, saveLayoutProfile } from '../utils/Storage';
import DraggableControl from '../components/DraggableControl';
import Pedal from '../components/Pedal';

// 60Hz update rate (~16ms)
setUpdateIntervalForType(SensorTypes.accelerometer, 16);

export default function ControllerWorkspace() {
    const [isLoading, setIsLoading] = useState(true);
    const [isEditMode, setIsEditMode] = useState(false);
    
    // Core Layout Profile State
    const [profile, setProfile] = useState(null);
    
    // Telemetry Refs
    const inputs = useRef({ gas: 0.0, brake: 0.0 });
    const wheelRot = useRef(new Animated.Value(0)).current;

    // Load initial layout
    useEffect(() => {
        const fetchProfile = async () => {
            const data = await loadLayoutProfile();
            setProfile(data);
            setIsLoading(false);
        };
        fetchProfile();
    }, []);

    // Sensor Fusion Loop (Pauses during Edit Mode)
    useEffect(() => {
        if (isLoading || isEditMode) return;

        const subscription = accelerometer.subscribe(({ x, y, z }) => {
            // Calculate roll angle in radians based on gravity vector
            const rollRaw = Math.atan2(y, Math.sqrt(x * x + z * z));
            
            // Normalize it using our fusion module
            const normalizedSteer = SensorFusion.normalizeSteering(rollRaw);

            // Dispatch via UDP at high frequency
            UdpClient.sendTelemetry(normalizedSteer, inputs.current.gas, inputs.current.brake);

            // Animate local UI steering wheel
            Animated.timing(wheelRot, {
                toValue: normalizedSteer * 90, 
                duration: 16, 
                useNativeDriver: true
            }).start();
        });

        return () => subscription.unsubscribe();
    }, [isLoading, isEditMode]);

    const triggerHaptic = () => {
        ReactNativeHapticFeedback.trigger("impactMedium", {
            enableVibrateFallback: true,
            ignoreAndroidSystemSettings: false,
        });
    };

    const handleLayoutSave = (id, newCoords) => {
        setProfile(prev => {
            const updated = {
                ...prev,
                positions: {
                    ...prev.positions,
                    [id]: newCoords
                }
            };
            
            // Auto-save to persistence layer
            saveLayoutProfile(updated);
            return updated;
        });
    };

    const toggleEditMode = () => {
        setIsEditMode(!isEditMode);
        triggerHaptic();
    };

    const togglePedalType = () => {
        setProfile(prev => {
            const updated = {
                ...prev,
                pedalType: prev.pedalType === 'ANALOG_SLIDER' ? 'DIGITAL_BUTTON' : 'ANALOG_SLIDER'
            };
            saveLayoutProfile(updated);
            return updated;
        });
        triggerHaptic();
    };

    if (isLoading || !profile) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#00E5FF" />
            </View>
        );
    }

    return (
        <View style={styles.container}>
            {/* Top Toolbar */}
            <View style={styles.toolbar}>
                <TouchableOpacity 
                    style={[styles.toolbarBtn, isEditMode ? styles.btnActive : {}]}
                    onPress={toggleEditMode}
                >
                    <Text style={styles.toolbarBtnText}>
                        {isEditMode ? '💾 SAVE LAYOUT' : '⚙️ EDIT LAYOUT'}
                    </Text>
                </TouchableOpacity>

                {isEditMode && (
                    <TouchableOpacity 
                        style={styles.toolbarBtn}
                        onPress={togglePedalType}
                    >
                        <Text style={styles.toolbarBtnText}>
                            PEDAL TYPE: {profile.pedalType === 'ANALOG_SLIDER' ? 'ANALOG' : 'DIGITAL'}
                        </Text>
                    </TouchableOpacity>
                )}
            </View>

            {/* Gear Down */}
            <DraggableControl 
                id="gearDown"
                isEditMode={isEditMode}
                initialPosition={profile.positions.gearDown}
                onLayoutSave={handleLayoutSave}
            >
                <TouchableOpacity style={styles.gearBtn} onPress={triggerHaptic}>
                    <Text style={styles.gearText}>-</Text>
                </TouchableOpacity>
            </DraggableControl>

            {/* Gear Up */}
            <DraggableControl 
                id="gearUp"
                isEditMode={isEditMode}
                initialPosition={profile.positions.gearUp}
                onLayoutSave={handleLayoutSave}
            >
                <TouchableOpacity style={styles.gearBtn} onPress={triggerHaptic}>
                    <Text style={styles.gearText}>+</Text>
                </TouchableOpacity>
            </DraggableControl>

            {/* Brake Pedal */}
            <DraggableControl 
                id="brake"
                isEditMode={isEditMode}
                initialPosition={profile.positions.brake}
                onLayoutSave={handleLayoutSave}
            >
                <Pedal 
                    type={profile.pedalType}
                    color="#FF1744"
                    hapticTrigger={triggerHaptic}
                    onValueChange={(val) => { inputs.current.brake = val; }}
                />
            </DraggableControl>

            {/* Gas Pedal */}
            <DraggableControl 
                id="gas"
                isEditMode={isEditMode}
                initialPosition={profile.positions.gas}
                onLayoutSave={handleLayoutSave}
            >
                <Pedal 
                    type={profile.pedalType}
                    color="#00E5FF"
                    hapticTrigger={triggerHaptic}
                    onValueChange={(val) => { inputs.current.gas = val; }}
                />
            </DraggableControl>

            {/* Steering Wheel */}
            <DraggableControl 
                id="steer"
                isEditMode={isEditMode}
                initialPosition={profile.positions.steer}
                onLayoutSave={handleLayoutSave}
            >
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
            </DraggableControl>
        </View>
    );
}

const styles = StyleSheet.create({
    loadingContainer: {
        flex: 1,
        backgroundColor: '#000000',
        justifyContent: 'center',
        alignItems: 'center'
    },
    container: {
        flex: 1,
        backgroundColor: '#000000', // Pitch Black AMOLED
    },
    toolbar: {
        position: 'absolute',
        top: 20,
        left: 0,
        right: 0,
        zIndex: 100,
        flexDirection: 'row',
        justifyContent: 'center',
        pointerEvents: 'box-none'
    },
    toolbarBtn: {
        backgroundColor: '#222',
        paddingHorizontal: 20,
        paddingVertical: 10,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: '#444',
        marginHorizontal: 10
    },
    btnActive: {
        borderColor: '#FF1744',
        backgroundColor: '#330000'
    },
    toolbarBtnText: {
        color: '#FFF',
        fontWeight: 'bold',
        fontSize: 14
    },
    gearBtn: {
        backgroundColor: '#121212', 
        width: 60, 
        height: 60, 
        borderRadius: 30,
        justifyContent: 'center', 
        alignItems: 'center',
        borderWidth: 2,
        borderColor: '#333'
    },
    gearText: { 
        color: '#FFF', 
        fontSize: 30, 
        fontWeight: 'bold' 
    },
    steeringWheel: {
        width: 150,
        height: 150,
        borderRadius: 75,
        borderWidth: 8,
        borderColor: '#333',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#111'
    },
    wheelSpokeHorizontal: {
        position: 'absolute', width: '100%', height: 8, backgroundColor: '#333',
    },
    wheelSpokeVertical: {
        position: 'absolute', width: 8, height: '50%', backgroundColor: '#333', top: '50%',
    }
});
