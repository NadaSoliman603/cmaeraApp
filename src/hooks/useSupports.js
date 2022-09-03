
import React, { useMemo } from 'react';
import { StyleSheet, View, Text } from 'react-native';
import { frameRateIncluded, useCameraDevices } from 'react-native-vision-camera';

const useSupports = ({device, formats , enableNightMode , fps}) => {
    const devices = useCameraDevices(device);
    const supportsCameraFlipping = useMemo(() => devices.back != null && devices.front != null, [devices.back, devices.front]);
    const supportsFlash = device?.hasFlash ?? false;
    
    const supportsHdr = useMemo(() => formats.some((f) => f.supportsVideoHDR || f.supportsPhotoHDR), [formats]);
    const supports60Fps = useMemo(() => formats.some((f) => f.frameRateRanges.some((rate) => frameRateIncluded(rate, 60))), [formats]);
    const canToggleNightMode = enableNightMode
      ? true // it's enabled so you have to be able to turn it off again
      : (device?.supportsLowLightBoost ?? false) || fps > 30; // either we have native support, or we can lower the FPS
    
    return {
        supportsCameraFlipping,
        supportsHdr,
        supports60Fps,
        canToggleNightMode,
        supportsFlash,
    }
}


export default useSupports;