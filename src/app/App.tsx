import { StatusBar } from 'expo-status-bar';
import { StyleSheet } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { MatchesPage } from '../pages/matches';
import { colors } from '../shared/theme/colors';

export function App() {
  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.root}>
        <MatchesPage />
        <StatusBar style="light" />
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background },
});
