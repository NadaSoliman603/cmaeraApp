import React, { useEffect, useRef ,useState } from 'react';
import { View, Text, StyleSheet, Pressable , Image, PixelRatio} from 'react-native';
import { Camera } from 'react-native-vision-camera';
import { useCameraDevices } from "react-native-vision-camera"
import {widthPercentageToDP as wp, heightPercentageToDP as hp} from 'react-native-responsive-screen';
import Reanimated, { divide, Extrapolate, interpolate, useAnimatedGestureHandler, useAnimatedProps, useSharedValue } from 'react-native-reanimated';
import CuptureButton from '../view/CuptureButton';
import { MAX_ZOOM_FACTOR } from '../conestants/Dimention';
import { useIsFocused } from '@react-navigation/core';
import useIsFourground from '../hooks/useIsForgroun';
const logoImage = require('../assets/image/icon.png')
import { PinchGestureHandler, PinchGestureHandlerGestureEvent, TapGestureHandler } from 'react-native-gesture-handler';

const ReanimatedCamera = Reanimated.createAnimatedComponent(Camera);
Reanimated.addWhitelistedNativeProps({
  zoom: true,
});

const CameraScreen = () => {
  const devices = useCameraDevices()
  const [cameraPosition , setCameraPosition] = React.useState("back")
  const device = devices[cameraPosition]
  const camera = useRef(null)
  const zoom = useSharedValue(0)
  const minZoom = device?.minZoom ?? 1
  const maxZoom = Math.min(device?.maxZoom ?? 1, MAX_ZOOM_FACTOR);
  const supportsFlash = device?.hasFlash ?? false;
  const [isCameraInitialized, setIsCameraInitialized] = useState(false);


  // check if camera page is active
  const isFocussed = useIsFocused();
  const isForeground = useIsFourground();
  const isActive = isFocussed && isForeground;

  useEffect(() => {
    const getCameraPermission = async () => {
      const cameraPermission = await Camera.getCameraPermissionStatus();
      const microphonePermission = await Camera.getMicrophonePermissionStatus();
      console.log("permision====>")
      console.log(cameraPermission, microphonePermission)

      if (cameraPermission === 'denied') {
        const newCameraPermission = await Camera.requestCameraPermission()
        console.log(newCameraPermission)
      }
      if (microphonePermission === 'denied') {
        const newMicrophonePermission = await Camera.requestMicrophonePermission()
        console.log(newMicrophonePermission)
      }
    }
    getCameraPermission()
    return () => { }
  }, []);
  if (device == null) return <Text>Loading ...</Text>
  const rotateCameraHandler = ()=>{}
  const onMediaCaptured = () => {}
  const setIsPressingButton = ()=>{}
  const onPinchGesture = ()=>{}
  const onDoubleTap = ()=>{}
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
  tinyLogo:{
    width: PixelRatio.getPixelSizeForLayoutSize(30),
    height: PixelRatio.getPixelSizeForLayoutSize(30),
    opacity:1,
  },
  rotateText :{
    color:"red",
    padding:15,
    fontSize:20,
    textAlign:'right',
    backgroundColor:"#0000005f"
  },
  container: {
    flex: 1,
    // backgroundColor: 'black',
  },
  captureButton: {
    position: 'absolute',
    alignSelf: 'center',
    // bottom: SAFE_AREA_PADDING.paddingBottom,
  },
  button: {
    // marginBottom: CONTENT_SPACING,
    // width: BUTTON_SIZE,
    // height: BUTTON_SIZE,
    // borderRadius: BUTTON_SIZE / 2,
    backgroundColor: 'rgba(140, 140, 140, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  rightButtonRow: {
    position: 'absolute',
    // right: SAFE_AREA_PADDING.paddingRight,
    // top: SAFE_AREA_PADDING.paddingTop,
  },
  text: {
    color: 'white',
    fontSize: 11,
    fontWeight: 'bold',
    textAlign: 'center',
  },
});




export default CameraScreen;