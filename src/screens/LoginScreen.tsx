import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../config/firebase';
import { StackScreenProps } from '@react-navigation/stack';
import { RootStackParamList } from '../../App';

type Props = StackScreenProps<RootStackParamList, 'Login'>;

export default function LoginScreen({ navigation }: Props) {
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!phone.trim()) {
      Alert.alert('Error', 'Please enter your phone number');
      return;
    }

    setLoading(true);
    try {
      const q = query(collection(db, 'volunteers'), where('phone', '==', phone));
      const querySnapshot = await getDocs(q);
      
      if (querySnapshot.empty) {
        Alert.alert('Error', 'Volunteer not found');
        setLoading(false);
        return;
      }

      const volunteerData = querySnapshot.docs[0].data();
      const volunteerId = querySnapshot.docs[0].id;
      
      navigation.replace('TaskList', { 
        volunteerId, 
        volunteerData: { ...volunteerData, id: volunteerId }
      });
    } catch (error) {
      Alert.alert('Error', 'Login failed');
    }
    setLoading(false);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Volunteer Login</Text>
      <TextInput
        style={styles.input}
        placeholder="Enter your phone number"
        value={phone}
        onChangeText={setPhone}
        keyboardType="phone-pad"
      />
      <TouchableOpacity 
        style={[styles.button, loading && styles.buttonDisabled]}
        onPress={handleLogin}
        disabled={loading}
      >
        <Text style={styles.buttonText}>
          {loading ? 'Logging in...' : 'Login'}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: 20, backgroundColor: '#f5f5f5' },
  title: { fontSize: 28, fontWeight: 'bold', textAlign: 'center', marginBottom: 30 },
  input: { borderWidth: 1, borderColor: '#ddd', padding: 15, borderRadius: 8, marginBottom: 20, backgroundColor: 'white' },
  button: { backgroundColor: '#007AFF', padding: 15, borderRadius: 8, alignItems: 'center' },
  buttonDisabled: { backgroundColor: '#ccc' },
  buttonText: { color: 'white', fontSize: 16, fontWeight: 'bold' }
});