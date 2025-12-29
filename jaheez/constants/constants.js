import { Dimensions, Image, Text, TouchableOpacity, View, DeviceEventEmitter } from 'react-native'
import Contants from 'expo-constants'
import { AntDesign, Ionicons } from '@expo/vector-icons'



const COLORS = {
    primary:'#F44A26',
    secondary:'#FC862C',
    
    DarkTextColor:'#1A1C1E',
    NormalTextColor:'#262626',
    LightTextColor:'#6C7278',
    ExtraLightTextColor:'#B7B7B7',
    whiteTextColor:'#FFFFFF',

    bgColor:'#FDFDFD',
    iconsColor:'#04070E',
    borderColor:'#F5F6FA'
}

const FONT = {
    GE_SS_Bold:'GE_SS_Bold',
    GE_SS_Bold1:'GE_SS_Bold1',
    GE_SS_Light:'GE_SS_Light',
    GE_SS_Light1:'GE_SS_Light1',
    GE_SS_Medium:'GE_SS_Medium',
    GE_SS_Medium1:'GE_SS_Medium1',
    Montserrat_Bold:'Montserrat_Bold',
    Montserrat_Semi_Bold:'Montserrat_Semi_Bold',
    Montserrat_Regular:'Montserrat_Regular',
    Montserrat_Light:'Montserrat_Light'
}

const SIZES = {
    xsmall:12,
    small:14,
    medium:18,
    large:22,
    xLarge:26,
    xxLarge:34
}

const DIMENSIONS = () => {
    const screenHeight = Dimensions.get('window').height
    const screenWidth = Dimensions.get('window').width
    const headerHeight = Contants.statusBarHeight
    return {
        screenWidth:screenWidth,
        screenHeight:screenHeight,
        headerHeight:headerHeight
    }
}


const MAIN_SCREEN_OPTIONS = (router,renderText) => ({
    header: (props) => {
        return (
            <View style={{ backgroundColor: COLORS.bgColor, height: 120 }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20,height: 120,paddingTop:35 }}>
                    <TouchableOpacity onPress={() => DeviceEventEmitter.emit('userMenu:toggle')} style={{ width: 50, height: 50, borderRadius: 25, alignItems: 'center', justifyContent: 'center' }}>
                        <AntDesign name="menu" size={32} color="black" />
                    </TouchableOpacity>
                    <View>
                        <Text style={{ fontSize: SIZES.large, fontFamily: FONT.GE_SS_Light1,color:COLORS.DarkTextColor, textAlign: 'right' }}>
                            {renderText}
                        </Text>
                    </View>
                    <TouchableOpacity onPress={() => { DeviceEventEmitter.emit('userMenu:close'); router.push('/(user)/profile'); }} style={{}}>
                        <Image
                            source={require('../assets/images/profile.png')}
                            style={{ width: 50, height: 50, borderRadius: 25 }}
                        />
                    </TouchableOpacity>
                </View>
            </View>
        );
    },
    headerShadowVisible: true,
})

// const MAIN_HOME_TAB_OPTIONS = (router) => ({
//     header: (props) => {
//         return (
//             <View style={{ backgroundColor: COLORS.bgColor, height: 120 }}>
//                 <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20,height: 120,paddingTop:35 }}>
//                     <TouchableOpacity onPress={() => router.push('/')} style={{}}>
//                         <Image
//                             source={require('../images/dark-logo.png')}
//                             style={{ width: 50, height: 50, borderRadius: 25 }}
//                         />
//                     </TouchableOpacity>
//                     <View>
//                         <Text style={{ fontSize: SIZES.large, fontFamily: FONT.CrExtraBold,color:COLORS.DarkTextColor, textAlign: 'right' }}>
//                             مرحبا بك في مود
//                         </Text>
//                         <Text style={{ fontSize: SIZES.medium,color:COLORS.LightTextColor2, fontFamily: FONT.CrRegular, textAlign: 'right' }}>
//                             إختــــار بمزاجــــــــــك
//                         </Text>
//                     </View>
//                     <TouchableOpacity onPress={() => router.push('/cart')} style={{ backgroundColor: '#F5F6FA', width: 50, height: 50, borderRadius: 25, alignItems: 'center', justifyContent: 'center' }}>
//                         <Ionicons name="bag-handle-outline" size={28} color="black" />
//                     </TouchableOpacity>
//                 </View>
//             </View>
//         );
//     },
//     headerShadowVisible: true,
// });

// const MAIN_WEBSITE_TAB_OPTIONS = (router) => ({
//     header: (props) => {
//         return (
//             <View style={{ backgroundColor: COLORS.bgColor, height: 120 }}>
//                 <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20,height: 120,paddingTop:35 }}>
//                     <TouchableOpacity onPress={() => router.back()} style={{ backgroundColor: '#F5F6FA', width: 50, height: 50, borderRadius: 25, alignItems: 'center', justifyContent: 'center' }}>
//                         <AntDesign name="arrowleft" size={28} color="black" />
//                     </TouchableOpacity>
//                     <View>
//                         <Text style={{ fontSize: SIZES.large, fontFamily: FONT.CrExtraBold,color:COLORS.DarkTextColor, textAlign: 'right' }}>
//                             مرحبا بك في مود
//                         </Text>
//                         <Text style={{ fontSize: SIZES.medium,color:COLORS.LightTextColor2, fontFamily: FONT.CrRegular, textAlign: 'right' }}>
//                             إختــــار بمزاجــــــــــك
//                         </Text>
//                     </View>
//                     <TouchableOpacity onPress={() => router.push('/cart')} style={{ backgroundColor: '#F5F6FA', width: 50, height: 50, borderRadius: 25, alignItems: 'center', justifyContent: 'center' }}>
//                         <Ionicons name="bag-handle-outline" size={28} color="black" />
//                     </TouchableOpacity>
//                 </View>
//             </View>
//         );
//     },
//     headerShadowVisible: true,
// });


//     const NON_LOGGED_HEADER = (router) => ({
//         header: (props) => (<View style={{ backgroundColor: 'trasnparent', height: 120 }}>
//                     <View style={{ flexDirection: 'row', justifyContent: 'flex-start', alignItems: 'center', paddingTop:30, paddingHorizontal: 20,height: 120 }}>
//                         <TouchableOpacity onPress={() => router.back()} style={{ backgroundColor: '#F5F6FA', width: 50, height: 50, borderRadius: 25, alignItems: 'center', justifyContent: 'center' }}>
//                             <AntDesign name="arrowleft" size={28} color="black" />
//                         </TouchableOpacity>
//                     </View>
//                 </View>),
//         headerShadowVisible: true,
//     })

//     const MY_ACCOUNT_HEADER_OPTIONS = (router,user) => ({
//         header: (props) => (<View style={{ backgroundColor: 'trasnparent', height: 120 }}>
//                     <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingTop:30, paddingHorizontal: 20,height: 120 }}>
//                         <TouchableOpacity onPress={() => router.back()} style={{ backgroundColor: '#F5F6FA', width: 50, height: 50, borderRadius: 25, alignItems: 'center', justifyContent: 'center' }}>
//                             <AntDesign name="arrowleft" size={28} color="black" />
//                         </TouchableOpacity>
//                         <View style={{alignItems:'center',justifyContent:'center'}}>
//                             <Text style={{color:COLORS.NormalTextColor,fontFamily:FONT.CrBold,fontSize:SIZES.large}}>
//                                 حسابي
//                             </Text>
//                         </View>
//                         <TouchableOpacity onPress={() => router.push('/cart')} style={{ backgroundColor: '#F5F6FA', width: 50, height: 50, borderRadius: 25, alignItems: 'center', justifyContent: 'center' }}>
//                             <Ionicons name="bag-handle-outline" size={28} color="black" />
//                         </TouchableOpacity>
//                     </View>
//                 </View>),
//         headerShadowVisible: true,
//     })




export {
    COLORS,FONT,SIZES,DIMENSIONS,
    MAIN_SCREEN_OPTIONS,
    // MAIN_HOME_TAB_OPTIONS,
    // NON_LOGGED_HEADER,
    // MY_ACCOUNT_HEADER_OPTIONS,
    // MAIN_WEBSITE_TAB_OPTIONS,
}