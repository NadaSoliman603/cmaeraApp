

import React, { useEffect, useState } from 'react';
import { StyleSheet, View, Text, AppState } from 'react-native';

const useIsFourground = (props) => {
    const [isForeground, setIsForeground] = useState(true);

    useEffect(()=>{
        const onChange = (state)=>{
            setIsForeground(state === 'active')
        }
        const listener = AppState.addEventListener('change', onChange);
        return () => listener.remove();
    },[setIsForeground])

    return isForeground
}



export default useIsFourground;