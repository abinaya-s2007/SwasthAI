import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@react-native-vector-icons/ionicons/static';
import { CommonActions } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAppNavigation } from '@/navigation/useAppNavigation';
import { Screen } from '@/components/Screen';
import { Button } from '@/components/Button';
import { useTheme } from '@/theme/ThemeContext';

export const LogoutConfirmScreen: React.FC = () => {
  const { colors } = useTheme();
  const navigation = useAppNavigation();

  const logout = async () => {
    await Promise.all([
      AsyncStorage.removeItem('authToken'),
      AsyncStorage.removeItem('sessionUser'),
      AsyncStorage.removeItem('accountMode'),
    ]);
    navigation.dispatch(
      CommonActions.reset({ index: 0, routes: [{ name: 'Login' }] })
    );
  };

  return (
    <Screen>
      <View style={styles.center}>
        <View style={[styles.circle, { backgroundColor: colors.surfaceAlt }]}>
          <Ionicons name="log-out-outline" size={36} color={colors.danger} />
        </View>
        <Text style={[styles.title, { color: colors.text }]}>Are you sure you want to log out?</Text>
      </View>
      <Button label="Log Out" variant="danger" onPress={logout} />
      <Button label="Cancel" variant="secondary" onPress={() => navigation.goBack()} style={{ marginTop: 10 }} />
    </Screen>
  );
};

const styles = StyleSheet.create({
  center: { alignItems: 'center', marginVertical: 40 },
  circle: { width: 80, height: 80, borderRadius: 40, alignItems: 'center', justifyContent: 'center', marginBottom: 20 },
  title: { fontSize: 16, fontWeight: '700', textAlign: 'center' },
});
