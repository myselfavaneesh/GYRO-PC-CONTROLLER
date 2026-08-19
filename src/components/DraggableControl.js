import React, { useRef } from 'react';
import { View, Animated, PanResponder, StyleSheet } from 'react-native';

export default function DraggableControl({ 
    isEditMode, 
    initialPosition, 
    onLayoutSave, 
    id, 
    children 
}) {
    // Current position state
    const pan = useRef(new Animated.ValueXY(initialPosition)).current;
    
    // Track if we've moved significantly to avoid misinterpreting taps as drags
    const hasMoved = useRef(false);

    const panResponder = useRef(
        PanResponder.create({
            onStartShouldSetPanResponder: () => isEditMode,
            onMoveShouldSetPanResponder: (evt, gestureState) => {
                // Only capture if edit mode and moving significantly
                if (isEditMode && (Math.abs(gestureState.dx) > 2 || Math.abs(gestureState.dy) > 2)) {
                    hasMoved.current = true;
                    return true;
                }
                return false;
            },
            onPanResponderGrant: () => {
                hasMoved.current = false;
                pan.setOffset({
                    x: pan.x._value,
                    y: pan.y._value
                });
            },
            onPanResponderMove: Animated.event(
                [null, { dx: pan.x, dy: pan.y }],
                { useNativeDriver: false }
            ),
            onPanResponderRelease: () => {
                pan.flattenOffset();
                if (onLayoutSave && hasMoved.current) {
                    onLayoutSave(id, { x: pan.x._value, y: pan.y._value });
                }
                hasMoved.current = false;
            },
            onPanResponderTerminate: () => {
                pan.flattenOffset();
                hasMoved.current = false;
            }
        })
    ).current;

    return (
        <Animated.View
            style={[
                pan.getLayout(),
                styles.wrapper,
                isEditMode && styles.editModeWrapper
            ]}
            {...(isEditMode ? panResponder.panHandlers : {})}
        >
            <View pointerEvents={isEditMode ? "none" : "auto"}>
                {children}
            </View>
        </Animated.View>
    );
}

const styles = StyleSheet.create({
    wrapper: {
        position: 'absolute',
    },
    editModeWrapper: {
        borderWidth: 2,
        borderColor: '#FF1744',
        borderStyle: 'dashed',
        backgroundColor: 'rgba(255, 23, 68, 0.15)',
        padding: 5,
        borderRadius: 10,
    }
});
