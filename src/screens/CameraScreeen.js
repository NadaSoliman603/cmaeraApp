import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { View, Text, StyleSheet, Pressable, Image, PixelRatio } from 'react-native';
import { Camera, frameRateIncluded, sortFormats, useFrameProcessor } from 'react-native-vision-camera';
import { useCameraDevices } from "react-native-vision-camera"
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import Reanimated, { divide, Extrapolate, interpolate, useAnimatedGestureHandler, useAnimatedProps, useSharedValue } from 'react-native-reanimated';
import CuptureButton from '../view/CuptureButton';
import { CONTENT_SPACING, MAX_ZOOM_FACTOR, SAFE_AREA_PADDING } from '../conestants/Dimention';
import { useIsFocused } from '@react-navigation/core';
import useIsFourground from '../hooks/useIsForgroun';
const logoImage = require('../assets/image/icon.png')
import { PinchGestureHandler, PinchGestureHandlerGestureEvent, TapGestureHandler } from 'react-native-gesture-handler';
import { StatusBarBlurBackground } from '../view/StatusBarBlurBackground';
import { PressableOpacity } from 'react-native-pressable-opacity';
import IonIcon from 'react-native-vector-icons/Ionicons';
import MaterialIcon  from 'react-native-vector-icons/MaterialIcons';
import useFBS from './../hooks/useFBS';
import useSupports from './../hooks/useSupports';

const ReanimatedCamera = Reanimated.createAnimatedComponent(Camera);
Reanimated.addWhitelistedNativeProps({
  zoom: true,
});
const SCALE_FULL_ZOOM = 3;
const BUTTON_SIZE = 40;

const CameraScreen = ({navigation}) => {
  const camera = useRef(null);
  const [isCameraInitialized, setIsCameraInitialized] = useState(false);
  const [hasMicrophonePermission, setHasMicrophonePermission] = useState(false);
  const zoom = useSharedValue(0);
  const isPressingButton = useSharedValue(false);

  // check if camera page is active
  const isFocussed = useIsFocused();
  const isForeground = useIsFourground();
  const isActive = isFocussed && isForeground;

  const [cameraPosition, setCameraPosition] = useState('back');
  const [enableHdr, setEnableHdr] = useState(false);
  const [flash, setFlash] = useState('off');
  const [enableNightMode, setEnableNightMode] = useState(false);

  // camera format settings
  const devices = useCameraDevices();
  const device = devices[cameraPosition];
  const formats = useMemo(() => {
    if (device?.formats == null) return [];
    return device.formats.sort(sortFormats);
  }, [device?.formats]);
  const [is60Fps, setIs60Fps] = useState(true);
  //#endregion
  const fps =  useFBS({ supportsLowLightBoost:device?.supportsLowLightBoost,  enableHdr,  enableNightMode,  formats,  is60Fps, device})
  const {supportsCameraFlipping,supportsHdr,supports60Fps,canToggleNightMode,supportsFlash,} = useSupports({device, formats , enableNightMode, fps})
  //#endregion

  const format = useMemo(() => {
    let result = formats;
    if (enableHdr) {
      // We only filter by HDR capable formats if HDR is set to true.
      // Otherwise we ignore the `supportsVideoHDR` property and accept formats which support HDR `true` or `false`
      result = result.filter((f) => f.supportsVideoHDR || f.supportsPhotoHDR);
    }

    // find the first format that includes the given FPS
    return result.find((f) => f.frameRateRanges.some((r) => frameRateIncluded(r, fps)));
  }, [formats, fps, enableHdr]);

    //#region Animated Zoom
  // This just maps the zoom factor to a percentage value.
  // so e.g. for [min, neutr., max] values [1, 2, 128] this would result in [0, 0.0081, 1]
  const minZoom = device?.minZoom ?? 1;
  const maxZoom = Math.min(device?.maxZoom ?? 1, MAX_ZOOM_FACTOR);

  const cameraAnimatedProps = useAnimatedProps(() => {
    const z = Math.max(Math.min(zoom.value, maxZoom), minZoom);
    return {
      zoom: z,
    };
  }, [maxZoom, minZoom, zoom]);
  
  const setIsPressingButton = useCallback(
    (_isPressingButton) => {
      isPressingButton.value = _isPressingButton;
    },
    [isPressingButton],
  );

  // Camera callbacks
  const onError = useCallback((error) => {
    console.error(error);
  }, []);


    const onInitialized = useCallback(() => {
    console.log('Camera initialized!');
    setIsCameraInitialized(true);
  }, []);
  
  
  const onMediaCaptured = useCallback(
    (media, type) => {
      console.log(`Media captured! ${JSON.stringify(media)}`);
      navigation.navigate('MediaPage', {
        path: media.path,
        type: type,
      });
    },
    [navigation],
  );

  




  const onDoubleTap = useCallback(() => {
    onFlipCameraPressed();
  }, [onFlipCameraPressed]);

  const onFlipCameraPressed = useCallback(() => {
    setCameraPosition((p) => (p === 'back' ? 'front' : 'back'));
  }, []);

  const onFlashPressed = useCallback(() => {
    setFlash((f) => (f === 'off' ? 'on' : 'off'));
  }, []);

  const neutralZoom = device?.neutralZoom ?? 1;
  useEffect(() => {
    // Run everytime the neutralZoomScaled value changes. (reset zoom when device changes)
    zoom.value = neutralZoom;
  }, [neutralZoom, zoom]);

  useEffect(() => {
    Camera.getMicrophonePermissionStatus().then((status) => setHasMicrophonePermission(status === 'authorized'));
  }, []);
  //#endregion
  



  const onPinchGesture = useAnimatedGestureHandler({
    onStart: (_, context) => {
      context.startZoom = zoom.value;
    },
    onActive: (event, context) => {
      // we're trying to map the scale gesture to a linear zoom here
      const startZoom = context.startZoom ?? 0;
      const scale = interpolate(event.scale, [1 - 1 / SCALE_FULL_ZOOM, 1, SCALE_FULL_ZOOM], [-1, 0, 1], Extrapolate.CLAMP);
      zoom.value = interpolate(scale, [-1, 0, 1], [minZoom, startZoom, maxZoom], Extrapolate.CLAMP);
    },
  });

  if (device != null && format != null) {
    console.log(
      `Re-rendering camera page with ${isActive ? 'active' : 'inactive'} camera. ` +
        `Device: "${device.name}" (${format.photoWidth}x${format.photoHeight} @ ${fps}fps)`,
    );
  } else {
    console.log('re-rendering camera page without active camera');
  }

  const frameProcessor = useFrameProcessor((frame) => {
    'worklet';
    // const values = examplePlugin(frame);
    // console.log(`Return Values: ${JSON.stringify(values)}`);
  }, []);

  
  const onFrameProcessorSuggestionAvailable = useCallback((suggestion) => {
    console.log(`Suggestion available! ${suggestion.type}: Can do ${suggestion.suggestedFrameProcessorFps} FPS`);
  }, []);



  return (
    <View style={styles.container}>
    {device != null && (
      <PinchGestureHandler onGestureEvent={onPinchGesture} enabled={isActive}>
        <Reanimated.View style={StyleSheet.absoluteFill}>
          <TapGestureHandler onEnded={onDoubleTap} numberOfTaps={2}>
            <ReanimatedCamera
              ref={camera}
              style={StyleSheet.absoluteFill}
              device={device}
              format={format}
              fps={fps}
              hdr={enableHdr}
              lowLightBoost={device.supportsLowLightBoost && enableNightMode}
              isActive={isActive}
              onInitialized={onInitialized}
              onError={onError}
              enableZoomGesture={false}
              animatedProps={cameraAnimatedProps}
              photo={true}
              video={true}
              audio={hasMicrophonePermission}
              frameProcessor={device.supportsParallelVideoProcessing ? frameProcessor : undefined}
              orientation="portrait"
              frameProcessorFps={1}
              onFrameProcessorPerformanceSuggestionAvailable={onFrameProcessorSuggestionAvailable}
            />
          </TapGestureHandler>
        </Reanimated.View>
      </PinchGestureHandler>
    )}

    <CuptureButton
      style={styles.captureButton}
      camera={camera}
      onMediaCaptured={onMediaCaptured}
      cameraZoom={zoom}
      minZoom={minZoom}
      maxZoom={maxZoom}
      flash={supportsFlash ? flash : 'off'}
      enabled={isCameraInitialized && isActive}
      setIsPressingButton={setIsPressingButton}
    />

    <StatusBarBlurBackground />

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
  </View>
  );
};

const styles = StyleSheet.create({
  cameraButton: {
    position: "absolute",
    top: hp('85%'),
    alignSelf: 'center',
  },
  rotateCamera: {
    position: 'absolute',
    flex: 1,
    zIndex: 1,
  },
  tinyLogo: {
    width: PixelRatio.getPixelSizeForLayoutSize(30),
    height: PixelRatio.getPixelSizeForLayoutSize(30),
    opacity: 1,
  },
  rotateText: {
    color: "red",
    padding: 15,
    fontSize: 20,
    textAlign: 'right',
    backgroundColor: "#0000005f"
  },
  container: {
    flex: 1,
    backgroundColor: 'black',
  },
  captureButton: {
    position: 'absolute',
    alignSelf: 'center',
    bottom: SAFE_AREA_PADDING.paddingBottom,
  },
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
  text: {
    color: 'white',
    fontSize: 11,
    fontWeight: 'bold',
    textAlign: 'center',
  },
});




export default CameraScreen;