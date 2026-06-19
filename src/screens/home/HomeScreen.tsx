import React,{useEffect,useState,useCallback,useRef}from 'react';
import Geolocation from 'react-native-geolocation-service';
import{View,Text,StyleSheet,ScrollView,TouchableOpacity,RefreshControl,ActivityIndicator,StatusBar,Alert}from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import{useNavigation}from '@react-navigation/native';
import{useAuthStore}from '../../store/auth.store';
import{api}from '../../services/api.service';
import{COLORS,ROLE_LABELS,PRIORITY_COLORS}from '../../constants';
import{MyDayData}from '../../types';

const QUICK_ACTIONS=[
  {icon:'clipboard-outline',     label:'Tugas',         route:'Tasks',          color:COLORS.primary,  bg:'#E8F0FE'},
  {icon:'qr-code-outline',       label:'Scan QR',       route:'Scanner',        color:'#6929C4',       bg:'#F3E8FF'},
  {icon:'checkmark-done-outline',label:'Checklist',     route:'Checklist',      color:COLORS.success,  bg:'#DEFBE6'},
  {icon:'cube-outline',          label:'Material',      route:'MaterialList',   color:COLORS.warning,  bg:'#FFF4E6'},
  {icon:'pricetag-outline',      label:'Tagging Aset',  route:'Tagging',        color:COLORS.primary,  bg:'#E8F0FE'},
  {icon:'calendar-outline',      label:'Jadwal',        route:'Schedule',       color:'#6929C4',       bg:'#F3E8FF'},
];

export default function HomeScreen(){
  const{user,token}=useAuthStore();
  const nav=useNavigation<any>();
  const[data,setData]=useState<MyDayData|null>(null);
  const[loading,setLoading]=useState(true);
  const[refreshing,setRefreshing]=useState(false);
  const[clockLoading,setClockLoading]=useState(false);
  const[now,setNow]=useState(new Date());
  const timerRef=useRef<any>(null);

  // Jam real-time
  useEffect(()=>{
    timerRef.current=setInterval(()=>setNow(new Date()),1000);
    return()=>clearInterval(timerRef.current);
  },[]);

  const fetchMyDay=useCallback(async()=>{
    try{const r=await api.get('/my-day');setData(r.data);}
    catch{setData(null);}
    finally{setLoading(false);setRefreshing(false);}
  },[]);

  useEffect(()=>{fetchMyDay();},[fetchMyDay]);

  const handleClock=useCallback(async(type:'check_in'|'check_out')=>{
    setClockLoading(true);
    try{
      Geolocation.getCurrentPosition(
        async(pos:any)=>{
          try{
            const endpoint=type==='check_in'?'/attendance/checkin':'/attendance/checkout';
            const r=await api.post(endpoint,{
              buildingId:user?.buildingId,
              latitude:pos.coords.latitude,
              longitude:pos.coords.longitude,
            });
            if(r.status===200||r.status===201){
              await fetchMyDay();
            }else{
              Alert.alert('Gagal',r.data?.error??'Gagal absen');
            }
          }catch(e:any){Alert.alert('Error',e?.response?.data?.error??'Koneksi gagal');}
          finally{setClockLoading(false);}
        },
        (err:any)=>{
          Alert.alert('GPS Error','GPS tidak tersedia: '+err.message);
          setClockLoading(false);
        },
        {enableHighAccuracy:true,timeout:10000,maximumAge:5000}
      );
    }catch(e:any){
      Alert.alert('Error','Modul GPS tidak tersedia');
      setClockLoading(false);
    }
  },[user,fetchMyDay]);

  const timeStr=now.toLocaleTimeString('id-ID',{hour:'2-digit',minute:'2-digit'});
  const dateStr=now.toLocaleDateString('id-ID',{weekday:'long',day:'numeric',month:'long',year:'numeric'});

  const hasCheckedIn=data?.attendance.hasCheckedIn??false;
  const hasCheckedOut=data?.attendance.hasCheckedOut??false;
  const canClockIn=!hasCheckedIn&&!clockLoading;
  const canClockOut=hasCheckedIn&&!hasCheckedOut&&!clockLoading;

  return(
    <ScrollView style={s.c} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={()=>{setRefreshing(true);fetchMyDay();}} tintColor={COLORS.primary}/>}>
      <StatusBar backgroundColor={COLORS.dark} barStyle="light-content"/>

      {/* ── HEADER ── */}
      <View style={s.hdr}>
        <View style={s.hdrL}>
          <View style={s.av}><Text style={s.avT}>{user?.name?.charAt(0)?.toUpperCase()}</Text></View>
          <View>
            <Text style={s.greet}>Selamat datang,</Text>
            <Text style={s.name}>{user?.name}</Text>
            <Text style={s.role}>{ROLE_LABELS[user?.role??'']??user?.role}</Text>
          </View>
        </View>
        <Text style={s.time}>{timeStr}</Text>
      </View>

      {/* ── BUILDING + SHIFT BAR ── */}
      <View style={s.bar}>
        <Icon name="business-outline" size={13} color={COLORS.primary}/>
        <Text style={s.bldg}>{user?.buildingName??'Building'}</Text>
        {data?.shift?(
          <><Text style={s.dot}>·</Text>
          <Icon name="time-outline" size={13} color={COLORS.success}/>
          <Text style={s.shift}>{data.shift.name} ({data.shift.startTime}–{data.shift.endTime})</Text></>
        ):!loading?(
          <><Text style={s.dot}>·</Text><Text style={s.noShift}>Belum ada jadwal shift</Text></>
        ):null}
      </View>

      {loading?<ActivityIndicator color={COLORS.primary} style={{marginTop:56}}/>:(<>

        {/* ── PERIODIC OVERDUE ALERT ── */}
        {(data?.periodicSchedules.overdue??0)>0&&(
          <View style={s.alert}>
            <Icon name="warning-outline" size={15} color={COLORS.warning}/>
            <Text style={s.alertT}>{data!.periodicSchedules.overdue} jadwal periodik melewati batas waktu</Text>
          </View>
        )}

        {/* ── STAT CARDS ── */}
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

        {/* ── ATTENDANCE CARD ── */}
        <View style={s.sec}>
          <Text style={s.secL}>STATUS ABSENSI HARI INI</Text>
          <View style={s.attCard}>
            {/* Check In / Check Out Info */}
            <View style={s.attRow}>
              <View style={s.attItem}>
                <Icon name="log-in-outline" size={20} color={COLORS.success}/>
                <Text style={s.attLbl}>Check In</Text>
                <Text style={[s.attT,{color:hasCheckedIn?COLORS.success:COLORS.textPrimary}]}>{data?.attendance.checkIn??'—'}</Text>
                {hasCheckedIn&&data?.attendance.isValidLocation===false&&(
                  <View style={s.locBadge}>
                    <Icon name="warning" size={10} color={COLORS.danger}/>
                    <Text style={s.locT}>Di luar area</Text>
                  </View>
                )}
              </View>
              <View style={s.div}/>
              <View style={s.attItem}>
                <Icon name="log-out-outline" size={20} color={COLORS.danger}/>
                <Text style={s.attLbl}>Check Out</Text>
                <Text style={[s.attT,{color:hasCheckedOut?COLORS.danger:COLORS.textPrimary}]}>{data?.attendance.checkOut??'—'}</Text>
              </View>
            </View>
            {/* Clock Buttons */}
            <View style={s.clockRow}>
              <TouchableOpacity
                style={[s.clockBtn,{backgroundColor:canClockIn?COLORS.success:'#E0E0E0'}]}
                onPress={()=>handleClock('check_in')}
                disabled={!canClockIn}
                activeOpacity={0.8}
              >
                {clockLoading&&canClockIn
                  ?<ActivityIndicator size="small" color="#fff"/>
                  :<Icon name="log-in-outline" size={16} color={canClockIn?'#fff':COLORS.gray}/>
                }
                <Text style={[s.clockT,{color:canClockIn?'#fff':COLORS.gray}]}>Clock In</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[s.clockBtn,{backgroundColor:canClockOut?COLORS.danger:'#E0E0E0'}]}
                onPress={()=>handleClock('check_out')}
                disabled={!canClockOut}
                activeOpacity={0.8}
              >
                {clockLoading&&canClockOut
                  ?<ActivityIndicator size="small" color="#fff"/>
                  :<Icon name="log-out-outline" size={16} color={canClockOut?'#fff':COLORS.gray}/>
                }
                <Text style={[s.clockT,{color:canClockOut?'#fff':COLORS.gray}]}>Clock Out</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* ── CHECKLIST HARI INI ── */}
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

        {/* ── WORK ORDER AKTIF ── */}
        {(data?.workOrders.items.length??0)>0&&(
          <View style={s.sec}>
            <Text style={s.secL}>WORK ORDER AKTIF</Text>
            <View style={s.listCard}>
              {data!.workOrders.items.slice(0,5).map((w,i)=>(
                <TouchableOpacity key={w.id} style={[s.row,i>0&&s.rowDiv]} onPress={()=>nav.navigate('Tasks')} activeOpacity={0.7}>
                  <View style={[s.dot2,{backgroundColor:PRIORITY_COLORS[w.priority]??COLORS.primary}]}/>
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

        {/* ── QUICK ACTIONS ── */}
        <View style={s.sec}>
          <Text style={s.secL}>AKSI CEPAT</Text>
          <View style={s.qaGrid}>
            {QUICK_ACTIONS.map(q=>(
              <TouchableOpacity key={q.route} style={s.qaItem} onPress={()=>nav.navigate(q.route)} activeOpacity={0.75}>
                <View style={[s.qaIco,{backgroundColor:q.bg}]}>
                  <Icon name={q.icon} size={24} color={q.color}/>
                </View>
                <Text style={s.qaLbl}>{q.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* ── DATE BAR ── */}
        <View style={s.dateCard}>
          <Icon name="calendar-outline" size={15} color={COLORS.gray}/>
          <Text style={s.dateT}>{dateStr}</Text>
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
  greet:{color:COLORS.gray,fontSize:12},
  name:{color:'#fff',fontSize:16,fontWeight:'700'},
  role:{color:COLORS.primary,fontSize:11,fontWeight:'600',letterSpacing:0.5},
  time:{color:COLORS.gray,fontSize:13,fontWeight:'600'},
  bar:{backgroundColor:COLORS.dark2,flexDirection:'row',alignItems:'center',paddingHorizontal:20,paddingVertical:10,gap:6,flexWrap:'wrap'},
  bldg:{color:'#C6C6C6',fontSize:12,fontWeight:'600'},
  dot:{color:'#393939'},
  shift:{color:COLORS.success,fontSize:12,fontWeight:'600'},
  noShift:{color:COLORS.gray,fontSize:12},
  alert:{flexDirection:'row',alignItems:'center',gap:8,marginHorizontal:16,marginTop:12,marginBottom:4,padding:10,backgroundColor:'#FFF4E6',borderLeftWidth:3,borderLeftColor:COLORS.warning,borderRadius:4},
  alertT:{fontSize:12,color:COLORS.warning,fontWeight:'600',flex:1},
  cards:{flexDirection:'row',gap:12,paddingHorizontal:16,paddingTop:16,paddingBottom:4},
  card:{flex:1,backgroundColor:COLORS.surface,padding:16,alignItems:'center',borderTopWidth:3,borderRadius:4,elevation:2,gap:6},
  cardN:{fontSize:28,fontWeight:'700',color:COLORS.textPrimary},
  cardL:{fontSize:12,color:COLORS.gray,textAlign:'center'},
  sec:{paddingHorizontal:16,marginTop:12},
  secL:{fontSize:11,fontWeight:'700',color:COLORS.gray,letterSpacing:1,marginBottom:8},
  attCard:{backgroundColor:COLORS.surface,borderRadius:4,elevation:1,overflow:'hidden'},
  attRow:{flexDirection:'row',alignItems:'center',paddingVertical:16},
  attItem:{flex:1,alignItems:'center',gap:4},
  div:{width:1,height:48,backgroundColor:COLORS.border},
  attLbl:{fontSize:12,color:COLORS.gray},
  attT:{fontSize:16,fontWeight:'700'},
  locBadge:{flexDirection:'row',alignItems:'center',gap:3,backgroundColor:'#FFF1F1',paddingHorizontal:6,paddingVertical:2,borderRadius:4},
  locT:{fontSize:10,color:COLORS.danger,fontWeight:'600'},
  clockRow:{flexDirection:'row',borderTopWidth:1,borderTopColor:COLORS.border},
  clockBtn:{flex:1,flexDirection:'row',alignItems:'center',justifyContent:'center',gap:6,paddingVertical:14},
  clockT:{fontSize:13,fontWeight:'700'},
  listCard:{backgroundColor:COLORS.surface,borderRadius:4,elevation:1},
  row:{flexDirection:'row',alignItems:'center',gap:10,paddingHorizontal:14,paddingVertical:12},
  rowDiv:{borderTopWidth:1,borderTopColor:COLORS.border},
  dot2:{width:8,height:8,borderRadius:4},
  rowN:{flex:1,fontSize:13,color:COLORS.textPrimary,fontWeight:'500'},
  badge:{paddingHorizontal:8,paddingVertical:3,borderRadius:4},
  badgeT:{fontSize:10,fontWeight:'700'},
  qaGrid:{flexDirection:'row',flexWrap:'wrap',gap:8},
  qaItem:{width:'30%',alignItems:'center',gap:8,paddingVertical:12},
  qaIco:{width:52,height:52,borderRadius:14,justifyContent:'center',alignItems:'center'},
  qaLbl:{fontSize:11,fontWeight:'600',color:COLORS.textPrimary,textAlign:'center'},
  dateCard:{flexDirection:'row',alignItems:'center',gap:8,marginHorizontal:16,marginTop:8,marginBottom:32,backgroundColor:COLORS.surface,padding:12,borderRadius:4,elevation:1},
  dateT:{color:COLORS.gray,fontSize:13},
});
