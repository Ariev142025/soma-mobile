import React,{useEffect} from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {SafeAreaProvider} from 'react-native-safe-area-context';
import {useAuthStore} from './store/auth.store';
import AppNavigator from './navigation/AppNavigator';
export default function App(){
  const{initAuth}=useAuthStore();
  useEffect(()=>{initAuth();},[]);
  return(
    <>
      <SafeAreaProvider>
        <NavigationContainer>
          <AppNavigator/>
        </NavigationContainer>
      </SafeAreaProvider>
    </>
  );
}
