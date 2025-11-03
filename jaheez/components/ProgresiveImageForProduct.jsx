import React, { useState } from "react";
import { ActivityIndicator, Image, StyleSheet, View } from "react-native";
import { COLORS, DIMENSIONS } from "../constants/constants";

const styles = StyleSheet.create({
    imageHolder: {
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
        backgroundColor:COLORS.borderColor
    },
    transLogo: {
        position:'absolute',
        width:70,
        height:70,
        resizeMode:'contain',
        bottom:10,
        right:10
    }
});

const ProgresiveImage = ({ src,imageStyles, size }) => {
    const [isLoading, setIsLoading] = useState(false);

    return (
        <View style={[styles.imageHolder, { width: imageStyles.width }]}>
            <Image
                src={src}
                style={[{ height: imageStyles.height,width: imageStyles.width,resizeMode:'contain' }]}
                onLoadStart={() => setIsLoading(true)}
                onLoadEnd={() => setIsLoading(false)}
            />
            <Image
                source={require('../assets/images/trans-logo.png')}
                style={styles.transLogo}
                onLoadStart={() => setIsLoading(true)}
                onLoadEnd={() => setIsLoading(false)}
            />
            {isLoading && (
                <ActivityIndicator style={{ position: 'absolute', zIndex: 3, top: 0, bottom: 0, left: 0, right: 0 }} size={size} color={COLORS.primary} />
            )}
        </View>
    );
};

export default ProgresiveImage;
