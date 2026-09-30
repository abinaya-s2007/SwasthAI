import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from './types';

// Screens nested inside the bottom tab navigator can still navigate to
// screens registered on the parent root stack — React Navigation bubbles
// unresolved route names up to ancestor navigators automatically.
export const useAppNavigation = () => useNavigation<NativeStackNavigationProp<RootStackParamList>>();
