import {create} from 'zustand';
import {StorageService} from '../services/storage.service';
import {api} from '../services/api.service';
import {User} from '../types';
interface AuthStore{
  user:User|null;isLoading:boolean;isAuthenticated:boolean;
  initAuth:()=>Promise<void>;
  login:(email:string,password:string)=>Promise<void>;
  logout:()=>Promise<void>;
  updateUser:(u:Partial<User>)=>void;
}
export const useAuthStore=create<AuthStore>((set,get)=>({
  user:null,isLoading:true,isAuthenticated:false,
  initAuth:async()=>{
    try{
      const [t,u]=await Promise.all([StorageService.getTokens(),StorageService.getUser()]);
      if(t?.accessToken&&u)set({user:u,isAuthenticated:true});
    }catch{}finally{set({isLoading:false});}
  },
  login:async(email,password)=>{
    const {data}=await api.post('/auth/login',{email,password});
    // Support both accessToken dan token (backward compat)
    const accessToken = data.accessToken ?? data.token;
    const refreshToken = data.refreshToken ?? data.token;
    await Promise.all([StorageService.setTokens(accessToken,refreshToken),StorageService.setUser(data.user)]);
    set({user:data.user,isAuthenticated:true});
  },
  logout:async()=>{
    try{await api.post('/auth/logout');}catch{}
    await StorageService.clearAll();
    set({user:null,isAuthenticated:false});
  },
  updateUser:(u)=>{
    const cur=get().user;if(!cur)return;
    const updated={...cur,...u};
    set({user:updated});StorageService.setUser(updated);
  },
}));
