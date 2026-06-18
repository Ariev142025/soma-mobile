import React,{useState} from 'react';
import{View,Text,StyleSheet,ScrollView,TouchableOpacity,TextInput,Alert,ActivityIndicator,StatusBar}from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import{useAuthStore}from '../../store/auth.store';
import{api}from '../../services/api.service';
import{COLORS,ROLE_LABELS}from '../../constants';
import AppHeader from '../../components/common/AppHeader';
export default function ProfileScreen(){
  const{user,logout,updateUser}=useAuthStore();
  const[phone,setPhone]=useState(user?.phone??'');
  const[op,setOp]=useState('');const[np,setNp]=useState('');
  const[saving,setSaving]=useState(false);const[changing,setChanging]=useState(false);
  const save=async()=>{
    if(!phone.trim())return;setSaving(true);
    try{await api.patch(`/users/${user?.id}`,{phone:phone.trim()});updateUser({phone:phone.trim()});Alert.alert('Berhasil','Nomor telepon diperbarui');}
    catch{Alert.alert('Gagal','Gagal menyimpan');}finally{setSaving(false);}
  };
  const chPass=async()=>{
    if(!op||!np){Alert.alert('Peringatan','Password lama dan baru wajib diisi');return;}
    if(np.length<6){Alert.alert('Peringatan','Password baru minimal 6 karakter');return;}
    setChanging(true);
    try{await api.post('/users/change-password',{userId:user?.id,oldPassword:op,newPassword:np});setOp('');setNp('');Alert.alert('Berhasil','Password berhasil diubah');}
    catch(e:any){Alert.alert('Gagal',e?.response?.data?.error??'Gagal mengubah password');}
    finally{setChanging(false);}
  };
  const handleLogout=()=>Alert.alert('Konfirmasi','Yakin ingin keluar?',[{text:'Batal',style:'cancel'},{text:'Keluar',style:'destructive',onPress:logout}]);
  return(
    <View style={s.c}>
      <StatusBar backgroundColor={COLORS.dark} barStyle="light-content"/>
      <AppHeader title="PROFIL" subtitle="Pengaturan akun"/>
      <ScrollView contentContainerStyle={s.scroll}>
        <View style={s.avSec}>
          <View style={s.av}><Text style={s.avT}>{user?.name?.charAt(0)?.toUpperCase()}</Text></View>
          <Text style={s.nm}>{user?.name}</Text>
          <Text style={s.role}>{ROLE_LABELS[user?.role??'']??user?.role}</Text>
          <Text style={s.bldg}>{user?.buildingName}</Text>
        </View>
        <View style={s.card}>
          <Text style={s.ct}>INFORMASI AKUN</Text>
          <View style={s.ir}><Icon name="mail-outline" size={16} color={COLORS.gray}/><Text style={s.it}>{user?.email}</Text></View>
          <View style={s.ir}><Icon name="business-outline" size={16} color={COLORS.gray}/><Text style={s.it}>{user?.buildingName}</Text></View>
        </View>
        <View style={s.card}>
          <Text style={s.ct}>NOMOR TELEPON</Text>
          <TextInput style={s.inp} value={phone} onChangeText={setPhone} placeholder="081234567890" placeholderTextColor={COLORS.gray} keyboardType="phone-pad"/>
          <TouchableOpacity style={[s.sb,saving&&{opacity:0.6}]} onPress={save} disabled={saving}>
            {saving?<ActivityIndicator color="#fff" size="small"/>:<Text style={s.sbT}>Simpan</Text>}
          </TouchableOpacity>
        </View>
        <View style={s.card}>
          <Text style={s.ct}>GANTI PASSWORD</Text>
          <TextInput style={s.inp} value={op} onChangeText={setOp} placeholder="Password lama" placeholderTextColor={COLORS.gray} secureTextEntry/>
          <TextInput style={[s.inp,{marginTop:8}]} value={np} onChangeText={setNp} placeholder="Password baru (min. 6 karakter)" placeholderTextColor={COLORS.gray} secureTextEntry/>
          <TouchableOpacity style={[s.sb,changing&&{opacity:0.6}]} onPress={chPass} disabled={changing}>
            {changing?<ActivityIndicator color="#fff" size="small"/>:<Text style={s.sbT}>Ganti Password</Text>}
          </TouchableOpacity>
        </View>
        <TouchableOpacity style={s.lb} onPress={handleLogout}>
          <Icon name="log-out-outline" size={18} color={COLORS.danger}/><Text style={s.lt}>Keluar</Text>
        </TouchableOpacity>
        <Text style={s.ver}>SOMA BMS Mobile v1.0.0</Text>
      </ScrollView>
    </View>
  );
}
const s=StyleSheet.create({
  c:{flex:1,backgroundColor:COLORS.bg},scroll:{padding:16,paddingBottom:40},
  avSec:{alignItems:'center',marginBottom:20},
  av:{width:72,height:72,borderRadius:36,backgroundColor:COLORS.primary,justifyContent:'center',alignItems:'center',marginBottom:12},
  avT:{color:'#fff',fontSize:28,fontWeight:'700'},nm:{fontSize:18,fontWeight:'700',color:COLORS.textPrimary},
  role:{fontSize:13,color:COLORS.primary,fontWeight:'600',marginTop:2},bldg:{fontSize:12,color:COLORS.gray,marginTop:2},
  card:{backgroundColor:COLORS.surface,borderRadius:8,padding:16,marginBottom:12,elevation:1},
  ct:{fontSize:11,fontWeight:'700',color:COLORS.gray,letterSpacing:1,marginBottom:12},
  ir:{flexDirection:'row',alignItems:'center',gap:10,marginBottom:8},it:{fontSize:14,color:COLORS.textPrimary},
  inp:{borderWidth:1,borderColor:COLORS.border,borderRadius:8,padding:12,fontSize:14,color:COLORS.textPrimary},
  sb:{backgroundColor:COLORS.primary,borderRadius:8,paddingVertical:12,alignItems:'center',marginTop:12},sbT:{color:'#fff',fontSize:14,fontWeight:'700'},
  lb:{flexDirection:'row',alignItems:'center',justifyContent:'center',gap:8,padding:14,borderRadius:8,borderWidth:1,borderColor:COLORS.danger+'50',marginTop:8},lt:{color:COLORS.danger,fontSize:14,fontWeight:'700'},
  ver:{textAlign:'center',color:COLORS.gray,fontSize:12,marginTop:20},
});
