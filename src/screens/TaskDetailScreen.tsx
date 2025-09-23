import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert, Linking, ScrollView } from 'react-native';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../config/firebase';
import { StackScreenProps } from '@react-navigation/stack';
import { RootStackParamList } from '../../App';

type Props = StackScreenProps<RootStackParamList, 'TaskDetail'>;

export default function TaskDetailScreen({ route, navigation }: Props) {
  const { task, volunteerId } = route.params;
  const [updating, setUpdating] = useState(false);

  const updateTaskStatus = async (newStatus: string) => {
    setUpdating(true);
    try {
      const collection = task.type === 'SOS' ? 'sosAlerts' : 'emergencyRequests';
      const taskRef = doc(db, collection, task.id);
      
      const updates: any = { status: newStatus };
      if (newStatus === 'completed') {
        updates.completedAt = new Date().toISOString();
        updates.resolved = true;
        
        const volunteerRef = doc(db, 'volunteers', volunteerId);
        await updateDoc(volunteerRef, {
          status: 'available',
          currentAssignment: null
        });
      }
      
      await updateDoc(taskRef, updates);
      Alert.alert('Success', `Task marked as ${newStatus}`);
      if (newStatus === 'completed') navigation.goBack();
    } catch (error) {
      Alert.alert('Error', 'Failed to update task');
    }
    setUpdating(false);
  };

  const openMaps = () => {
    const { lat, lng } = task.location;
    const url = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;
    Linking.openURL(url);
  };

  const callReporter = () => {
    const phone = task.contactNumber || task.contact;
    if (phone) Linking.openURL(`tel:${phone}`);
  };

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
      case 'completed': return '#34C759';
      default: return '#666';
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.taskType}>{task.type === 'SOS' ? '🚨 SOS Alert' : `🆘 ${task.type}`}</Text>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(task.status) }]}>
          <Text style={styles.statusText}>{task.status || 'assigned'}</Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Reporter Information</Text>
        <Text style={styles.info}>Name: {task.reporterName || task.reporter || 'Anonymous'}</Text>
        <Text style={styles.info}>Phone: {task.contactNumber || task.contact || 'N/A'}</Text>
        {task.priority && (
          <View style={[styles.priorityBadge, { backgroundColor: getPriorityColor(task.priority) }]}>
            <Text style={styles.priorityText}>Priority: {task.priority.toUpperCase()}</Text>
          </View>
        )}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Location</Text>
        <Text style={styles.info}>{task.location.address}</Text>
        <Text style={styles.distance}>Distance: {task.estimatedDistance}km | ETA: {task.estimatedArrival} min</Text>
        <TouchableOpacity style={styles.mapButton} onPress={openMaps}>
          <Text style={styles.buttonText}>📍 Open in Maps</Text>
        </TouchableOpacity>
      </View>

      {task.description && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Description</Text>
          <Text style={styles.description}>{task.description}</Text>
        </View>
      )}

      {task.victimsCount > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Additional Info</Text>
          <Text style={styles.info}>Victims: {task.victimsCount}</Text>
        </View>
      )}

      <View style={styles.actions}>
        <TouchableOpacity 
          style={styles.callButton} 
          onPress={callReporter}
          disabled={!task.contactNumber && !task.contact}
        >
          <Text style={styles.buttonText}>📞 Call Reporter</Text>
        </TouchableOpacity>

        {task.status !== 'in-progress' && task.status !== 'completed' && (
          <TouchableOpacity 
            style={[styles.actionButton, styles.acceptButton]}
            onPress={() => updateTaskStatus('in-progress')}
            disabled={updating}
          >
            <Text style={styles.buttonText}>✅ Accept Task</Text>
          </TouchableOpacity>
        )}

        {task.status === 'in-progress' && (
          <TouchableOpacity 
            style={[styles.actionButton, styles.completeButton]}
            onPress={() => updateTaskStatus('completed')}
            disabled={updating}
          >
            <Text style={styles.buttonText}>🏁 Mark Completed</Text>
          </TouchableOpacity>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  header: { backgroundColor: 'white', padding: 20, borderBottomWidth: 1, borderBottomColor: '#eee', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  taskType: { fontSize: 20, fontWeight: 'bold' },
  statusBadge: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 15 },
  statusText: { color: 'white', fontSize: 12, fontWeight: 'bold' },
  section: { backgroundColor: 'white', margin: 10, padding: 15, borderRadius: 8 },
  sectionTitle: { fontSize: 16, fontWeight: 'bold', marginBottom: 10, color: '#333' },
  info: { fontSize: 14, color: '#666', marginBottom: 5 },
  distance: { fontSize: 12, color: '#007AFF', fontWeight: '600' },
  description: { fontSize: 14, color: '#333', lineHeight: 20 },
  priorityBadge: { marginTop: 10, paddingHorizontal: 10, paddingVertical: 5, borderRadius: 12, alignSelf: 'flex-start' },
  priorityText: { color: 'white', fontSize: 12, fontWeight: 'bold' },
  mapButton: { backgroundColor: '#007AFF', padding: 12, borderRadius: 8, marginTop: 10, alignItems: 'center' },
  actions: { margin: 10 },
  callButton: { backgroundColor: '#34C759', padding: 15, borderRadius: 8, marginBottom: 10, alignItems: 'center' },
  actionButton: { padding: 15, borderRadius: 8, marginBottom: 10, alignItems: 'center' },
  acceptButton: { backgroundColor: '#FF9500' },
  completeButton: { backgroundColor: '#34C759' },
  buttonText: { color: 'white', fontSize: 16, fontWeight: 'bold' }
});