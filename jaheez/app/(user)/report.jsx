import React, { useMemo, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, Keyboard, TouchableWithoutFeedback, Alert } from 'react-native';
import { FontAwesome5 } from '@expo/vector-icons';
import SideMenu from '../../components/SideMenu';
import styles from '../../styles/user/report.styles';

const Report = () => {
  const [mode, setMode] = useState('driver'); // 'driver' | 'general'
  const [selectedTripId, setSelectedTripId] = useState(null);
  const [description, setDescription] = useState('');

  const trips = useMemo(
    () => [
      { id: '44066780', date: '2025/09/25', driver: 'حسن حسني' },
      { id: '44066781', date: '2025/09/20', driver: 'معتز راشد' },
      { id: '44066782', date: '2025/09/12', driver: 'سالم علي' },
    ],
    []
  );

  const handleSubmit = () => {
    if (!description.trim()) {
      Alert.alert('أضف تفاصيل البلاغ', 'يرجى كتابة وصف مختصر للمشكلة.');
      return;
    }
    if (mode === 'driver' && !selectedTripId) {
      Alert.alert('اختر رحلة', 'يرجى اختيار رحلة للإبلاغ عن السائق.');
      return;
    }
    // Placeholder submit behavior
    Alert.alert('تم الإرسال', 'تم استلام البلاغ وسنتابع معك.');
    setDescription('');
    setSelectedTripId(null);
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
      <View style={styles.container}>
        <SideMenu />

        {/* <View style={styles.header}>
          <Text style={styles.title}>إرسال بلاغ</Text>
          <Text style={styles.subtitle}>اختر نوع البلاغ وأخبرنا بالتفاصيل.</Text>
        </View> */}

        <View style={styles.modeSwitcher}>
          <TouchableOpacity
            style={[styles.modeBtn, mode === 'driver' ? styles.modeBtnActive : styles.modeBtnInactive]}
            activeOpacity={0.85}
            onPress={() => setMode('driver')}
          >
            <Text style={mode === 'driver' ? styles.modeTextActive : styles.modeTextInactive}>بلاغ عن سائق</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.modeBtn, mode === 'general' ? styles.modeBtnActive : styles.modeBtnInactive]}
            activeOpacity={0.85}
            onPress={() => setMode('general')}
          >
            <Text style={mode === 'general' ? styles.modeTextActive : styles.modeTextInactive}>بلاغ عام</Text>
          </TouchableOpacity>
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          {mode === 'driver' && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>اختر الرحلة</Text>
              <ScrollView contentContainerStyle={styles.tripList} showsVerticalScrollIndicator={false}>
                {trips.map((trip) => {
                  const isActive = trip.id === selectedTripId;
                  return (
                    <TouchableOpacity
                      key={trip.id}
                      style={[styles.tripCard, isActive && styles.tripCardActive]}
                      activeOpacity={0.85}
                      onPress={() => setSelectedTripId(trip.id)}
                    >
                      <View style={styles.tripMetaRow}>
                        <View style={styles.tripMeta}>
                          <Text style={styles.tripLabel}>السائق</Text>
                          <Text style={styles.tripValue}>{trip.driver}</Text>
                        </View>
                        <View style={styles.tripMeta}>
                          <Text style={styles.tripLabel}>التاريخ</Text>
                          <Text style={styles.tripValue}>{trip.date}</Text>
                        </View>
                      </View>
                      {/* {isActive && (
                        <View style={styles.chipSelected}>
                          <FontAwesome5 name="check" size={12} color={styles.chipText.color} />
                          <Text style={styles.chipText}>تم الاختيار</Text>
                        </View>
                      )} */}
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            </View>
          )}

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>وصف البلاغ</Text>
            <TextInput
              style={styles.textArea}
              placeholder="أدخل تفاصيل المشكلة هنا"
              placeholderTextColor={styles.placeholderColor}
              multiline
              numberOfLines={4}
              textAlign="right"
              value={description}
              onChangeText={setDescription}
            />
          </View>

          <TouchableOpacity style={styles.submitBtn} activeOpacity={0.9} onPress={handleSubmit}>
            <Text style={styles.submitText}>إرسال البلاغ</Text>
          </TouchableOpacity>
        </ScrollView>
      </View>
    </TouchableWithoutFeedback>
  );
};

export default Report;
