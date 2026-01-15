import React from 'react';
import { View, Text, StyleSheet, FlatList, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function LeaderboardScreen() {

  //Mock data for ranking
  const leaderboardData = [
    { id: '1', name: 'Alex', points: 1250, rank: 1 },
    { id: '2', name: 'Jordan', points: 980, rank: 2 },
    { id: '3', name: 'Taylor', points: 850, rank: 3 },
    { id: '4', name: 'Casey', points: 600, rank: 4 },
    { id: '5', name: 'Jamie', points: 450, rank: 5 },
  ];

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1: return { icon: 'trophy', color: '#FFD700' }; // Gold
      case 2: return { icon: 'medal', color: '#C0C0C0' }; // Silver
      case 3: return { icon: 'medal', color: '#CD7F32' }; // Bronze
      default: return null;
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Leaderboard</Text>

      <FlatList
        data={leaderboardData}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => {
          const rankDetails = getRankIcon(item.rank);

          return(
            <View style={styles.rankCard}>
              <View style={styles.leftSection}>
                <Text style={styles.rankNumber}>{item.rank}</Text>
                <View style={styles.avatarPlaceholder}>
                  <Text style={styles.avatarText}>{item.name[0]}</Text>
                </View>
                <Text style={styles.userName}>{item.name}</Text>
              </View>

              <View style={styles.rightSection}>
                {rankDetails && (
                  <Ionicons 
                    name={rankDetails.icon as any}
                    size={20}
                    color={rankDetails.color}
                    style={{ marginRight: 8 }}
                  />
                )}
                <Text style={styles.userPoints}>{item.points}</Text>
              </View>
            </View>
          );
        }}
      ></FlatList>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f9fa', padding: 20 },
  title: { fontSize: 28, fontWeight: 'bold', color: '#333', marginTop: 40, marginBottom: 20 },
  rankCard: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 15,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#eee',
  },
  leftSection: { flexDirection: 'row', alignItems: 'center' },
  rankNumber: { fontSize: 16, fontWeight: 'bold', color: '#888', marginRight: 15, width: 20 },
  avatarPlaceholder: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#6200ee',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  avatarText: { color: '#fff', fontWeight: 'bold' },
  userName: { fontSize: 16, fontWeight: '600', color: '#333' },
  rightSection: { flexDirection: 'row', alignItems: 'center', minWidth: 80, justifyContent: 'flex-end' },
  userPoints: { fontSize: 16, fontWeight: 'bold', color: '#6200ee' },
});