import React,{useState,useEffect,useCallback} from 'react';
import{View,Text,StyleSheet,FlatList,TouchableOpacity,TextInput,ActivityIndicator,RefreshControl,StatusBar,Alert}from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import{useAuthStore}from '../../store/auth.store';
import{api}from '../../services/api.service';
import{COLORS}from '../../constants';
import{PeriodicSchedule}from '../../types';
import AppHeader from '../../components/common/AppHeader';
const SC:Record<string,string>={overdue:COLORS.danger,due_soon:COLORS.warning,ok:COLORS.success};
const SL:Record<string,string>={overdue:'Terlambat',due_soon:'Segera',ok:'On Track'};
export default function ScheduleScreen(){
  const{user}=useAuthStore();
  const[schedules,setSchedules]=useState<PeriodicSchedule[]>([]);
  const[filtered,setFiltered]=useState<PeriodicSchedule[]>([]);
  const[loading,setLoading]=useState(true);
  const[refreshing,setRefreshing]=useState(false);
  const[search,setSearch]=useState('');
  const[exec,setExec]=useState<string|null>(null);
  const fetch=useCallback(async()=>{
    try{const{data}=await api.get('/periodic-schedules',{params:{buildingId:user?.buildingId}});setSchedules(data??[]);}
    catch{setSchedules([]);}finally{setLoading(false);setRefreshing(false);}
  },[user]);
  useEffect(()=>{fetch();},[fetch]);
  useEffect(()=>{
    if(!search.trim()){setFiltered(schedules);return;}
    setFiltered(schedules.filter(s=>s.title.toLowerCase().includes(search.toLowerCase())||(s.assetName?.toLowerCase().includes(search.toLowerCase())??false)));
  },[search,schedules]);
  const handle=(sch:PeriodicSchedule)=>{
    Alert.alert('Konfirmasi',`Tandai "${sch.title}" selesai?`,[
      {text:'Batal',style:'cancel'},
      {text:'Selesai',onPress:async()=>{
        setExec(sch.id);
        try{await api.post(`/periodic-schedules/${sch.id}/execute`,{executedBy:user?.id,notes:'Via mobile app'});await fetch();}
        catch(e:any){Alert.alert('Gagal',e?.response?.data?.error??'Gagal update');}
        finally{setExec(null);}
      }},
    ]);
  };
  const fmt=(d:string)=>{try{return new Date(d).toLocaleDateString('id-ID',{day:'numeric',month:'short',year:'numeric'});}catch{return d;}};
  const ov=filtered.filter(s=>s.status==='overdue').length;
  const ds=filtered.filter(s=>s.status==='due_soon').length;
  return(
    <View style={s.c}>
      <StatusBar backgroundColor={COLORS.dark} barStyle="light-content"/>
      <AppHeader title="JADWAL PERIODIK" subtitle={`${filtered.length} jadwal`}/>
      {(ov>0||ds>0)&&(<View style={s.sum}>
        {ov>0&&<View style={[s.chip,{backgroundColor:COLORS.danger+'22'}]}><Icon name="warning" size={13} color={COLORS.danger}/><Text style={[s.chipT,{color:COLORS.danger}]}>{ov} terlambat</Text></View>}
        {ds>0&&<View style={[s.chip,{backgroundColor:COLORS.warning+'22'}]}><Icon name="time-outline" size={13} color={COLORS.warning}/><Text style={[s.chipT,{color:COLORS.warning}]}>{ds} segera</Text></View>}
      </View>)}
      <View style={s.bar}><Icon name="search-outline" size={16} color={COLORS.gray}/>
        <TextInput style={s.inp} placeholder="Cari jadwal..." placeholderTextColor={COLORS.gray} value={search} onChangeText={setSearch}/>
      </View>
      {loading?<ActivityIndicator color={COLORS.primary} style={{marginTop:56}}/>:(
        <FlatList data={filtered} keyExtractor={i=>i.id}
          renderItem={({item:sch})=>(
            <View style={s.card}>
              <View style={[s.stripe,{backgroundColor:SC[sch.status]??COLORS.gray}]}/>
              <View style={s.body}>
                <View style={s.ch}>
                  <Icon name="calendar-outline" size={16} color={COLORS.primary}/>
                  <Text style={s.ct} numberOfLines={1}>{sch.title}</Text>
                  <View style={[s.badge,{backgroundColor:(SC[sch.status]??COLORS.gray)+'22'}]}>
                    <Text style={[s.badgeT,{color:SC[sch.status]??COLORS.gray}]}>{SL[sch.status]??sch.status}</Text>
                  </View>
                </View>
                {sch.assetName&&<Text style={s.at}>{sch.assetName}</Text>}
                <Text style={s.mt}>{sch.frequency} · Due: {fmt(sch.nextDueDate)}</Text>
                {sch.daysUntilDue<0&&<Text style={{fontSize:11,color:COLORS.danger,fontWeight:'700'}}>Terlambat {Math.abs(sch.daysUntilDue)} hari</Text>}
                {sch.daysUntilDue>=0&&sch.daysUntilDue<=7&&<Text style={{fontSize:11,color:COLORS.warning,fontWeight:'700'}}>{sch.daysUntilDue===0?'Jatuh tempo hari ini':`${sch.daysUntilDue} hari lagi`}</Text>}
              </View>
              <TouchableOpacity style={[s.eb,exec===sch.id&&{opacity:0.5}]} onPress={()=>handle(sch)} disabled={exec===sch.id}>
                {exec===sch.id?<ActivityIndicator size="small" color={COLORS.success}/>:<Icon name="checkmark-circle-outline" size={26} color={COLORS.success}/>}
              </TouchableOpacity>
            </View>
          )}
          contentContainerStyle={{padding:16,gap:10}}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={()=>{setRefreshing(true);fetch();}} tintColor={COLORS.primary}/>}
          ListEmptyComponent={<View style={s.empty}><Icon name="calendar-outline" size={48} color={COLORS.border}/><Text style={{color:COLORS.gray,fontSize:14}}>Tidak ada jadwal</Text></View>}
        />
      )}
    </View>
  );
}
const s=StyleSheet.create({
  c:{flex:1,backgroundColor:COLORS.bg},
  sum:{flexDirection:'row',gap:8,paddingHorizontal:16,paddingTop:12},
  chip:{flexDirection:'row',alignItems:'center',gap:5,paddingHorizontal:10,paddingVertical:5,borderRadius:20},chipT:{fontSize:12,fontWeight:'700'},
  bar:{flexDirection:'row',alignItems:'center',gap:10,backgroundColor:COLORS.surface,margin:16,paddingHorizontal:14,paddingVertical:10,borderRadius:8,elevation:1},
  inp:{flex:1,fontSize:14,color:COLORS.textPrimary},
  card:{backgroundColor:COLORS.surface,flexDirection:'row',alignItems:'center',borderRadius:8,elevation:1,overflow:'hidden'},
  stripe:{width:4,alignSelf:'stretch'},body:{flex:1,padding:12,gap:3},
  ch:{flexDirection:'row',alignItems:'center',gap:6},ct:{flex:1,fontSize:14,fontWeight:'600',color:COLORS.textPrimary},
  badge:{paddingHorizontal:8,paddingVertical:3,borderRadius:4},badgeT:{fontSize:10,fontWeight:'700'},
  at:{fontSize:12,color:COLORS.gray},mt:{fontSize:12,color:COLORS.gray},
  eb:{padding:16},empty:{flex:1,justifyContent:'center',alignItems:'center',gap:12,marginTop:80},
});
