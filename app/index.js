import { Redirect } from 'expo-router';

export default function Index() {
  // The _layout.js file handles the actual routing based on auth state
  // We just redirect to /login initially, and RootLayoutNav will redirect to /(tabs) if authenticated
  return <Redirect href="/(auth)/login" />;
}
