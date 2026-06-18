import React,{useState,useEffect,useCallback} from 'react';
import{View,Text,StyleSheet,FlatList,TouchableOpacity,TextInput,ActivityIndicator,RefreshControl,StatusBar}from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import{useAuthStore}from '../../store/auth.store';
import{api}from '../../services/api.service';
import{COLORS}from '../../constants';
import{Asset}from '../../types';
import AppHeader from '../../components/common/AppHeader';
const SC:Record<string,string>={operational:COLORS.success,maintenance:'#F1C21B',breakdown:COLORS.danger,inactive:COLORS.gray};
export default function TaggingScreen(){
  const{user}=useAuthStore();
  const[assets,setAssets]=useState<Asset[]>([]);
  const[filtered,setFiltered]=useState<Asset[]>([]);
  const[loading,setLoading]=useState(true);
  const[refreshing,setRefreshing]=useState(false);
  const[search,setSearch]=useState('');
  const[tagging,setTagging]=useState<string|null>(null);
  const[result,setResult]=useState<{id:string;ok:boolean;msg:string}|null>(null);
  const fetch=useCallback(async()=>{
    try{const{data}=await api.get('/assets',{params:{buildingId:user?.buildingId}});setAssets(data??[]);setFiltered(data??[]);}
    catch{setAssets([]);}finally{setLoading(false);setRefreshing(false);}
  },[user]);
  useEffect(()=>{fetch();},[fetch]);
  useEffect(()=>{
    if(!search.trim()){setFiltered(assets);return;}
    setFiltered(assets.filter(a=>a.name.toLowerCase().includes(search.toLowerCase())||(a.location?.toLowerCase().includes(search.toLowerCase())??false)||a.category.toLowerCase().includes(search.toLowerCase())));
  },[search,assets]);
  const doTag=async(a:Asset)=>{
    setTagging(a.id);setResult(null);
    try{
      const t=new Date();const n=new Date(t);n.setDate(n.getDate()+30);
      const f=(d:Date)=>d.toISOString().slice(0,10);
      await api.post(`/assets/${a.id}/tags`,{buildingId:user?.buildingId,taggedBy:user?.id,taggedAt:f(t),nextTagDate:f(n),status:'ok'});
      setResult({id:a.id,ok:true,msg:`${a.name} berhasil di-tag`});
    }catch(e:any){setResult({id:a.id,ok:false,msg:e?.response?.data?.error??'Gagal tag aset'});}
    finally{setTagging(null);}
  };
  return(
    <View style={s.c}>
      <StatusBar backgroundColor={COLORS.dark} barStyle="light-content"/>
      <AppHeader title="TAGGING ASET" subtitle={`${filtered.length} aset`}/>
      <View style={s.bar}><Icon name="search-outline" size={16} color={COLORS.gray}/>
        <TextInput style={s.inp} placeholder="Cari aset..." placeholderTextColor={COLORS.gray} value={search} onChangeText={setSearch}/>
        {search?<TouchableOpacity onPress={()=>setSearch('')}><Icon name="close-circle" size={16} color={COLORS.gray}/></TouchableOpacity>:null}
      </View>
      {loading?<ActivityIndicator color={COLORS.primary} style={{marginTop:56}}/>:(
        <FlatList data={filtered} keyExtractor={i=>i.id}
          renderItem={({item:a})=>(
            <View style={s.card}>
              <View style={[s.stripe,{backgroundColor:SC[a.status]??COLORS.gray}]}/>
              <View style={s.body}>
                <Text style={s.nm} numberOfLines={1}>{a.name}</Text>
                <Text style={s.mt}>{a.category}{a.location?` · ${a.location}`:''}</Text>
                {a.healthScore!==undefined&&<Text style={[s.hs,{color:a.healthScore>=70?COLORS.success:COLORS.danger}]}>{a.healthScore}% health</Text>}
                {result?.id===a.id&&<View style={[s.rb,{backgroundColor:result.ok?'#DEFBE6':'#FFF1F1'}]}>
                  <Text style={{fontSize:11,fontWeight:'700',color:result.ok?COLORS.success:COLORS.danger}}>{result.msg}</Text>
                </View>}
              </View>
              <TouchableOpacity style={[s.tb,tagging===a.id&&{opacity:0.5}]} onPress={()=>doTag(a)} disabled={tagging===a.id}>
                {tagging===a.id?<ActivityIndicator size="small" color={COLORS.primary}/>:(<><Icon name="pricetag-outline" size={16} color={COLORS.primary}/><Text style={s.tbT}>Tag</Text></>)}
              </TouchableOpacity>
            </View>
          )}
          contentContainerStyle={{padding:16,gap:10}}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={()=>{setRefreshing(true);fetch();}} tintColor={COLORS.primary}/>}
          ListEmptyComponent={<View style={s.empty}><Icon name="hardware-chip-outline" size={48} color={COLORS.border}/><Text style={{color:COLORS.gray,fontSize:14}}>Tidak ada aset</Text></View>}
        />
      )}
    </View>
  );
}
const s=StyleSheet.create({
  c:{flex:1,backgroundColor:COLORS.bg},
  bar:{flexDirection:'row',alignItems:'center',gap:10,backgroundColor:COLORS.surface,margin:16,paddingHorizontal:14,paddingVertical:10,borderRadius:8,elevation:1},
  inp:{flex:1,fontSize:14,color:COLORS.textPrimary},
  card:{backgroundColor:COLORS.surface,flexDirection:'row',alignItems:'center',borderRadius:8,elevation:1,overflow:'hidden'},
  stripe:{width:4,alignSelf:'stretch'},body:{flex:1,padding:12,gap:3},
  nm:{fontSize:14,fontWeight:'600',color:COLORS.textPrimary},mt:{fontSize:12,color:COLORS.gray},hs:{fontSize:11,fontWeight:'600'},
  rb:{marginTop:6,padding:6,borderRadius:4},
  tb:{flexDirection:'row',alignItems:'center',gap:4,paddingHorizontal:14,paddingVertical:10,marginRight:12,borderWidth:1,borderColor:COLORS.primary,borderRadius:6},
  tbT:{fontSize:12,fontWeight:'700',color:COLORS.primary},
  empty:{flex:1,justifyContent:'center',alignItems:'center',gap:12,marginTop:80},
});
