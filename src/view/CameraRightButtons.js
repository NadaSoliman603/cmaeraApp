
import React from 'react';
import { StyleSheet, View, Text } from 'react-native';

const CameraRightButtons = (props) => {
    return (
        <View style={styles.rightButtonRow}>
            {supportsCameraFlipping && (
                <PressableOpacity style={styles.button} onPress={onFlipCameraPressed} disabledOpacity={0.4}>
                    <IonIcon name="camera-reverse" color="white" size={24} />
                </PressableOpacity>
            )}
            {supportsFlash && (
                <PressableOpacity style={styles.button} onPress={onFlashPressed} disabledOpacity={0.4}>
                    <IonIcon name={flash === 'on' ? 'flash' : 'flash-off'} color="white" size={24} />
                </PressableOpacity>
            )}

            {supports60Fps && (
                <PressableOpacity style={styles.button} onPress={() => setIs60Fps(!is60Fps)}>
                    <Text style={styles.text}>
                        {is60Fps ? '60' : '30'}
                        {'\n'}FPS
                    </Text>
                </PressableOpacity>
            )}

            {supportsHdr && (
                <PressableOpacity style={styles.button} onPress={() => setEnableHdr((h) => !h)}>
                    <MaterialIcon name={enableHdr ? 'hdr' : 'hdr-off'} color="white" size={24} />
                </PressableOpacity>
            )}
            {canToggleNightMode && (
                <PressableOpacity style={styles.button} onPress={() => setEnableNightMode(!enableNightMode)} disabledOpacity={0.4}>
                    <IonIcon name={enableNightMode ? 'moon' : 'moon-outline'} color="white" size={24} />
                </PressableOpacity>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    button: {
        marginBottom: CONTENT_SPACING,
        width: BUTTON_SIZE,
        height: BUTTON_SIZE,
        borderRadius: BUTTON_SIZE / 2,
        backgroundColor: 'rgba(140, 140, 140, 0.3)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    rightButtonRow: {
        position: 'absolute',
        right: SAFE_AREA_PADDING.paddingRight,
        top: SAFE_AREA_PADDING.paddingTop,
    },
});

export default CameraRightButtons;