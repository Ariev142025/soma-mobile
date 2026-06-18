import React,{useState,useCallback} from 'react';
import{View,Text,StyleSheet,TouchableOpacity,ActivityIndicator,ScrollView,StatusBar}from 'react-native';
import{Camera,useCameraDevices,useCodeScanner}from 'react-native-vision-camera';
import Icon from 'react-native-vector-icons/Ionicons';
import{useNavigation}from '@react-navigation/native';
import{api}from '../../services/api.service';
import{COLORS}from '../../constants';
const UUID=/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/i;
export default function ScannerScreen(){
  const nav=useNavigation<any>();
  const devices=useCameraDevices();
  const device=devices.find(d=>d.position==='back');
  const[perm,setPerm]=useState<boolean|null>(null);
  const[scanned,setScanned]=useState(false);
  const[loading,setLoading]=useState(false);
  const[asset,setAsset]=useState<any>(null);
  const[err,setErr]=useState<string|null>(null);
  React.useEffect(()=>{Camera.requestCameraPermission().then(s=>setPerm(s==='granted'));},[]);
  const onScan=useCallback(async(val:string)=>{
    if(scanned||loading)return;
    const id=val.match(UUID)?.[0];
    if(!id){setScanned(true);setErr('QR tidak dikenali — bukan QR aset SOMA BMS');return;}
    setScanned(true);setLoading(true);setErr(null);
    try{const{data}=await api.get(`/assets/${id}/qr-data`);setAsset(data);}
    catch(e:any){setErr(e?.response?.status===404?'Aset tidak ditemukan':e?.response?.data?.error??'Gagal memuat aset');}
    finally{setLoading(false);}
  },[scanned,loading]);
  const scanner=useCodeScanner({codeTypes:['qr'],onCodeScanned:(c)=>{const v=c[0]?.value;if(v)onScan(v);}});
  const reset=()=>{setScanned(false);setAsset(null);setErr(null);};
  if(perm===null)return<ActivityIndicator color={COLORS.primary} style={{flex:1}}/>;
  if(!perm)return(
    <View style={s.c}><StatusBar backgroundColor={COLORS.dark} barStyle="light-content"/>
      <View style={s.hdr}><Text style={s.title}>SCAN QR CODE</Text></View>
      <View style={s.center}><Icon name="camera-outline" size={56} color={COLORS.gray}/>
        <Text style={s.pt}>Izin kamera diperlukan</Text>
        <TouchableOpacity style={s.pb} onPress={()=>Camera.requestCameraPermission().then(s=>setPerm(s==='granted'))}>
          <Text style={s.pbT}>Izinkan Kamera</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
  return(
    <View style={s.c}><StatusBar backgroundColor={COLORS.dark} barStyle="light-content"/>
      <View style={s.hdr}><Text style={s.title}>SCAN QR CODE</Text><Text style={s.sub}>Arahkan ke QR aset</Text></View>
      <View style={s.cam}>
        {!scanned&&device&&(<Camera style={StyleSheet.absoluteFill} device={device} isActive codeScanner={scanner}>
          <View style={s.ov}><View style={s.fr}>
            {(['TL','TR','BL','BR'] as const).map(p=><View key={p} style={[s.co,s[`co${p}`]]}/>)}
          </View><Text style={s.hint}>Posisikan QR di dalam kotak</Text></View>
        </Camera>)}
        {loading&&<View style={s.center}><ActivityIndicator color={COLORS.primary} size="large"/><Text style={s.lt}>Memuat data aset...</Text></View>}
        {err&&!loading&&<View style={s.center}><Icon name="close-circle" size={56} color={COLORS.danger}/><Text style={s.et}>{err}</Text>
          <TouchableOpacity style={s.rb} onPress={reset}><Icon name="refresh-outline" size={18} color="#fff"/><Text style={s.rbT}>Scan Lagi</Text></TouchableOpacity>
        </View>}
        {asset&&!loading&&(<ScrollView style={s.res} contentContainerStyle={{padding:16,paddingBottom:32}}>
          <View style={s.ac}>
            <View style={s.aH}><Icon name="checkmark-circle" size={22} color={COLORS.success}/><Text style={s.aN} numberOfLines={2}>{asset.name}</Text></View>
            {asset.code&&<Text style={s.am}>Kode: {asset.code}</Text>}
            {asset.category&&<Text style={s.am}>Kategori: {asset.category}</Text>}
            {(asset.location||asset.floor)&&<Text style={s.am}>Lokasi: {[asset.floor,asset.location].filter(Boolean).join(' · ')}</Text>}
          </View>
          <TouchableOpacity style={s.pb2} onPress={()=>nav.navigate('Tagging')}><Icon name="pricetag-outline" size={18} color="#fff"/><Text style={s.pbT2}>Buka Tagging Aset</Text></TouchableOpacity>
          <TouchableOpacity style={s.sb} onPress={reset}><Icon name="refresh-outline" size={18} color={COLORS.primary}/><Text style={s.sbT}>Scan Lagi</Text></TouchableOpacity>
        </ScrollView>)}
      </View>
    </View>
  );
}
const s=StyleSheet.create({
  c:{flex:1,backgroundColor:COLORS.dark},
  hdr:{paddingHorizontal:20,paddingTop:52,paddingBottom:16},
  title:{color:'#fff',fontSize:16,fontWeight:'700',letterSpacing:1},sub:{color:COLORS.gray,fontSize:12,marginTop:2},
  cam:{flex:1},ov:{flex:1,justifyContent:'center',alignItems:'center',gap:24},
  fr:{width:220,height:220,position:'relative'},
  co:{position:'absolute',width:28,height:28,borderColor:COLORS.primary,borderWidth:3},
  coTL:{top:0,left:0,borderRightWidth:0,borderBottomWidth:0},coTR:{top:0,right:0,borderLeftWidth:0,borderBottomWidth:0},
  coBL:{bottom:0,left:0,borderRightWidth:0,borderTopWidth:0},coBR:{bottom:0,right:0,borderLeftWidth:0,borderTopWidth:0},
  hint:{color:'#C6C6C6',fontSize:13,textAlign:'center'},
  center:{flex:1,justifyContent:'center',alignItems:'center',gap:16,padding:32},
  pt:{color:'#C6C6C6',fontSize:14,textAlign:'center'},
  pb:{backgroundColor:COLORS.primary,paddingHorizontal:24,paddingVertical:12,borderRadius:8},pbT:{color:'#fff',fontSize:14,fontWeight:'700'},
  lt:{color:'#fff',fontSize:15,fontWeight:'600'},et:{color:COLORS.danger,fontSize:15,fontWeight:'600',textAlign:'center'},
  rb:{backgroundColor:COLORS.primary,flexDirection:'row',alignItems:'center',gap:8,paddingHorizontal:24,paddingVertical:12,borderRadius:8,marginTop:8},rbT:{color:'#fff',fontSize:14,fontWeight:'700'},
  res:{flex:1,backgroundColor:COLORS.bg},
  ac:{backgroundColor:COLORS.surface,padding:16,borderRadius:8,gap:6,elevation:1,marginBottom:16},
  aH:{flexDirection:'row',alignItems:'center',gap:8,marginBottom:4},aN:{flex:1,fontSize:16,fontWeight:'700',color:COLORS.textPrimary},am:{fontSize:13,color:COLORS.gray},
  pb2:{backgroundColor:COLORS.primary,flexDirection:'row',alignItems:'center',justifyContent:'center',gap:8,paddingVertical:14,borderRadius:8,marginBottom:10},pbT2:{color:'#fff',fontSize:14,fontWeight:'700'},
  sb:{borderWidth:1,borderColor:COLORS.primary,flexDirection:'row',alignItems:'center',justifyContent:'center',gap:8,paddingVertical:14,borderRadius:8},sbT:{color:COLORS.primary,fontSize:14,fontWeight:'700'},
});
