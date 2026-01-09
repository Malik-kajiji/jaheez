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
    LightGrayColor:'#F2F2F2',

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

const DRIVER_MAIN_SCREEN_OPTIONS = (router,renderText) => ({
    header: (props) => {
        const navigateFromHeader = (targetName) => {
            const currentName = props?.route?.name;
            const homeName = 'home';
            const targetPath = `/(driver)/${targetName}`;

            if (currentName === targetName) return;

            if (targetName === homeName) {
                router.back();
                return;
            }

            if (currentName === homeName) {
                router.push(targetPath);
            } else {
                router.replace(targetPath);
            }
        };
        return (
            <View style={{ backgroundColor: COLORS.bgColor, height: 120 }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20,height: 120,paddingTop:35 }}>
                    <TouchableOpacity onPress={() => DeviceEventEmitter.emit('driverMenu:toggle')} style={{ width: 50, height: 50, borderRadius: 25, alignItems: 'center', justifyContent: 'center' }}>
                        <AntDesign name="menu" size={32} color="black" />
                    </TouchableOpacity>
                    <View>
                        <Text style={{ fontSize: SIZES.large, fontFamily: FONT.GE_SS_Light1,color:COLORS.DarkTextColor, textAlign: 'right' }}>
                            {renderText}
                        </Text>
                    </View>
                    <TouchableOpacity onPress={() => { DeviceEventEmitter.emit('driverMenu:close'); navigateFromHeader('profile'); }} style={{}}>
                        <Image
                            source={require('../assets/images/driver.png')}
                            style={{ width: 50, height: 50, borderRadius: 25 }}
                        />
                    </TouchableOpacity>
                </View>
            </View>
        );
    },
    headerShadowVisible: true,
})






export {
    COLORS,FONT,SIZES,DIMENSIONS,
    MAIN_SCREEN_OPTIONS,
    DRIVER_MAIN_SCREEN_OPTIONS
}