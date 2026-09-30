import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@react-native-vector-icons/ionicons/static';
import { useAppNavigation } from '@/navigation/useAppNavigation';
import { Screen } from '@/components/Screen';
import { Header } from '@/components/Header';
import { Card } from '@/components/Card';
import { Button } from '@/components/Button';
import { useTheme } from '@/theme/ThemeContext';
import { mockContacts } from '@/data/mockData';

export const ContactCascadeScreen: React.FC = () => {
  const { colors } = useTheme();
  const navigation = useAppNavigation();

  return (
    <Screen>
      <Header title="Contact Notifications" />
      <Card noPadding>
        {mockContacts.map((c, i) => (
          <View
            key={c.id}
            style={[
              styles.row,
              i < mockContacts.length - 1 && { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.border },
            ]}
          >
            <View style={[styles.avatar, { backgroundColor: colors.primary }]}>
              <Text style={{ color: colors.primaryText, fontWeight: '700' }}>{c.name.charAt(0)}</Text>
            </View>
            <View style={{ flex: 1, marginLeft: 10 }}>
              <Text style={{ color: colors.text, fontWeight: '700' }}>{c.name}</Text>
              <Text style={{ color: colors.textMuted, fontSize: 12 }}>{c.relation}</Text>
            </View>
            <View style={styles.statusCol}>
              <Ionicons name="checkmark-circle" size={16} color={colors.success} />
              <Text style={{ color: colors.success, fontSize: 11, marginTop: 2 }}>Notified</Text>
              <Text style={{ color: colors.textMuted, fontSize: 10 }}>{c.notifiedAt}</Text>
            </View>
          </View>
        ))}
        <View style={styles.row}>
          <View style={[styles.avatar, { backgroundColor: colors.danger }]}>
            <Ionicons name="medkit" size={16} color="#FFFFFF" />
          </View>
          <View style={{ flex: 1, marginLeft: 10 }}>
            <Text style={{ color: colors.text, fontWeight: '700' }}>Emergency Services</Text>
          </View>
          <View style={styles.statusCol}>
            <Ionicons name="checkmark-circle" size={16} color={colors.success} />
            <Text style={{ color: colors.success, fontSize: 11, marginTop: 2 }}>Notified</Text>
          </View>
        </View>
      </Card>
      <Button label="View Live Status" onPress={() => navigation.navigate('SOSInProgress')} />
    </Screen>
  );
};

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', paddingVertical: 14, paddingHorizontal: 16 },
  avatar: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  statusCol: { alignItems: 'flex-end' },
});
