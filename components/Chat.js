import { View, StyleSheet } from 'react-native';
import React from 'react';

export default function Chat({ route, navigation }) {
    const name = route.params.name;
    const backgroundColor = route.params.selectedColor;
    React.useEffect(() => {
        if (name && navigation) navigation.setOptions({
            title: name,
            backgroundColor: backgroundColor
        });
    }, [navigation, name, backgroundColor]);
    return (<View style={[styles.container, { backgroundColor }]}></View>);
}

const styles = StyleSheet.create({
    container: {
        flex: 1
    }
});