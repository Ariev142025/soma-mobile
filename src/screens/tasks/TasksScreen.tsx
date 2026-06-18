import React,{useState,useCallback,useEffect} from 'react';
import{View,Text,StyleSheet,FlatList,TouchableOpacity,TextInput,RefreshControl,ActivityIndicator,StatusBar}from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import{useAuthStore}from '../../store/auth.store';
import{api}from '../../services/api.service';
import{COLORS,PRIORITY_COLORS,STATUS_COLORS}from '../../constants';
import{WorkOrder}from '../../types';
const SL:Record<string,string>={open:'Buka',in_progress:'Proses',completed:'Selesai',cancelled:'Batal'};
export default function TasksScreen(){
  const{user}=useAuthStore();
  const[orders,setOrders]=useState<WorkOrder[]>([]);
  const[filtered,setFiltered]=useState<WorkOrder[]>([]);
  const[loading,setLoading]=useState(true);
  const[refreshing,setRefreshing]=useState(false);
  const[search,setSearch]=useState('');
  const[sf,setSf]=useState('all');
  const fetch=useCallback(async()=>{
    try{const{data}=await api.get('/work-orders',{params:{buildingId:user?.buildingId,assignedTo:user?.id}});setOrders(data??[]);}
    catch{setOrders([]);}finally{setLoading(false);setRefreshing(false);}
  },[user]);
  useEffect(()=>{fetch();},[fetch]);
  useEffect(()=>{
    let r=orders;
    if(sf!=='all')r=r.filter(o=>o.status===sf);
    if(search.trim())r=r.filter(o=>o.title.toLowerCase().includes(search.toLowerCase())||(o.location?.toLowerCase().includes(search.toLowerCase())??false));
    setFiltered(r);
  },[search,sf,orders]);
  const TABS=['all','open','in_progress','completed'];
  return(
    <View style={s.c}>
      <StatusBar backgroundColor={COLORS.dark} barStyle="light-content"/>
      <View style={s.hdr}><Text style={s.title}>WORK ORDERS</Text><Text style={s.sub}>{filtered.length} tugas</Text></View>
      <View style={s.bar}><Icon name="search-outline" size={16} color={COLORS.gray}/>
        <TextInput style={s.inp} placeholder="Cari work order..." placeholderTextColor={COLORS.gray} value={search} onChangeText={setSearch}/>
      </View>
      <View style={s.tabs}>
        {TABS.map(t=>(
          <TouchableOpacity key={t} style={[s.tab,sf===t&&s.tabA]} onPress={()=>setSf(t)}>
            <Text style={[s.tabT,sf===t&&s.tabTA]}>{t==='all'?'Semua':SL[t]??t}</Text>
          </TouchableOpacity>
        ))}
      </View>
      {loading?<ActivityIndicator color={COLORS.primary} style={{marginTop:56}}/>:
        <FlatList data={filtered} keyExtractor={i=>i.id}
          renderItem={({item:w})=>(
            <View style={s.card}>
              <View style={s.cH}>
                <View style={[s.dot,{backgroundColor:PRIORITY_COLORS[w.priority]??COLORS.gray}]}/>
                <Text style={s.cT} numberOfLines={1}>{w.title}</Text>
                <View style={[s.badge,{backgroundColor:(STATUS_COLORS[w.status]??COLORS.gray)+'22'}]}>
                  <Text style={[s.badgeT,{color:STATUS_COLORS[w.status]??COLORS.gray}]}>{SL[w.status]??w.status}</Text>
                </View>
              </View>
              {w.location&&<View style={s.meta}><Icon name="location-outline" size={12} color={COLORS.gray}/><Text style={s.metaT}>{w.location}</Text></View>}
              <View style={s.cF}>
                <View style={s.meta}><Icon name="flag-outline" size={12} color={PRIORITY_COLORS[w.priority]??COLORS.gray}/><Text style={[s.metaT,{color:PRIORITY_COLORS[w.priority]}]}>{w.priority?.toUpperCase()}</Text></View>
                {w.dueDate&&<View style={s.meta}><Icon name="calendar-outline" size={12} color={COLORS.gray}/><Text style={s.metaT}>{w.dueDate?.slice(0,10)}</Text></View>}
              </View>
            </View>
          )}
          contentContainerStyle={{padding:16,gap:10}}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={()=>{setRefreshing(true);fetch();}} tintColor={COLORS.primary}/>}
          ListEmptyComponent={<View style={s.empty}><Icon name="clipboard-outline" size={48} color={COLORS.border}/><Text style={s.emptyT}>Tidak ada work order</Text></View>}
        />
      }
    </View>
  );
}
const s=StyleSheet.create({
  c:{flex:1,backgroundColor:COLORS.bg},
  hdr:{backgroundColor:COLORS.dark,paddingHorizontal:20,paddingTop:52,paddingBottom:16},
  title:{color:'#fff',fontSize:16,fontWeight:'700',letterSpacing:1},sub:{color:COLORS.gray,fontSize:12,marginTop:2},
  bar:{flexDirection:'row',alignItems:'center',gap:10,backgroundColor:COLORS.surface,margin:16,paddingHorizontal:14,paddingVertical:10,borderRadius:8,elevation:1},
  inp:{flex:1,fontSize:14,color:COLORS.textPrimary},
  tabs:{flexDirection:'row',paddingHorizontal:16,gap:8,marginBottom:8},
  tab:{paddingHorizontal:12,paddingVertical:6,borderBottomWidth:2,borderBottomColor:'transparent'},
  tabA:{borderBottomColor:COLORS.primary},tabT:{fontSize:12,fontWeight:'600',color:COLORS.gray},tabTA:{color:COLORS.primary},
  card:{backgroundColor:COLORS.surface,padding:14,borderRadius:8,elevation:1},
  cH:{flexDirection:'row',alignItems:'center',gap:8,marginBottom:8},
  dot:{width:8,height:8,borderRadius:4},
  cT:{flex:1,fontSize:14,fontWeight:'600',color:COLORS.textPrimary},
  badge:{paddingHorizontal:8,paddingVertical:3,borderRadius:4},badgeT:{fontSize:11,fontWeight:'700'},
  meta:{flexDirection:'row',alignItems:'center',gap:4,marginBottom:2},metaT:{fontSize:12,color:COLORS.gray},
  cF:{flexDirection:'row',justifyContent:'space-between',marginTop:4},
  empty:{flex:1,justifyContent:'center',alignItems:'center',gap:12,marginTop:80},emptyT:{color:COLORS.gray,fontSize:14},
  textPrimary:{color:COLORS.textPrimary},
});
