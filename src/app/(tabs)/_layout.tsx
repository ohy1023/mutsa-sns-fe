import { Tabs } from 'expo-router';
import { View, TouchableOpacity, Text } from 'react-native';
import { Bell, MessageCircle } from 'lucide-react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

export default function TabLayout() {
  return (
    <GestureHandlerRootView className="flex-1">
      <SafeAreaProvider>
        <Tabs
          screenOptions={{
            headerTitle: '',
            headerStyle: { backgroundColor: 'white' },
            headerShadowVisible: false,
            headerLeft: () => (
              <View className="pl-4">
                <Text className="text-lg font-bold text-black">MustaSns</Text>
              </View>
            ),
            headerRight: () => (
              <View className="flex-row gap-4 pr-4">
                <TouchableOpacity>
                  <Bell size={24} color="black" />
                </TouchableOpacity>
                <TouchableOpacity>
                  <MessageCircle size={24} color="black" />
                </TouchableOpacity>
              </View>
            ),
            tabBarStyle: {
              backgroundColor: 'white',
              height: 60,
              borderTopWidth: 0.5,
              borderTopColor: '#ddd',
            },
            tabBarLabelStyle: {
              fontSize: 12,
              fontWeight: '600',
            },
          }}
        >
          <Tabs.Screen
            name="index"
            options={{ title: '홈', tabBarIcon: () => <Text>🏠</Text> }}
          />
          <Tabs.Screen
            name="search"
            options={{ title: '검색', tabBarIcon: () => <Text>🔍</Text> }}
          />
          <Tabs.Screen
            name="newPost"
            options={{ title: '새 게시물', tabBarIcon: () => <Text>✏️</Text> }}
          />
          <Tabs.Screen
            name="profile"
            options={{ title: '마이페이지', tabBarIcon: () => <Text>👤</Text> }}
          />
        </Tabs>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
