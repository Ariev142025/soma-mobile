import React,{useState} from 'react';
import{View,Text,TextInput,TouchableOpacity,StyleSheet,KeyboardAvoidingView,Platform,ActivityIndicator,Alert,StatusBar}from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import{useAuthStore}from '../../store/auth.store';
import{COLORS}from '../../constants';
export default function LoginScreen(){
  const{login}=useAuthStore();
  const[email,setEmail]=useState('');
  const[pass,setPass]=useState('');
  const[show,setShow]=useState(false);
  const[loading,setLoading]=useState(false);
  const handle=async()=>{
    if(!email.trim()||!pass.trim()){Alert.alert('Peringatan','Email dan password wajib diisi');return;}
    setLoading(true);
    try{await login(email.trim().toLowerCase(),pass);}
    catch(e:any){Alert.alert('Login Gagal',e?.response?.data?.error??'Periksa email dan password');}
    finally{setLoading(false);}
  };
  return(
    <KeyboardAvoidingView style={s.c} behavior={Platform.OS==='ios'?'padding':undefined}>
      <StatusBar backgroundColor={COLORS.dark} barStyle="light-content"/>
      <View style={s.brand}>
        <View style={s.logo}><Icon name="business" size={36} color={COLORS.primary}/></View>
        <Text style={s.appName}>SOMA BMS</Text>
        <Text style={s.appSub}>Building Management System</Text>
      </View>
      <View style={s.form}>
        <Text style={s.formTitle}>Masuk</Text>
        <View style={s.inp}>
          <Icon name="mail-outline" size={18} color={COLORS.gray} style={s.ico}/>
          <TextInput style={s.txt} placeholder="Email" placeholderTextColor={COLORS.gray}
            value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none"/>
        </View>
        <View style={s.inp}>
          <Icon name="lock-closed-outline" size={18} color={COLORS.gray} style={s.ico}/>
          <TextInput style={{flex:1,color:'#fff',fontSize:15}} placeholder="Password"
            placeholderTextColor={COLORS.gray} value={pass} onChangeText={setPass} secureTextEntry={!show}/>
          <TouchableOpacity onPress={()=>setShow(!show)} style={{padding:4}}>
            <Icon name={show?'eye-off-outline':'eye-outline'} size={18} color={COLORS.gray}/>
          </TouchableOpacity>
        </View>
        <TouchableOpacity style={[s.btn,loading&&{opacity:0.6}]} onPress={handle} disabled={loading} activeOpacity={0.85}>
          {loading?<ActivityIndicator color="#fff"/>:<Text style={s.btnTxt}>MASUK</Text>}
        </TouchableOpacity>
      </View>
      <Text style={s.footer}>v1.0.0 · somacontrols.com</Text>
    </KeyboardAvoidingView>
  );
}
const s=StyleSheet.create({
  c:{flex:1,backgroundColor:COLORS.dark,justifyContent:'center',paddingHorizontal:32},
  brand:{alignItems:'center',marginBottom:48},
  logo:{width:72,height:72,borderRadius:16,backgroundColor:'rgba(15,98,254,0.15)',justifyContent:'center',alignItems:'center',marginBottom:16},
  appName:{color:'#fff',fontSize:24,fontWeight:'700',letterSpacing:2},
  appSub:{color:COLORS.gray,fontSize:13,marginTop:4},
  form:{backgroundColor:'#1E1E1E',borderRadius:16,padding:24,gap:16},
  formTitle:{color:'#fff',fontSize:18,fontWeight:'700',marginBottom:4},
  inp:{flexDirection:'row',alignItems:'center',backgroundColor:'#2D2D2D',borderRadius:10,paddingHorizontal:14,height:52},
  ico:{marginRight:10},
  txt:{flex:1,color:'#fff',fontSize:15},
  btn:{backgroundColor:COLORS.primary,borderRadius:10,height:52,justifyContent:'center',alignItems:'center',marginTop:8},
  btnTxt:{color:'#fff',fontSize:15,fontWeight:'700',letterSpacing:1},
  footer:{color:COLORS.gray,fontSize:12,textAlign:'center',marginTop:32},
});
