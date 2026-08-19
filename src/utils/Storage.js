import AsyncStorage from '@react-native-async-storage/async-storage';
import { Dimensions } from 'react-native';

const STORAGE_KEY = '@LayoutProfile_v1';
const { width, height } = Dimensions.get('window');

const defaultProfile = {
    controlMode: 'GYRO_WHEEL',
    pedalType: 'DIGITAL_BUTTON',
    positions: {
        gearDown: { x: 20, y: 20 },
        gearUp: { x: width - 80, y: 20 },
        brake: { x: 40, y: height - 200 },
        steer: { x: (width / 2) - 75, y: height - 200 },
        gas: { x: width - 160, y: height - 200 }
    }
};

export const saveLayoutProfile = async (profile) => {
    try {
        const jsonValue = JSON.stringify(profile);
        await AsyncStorage.setItem(STORAGE_KEY, jsonValue);
    } catch (e) {
        console.error("Error saving layout profile", e);
    }
};

export const loadLayoutProfile = async () => {
    try {
        const jsonValue = await AsyncStorage.getItem(STORAGE_KEY);
        if (jsonValue != null) {
            // Merge loaded positions with defaults to prevent crashes on missing keys
            const loaded = JSON.parse(jsonValue);
            return {
                ...defaultProfile,
                ...loaded,
                positions: {
                    ...defaultProfile.positions,
                    ...(loaded.positions || {})
                }
            };
        }
    } catch (e) {
        console.error("Error loading layout profile", e);
    }
    
    return defaultProfile;
};
