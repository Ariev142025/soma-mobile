import * as Keychain from 'react-native-keychain';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {User} from '../types';
const SVC = 'com.somacontrols.mobile';
export const StorageService = {
  async setTokens(a:string,r:string){await Keychain.setGenericPassword(a,r,{service:SVC})},
  async getTokens(){
    const c=await Keychain.getGenericPassword({service:SVC});
    return c?{accessToken:c.username,refreshToken:c.password}:null;
  },
  async clearTokens(){await Keychain.resetGenericPassword({service:SVC})},
  async setUser(u:User){await AsyncStorage.setItem('soma_user',JSON.stringify(u))},
  async getUser():Promise<User|null>{
    const r=await AsyncStorage.getItem('soma_user');return r?JSON.parse(r):null;
  },
  async clearAll(){
    await Promise.all([Keychain.resetGenericPassword({service:SVC}),AsyncStorage.removeItem('soma_user')]);
  },
};
