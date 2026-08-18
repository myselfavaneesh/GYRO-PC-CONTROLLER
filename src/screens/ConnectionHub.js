import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, Animated, Easing } from 'react-native';
import UdpClient from '../utils/UdpClient';

export default function ConnectionHub({ navigation }) {
    const [ip, setIp] = useState('192.168.1.100');
    const [port, setPort] = useState('8080');
    const [pin, setPin] = useState('');
    const [showFallback, setShowFallback] = useState(false);
    
    const [pulseAnim] = useState(new Animated.Value(0));

    useEffect(() => {
        Animated.loop(
            Animated.sequence([
                Animated.timing(pulseAnim, {
                    toValue: 1,
                    duration: 1000,
                    easing: Easing.inOut(Easing.ease),
                    useNativeDriver: true
                }),
                Animated.timing(pulseAnim, {
                    toValue: 0,
                    duration: 1000,
                    easing: Easing.inOut(Easing.ease),
                    useNativeDriver: true
                })
            ])
        ).start();
    }, []);

    const connectToServer = () => {
        UdpClient.connect(ip, port);
        // Navigate to controller
        navigation.navigate('ControllerWorkspace');
    };

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Animated.View style={[
                    styles.indicator,
                    {
                        opacity: pulseAnim.interpolate({
                            inputRange: [0, 1],
                            outputRange: [0.3, 1]
                        }),
                        backgroundColor: '#FF1744' // Red for disconnected
                    }
                ]} />
                <Text style={styles.headerText}>Disconnected</Text>
            </View>

            <View style={styles.primaryCard}>
                <TouchableOpacity style={styles.scanBtn} onPress={() => {}}>
                    <Text style={styles.scanBtnText}>SCAN PC QR CODE</Text>
                </TouchableOpacity>
            </View>

            <TouchableOpacity 
                style={styles.fallbackToggle} 
                onPress={() => setShowFallback(!showFallback)}>
                <Text style={styles.fallbackToggleText}>
                    {showFallback ? '- Hide Alternative Methods' : '+ Alternative Connection Methods'}
                </Text>
            </TouchableOpacity>

            {showFallback && (
                <View style={styles.fallbackTray}>
                    <Text style={styles.label}>Server PIN</Text>
                    <TextInput 
                        style={styles.input}
                        placeholder="e.g. X7B9K2"
                        placeholderTextColor="#444"
                        value={pin}
                        onChangeText={setPin}
                    />

                    <Text style={styles.label}>IPv4 Address</Text>
                    <TextInput 
                        style={styles.input}
                        placeholder="192.168.1.99"
                        placeholderTextColor="#444"
                        value={ip}
                        onChangeText={setIp}
                        keyboardType="numeric"
                    />

                    <Text style={styles.label}>Port</Text>
                    <TextInput 
                        style={styles.input}
                        placeholder="8080"
                        placeholderTextColor="#444"
                        value={port}
                        onChangeText={setPort}
                        keyboardType="numeric"
                    />

                    <TouchableOpacity style={styles.connectBtn} onPress={connectToServer}>
                        <Text style={styles.connectBtnText}>CONNECT</Text>
                    </TouchableOpacity>
                </View>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#000000',
        padding: 24,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 40,
        marginBottom: 60,
    },
    indicator: {
        width: 16,
        height: 16,
        borderRadius: 8,
        marginRight: 12,
    },
    headerText: {
        color: '#FFFFFF',
        fontFamily: 'RobotoMono-Regular', // Placeholder for monospace
        fontSize: 16,
    },
    primaryCard: {
        alignItems: 'center',
        marginBottom: 40,
    },
    scanBtn: {
        backgroundColor: '#00E5FF',
        paddingVertical: 20,
        paddingHorizontal: 40,
        borderRadius: 12,
        width: '100%',
        alignItems: 'center',
    },
    scanBtnText: {
        color: '#000000',
        fontWeight: 'bold',
        fontSize: 18,
        letterSpacing: 1,
    },
    fallbackToggle: {
        paddingVertical: 15,
        borderBottomWidth: 1,
        borderColor: '#222',
        marginBottom: 20,
    },
    fallbackToggleText: {
        color: '#888',
        fontSize: 14,
    },
    fallbackTray: {
        backgroundColor: '#121212',
        padding: 20,
        borderRadius: 12,
    },
    label: {
        color: '#888',
        fontSize: 12,
        marginBottom: 8,
        textTransform: 'uppercase',
    },
    input: {
        backgroundColor: '#000',
        color: '#00E5FF',
        padding: 15,
        borderRadius: 8,
        fontFamily: 'RobotoMono-Regular',
        marginBottom: 20,
        borderWidth: 1,
        borderColor: '#333',
    },
    connectBtn: {
        backgroundColor: '#333',
        padding: 15,
        borderRadius: 8,
        alignItems: 'center',
    },
    connectBtnText: {
        color: '#FFF',
        fontWeight: 'bold',
    }
});
