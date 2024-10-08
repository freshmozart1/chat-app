import React from "react";
import { View, TouchableOpacity, StyleSheet, Text, Alert } from "react-native";
import { useActionSheet } from '@expo/react-native-action-sheet';
import * as Location from 'expo-location';

export default function CustomActions({ wrapperStyle, iconTextStyle, onSend, user, messageId }) {
    const actionSheet = useActionSheet();
    const getLocation = async () => {
        let permissions = await Location.requestForegroundPermissionsAsync();
        if (permissions?.granted) {
            const location = await Location.getCurrentPositionAsync({});
            if (location) {
                onSend([{
                    _id: messageId,
                    text: '',
                    createdAt: new Date(),
                    user: user,
                    location: {
                        longitude: location.coords.longitude,
                        latitude: location.coords.latitude,
                    }
                }]);
            } else Alert.alert("Error occurred while fetching location");
        } else Alert.alert("Permissions haven't been granted.");
    }
    const onActionPress = () => {
        const options = ['Choose From Library', 'Take Picture', 'Send Location', 'Cancel'];
        const cancelButtonIndex = options.length - 1;
        actionSheet.showActionSheetWithOptions(
            {
                options,
                cancelButtonIndex
            },
            async buttonIndex => {
                switch (buttonIndex) {
                    case 0:
                        // pickImage();
                        return;
                    case 1:
                        // takePhoto();
                        return;
                    case 2:
                        await getLocation();
                        return;
                    default:
                }
            }
        );
    };

    return (
        <TouchableOpacity style={styles.container} onPress={onActionPress}>
            <View style={[styles.wrapper, wrapperStyle]}>
                <Text style={[styles.iconText, iconTextStyle]}>+</Text>
            </View>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    container: {
        width: 26,
        height: 26,
        marginLeft: 10,
        marginBottom: 10
    },
    wrapper: {
        flex: 1,
        borderRadius: 13,
        borderColor: '#b2b2b2',
        borderWidth: 2,
        alignItems: 'center',
        justifyContent: 'center'
    },
    iconText: {
        color: '#b2b2b2',
        fontSize: 10,
        fontWeight: 'bold',
        backgroundColor: 'transparent'
    }
});