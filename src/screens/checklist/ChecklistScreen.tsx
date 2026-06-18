import React,{useState,useEffect,useCallback,useMemo} from 'react';
import{View,Text,StyleSheet,FlatList,TouchableOpacity,TextInput,ScrollView,Alert,ActivityIndicator,RefreshControl,StatusBar,Image}from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import{launchCamera}from 'react-native-image-picker';
import{useAuthStore}from '../../store/auth.store';
import{api}from '../../services/api.service';
import{COLORS}from '../../constants';
import AppHeader from '../../components/common/AppHeader';
type Scr='list'|'fill';
const PF:Record<string,[string,string]>={ok_nok:['OK','NOK'],pass_fail:['Pass','Fail'],yes_no:['Ya','Tidak'],boolean:['OK','NOT OK']};
const FC:Record<string,string>={harian:COLORS.primary,daily:COLORS.primary,mingguan:COLORS.purple,weekly:COLORS.purple,bulanan:COLORS.success,monthly:COLORS.success};
function norm(items:any[]):any[]{
  if(!Array.isArray(items)||!items.length)return[];
  if(items[0]?.fields!==undefined)return items.map((s,i)=>({id:s.id??String(i),title:s.title??`Seksi ${i+1}`,fields:(s.fields??[]).map((f:any)=>({id:f.id,label:f.label??'',type:f.type??'text',required:!!f.required,options:f.options}))}));
  const order:string[]=[],g:Record<string,any>={};
  items.forEach((f:any)=>{const id=f.sectionId??f.section??'default',t=f.section??'Checklist';if(!g[id]){g[id]={id,title:t,fields:[]};order.push(id);}g[id].fields.push({id:f.id,label:f.label??'',type:f.type??'text',required:!!f.required,options:f.options});});
  return order.map(id=>g[id]);
}
export default function ChecklistScreen(){
  const{user}=useAuthStore();
  const[scr,setScr]=useState<Scr>('list');
  const[tpls,setTpls]=useState<any[]>([]);
  const[sel,setSel]=useState<any>(null);
  const[ans,setAns]=useState<Record<string,any>>({});
  const[loading,setLoading]=useState(true);
  const[sub,setSub]=useState(false);
  const[refreshing,setRefreshing]=useState(false);
  const fetch=useCallback(async()=>{
    try{const{data}=await api.get('/checklist-templates',{params:{buildingId:user?.buildingId}});setTpls(data??[]);}
    catch{setTpls([]);}finally{setLoading(false);setRefreshing(false);}
  },[user]);
  useEffect(()=>{fetch();},[fetch]);
  const secs=useMemo(()=>norm(sel?.items??[]),[sel]);
  const setA=(id:string,v:any)=>setAns(p=>({...p,[id]:v}));
  const resFr=(type:string,v:any)=>{const o=PF[type];if(o){if(v===o[0])return'pass';if(v===o[1])return'fail';}return'na';};
  const submit=async()=>{
    if(!sel)return;
    const all=secs.flatMap((s:any)=>s.fields);
    const miss=all.filter((f:any)=>f.required&&(ans[f.id]===undefined||ans[f.id]===''));
    if(miss.length>0){Alert.alert('Belum Lengkap',`${miss.length} field wajib belum diisi`);return;}
    setSub(true);
    try{
      await api.post(`/checklist-templates/${sel.id}/submit`,{assetId:sel.assetId??undefined,submittedBy:user?.id,
        items:all.map((f:any)=>{const v=ans[f.id];const i:any={id:f.id,label:f.label,type:f.type,required:f.required,result:resFr(f.type,v)};if(v!==undefined&&v!==''){if(f.type==='photo')i.notes=v;else i.value=v;}return i;})});
      Alert.alert('Berhasil','Checklist berhasil disimpan',[{text:'OK',onPress:()=>{setScr('list');setSel(null);setAns({});}}]);
    }catch(e:any){Alert.alert('Gagal',e?.response?.data?.error??'Gagal menyimpan');}
    finally{setSub(false);}
  };
  const renderField=(f:any)=>{
    const o=PF[f.type];
    if(o)return(<View style={s.br}>{o.map((opt:string)=><TouchableOpacity key={opt} style={[s.bb,ans[f.id]===opt&&s.bbA]} onPress={()=>setA(f.id,opt)}><Text style={[s.bbT,ans[f.id]===opt&&{color:'#fff'}]}>{opt}</Text></TouchableOpacity>)}</View>);
    if(f.type==='dropdown'||f.type==='select')return(<View style={s.or}>{(f.options??[]).map((o:string)=><TouchableOpacity key={o} style={[s.ob,ans[f.id]===o&&s.obA]} onPress={()=>setA(f.id,o)}><Text style={[s.obT,ans[f.id]===o&&{color:'#fff'}]}>{o}</Text></TouchableOpacity>)}</View>);
    if(f.type==='photo')return(<View><TouchableOpacity style={s.pb} onPress={async()=>{const r=await launchCamera({mediaType:'photo',quality:0.5});if(!r.didCancel&&r.assets?.[0]?.uri)setA(f.id,r.assets[0].uri);}}><Icon name="camera-outline" size={18} color={COLORS.primary}/><Text style={s.pbT}>{ans[f.id]?'Foto diambil ✓':'Ambil Foto'}</Text></TouchableOpacity>{ans[f.id]&&<Image source={{uri:ans[f.id]}} style={s.pp}/>}</View>);
    if(f.type==='number')return(<TextInput style={s.ti} placeholder="0" placeholderTextColor={COLORS.gray} keyboardType="numeric" value={ans[f.id]!==undefined?String(ans[f.id]):''} onChangeText={v=>setA(f.id,v)}/>);
    return(<TextInput style={s.ta} placeholder="Masukkan catatan..." placeholderTextColor={COLORS.gray} multiline value={ans[f.id]!==undefined?String(ans[f.id]):''} onChangeText={v=>setA(f.id,v)}/>);
  };
  if(scr==='fill'&&sel)return(
    <View style={s.c}>
      <StatusBar backgroundColor={COLORS.dark} barStyle="light-content"/>
      <AppHeader title={sel.name} subtitle={`${secs.length} seksi`}/>
      <ScrollView style={{flex:1}} contentContainerStyle={{paddingBottom:100}}>
        {secs.length===0?(<View style={s.empty}><Icon name="document-text-outline" size={48} color={COLORS.border}/><Text style={s.et}>Template belum punya field</Text></View>)
        :secs.map((sec:any)=>(
          <View key={sec.id} style={s.sec}>
            <Text style={s.secT}>{sec.title.toUpperCase()}</Text>
            {sec.fields.map((f:any)=>(
              <View key={f.id} style={s.fc}>
                <Text style={s.fl}>{f.label}{f.required&&<Text style={{color:COLORS.danger}}> *</Text>}</Text>
                {renderField(f)}
              </View>
            ))}
          </View>
        ))}
      </ScrollView>
      <View style={s.sw}>
        <TouchableOpacity style={s.sb} onPress={submit} disabled={sub}>
          {sub?<ActivityIndicator color="#fff"/>:(<><Icon name="checkmark-circle-outline" size={20} color="#fff"/><Text style={s.sbT}>SIMPAN CHECKLIST</Text></>)}
        </TouchableOpacity>
      </View>
    </View>
  );
  return(
    <View style={s.c}>
      <StatusBar backgroundColor={COLORS.dark} barStyle="light-content"/>
      <View style={s.hdr}><Text style={s.title}>CHECKLIST</Text><Text style={s.sub}>{tpls.length} template</Text></View>
      {loading?<ActivityIndicator color={COLORS.primary} style={{marginTop:56}}/>:
        <FlatList data={tpls} keyExtractor={i=>i.id} contentContainerStyle={{padding:16,gap:10}}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={()=>{setRefreshing(true);fetch();}} tintColor={COLORS.primary}/>}
          renderItem={({item})=>(
            <TouchableOpacity style={s.tc} onPress={()=>{setSel(item);setAns({});setScr('fill');}} activeOpacity={0.8}>
              <View style={[s.fb,{backgroundColor:FC[item.frequency]??COLORS.gray}]}/>
              <View style={s.ti2}>
                <Text style={s.tn}>{item.name}</Text>
                <Text style={s.tm}>{item.type} · {item.frequency} · {(item.items??[]).length} item</Text>
              </View>
              <Icon name="chevron-forward" size={18} color={COLORS.gray}/>
            </TouchableOpacity>
          )}
          ListEmptyComponent={<View style={s.empty}><Icon name="checkmark-done-outline" size={48} color={COLORS.border}/><Text style={s.et}>Tidak ada template</Text></View>}
        />
      }
    </View>
  );
}
const s=StyleSheet.create({
  c:{flex:1,backgroundColor:COLORS.bg},
  hdr:{backgroundColor:COLORS.dark,paddingHorizontal:20,paddingTop:52,paddingBottom:16},
  title:{color:'#fff',fontSize:16,fontWeight:'700',letterSpacing:1},sub:{color:COLORS.gray,fontSize:12,marginTop:2},
  empty:{flex:1,justifyContent:'center',alignItems:'center',gap:12,marginTop:80},et:{color:COLORS.gray,fontSize:14},
  tc:{backgroundColor:COLORS.surface,flexDirection:'row',alignItems:'center',borderRadius:8,elevation:1,overflow:'hidden'},
  fb:{width:4,alignSelf:'stretch'},ti2:{flex:1,padding:14},tn:{fontSize:14,fontWeight:'600',color:COLORS.textPrimary,marginBottom:4},tm:{fontSize:12,color:COLORS.gray},
  sec:{paddingHorizontal:16,marginTop:16},secT:{fontSize:11,fontWeight:'700',color:COLORS.gray,letterSpacing:1,marginBottom:8},
  fc:{backgroundColor:COLORS.surface,padding:14,marginBottom:8,borderRadius:8,elevation:1},fl:{fontSize:13,fontWeight:'600',color:COLORS.textPrimary,marginBottom:10},
  br:{flexDirection:'row',gap:10},bb:{flex:1,paddingVertical:10,alignItems:'center',borderWidth:1,borderColor:COLORS.border,borderRadius:6},bbA:{backgroundColor:COLORS.primary,borderColor:COLORS.primary},bbT:{fontSize:13,fontWeight:'700',color:COLORS.gray},
  or:{flexDirection:'row',flexWrap:'wrap',gap:8},ob:{paddingHorizontal:14,paddingVertical:8,borderWidth:1,borderColor:COLORS.border,borderRadius:6},obA:{backgroundColor:COLORS.primary,borderColor:COLORS.primary},obT:{fontSize:12,fontWeight:'600',color:COLORS.gray},
  ti:{borderWidth:1,borderColor:COLORS.border,padding:12,fontSize:14,color:COLORS.textPrimary,borderRadius:6},
  ta:{borderWidth:1,borderColor:COLORS.border,padding:12,fontSize:14,color:COLORS.textPrimary,minHeight:72,textAlignVertical:'top',borderRadius:6},
  pb:{flexDirection:'row',alignItems:'center',gap:8,borderWidth:1,borderColor:COLORS.primary,borderStyle:'dashed',paddingVertical:10,paddingHorizontal:12,justifyContent:'center',borderRadius:6},pbT:{fontSize:13,fontWeight:'600',color:COLORS.primary},pp:{width:'100%',height:140,marginTop:8,borderRadius:6},
  sw:{padding:16,backgroundColor:COLORS.surface,borderTopWidth:1,borderTopColor:COLORS.border},
  sb:{backgroundColor:COLORS.primary,flexDirection:'row',alignItems:'center',justifyContent:'center',gap:10,paddingVertical:16,borderRadius:8},sbT:{color:'#fff',fontSize:14,fontWeight:'700',letterSpacing:1},
});
