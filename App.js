import React from 'react';
import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StatusBar } from 'react-native';

import ConnectionHub from './src/screens/ConnectionHub';
import ControllerWorkspace from './src/screens/ControllerWorkspace';
import Calibration from './src/screens/Calibration';

const Stack = createNativeStackNavigator();

const DarkTheme = {
    ...DefaultTheme,
    colors: {
        ...DefaultTheme.colors,
        background: '#000000',
        text: '#ffffff',
    },
};

export default function App() {
    return (
        <NavigationContainer theme={DarkTheme}>
            <StatusBar barStyle="light-content" backgroundColor="#000000" />
            <Stack.Navigator 
                initialRouteName="ConnectionHub"
                screenOptions={{
                    headerStyle: { backgroundColor: '#121212' },
                    headerTintColor: '#00E5FF',
                    headerTitleStyle: { fontFamily: 'RobotoMono-Regular' },
                }}
            >
                <Stack.Screen 
                    name="ConnectionHub" 
                    component={ConnectionHub} 
                    options={{ headerShown: false }}
                />
                <Stack.Screen 
                    name="ControllerWorkspace" 
                    component={ControllerWorkspace} 
                    options={{ 
                        headerShown: false,
                        // Landscape orientation should be forced in actual AndroidManifest.xml / Info.plist
                        // or using react-native-orientation-locker
                    }}
                />
                <Stack.Screen 
                    name="Calibration" 
                    component={Calibration} 
                    options={{ title: 'Calibration' }}
                />
            </Stack.Navigator>
        </NavigationContainer>
    );
}
