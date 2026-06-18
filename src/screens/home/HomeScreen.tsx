import React,{useEffect,useState,useCallback} from 'react';
import{View,Text,StyleSheet,ScrollView,TouchableOpacity,RefreshControl,ActivityIndicator,StatusBar}from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import{useNavigation}from '@react-navigation/native';
import{useAuthStore}from '../../store/auth.store';
import{api}from '../../services/api.service';
import{COLORS,ROLE_LABELS}from '../../constants';
import{MyDayData}from '../../types';
export default function HomeScreen(){
  const{user}=useAuthStore();
  const nav=useNavigation<any>();
  const[data,setData]=useState<MyDayData|null>(null);
  const[loading,setLoading]=useState(true);
  const[refreshing,setRefreshing]=useState(false);
  const fetch=useCallback(async()=>{
    try{const r=await api.get('/my-day');setData(r.data);}
    catch{setData(null);}
    finally{setLoading(false);setRefreshing(false);}
  },[]);
  useEffect(()=>{fetch();},[fetch]);
  const now=new Date();
  const time=now.toLocaleTimeString('id-ID',{hour:'2-digit',minute:'2-digit'});
  const date=now.toLocaleDateString('id-ID',{weekday:'long',day:'numeric',month:'long',year:'numeric'});
  return(
    <ScrollView style={s.c} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={()=>{setRefreshing(true);fetch();}} tintColor={COLORS.primary}/>}>
      <StatusBar backgroundColor={COLORS.dark} barStyle="light-content"/>
      <View style={s.hdr}>
        <View style={s.hdrL}>
          <View style={s.av}><Text style={s.avT}>{user?.name?.charAt(0)?.toUpperCase()}</Text></View>
          <View>
            <Text style={s.greet}>Selamat datang,</Text>
            <Text style={s.name}>{user?.name}</Text>
            <Text style={s.role}>{ROLE_LABELS[user?.role??'']??user?.role}</Text>
          </View>
        </View>
        <Text style={s.time}>{time}</Text>
      </View>
      <View style={s.bar}>
        <Icon name="business-outline" size={13} color={COLORS.primary}/>
        <Text style={s.bldg}>{user?.buildingName??'Building'}</Text>
        {data?.shift?(<><Text style={s.dot}>·</Text><Text style={s.shift}>{data.shift.name} ({data.shift.startTime}–{data.shift.endTime})</Text></>)
        :!loading?(<><Text style={s.dot}>·</Text><Text style={s.noShift}>Belum ada jadwal shift</Text></>):null}
      </View>
      {loading?<ActivityIndicator color={COLORS.primary} style={{marginTop:56}}/>:(<>
        <View style={s.cards}>
          <TouchableOpacity style={[s.card,{borderTopColor:COLORS.primary}]} onPress={()=>nav.navigate('Tasks')} activeOpacity={0.8}>
            <Icon name="clipboard-outline" size={24} color={COLORS.primary}/>
            <Text style={s.cardN}>{data?.workOrders.total??0}</Text>
            <Text style={s.cardL}>{'Work Order\nAktif'}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[s.card,{borderTopColor:(data?.checklists.pending??0)>0?COLORS.danger:COLORS.success}]} onPress={()=>nav.navigate('Checklist')} activeOpacity={0.8}>
            <Icon name="checkmark-circle-outline" size={24} color={(data?.checklists.pending??0)>0?COLORS.danger:COLORS.success}/>
            <Text style={[s.cardN,{color:(data?.checklists.pending??0)>0?COLORS.danger:COLORS.textPrimary}]}>{data?.checklists.pending??0}</Text>
            <Text style={s.cardL}>{'Checklist\nPending'}</Text>
          </TouchableOpacity>
        </View>
        {(data?.periodicSchedules.overdue??0)>0&&(
          <View style={s.alert}>
            <Icon name="warning-outline" size={15} color={COLORS.warning}/>
            <Text style={s.alertT}>{data!.periodicSchedules.overdue} jadwal periodik melewati batas waktu</Text>
          </View>
        )}
        <View style={s.sec}>
          <Text style={s.secL}>STATUS ABSENSI HARI INI</Text>
          <View style={s.attCard}>
            <View style={s.attItem}>
              <Icon name="log-in-outline" size={20} color={COLORS.success}/>
              <Text style={s.attLbl}>Check In</Text>
              <Text style={[s.attT,{color:data?.attendance.hasCheckedIn?COLORS.success:COLORS.textPrimary}]}>{data?.attendance.checkIn??'—'}</Text>
              {data?.attendance.hasCheckedIn&&data?.attendance.isValidLocation===false&&(
                <View style={s.locBadge}><Icon name="warning" size={10} color={COLORS.danger}/><Text style={s.locT}>Di luar area</Text></View>
              )}
            </View>
            <View style={s.div}/>
            <View style={s.attItem}>
              <Icon name="log-out-outline" size={20} color={COLORS.danger}/>
              <Text style={s.attLbl}>Check Out</Text>
              <Text style={[s.attT,{color:data?.attendance.hasCheckedOut?COLORS.danger:COLORS.textPrimary}]}>{data?.attendance.checkOut??'—'}</Text>
            </View>
          </View>
        </View>
        {(data?.checklists.items.length??0)>0&&(
          <View style={s.sec}>
            <Text style={s.secL}>CHECKLIST HARI INI</Text>
            <View style={s.listCard}>
              {data!.checklists.items.map((c,i)=>(
                <TouchableOpacity key={c.id} style={[s.row,i>0&&s.rowDiv]} onPress={()=>nav.navigate('Checklist')} activeOpacity={0.7}>
                  <View style={[s.dot2,{backgroundColor:c.isDone?COLORS.success:COLORS.danger}]}/>
                  <Text style={s.rowN} numberOfLines={1}>{c.name}</Text>
                  <View style={[s.badge,{backgroundColor:c.isDone?'#DEFBE6':'#FFF1F1'}]}>
                    <Text style={[s.badgeT,{color:c.isDone?COLORS.success:COLORS.danger}]}>{c.isDone?'Selesai':'Pending'}</Text>
                  </View>
                  <Icon name="chevron-forward" size={13} color={COLORS.gray}/>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}
        {(data?.workOrders.items.length??0)>0&&(
          <View style={s.sec}>
            <Text style={s.secL}>WORK ORDER AKTIF</Text>
            <View style={s.listCard}>
              {data!.workOrders.items.slice(0,3).map((w,i)=>(
                <TouchableOpacity key={w.id} style={[s.row,i>0&&s.rowDiv]} onPress={()=>nav.navigate('Tasks')} activeOpacity={0.7}>
                  <View style={[s.dot2,{backgroundColor:w.priority==='urgent'?COLORS.danger:w.priority==='high'?COLORS.warning:COLORS.primary}]}/>
                  <Text style={s.rowN} numberOfLines={1}>{w.title}</Text>
                  <View style={[s.badge,{backgroundColor:'#E0F2FE'}]}>
                    <Text style={[s.badgeT,{color:'#0369A1'}]}>{w.priority?.toUpperCase()}</Text>
                  </View>
                  <Icon name="chevron-forward" size={13} color={COLORS.gray}/>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}
        <View style={s.dateCard}>
          <Icon name="calendar-outline" size={15} color={COLORS.gray}/>
          <Text style={s.dateT}>{date}</Text>
        </View>
      </>)}
    </ScrollView>
  );
}
const s=StyleSheet.create({
  c:{flex:1,backgroundColor:COLORS.bg},
  hdr:{backgroundColor:COLORS.dark,flexDirection:'row',alignItems:'center',justifyContent:'space-between',paddingHorizontal:20,paddingTop:52,paddingBottom:20},
  hdrL:{flexDirection:'row',alignItems:'center',gap:12},
  av:{width:44,height:44,borderRadius:22,backgroundColor:COLORS.primary,justifyContent:'center',alignItems:'center'},
  avT:{color:'#fff',fontSize:18,fontWeight:'700'},
  greet:{color:COLORS.gray,fontSize:12},name:{color:'#fff',fontSize:16,fontWeight:'700'},
  role:{color:COLORS.primary,fontSize:11,fontWeight:'600',letterSpacing:0.5},
  time:{color:COLORS.gray,fontSize:13,fontWeight:'600'},
  bar:{backgroundColor:COLORS.dark2,flexDirection:'row',alignItems:'center',paddingHorizontal:20,paddingVertical:10,gap:6,flexWrap:'wrap'},
  bldg:{color:'#C6C6C6',fontSize:12,fontWeight:'600'},dot:{color:'#393939'},
  shift:{color:COLORS.success,fontSize:12,fontWeight:'600'},noShift:{color:COLORS.gray,fontSize:12},
  cards:{flexDirection:'row',gap:12,padding:16},
  card:{flex:1,backgroundColor:COLORS.surface,padding:16,alignItems:'center',borderTopWidth:3,borderRadius:4,elevation:2,gap:6},
  cardN:{fontSize:28,fontWeight:'700',color:COLORS.textPrimary},
  cardL:{fontSize:12,color:COLORS.gray,textAlign:'center'},
  alert:{flexDirection:'row',alignItems:'center',gap:8,marginHorizontal:16,marginBottom:8,padding:10,backgroundColor:'#FFF4E6',borderLeftWidth:3,borderLeftColor:COLORS.warning,borderRadius:4},
  alertT:{fontSize:12,color:COLORS.warning,fontWeight:'600',flex:1},
  sec:{paddingHorizontal:16,marginBottom:12},
  secL:{fontSize:11,fontWeight:'700',color:COLORS.gray,letterSpacing:1,marginBottom:8},
  attCard:{backgroundColor:COLORS.surface,padding:16,flexDirection:'row',alignItems:'center',borderRadius:4,elevation:1},
  attItem:{flex:1,alignItems:'center',gap:4},
  div:{width:1,height:48,backgroundColor:COLORS.border},
  attLbl:{fontSize:12,color:COLORS.gray},attT:{fontSize:16,fontWeight:'700'},
  locBadge:{flexDirection:'row',alignItems:'center',gap:3,backgroundColor:'#FFF1F1',paddingHorizontal:6,paddingVertical:2,borderRadius:4},
  locT:{fontSize:10,color:COLORS.danger,fontWeight:'600'},
  listCard:{backgroundColor:COLORS.surface,borderRadius:4,elevation:1},
  row:{flexDirection:'row',alignItems:'center',gap:10,paddingHorizontal:14,paddingVertical:12},
  rowDiv:{borderTopWidth:1,borderTopColor:COLORS.border},
  dot2:{width:8,height:8,borderRadius:4},
  rowN:{flex:1,fontSize:13,color:COLORS.textPrimary,fontWeight:'500'},
  badge:{paddingHorizontal:8,paddingVertical:3,borderRadius:4},badgeT:{fontSize:10,fontWeight:'700'},
  dateCard:{flexDirection:'row',alignItems:'center',gap:8,marginHorizontal:16,marginBottom:28,backgroundColor:COLORS.surface,padding:12,borderRadius:4,elevation:1},
  dateT:{color:COLORS.gray,fontSize:13},textPrimary:{color:COLORS.textPrimary},
});
