
import React, { useMemo } from 'react';
import { StyleSheet, View, Text } from 'react-native';
import { frameRateIncluded } from 'react-native-vision-camera';

const useFBS = ({ supportsLowLightBoost, enableHdr, enableNightMode, formats, is60Fps , device}) => {

    const fps = useMemo(() => {
        if (!is60Fps) return 30;

        if (enableNightMode && !device?.supportsLowLightBoost) {
          // User has enabled Night Mode, but Night Mode is not natively supported, so we simulate it by lowering the frame rate.
          return 30;
        }

        const supportsHdrAt60Fps = formats.some((f) => f.supportsVideoHDR && f.frameRateRanges.some((r) => frameRateIncluded(r, 60)));
        if (enableHdr && !supportsHdrAt60Fps) {
          // User has enabled HDR, but HDR is not supported at 60 FPS.
          return 30;
        }

        const supports60Fps = formats.some((f) => f.frameRateRanges.some((r) => frameRateIncluded(r, 60)));
        console.log("====================>supports60Fps" , supports60Fps)
        if (!supports60Fps) {
          // 60 FPS is not supported by any format.
          return 30;
        }
        // If nothing blocks us from using it, we default to 60 FPS.
        return 60;
      }, [supportsLowLightBoost, enableHdr, enableNightMode, formats, is60Fps]);

    return fps;
}


export default useFBS;