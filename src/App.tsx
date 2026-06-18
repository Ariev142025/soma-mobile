import React,{useEffect} from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {GestureHandlerRootView} from 'react-native-gesture-handler';
import {SafeAreaProvider} from 'react-native-safe-area-context';
import {useAuthStore} from './store/auth.store';
import AppNavigator from './navigation/AppNavigator';
export default function App(){
  const{initAuth}=useAuthStore();
  useEffect(()=>{initAuth();},[]);
  return(
    <GestureHandlerRootView style={{flex:1}}>
      <SafeAreaProvider>
        <NavigationContainer>
          <AppNavigator/>
        </NavigationContainer>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
