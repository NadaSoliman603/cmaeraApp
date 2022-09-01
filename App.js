// /**
//  * Sample React Native App
//  * https://github.com/facebook/react-native
//  *
//  * @format
//  * @flow strict-local
//  */


// In App.js in a new project

import * as React from 'react';
import { View, Text } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import PermissionScreen from './src/screens/PermissionScreen';
import CameraScreen from './src/screens/CameraScreeen';
import MediaScreen from './src/screens/MediaScreen';
import { useEffect } from 'react';
import { Camera } from 'react-native-vision-camera';



const Stack = createNativeStackNavigator();

function App() {
  const [cameraPermission , setCameraPermission] = React.useState()
  const [microphonPermission , setMicrophonPermission] = React.useState()

  useEffect(()=>{
    Camera.getCameraPermissionStatus().then(setCameraPermission);
    Camera.getMicrophonePermissionStatus().then(setMicrophonPermission)
  },[])

  console.log("cameraPermission  , =========>");
  console.log(cameraPermission , microphonPermission);

  if (cameraPermission == null || microphonPermission == null) {
    // still loading
    return <Text>Looding ...</Text>;
  }
  const showPermissionsPage = cameraPermission !== 'authorized' || microphonPermission === 'not-determined';

  return (
    <NavigationContainer>
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        statusBarStyle: 'dark',
        animationTypeForReplace: 'push',
      }}
      initialRouteName={showPermissionsPage ? 'PermissionsPage' : 'CameraPage'}>
      <Stack.Screen name="PermissionsPage" component={PermissionScreen} />
      <Stack.Screen name="CameraPage" component={CameraScreen} />
      <Stack.Screen
        name="MediaPage"
        component={MediaScreen}
        options={{
          animation: 'none',
          presentation: 'transparentModal',
        }}
      />
    </Stack.Navigator>
  </NavigationContainer>
  );
}

export default App;
