import React,{useState,useEffect,useCallback} from 'react';
import{View,Text,StyleSheet,ScrollView,TouchableOpacity,ActivityIndicator,Alert,RefreshControl,StatusBar}from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import Geolocation from 'react-native-geolocation-service';
import{request,PERMISSIONS,RESULTS}from 'react-native-permissions';
import{Platform}from 'react-native';
import{COLORS}from '../../constants';
import{api}from '../../services/api.service';
import{useAuthStore}from '../../store/auth.store';
export default function AttendanceScreen(){
  const{user}=useAuthStore();
  const[loc,setLoc]=useState<{lat:number;lng:number}|null>(null);
  const[today,setToday]=useState<any>(null);
  const[loading,setLoading]=useState(true);
  const[submitting,setSubmitting]=useState(false);
  const[refreshing,setRefreshing]=useState(false);
  const reqPerm=async()=>{
    const p=Platform.OS==='ios'?PERMISSIONS.IOS.LOCATION_WHEN_IN_USE:PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION;
    return(await request(p))===RESULTS.GRANTED;
  };
  const getLoc=():Promise<{lat:number;lng:number}>=>new Promise((res,rej)=>
    Geolocation.getCurrentPosition(p=>res({lat:p.coords.latitude,lng:p.coords.longitude}),rej,{enableHighAccuracy:true,timeout:15000})
  );
  const fetchData=useCallback(async()=>{
    try{
      const r=await api.get('/attendance/today',{params:{buildingId:user?.buildingId}});
      setToday(r.data);
    }catch{}finally{setLoading(false);setRefreshing(false);}
  },[user]);
  useEffect(()=>{
    (async()=>{
      await reqPerm();
      try{setLoc(await getLoc());}catch{}
      await fetchData();
    })();
  },[fetchData]);
  const handle=async(type:'check_in'|'check_out')=>{
    setSubmitting(true);
    try{
      const l=await getLoc();setLoc(l);
      await api.post('/attendance',{buildingId:user?.buildingId,type,latitude:l.lat,longitude:l.lng});
      Alert.alert('Berhasil',type==='check_in'?'Check in berhasil':'Check out berhasil');
      await fetchData();
    }catch(e:any){Alert.alert('Gagal',e?.response?.data?.error??'Gagal menyimpan absensi');}
    finally{setSubmitting(false);}
  };
  const hasIn=!!today?.checkIn;const hasOut=!!today?.checkOut;
  return(
    <ScrollView style={s.c} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={()=>{setRefreshing(true);fetchData();}} tintColor={COLORS.primary}/>}>
      <StatusBar backgroundColor={COLORS.dark} barStyle="light-content"/>
      <View style={s.hdr}>
        <Text style={s.title}>ABSENSI</Text>
        <Text style={s.sub}>{new Date().toLocaleDateString('id-ID',{weekday:'long',day:'numeric',month:'long'})}</Text>
      </View>
      {loading?<ActivityIndicator color={COLORS.primary} style={{marginTop:56}}/>:(<>
        <View style={s.sec}>
          <View style={s.card}>
            <View style={s.row}>
              <View style={s.item}>
                <Icon name="log-in-outline" size={22} color={COLORS.success}/>
                <Text style={s.lbl}>Check In</Text>
                <Text style={[s.t,{color:hasIn?COLORS.success:COLORS.textPrimary}]}>{today?.checkIn??'—'}</Text>
                {hasIn&&today?.isValidLocation===false&&(<View style={s.badge}><Icon name="warning" size={10} color={COLORS.danger}/><Text style={s.badgeT}>Di luar area</Text></View>)}
              </View>
              <View style={s.dv}/>
              <View style={s.item}>
                <Icon name="log-out-outline" size={22} color={COLORS.danger}/>
                <Text style={s.lbl}>Check Out</Text>
                <Text style={[s.t,{color:hasOut?COLORS.danger:COLORS.textPrimary}]}>{today?.checkOut??'—'}</Text>
              </View>
            </View>
          </View>
        </View>
        <View style={s.sec}>
          <View style={s.gps}>
            <Icon name="location" size={14} color={loc?COLORS.success:COLORS.gray}/>
            <Text style={{fontSize:12,color:loc?COLORS.textPrimary:COLORS.gray,flex:1}}>
              {loc?`GPS: ${loc.lat.toFixed(5)}, ${loc.lng.toFixed(5)}`:'Mendeteksi lokasi...'}
            </Text>
          </View>
        </View>
        <View style={s.sec}>
          <TouchableOpacity style={[s.btn,{backgroundColor:COLORS.success},(hasIn||submitting)&&{opacity:0.45}]}
            onPress={()=>handle('check_in')} disabled={hasIn||submitting} activeOpacity={0.85}>
            {submitting?<ActivityIndicator color="#fff"/>:(<><Icon name="log-in-outline" size={22} color="#fff"/><Text style={s.btnT}>{hasIn?'Sudah Check In':'CHECK IN'}</Text></>)}
          </TouchableOpacity>
          <TouchableOpacity style={[s.btn,{backgroundColor:COLORS.danger,marginTop:12},(!hasIn||hasOut||submitting)&&{opacity:0.45}]}
            onPress={()=>handle('check_out')} disabled={!hasIn||hasOut||submitting} activeOpacity={0.85}>
            {submitting?<ActivityIndicator color="#fff"/>:(<><Icon name="log-out-outline" size={22} color="#fff"/><Text style={s.btnT}>{hasOut?'Sudah Check Out':'CHECK OUT'}</Text></>)}
          </TouchableOpacity>
        </View>
      </>)}
    </ScrollView>
  );
}
const s=StyleSheet.create({
  c:{flex:1,backgroundColor:COLORS.bg},
  hdr:{backgroundColor:COLORS.dark,paddingHorizontal:20,paddingTop:52,paddingBottom:20},
  title:{color:'#fff',fontSize:16,fontWeight:'700',letterSpacing:1},sub:{color:COLORS.gray,fontSize:12,marginTop:2},
  sec:{paddingHorizontal:16,marginTop:16},
  card:{backgroundColor:COLORS.surface,borderRadius:8,padding:16,elevation:2},
  row:{flexDirection:'row',alignItems:'center'},
  item:{flex:1,alignItems:'center',gap:6},dv:{width:1,height:56,backgroundColor:COLORS.border},
  lbl:{fontSize:12,color:COLORS.gray},t:{fontSize:18,fontWeight:'700'},
  badge:{flexDirection:'row',alignItems:'center',gap:3,backgroundColor:'#FFF1F1',paddingHorizontal:6,paddingVertical:2,borderRadius:4},
  badgeT:{fontSize:10,color:COLORS.danger,fontWeight:'600'},
  gps:{backgroundColor:COLORS.surface,borderRadius:8,padding:12,elevation:1,flexDirection:'row',alignItems:'center',gap:8},
  btn:{flexDirection:'row',alignItems:'center',justifyContent:'center',gap:10,paddingVertical:16,borderRadius:8},
  btnT:{color:'#fff',fontSize:15,fontWeight:'700',letterSpacing:1},
  textPrimary:{color:COLORS.textPrimary},
});
