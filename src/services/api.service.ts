import axios,{AxiosError,AxiosRequestConfig} from 'axios';
import {API_BASE_URL,API_TIMEOUT} from '../constants';
import {StorageService} from './storage.service';
export const api=axios.create({baseURL:API_BASE_URL,timeout:API_TIMEOUT,headers:{'Content-Type':'application/json'}});
api.interceptors.request.use(async(config)=>{
  const t=await StorageService.getTokens();
  if(t?.accessToken)config.headers.Authorization=`Bearer ${t.accessToken}`;
  return config;
},(e)=>Promise.reject(e));
let refreshing=false;
api.interceptors.response.use(r=>r,async(error:AxiosError)=>{
  const req=error.config as AxiosRequestConfig&{_retry?:boolean};
  if(error.response?.status===401&&!req._retry){
    req._retry=true;
    if(refreshing)return Promise.reject(error);
    refreshing=true;
    try{
      const t=await StorageService.getTokens();
      if(!t?.refreshToken)throw new Error('no token');
      const {data}=await axios.post(`${API_BASE_URL}/auth/refresh`,{refreshToken:t.refreshToken});
      await StorageService.setTokens(data.accessToken,t.refreshToken);
      if(req.headers)req.headers.Authorization=`Bearer ${data.accessToken}`;
      return api(req);
    }catch{
      const {useAuthStore}=await import('../store/auth.store');
      await useAuthStore.getState().logout();
      return Promise.reject(error);
    }finally{refreshing=false;}
  }
  return Promise.reject(error);
});
export default api;
