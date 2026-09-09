import { Redirect } from 'expo-router';

// This tab never actually renders — AddButton's tabBarButton override
// pushes the /add-transaction modal instead of navigating here. This
// file exists only so expo-router has a valid route to satisfy the Tabs.Screen.
export default function AddTabPlaceholder() {
  return <Redirect href="/(tabs)" />;
}
