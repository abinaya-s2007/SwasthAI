import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@react-native-vector-icons/ionicons/static';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '@/theme/ThemeContext';

type Props = {
  title: string;
  subtitle?: string;
  showBack?: boolean;
  rightIcon?: string;
  onRightPress?: () => void;
};

export const Header: React.FC<Props> = ({
  title,
  subtitle,
  showBack = true,
  rightIcon,
  onRightPress,
}) => {
  const { colors } = useTheme();
  const navigation = useNavigation();
  const canGoBack = navigation.canGoBack?.();

  return (
    <View style={styles.row}>
      <View style={styles.left}>
        {showBack && canGoBack ? (
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={[styles.iconBtn, { backgroundColor: colors.surfaceAlt }]}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Ionicons name="chevron-back" size={20} color={colors.text} />
          </TouchableOpacity>
        ) : (
          <View style={styles.iconBtn} />
        )}
      </View>
      <View style={styles.center}>
        <Text style={[styles.title, { color: colors.text }]} numberOfLines={1}>
          {title}
        </Text>
        {subtitle ? (
          <Text style={[styles.subtitle, { color: colors.textMuted }]} numberOfLines={1}>
            {subtitle}
          </Text>
        ) : null}
      </View>
      <View style={styles.right}>
        {rightIcon ? (
          <TouchableOpacity
            onPress={onRightPress}
            style={[styles.iconBtn, { backgroundColor: colors.surfaceAlt }]}
          >
            <Ionicons name={rightIcon} size={20} color={colors.text} />
          </TouchableOpacity>
        ) : (
          <View style={styles.iconBtn} />
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  left: { width: 40 },
  right: { width: 40, alignItems: 'flex-end' },
  center: { flex: 1, alignItems: 'center' },
  iconBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: { fontSize: 17, fontWeight: '700' },
  subtitle: { fontSize: 12, marginTop: 2 },
});
