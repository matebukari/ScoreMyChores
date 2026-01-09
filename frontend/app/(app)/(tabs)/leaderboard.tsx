import { View, Text, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const Leaderboard = () => {
  return (
    <SafeAreaView className="flex-1 bg-white" edges={['top']}>
      <ScrollView 
        contentContainerStyle={{ flexGrow: 1, paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
      >
        <View className="flex-1 justify-center items-center">
          <Text className="text-5xl text-light-100">Leaderboard</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}

export default Leaderboard