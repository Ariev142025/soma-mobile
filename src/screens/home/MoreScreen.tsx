import React from 'react';
import{View,Text,StyleSheet,TouchableOpacity,ScrollView,StatusBar}from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import{useNavigation}from '@react-navigation/native';
import{useAuthStore}from '../../store/auth.store';
import{COLORS,ROLE_LABELS}from '../../constants';
const MENUS=[
  {icon:'checkmark-done-outline',label:'Checklist',route:'Checklist',color:COLORS.success},
  {icon:'pricetag-outline',label:'Tagging Aset',route:'Tagging',color:COLORS.primary},
  {icon:'cube-outline',label:'Material',route:'MaterialList',color:COLORS.warning},
  {icon:'calendar-outline',label:'Jadwal Periodik',route:'Schedule',color:COLORS.purple},
  {icon:'person-outline',label:'Profil',route:'Profile',color:COLORS.gray},
];
export default function MoreScreen(){
  const nav=useNavigation<any>();
  const{user}=useAuthStore();
  return(
    <ScrollView style={s.c}>
      <StatusBar backgroundColor={COLORS.dark} barStyle="light-content"/>
      <View style={s.hdr}>
        <View style={s.av}><Text style={s.avT}>{user?.name?.charAt(0)?.toUpperCase()}</Text></View>
        <View>
          <Text style={s.name}>{user?.name}</Text>
          <Text style={s.role}>{ROLE_LABELS[user?.role??'']??user?.role}</Text>
          <Text style={s.bldg}>{user?.buildingName}</Text>
        </View>
      </View>
      <View style={s.grid}>
        {MENUS.map(m=>(
          <TouchableOpacity key={m.route} style={s.item} onPress={()=>nav.navigate(m.route)} activeOpacity={0.75}>
            <View style={[s.ico,{backgroundColor:m.color+'22'}]}>
              <Icon name={m.icon} size={26} color={m.color}/>
            </View>
            <Text style={s.lbl}>{m.label}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </ScrollView>
  );
}
const s=StyleSheet.create({
  c:{flex:1,backgroundColor:COLORS.bg},
  hdr:{backgroundColor:COLORS.dark,flexDirection:'row',alignItems:'center',gap:14,paddingHorizontal:20,paddingTop:52,paddingBottom:20},
  av:{width:52,height:52,borderRadius:26,backgroundColor:COLORS.primary,justifyContent:'center',alignItems:'center'},
  avT:{color:'#fff',fontSize:20,fontWeight:'700'},
  name:{color:'#fff',fontSize:16,fontWeight:'700'},
  role:{color:COLORS.primary,fontSize:12,fontWeight:'600',marginTop:2},
  bldg:{color:COLORS.gray,fontSize:12,marginTop:2},
  grid:{flexDirection:'row',flexWrap:'wrap',padding:12,gap:12},
  item:{width:'47%',backgroundColor:COLORS.surface,borderRadius:12,padding:18,alignItems:'center',gap:10,elevation:1},
  ico:{width:52,height:52,borderRadius:14,justifyContent:'center',alignItems:'center'},
  lbl:{fontSize:13,fontWeight:'600',color:COLORS.textPrimary,textAlign:'center'},
});
