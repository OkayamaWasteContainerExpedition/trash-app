import { Stack } from 'expo-router';
import { BinProvider } from '../contexts/BinContext';

export default function Layout() {
  return (
    <BinProvider>
      <Stack
        screenOptions={{
          headerShown: false, // 独自ヘッダーを使用するためデフォルトは非表示
          contentStyle: { backgroundColor: '#FFF8F4' }, // Warm Cream
        }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="camera" options={{ presentation: 'modal' }} />
        <Stack.Screen name="register" />
        <Stack.Screen name="detail" />
      </Stack>
    </BinProvider>
  );
}
