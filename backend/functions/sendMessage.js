
const sendMessage = async (message, phoneNumber) => {
    try {
        const url = 'https://client.almasafa.ly/api/sms/Send';
        const token = process.env.SMS_TOKEN;
    
        const postPhoneNumber = `218${phoneNumber.slice(1,phoneNumber.length)}`
    
        const data = {
            phoneNumber:postPhoneNumber,
            message,
            senderId:process.env.SENDER_ID
        };
    
        const res = await fetch(url, {
            method: 'POST',
            headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
            'Accept': 'application/json'
            },
            body: JSON.stringify(data)
        })

        if (!res.ok) {
            throw new Error('فشل في إرسال الرسالة!');
        }
    
        const json = await res.json()
    
        return json
    }catch(err){
        return { error: 'فشل في إرسال الرسالة!' };
    }
};

module.exports = sendMessage
// const sendMessage = async (message, phoneNumber) => {
//     const url = 'https://isend.com.ly/api/v3/sms/send';
//     const token = '281|4WE4q2t3GqxcIXNp7QQzKLLMEfsMkjxFgCF5pwnWcd47f877';

//     const data = {
//         recipient: phoneNumber,
//         sender_id: 'iSend',
//         type: 'plain',
//         message: message
//     };

//     const res = await fetch(url, {
//         method: 'POST',
//         headers: {
//         'Authorization': `Bearer ${token}`,
//         'Content-Type': 'application/json',
//         'Accept': 'application/json'
//         },
//         body: JSON.stringify(data)
//     })

//     const json = await res.json()

//     return json
// };
