import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, StyleSheet, RefreshControl } from 'react-native';
import { collection, query, where, onSnapshot, orderBy } from 'firebase/firestore';
import { db } from '../config/firebase';
import TaskCard from '../components/TaskCard';
import { StackScreenProps } from '@react-navigation/stack';
import { RootStackParamList } from '../../App';

type Props = StackScreenProps<RootStackParamList, 'TaskList'>;

export default function TaskListScreen({ route, navigation }: Props) {
  const { volunteerId, volunteerData } = route.params;
  const [tasks, setTasks] = useState<any[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    const sosQuery = query(
      collection(db, 'sosAlerts'),
      where('volunteerId', '==', volunteerId),
      orderBy('firebaseTimestamp', 'desc')
    );

    const requestsQuery = query(
      collection(db, 'emergencyRequests'),
      where('volunteerId', '==', volunteerId),
      orderBy('firebaseTimestamp', 'desc')
    );

    const unsubscribeSos = onSnapshot(sosQuery, (snapshot) => {
      const sosTasks = snapshot.docs.map(doc => ({
        id: doc.id,
        type: 'SOS',
        ...doc.data(),
        location: {
          address: doc.data().location?.address || 'Unknown',
          lat: doc.data().location?.latitude || 0,
          lng: doc.data().location?.longitude || 0
        }
      }));

      setTasks(prevTasks => [...sosTasks, ...prevTasks].sort((a, b) => 
        new Date(b.assignedAt || 0).getTime() - new Date(a.assignedAt || 0).getTime()
      ));
    });

    const unsubscribeRequests = onSnapshot(requestsQuery, (snapshot) => {
      const requestTasks = snapshot.docs.map(doc => ({
        id: doc.id,
        type: doc.data().type || 'Emergency',
        ...doc.data(),
        location: {
          address: doc.data().location?.address || 'Unknown',
          lat: doc.data().location?.latitude || 0,
          lng: doc.data().location?.longitude || 0
        }
      }));

      setTasks(prevTasks => [...prevTasks, ...requestTasks].sort((a, b) => 
        new Date(b.assignedAt || 0).getTime() - new Date(a.assignedAt || 0).getTime()
      ));
    });

    return () => {
      unsubscribeSos();
      unsubscribeRequests();
    };
  }, [volunteerId]);

  const onRefresh = () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1000);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.welcomeText}>Welcome, {volunteerData.name}</Text>
        <Text style={styles.statusText}>Status: {volunteerData.status}</Text>
        <Text style={styles.tasksCount}>{tasks.length} Active Tasks</Text>
      </View>
      
      <FlatList
        data={tasks.filter(task => task.status !== 'completed')}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TaskCard 
            task={item} 
            onPress={() => navigation.navigate('TaskDetail', { task: item, volunteerId })}
          />
        )}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        ListEmptyComponent={() => (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No tasks assigned</Text>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  header: { backgroundColor: 'white', padding: 20, borderBottomWidth: 1, borderBottomColor: '#eee' },
  welcomeText: { fontSize: 20, fontWeight: 'bold', marginBottom: 5 },
  statusText: { fontSize: 14, color: '#666', marginBottom: 5 },
  tasksCount: { fontSize: 16, color: '#007AFF', fontWeight: '600' },
  emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', marginTop: 100 },
  emptyText: { fontSize: 16, color: '#666' }
});