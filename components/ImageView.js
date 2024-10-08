import React, { useEffect } from 'react';
import { View, Image, StyleSheet } from 'react-native';

export default function ImageView({ route, navigation }) {
    const { imageURL } = route?.params;
    const styles = StyleSheet.create({
        container: {
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: 'black',
        },
        image: {
            width: '100%',
            height: '100%',
            resizeMode: 'contain',
        },
    });
    useEffect(() => {
        navigation.setOptions({
            title: '',
            headerStyle: { backgroundColor: 'black' },
            headerTintColor: 'white'
        });
    });
    return (
        <View style={styles.container}>
            <Image
                source={{ uri: imageURL }}
                style={styles.image}
            />
        </View>
    );
}