import React from "react";
import { View, TouchableOpacity, Text, Alert } from "react-native";
import { useActionSheet } from '@expo/react-native-action-sheet';
import * as Location from 'expo-location';
import * as ImagePicker from 'expo-image-picker';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

export default function CustomActions({ wrapperStyle, iconTextStyle, onSend, user, messageId, storage }) {
    const actionSheet = useActionSheet(),
        onActionPress = () => {
            const options = ['Choose From Library', 'Take Picture', 'Send Location', 'Cancel'],
                cancelButtonIndex = options.length - 1;
            actionSheet.showActionSheetWithOptions({ options, cancelButtonIndex }, buttonIndex => {
                switch (buttonIndex) {
                    case 0:
                        pickImage();
                        return;
                    case 1:
                        // takePhoto();
                        return;
                    case 2:
                        getLocation();
                        return;
                    default:
                }
            });
        },

        getLocation = async () => {
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
        },

        pickImage = async () => {
            let result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                allowsEditing: true,
                quality: 1,
            });
            if (!result.canceled) {
                const imageURI = result.assets[0].uri;
                const image = await fetch(imageURI);
                const imageBlob = await image.blob();
                const storageRef = ref(storage, `images/${messageId}`); // I took the messageId, because it links the image to the message
                const uploadResult = await uploadBytes(storageRef, imageBlob);
                const imageURL = await getDownloadURL(uploadResult.ref);
                onSend([{
                    _id: messageId,
                    text: '',
                    createdAt: new Date(),
                    user: user,
                    imageURL // The gifted chat image viewer is not working, so I decided to use a custom image viewer
                }]);
            }
        };

    return (
        <TouchableOpacity style={{
            width: 26,
            height: 26,
            marginLeft: 10,
            marginBottom: 10
        }} onPress={onActionPress}>
            <View style={
                [
                    {
                        flex: 1,
                        borderRadius: 13,
                        borderColor: '#b2b2b2',
                        borderWidth: 2,
                        alignItems: 'center',
                        justifyContent: 'center'
                    },
                    wrapperStyle
                ]
            }>
                <Text style={
                    [
                        {
                            color: '#b2b2b2',
                            fontSize: 10,
                            fontWeight: 'bold',
                            backgroundColor: 'transparent'
                        },
                        iconTextStyle
                    ]
                }>+</Text>
            </View>
        </TouchableOpacity>
    );
}