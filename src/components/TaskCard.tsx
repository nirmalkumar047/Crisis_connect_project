import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

interface TaskCardProps {
  task: any;
  onPress: () => void;
}

export default function TaskCard({ task, onPress }: TaskCardProps) {
  const getPriorityColor = (priority: string) => {
    switch(priority) {
      case 'high': return '#FF3B30';
      case 'medium': return '#FF9500';
      default: return '#34C759';
    }
  };

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'assigned': return '#007AFF';
      case 'in-progress': return '#FF9500';
      default: return '#666';
    }
  };

  const formatTime = (timestamp: string) => {
    if (!timestamp) return 'Just now';
    try {
      return new Date(timestamp).toLocaleTimeString();
    } catch {
      return 'Recently';
    }
  };

  return (
    <TouchableOpacity style={styles.card} onPress={onPress}>
      <View style={styles.header}>
        <Text style={styles.taskType}>
          {task.type === 'SOS' ? '🚨 SOS Alert' : `🆘 ${task.type}`}
        </Text>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(task.status) }]}>
          <Text style={styles.statusText}>{task.status || 'assigned'}</Text>
        </View>
      </View>
      
      <Text style={styles.reporter}>
        Reporter: {task.reporterName || task.reporter || 'Anonymous'}
      </Text>
      
      <Text style={styles.location}>📍 {task.location.address}</Text>
      
      {task.priority && (
        <View style={[styles.priorityBadge, { backgroundColor: getPriorityColor(task.priority) }]}>
          <Text style={styles.priorityText}>{task.priority.toUpperCase()}</Text>
        </View>
      )}
      
      <View style={styles.footer}>
        <Text style={styles.distance}>
          {task.estimatedDistance}km • {task.estimatedArrival} min
        </Text>
        <Text style={styles.time}>{formatTime(task.assignedAt)}</Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: 'white', margin: 10, padding: 15, borderRadius: 8, elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.2, shadowRadius: 2 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  taskType: { fontSize: 16, fontWeight: 'bold', flex: 1 },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12 },
  statusText: { color: 'white', fontSize: 10, fontWeight: 'bold' },
  reporter: { fontSize: 14, color: '#666', marginBottom: 5 },
  location: { fontSize: 14, color: '#333', marginBottom: 10 },
  priorityBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 10, alignSelf: 'flex-start', marginBottom: 10 },
  priorityText: { color: 'white', fontSize: 10, fontWeight: 'bold' },
  footer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  distance: { fontSize: 12, color: '#007AFF', fontWeight: '600' },
  time: { fontSize: 12, color: '#999' }
});