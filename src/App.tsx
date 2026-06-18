import React,{useEffect} from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {SafeAreaProvider} from 'react-native-safe-area-context';
import {Alert} from 'react-native';
import {useAuthStore} from './store/auth.store';
import AppNavigator from './navigation/AppNavigator';
import {OTAService} from './services/ota.service';

async function checkOTA(){
  try{
    const{updated,mandatory}=await OTAService.checkAndApply();
    if(updated&&mandatory){
      Alert.alert('Update Tersedia','App perlu di-restart untuk menerapkan update.',[{text:'OK'}]);
    }
  }catch(e){console.warn('OTA check failed:',e);}
}

export default function App(){
  const{initAuth}=useAuthStore();
  useEffect(()=>{
    initAuth();
    checkOTA();
  },[]);
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
