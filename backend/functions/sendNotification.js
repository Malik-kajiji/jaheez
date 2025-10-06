// const {  
//     Expo
// } = require('expo-server-sdk')

// let expo = new Expo({
//     accessToken: process.env.EXPO_ACCESS_TOKEN,
//     useFcmV1: true,
//   });

const sendNotification = async (title,body,expoPushtokens) => {
    console.log(`title:${title}`)
    console.log(`body:${body}`)
    console.log(`expoPushtokens:${expoPushtokens}`)

    // try {

    //     let messages = [];
    //     for (let pushToken of expoPushtokens) {
    //     if (!Expo.isExpoPushToken(pushToken)) {
    //         console.error(`Push token ${pushToken} is not a valid Expo push token`);
    //         continue;
    //     }

    //     messages.push({
    //         to: pushToken.token,
    //         sound: 'default',
    //         title: title,
    //         body: body,
    //     })
    //     }


    //     let chunks = expo.chunkPushNotifications(messages);
    //     (async () => {
    //     for (let chunk of chunks) {
    //         try {
    //             let ticketChunk = await expo.sendPushNotificationsAsync(chunk);
    //         } catch (error) {
    //             console.error(error);
    //         }
    //     }
    //     })();

    //     return {
    //         message:'تم الارسال بنجاح!'
    //     }
    // }catch(err){
    //     throw new Error(err.message);
    // }
}


module.exports = {
    sendNotification
}