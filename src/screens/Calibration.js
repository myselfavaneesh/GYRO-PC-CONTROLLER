import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import SensorFusion from '../utils/SensorFusion';

// In a real React Native app, we'd use @react-native-community/slider
// But we'll mock the visual structure here since we're generating source code.
const Slider = ({ value, onValueChange, minimumValue, maximumValue }) => (
    <View style={styles.sliderMock}>
        <View style={[styles.sliderFill, { width: `${((value - minimumValue) / (maximumValue - minimumValue)) * 100}%` }]} />
    </View>
);

export default function Calibration() {
    const [deadzone, setDeadzone] = useState(0.05); // 5%
    const [sensitivity, setSensitivity] = useState(1.0);
    const [hapticScale, setHapticScale] = useState(0.8);
    const [liveSteer, setLiveSteer] = useState(0.0);

    // Update sensor fusion module when sliders change
    const handleDeadzoneChange = (val) => {
        setDeadzone(val);
        SensorFusion.setParameters(val, sensitivity);
    };

    const handleSensitivityChange = (val) => {
        setSensitivity(val);
        SensorFusion.setParameters(deadzone, val);
    };

    return (
        <ScrollView style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>Calibration & Matrix</Text>
            </View>

            {/* Live Preview Header */}
            <View style={styles.previewStrip}>
                <Text style={styles.label}>Live Steering Output: {liveSteer.toFixed(2)}</Text>
                <View style={styles.previewBarBg}>
                    <View style={[
                        styles.previewBarCursor, 
                        { left: `${((liveSteer + 1) / 2) * 100}%` }
                    ]} />
                </View>
            </View>

            {/* Interactive Calibration Matrix */}
            <View style={styles.matrixCard}>
                <Text style={styles.label}>Steering Deadzone Control ({(deadzone * 100).toFixed(0)}%)</Text>
                <Slider 
                    minimumValue={0} 
                    maximumValue={0.15} 
                    value={deadzone} 
                    onValueChange={handleDeadzoneChange} 
                />
                <Text style={styles.helper}>Maps 0% to 15% noise dampening at center.</Text>
            </View>

            <View style={styles.matrixCard}>
                <Text style={styles.label}>Sensor Fusion Sensitivity ({sensitivity.toFixed(1)}x)</Text>
                <Slider 
                    minimumValue={0.5} 
                    maximumValue={3.0} 
                    value={sensitivity} 
                    onValueChange={handleSensitivityChange} 
                />
                <Text style={styles.helper}>Scales mapping up to 2000° true lock-to-lock rotation.</Text>
            </View>

            <View style={styles.matrixCard}>
                <Text style={styles.label}>Haptic Response Scale ({(hapticScale * 100).toFixed(0)}%)</Text>
                <Slider 
                    minimumValue={0} 
                    maximumValue={1.0} 
                    value={hapticScale} 
                    onValueChange={setHapticScale} 
                />
                <Text style={styles.helper}>Controls vibration feedback intensity from PC telemetry.</Text>
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#000000',
        padding: 24,
    },
    header: {
        marginBottom: 30,
    },
    title: {
        color: '#00E5FF',
        fontSize: 24,
        fontWeight: 'bold',
        fontFamily: 'RobotoMono-Regular',
    },
    previewStrip: {
        backgroundColor: '#121212',
        padding: 20,
        borderRadius: 12,
        marginBottom: 30,
        borderWidth: 1,
        borderColor: '#00E5FF',
    },
    label: {
        color: '#FFFFFF',
        fontFamily: 'RobotoMono-Regular',
        marginBottom: 10,
    },
    previewBarBg: {
        height: 10,
        backgroundColor: '#333',
        borderRadius: 5,
        position: 'relative',
        justifyContent: 'center',
    },
    previewBarCursor: {
        position: 'absolute',
        width: 14,
        height: 20,
        backgroundColor: '#00E5FF',
        borderRadius: 2,
        transform: [{ translateX: -7 }],
    },
    matrixCard: {
        backgroundColor: '#121212',
        padding: 20,
        borderRadius: 12,
        marginBottom: 20,
    },
    helper: {
        color: '#888',
        fontSize: 12,
        marginTop: 10,
    },
    sliderMock: {
        height: 4,
        backgroundColor: '#333',
        width: '100%',
        borderRadius: 2,
        marginVertical: 10,
    },
    sliderFill: {
        height: '100%',
        backgroundColor: '#00E5FF',
    }
});
