import React from 'react';
import {View,Text,TouchableOpacity,StyleSheet,StatusBar,Platform} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import {useNavigation} from '@react-navigation/native';
import {COLORS} from '../../constants';
interface Props{title:string;subtitle?:string;showBack?:boolean;rightComponent?:React.ReactNode;bg?:string;}
export default function AppHeader({title,subtitle,showBack=true,rightComponent,bg=COLORS.dark}:Props){
  const nav=useNavigation();
  const PT=Platform.OS==='android'?(StatusBar.currentHeight??0):0;
  return(
    <View style={[s.header,{backgroundColor:bg,paddingTop:PT+16}]}>
      <StatusBar backgroundColor={bg} barStyle="light-content"/>
      <View style={s.row}>
        {showBack?(
          <TouchableOpacity style={s.back} onPress={()=>nav.goBack()} hitSlop={{top:12,bottom:12,left:12,right:12}}>
            <Icon name="arrow-back" size={22} color="#fff"/>
          </TouchableOpacity>
        ):<View style={s.ph}/>}
        <View style={s.mid}>
          <Text style={s.title} numberOfLines={1}>{title}</Text>
          {subtitle?<Text style={s.sub} numberOfLines={1}>{subtitle}</Text>:null}
        </View>
        {rightComponent?<View style={s.right}>{rightComponent}</View>:<View style={s.ph}/>}
      </View>
    </View>
  );
}
const s=StyleSheet.create({
  header:{paddingBottom:16,paddingHorizontal:16},
  row:{flexDirection:'row',alignItems:'center',gap:12},
  back:{width:36,height:36,borderRadius:18,justifyContent:'center',alignItems:'center',backgroundColor:'rgba(255,255,255,0.1)'},
  ph:{width:36},mid:{flex:1},
  title:{color:'#fff',fontSize:16,fontWeight:'700',letterSpacing:0.5},
  sub:{color:COLORS.gray,fontSize:12,marginTop:2},
  right:{flexShrink:0},
});
