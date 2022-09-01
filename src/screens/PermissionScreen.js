import * as React  from 'react';
import {useCallback} from 'react';
import { View, Text, StyleSheet, Image, ScrollView } from 'react-native';
import { Camera } from 'react-native-vision-camera';
import {useEffect} from "react"
import { StatusBar, Dimensions, Platform, PixelRatio, } from 'react-native';

import { Linking } from 'react-native';
import { SAFE_AREA_PADDING } from '../conestants/Dimention';

const BANNER_IMAGE = require('../assets/image/11.png') ;

function PermissionScreen({navigation}) {

  ////////////////////////////////////////////////////////

  //////////////////////////////////////////////////////////
  const [cameraPermissionStatus , setCameraPermissionStatus] = React.useState()
  const [microphonePermissionStatus , setMicrophonePermissionStatus] = React.useState()

  const requestMicrophonePermission = useCallback(async()=>{
    console.log('Requesting microphone permission...');
    const Permission = await Camera.requestMicrophonePermission()
    console.log(`Microphone permission status: ${Permission}`);
    if (Permission === 'denied') await Linking.openSettings();
    setMicrophonePermissionStatus(Permission);
  },[])


  const requestCameraPermission = useCallback(async () => {
    console.log('Requesting camera permission...');
    const permission = await Camera.requestCameraPermission();
    console.log(`Camera permission status: ${permission}`);

    if (permission === 'denied') await Linking.openSettings();
    setCameraPermissionStatus(permission);
  }, []);

  useEffect(()=>{
    if (cameraPermissionStatus === 'authorized' && microphonePermissionStatus === 'authorized') navigation.replace('CameraPage');
  },[cameraPermissionStatus, microphonePermissionStatus, navigation])

  return (
    // <ScrollView style={styles.container}>
      <View style={styles.container}>
      <Image source={BANNER_IMAGE} style={styles.banner} />
      <Text style={styles.welcome}>Welcome to{'\n'}Vision Camera.</Text>
      <View style={styles.permissionsContainer}>
        {cameraPermissionStatus !== 'authorized' && (
          <Text style={styles.permissionText}>
            Vision Camera needs <Text style={styles.bold}>Camera permission</Text>.{' '}
            <Text style={styles.hyperlink} onPress={requestCameraPermission}>
              Grant
            </Text>
          </Text>
        )}
        {microphonePermissionStatus !== 'authorized' && (
          <Text style={styles.permissionText}>
            Vision Camera needs <Text style={styles.bold}>Microphone permission</Text>.{' '}
            <Text style={styles.hyperlink} onPress={requestMicrophonePermission}>
              Grant
            </Text>
          </Text>
        )}
      </View>
    </View>
    // </ScrollView>
  );
}

const styles = StyleSheet.create({
  welcome: {
    fontSize: 38,
    fontWeight: 'bold',
    maxWidth: '80%',
  },
  banner: {
    position: 'absolute',
    opacity: 0.4,
    bottom: 0,
    left: 0,
  },
  container: {
    flex: 1,
    backgroundColor: 'white',
    // height:2000
    ...SAFE_AREA_PADDING,
  },
  permissionsContainer: {
    // marginTop: CONTENT_SPACING * 2,
  },
  permissionText: {
    fontSize: 17,
  },
  hyperlink: {
    color: '#007aff',
    fontWeight: 'bold',
  },
  bold: {
    fontWeight: 'bold',
  },
});
export default PermissionScreen;