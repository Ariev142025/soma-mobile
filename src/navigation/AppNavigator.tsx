import React from 'react';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import Icon from 'react-native-vector-icons/Ionicons';
import {COLORS} from '../constants';
import {useAuthStore} from '../store/auth.store';
import LoginScreen from '../screens/auth/LoginScreen';
import HomeScreen from '../screens/home/HomeScreen';
import TasksScreen from '../screens/tasks/TasksScreen';
import ScannerScreen from '../screens/scanner/ScannerScreen';
import AttendanceScreen from '../screens/attendance/AttendanceScreen';
import MoreScreen from '../screens/home/MoreScreen';
import ChecklistScreen from '../screens/checklist/ChecklistScreen';
import TaggingScreen from '../screens/scanner/TaggingScreen';
import {MaterialListScreen,MaterialRequestScreen} from '../screens/material/MaterialScreen';
import ScheduleScreen from '../screens/schedule/ScheduleScreen';
import ProfileScreen from '../screens/profile/ProfileScreen';
const Root=createNativeStackNavigator();
const Main=createNativeStackNavigator();
const Tab=createBottomTabNavigator();
const TAB_ICONS:Record<string,[string,string]>={
  Home:['home','home-outline'],Tasks:['clipboard','clipboard-outline'],
  Scanner:['qr-code','qr-code-outline'],Attendance:['finger-print','finger-print-outline'],
  More:['grid','grid-outline'],
};
function Tabs(){
  return(
    <Tab.Navigator screenOptions={({route})=>({
      headerShown:false,
      tabBarActiveTintColor:COLORS.primary,tabBarInactiveTintColor:COLORS.gray,
      tabBarStyle:{backgroundColor:COLORS.surface,borderTopColor:COLORS.border},
      tabBarLabelStyle:{fontSize:11,fontWeight:'600'},
      tabBarIcon:({color,size,focused})=>{
        const[a,i]=TAB_ICONS[route.name]??['ellipse','ellipse-outline'];
        return <Icon name={focused?a:i} size={size} color={color}/>;
      },
    })}>
      <Tab.Screen name="Home" component={HomeScreen} options={{title:'Beranda'}}/>
      <Tab.Screen name="Tasks" component={TasksScreen} options={{title:'Tugas'}}/>
      <Tab.Screen name="Scanner" component={ScannerScreen} options={{title:'Scan QR'}}/>
      <Tab.Screen name="Attendance" component={AttendanceScreen} options={{title:'Absensi'}}/>
      <Tab.Screen name="More" component={MoreScreen} options={{title:'Lainnya'}}/>
    </Tab.Navigator>
  );
}
function MainNav(){
  return(
    <Main.Navigator screenOptions={{headerShown:false}}>
      <Main.Screen name="Tabs" component={Tabs}/>
      <Main.Screen name="Checklist" component={ChecklistScreen}/>
      <Main.Screen name="Tagging" component={TaggingScreen}/>
      <Main.Screen name="MaterialList" component={MaterialListScreen}/>
      <Main.Screen name="MaterialRequest" component={MaterialRequestScreen}/>
      <Main.Screen name="Schedule" component={ScheduleScreen}/>
      <Main.Screen name="Profile" component={ProfileScreen}/>
    </Main.Navigator>
  );
}
export default function AppNavigator(){
  const{isAuthenticated,isLoading}=useAuthStore();
  if(isLoading)return null;
  return(
    <Root.Navigator screenOptions={{headerShown:false}}>
      {isAuthenticated
        ?<Root.Screen name="Main" component={MainNav}/>
        :<Root.Screen name="Login" component={LoginScreen}/>}
    </Root.Navigator>
  );
}
