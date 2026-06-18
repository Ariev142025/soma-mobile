import React,{useState,useEffect,useCallback} from 'react';
import{View,Text,StyleSheet,FlatList,TouchableOpacity,TextInput,ActivityIndicator,RefreshControl,StatusBar,Alert,ScrollView}from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import{useNavigation}from '@react-navigation/native';
import{useAuthStore}from '../../store/auth.store';
import{api}from '../../services/api.service';
import{COLORS}from '../../constants';
import{MaterialItem}from '../../types';
import AppHeader from '../../components/common/AppHeader';
export function MaterialListScreen(){
  const{user}=useAuthStore();const nav=useNavigation<any>();
  const[items,setItems]=useState<MaterialItem[]>([]);const[filtered,setFiltered]=useState<MaterialItem[]>([]);
  const[loading,setLoading]=useState(true);const[refreshing,setRefreshing]=useState(false);const[search,setSearch]=useState('');
  const fetch=useCallback(async()=>{
    try{const{data}=await api.get('/inventory',{params:{buildingId:user?.buildingId}});setItems(data??[]);setFiltered(data??[]);}
    catch{setItems([]);}finally{setLoading(false);setRefreshing(false);}
  },[user]);
  useEffect(()=>{fetch();},[fetch]);
  useEffect(()=>{
    if(!search.trim()){setFiltered(items);return;}
    setFiltered(items.filter(i=>i.name.toLowerCase().includes(search.toLowerCase())||i.category.toLowerCase().includes(search.toLowerCase())));
  },[search,items]);
  const low=(i:MaterialItem)=>i.quantity<=i.minStock;
  return(
    <View style={s.c}>
      <StatusBar backgroundColor={COLORS.dark} barStyle="light-content"/>
      <AppHeader title="MATERIAL & INVENTORY" subtitle={`${filtered.length} item`}
        rightComponent={<TouchableOpacity style={s.rb} onPress={()=>nav.navigate('MaterialRequest')}><Icon name="add" size={16} color="#fff"/><Text style={s.rbT}>Request</Text></TouchableOpacity>}/>
      <View style={s.bar}><Icon name="search-outline" size={16} color={COLORS.gray}/>
        <TextInput style={s.inp} placeholder="Cari material..." placeholderTextColor={COLORS.gray} value={search} onChangeText={setSearch}/>
      </View>
      {loading?<ActivityIndicator color={COLORS.primary} style={{marginTop:56}}/>:(
        <FlatList data={filtered} keyExtractor={i=>i.id}
          renderItem={({item:i})=>(
            <View style={[s.card,low(i)&&s.cardL]}>
              <View style={s.body}>
                <View style={s.ch}><Text style={s.nm} numberOfLines={1}>{i.name}</Text>
                  {low(i)&&<View style={s.lb}><Icon name="warning-outline" size={10} color={COLORS.danger}/><Text style={s.lt}>Stok Rendah</Text></View>}
                </View>
                <Text style={s.cat}>{i.category}</Text>
                {i.location&&<View style={{flexDirection:'row',alignItems:'center',gap:4}}><Icon name="location-outline" size={11} color={COLORS.gray}/><Text style={s.mt}>{i.location}</Text></View>}
              </View>
              <View style={s.sw}><Text style={[s.sn,{color:low(i)?COLORS.danger:COLORS.textPrimary}]}>{i.quantity}</Text><Text style={s.su}>{i.unit}</Text><Text style={s.sm}>min: {i.minStock}</Text></View>
            </View>
          )}
          contentContainerStyle={{padding:16,gap:10}}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={()=>{setRefreshing(true);fetch();}} tintColor={COLORS.primary}/>}
          ListEmptyComponent={<View style={s.empty}><Icon name="cube-outline" size={48} color={COLORS.border}/><Text style={{color:COLORS.gray,fontSize:14}}>Tidak ada material</Text></View>}
        />
      )}
    </View>
  );
}
interface RI{itemId:string;itemName:string;unit:string;quantity:number;}
export function MaterialRequestScreen(){
  const{user}=useAuthStore();const nav=useNavigation<any>();
  const[inv,setInv]=useState<MaterialItem[]>([]);const[loading,setLoading]=useState(true);const[sub,setSub]=useState(false);
  const[ri,setRi]=useState<RI[]>([]);const[notes,setNotes]=useState('');const[prio,setPrio]=useState('medium');const[search,setSearch]=useState('');
  useEffect(()=>{api.get('/inventory',{params:{buildingId:user?.buildingId}}).then(({data})=>setInv(data??[])).catch(()=>setInv([])).finally(()=>setLoading(false));},[user]);
  const fi=inv.filter(i=>!search.trim()||i.name.toLowerCase().includes(search.toLowerCase())||i.category.toLowerCase().includes(search.toLowerCase()));
  const add=(i:MaterialItem)=>{if(ri.find(r=>r.itemId===i.id))return;setRi(p=>[...p,{itemId:i.id,itemName:i.name,unit:i.unit,quantity:1}]);};
  const rm=(id:string)=>setRi(p=>p.filter(r=>r.itemId!==id));
  const qty=(id:string,q:number)=>{if(q<1)return;setRi(p=>p.map(r=>r.itemId===id?{...r,quantity:q}:r));};
  const submit=async()=>{
    if(!ri.length){Alert.alert('Peringatan','Tambahkan minimal 1 item');return;}
    setSub(true);
    try{
      await api.post('/material-requests',{buildingId:user?.buildingId,requestedBy:user?.id,priority:prio,notes,
        items:ri.map(r=>({inventoryItemId:r.itemId,itemName:r.itemName,unit:r.unit,quantityRequested:r.quantity}))});
      Alert.alert('Berhasil','Request berhasil dibuat',[{text:'OK',onPress:()=>nav.goBack()}]);
    }catch(e:any){Alert.alert('Gagal',e?.response?.data?.error??'Gagal membuat request');}
    finally{setSub(false);}
  };
  const PC:Record<string,string>={low:COLORS.gray,medium:COLORS.primary,high:COLORS.warning,urgent:COLORS.danger};
  return(
    <View style={s.c}>
      <StatusBar backgroundColor={COLORS.dark} barStyle="light-content"/>
      <AppHeader title="MATERIAL REQUEST" subtitle={`${ri.length} item dipilih`}/>
      <ScrollView contentContainerStyle={{paddingBottom:100}}>
        <View style={s.sec}><Text style={s.sl}>PRIORITAS</Text>
          <View style={{flexDirection:'row',gap:8}}>
            {['low','medium','high','urgent'].map(p=>(
              <TouchableOpacity key={p} style={[s.pb2,prio===p&&{backgroundColor:PC[p],borderColor:PC[p]}]} onPress={()=>setPrio(p)}>
                <Text style={[s.pbt,prio===p&&{color:'#fff'}]}>{p.toUpperCase()}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
        {ri.length>0&&(<View style={s.sec}><Text style={s.sl}>ITEM DIPILIH</Text>
          <View style={{backgroundColor:COLORS.surface,borderRadius:8,elevation:1}}>
            {ri.map((item,i)=>(<View key={item.itemId}>
              {i>0&&<View style={{height:1,backgroundColor:COLORS.border,marginHorizontal:14}}/>}
              <View style={{flexDirection:'row',alignItems:'center',paddingHorizontal:14,paddingVertical:12,gap:8}}>
                <Text style={{flex:1,fontSize:13,fontWeight:'600',color:COLORS.textPrimary}} numberOfLines={1}>{item.itemName}</Text>
                <TouchableOpacity style={s.qb} onPress={()=>qty(item.itemId,item.quantity-1)}><Icon name="remove" size={14} color={COLORS.textPrimary}/></TouchableOpacity>
                <Text style={s.qn}>{item.quantity}</Text>
                <TouchableOpacity style={s.qb} onPress={()=>qty(item.itemId,item.quantity+1)}><Icon name="add" size={14} color={COLORS.textPrimary}/></TouchableOpacity>
                <Text style={{fontSize:11,color:COLORS.gray}}>{item.unit}</Text>
                <TouchableOpacity onPress={()=>rm(item.itemId)}><Icon name="trash-outline" size={16} color={COLORS.danger}/></TouchableOpacity>
              </View>
            </View>))}
          </View>
        </View>)}
        <View style={s.sec}><Text style={s.sl}>CATATAN</Text>
          <TextInput style={s.ni} placeholder="Keterangan..." placeholderTextColor={COLORS.gray} value={notes} onChangeText={setNotes} multiline numberOfLines={3}/>
        </View>
        <View style={s.sec}><Text style={s.sl}>PILIH DARI INVENTORY</Text>
          <View style={s.bar}><Icon name="search-outline" size={14} color={COLORS.gray}/>
            <TextInput style={s.inp} placeholder="Cari..." placeholderTextColor={COLORS.gray} value={search} onChangeText={setSearch}/>
          </View>
          {loading?<ActivityIndicator color={COLORS.primary} style={{marginTop:16}}/>:fi.map(item=>{
            const added=!!ri.find(r=>r.itemId===item.id);
            return(<TouchableOpacity key={item.id} style={[s.ii,added&&{backgroundColor:'#DEFBE6'}]} onPress={()=>add(item)} disabled={added}>
              <View style={{flex:1}}><Text style={s.in} numberOfLines={1}>{item.name}</Text><Text style={{fontSize:12,color:COLORS.gray,marginTop:2}}>{item.category} · {item.quantity} {item.unit}</Text></View>
              <Icon name={added?'checkmark-circle':'add-circle-outline'} size={22} color={added?COLORS.success:COLORS.primary}/>
            </TouchableOpacity>);
          })}
        </View>
      </ScrollView>
      <View style={s.sw2}>
        <TouchableOpacity style={s.sbb} onPress={submit} disabled={sub}>
          {sub?<ActivityIndicator color="#fff"/>:(<><Icon name="send-outline" size={18} color="#fff"/><Text style={s.sbT}>KIRIM REQUEST</Text></>)}
        </TouchableOpacity>
      </View>
    </View>
  );
}
const s=StyleSheet.create({
  c:{flex:1,backgroundColor:COLORS.bg},
  bar:{flexDirection:'row',alignItems:'center',gap:10,backgroundColor:COLORS.surface,marginHorizontal:16,marginTop:12,paddingHorizontal:14,paddingVertical:10,borderRadius:8,elevation:1},
  inp:{flex:1,fontSize:14,color:COLORS.textPrimary},
  rb:{flexDirection:'row',alignItems:'center',gap:4,backgroundColor:COLORS.primary,paddingHorizontal:12,paddingVertical:6,borderRadius:6},rbT:{color:'#fff',fontSize:12,fontWeight:'700'},
  card:{backgroundColor:COLORS.surface,flexDirection:'row',alignItems:'center',borderRadius:8,elevation:1},cardL:{borderLeftWidth:3,borderLeftColor:COLORS.danger},
  body:{flex:1,padding:14,gap:4},ch:{flexDirection:'row',alignItems:'center',gap:8},nm:{flex:1,fontSize:14,fontWeight:'600',color:COLORS.textPrimary},
  lb:{flexDirection:'row',alignItems:'center',gap:3,backgroundColor:'#FFF1F1',paddingHorizontal:6,paddingVertical:2,borderRadius:4},lt:{fontSize:10,fontWeight:'700',color:COLORS.danger},
  cat:{fontSize:12,color:COLORS.gray},mt:{fontSize:12,color:COLORS.gray},
  sw:{paddingHorizontal:16,alignItems:'center'},sn:{fontSize:22,fontWeight:'700'},su:{fontSize:11,color:COLORS.gray},sm:{fontSize:10,color:COLORS.gray,marginTop:2},
  empty:{flex:1,justifyContent:'center',alignItems:'center',gap:12,marginTop:80},
  sec:{paddingHorizontal:16,marginTop:16},sl:{fontSize:11,fontWeight:'700',color:COLORS.gray,letterSpacing:1,marginBottom:8},
  pb2:{flex:1,paddingVertical:8,alignItems:'center',borderWidth:1,borderColor:COLORS.border,backgroundColor:COLORS.surface,borderRadius:6},pbt:{fontSize:11,fontWeight:'700',color:COLORS.gray},
  qb:{width:26,height:26,backgroundColor:COLORS.bg,justifyContent:'center',alignItems:'center',borderRadius:6},qn:{fontSize:14,fontWeight:'700',color:COLORS.textPrimary,minWidth:24,textAlign:'center'},
  ni:{backgroundColor:COLORS.surface,borderWidth:1,borderColor:COLORS.border,padding:12,fontSize:14,color:COLORS.textPrimary,textAlignVertical:'top',minHeight:80,borderRadius:8},
  ii:{backgroundColor:COLORS.surface,flexDirection:'row',alignItems:'center',paddingHorizontal:14,paddingVertical:12,marginBottom:6,borderRadius:8,elevation:1},
  in:{fontSize:13,fontWeight:'600',color:COLORS.textPrimary},
  sw2:{padding:16,backgroundColor:COLORS.surface,borderTopWidth:1,borderTopColor:COLORS.border},
  sbb:{backgroundColor:COLORS.primary,flexDirection:'row',alignItems:'center',justifyContent:'center',gap:10,paddingVertical:16,borderRadius:8},sbT:{color:'#fff',fontSize:14,fontWeight:'700',letterSpacing:1},
});
