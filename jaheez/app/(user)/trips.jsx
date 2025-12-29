import React, { useMemo, useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Image } from 'react-native';
import { FontAwesome5 } from '@expo/vector-icons';
import SideMenu from '../../components/SideMenu';
import styles from '../../styles/user/trips.styles';
import { COLORS } from '../../constants/constants';

const tripsData = [
  {
    id: '44066780',
    date: '2025/09/25',
    time: '3:40 م',
    plate: '52-XYZ-7',
    rating: 4,
    avatar: require('../../assets/images/driver.png'),
  },
  {
    id: '44066781',
    date: '2025/09/25',
    time: '3:40 م',
    plate: '52-XYZ-7',
    rating: 4,
    avatar: require('../../assets/images/driver.png'),
  },
  {
    id: '44066782',
    date: '2025/09/25',
    time: '3:40 م',
    plate: '52-XYZ-7',
    rating: 4,
    avatar: require('../../assets/images/driver.png'),
  },
  {
    id: '44066783',
    date: '2025/09/25',
    time: '3:40 م',
    plate: '52-XYZ-7',
    rating: 4,
    avatar: require('../../assets/images/driver.png'),
  },
];

const Trips = () => {
  const [tab, setTab] = useState('mine');

  const visibleTrips = useMemo(() => tripsData, [tab]);

  return (
    <View style={styles.container}>
      <SideMenu />

      <View style={styles.tabsWrapper}>
        <TouchableOpacity
          style={[styles.tab, tab === 'mine' ? styles.tabActive : styles.tabInactive]}
          activeOpacity={0.9}
          onPress={() => setTab('mine')}
        >
          <Text style={tab === 'mine' ? styles.tabTextActive : styles.tabTextInactive}>رحلاتي الخاصة</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, tab === 'other' ? styles.tabActive : styles.tabInactive]}
          activeOpacity={0.9}
          onPress={() => setTab('other')}
        >
          <Text style={tab === 'other' ? styles.tabTextActive : styles.tabTextInactive}>رحلات لشخص آخر</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.list} showsVerticalScrollIndicator={false}>
        {visibleTrips.map((trip) => (
          <View key={trip.id} style={styles.card}>
            <View style={styles.cardLeft}>
              <Text style={styles.dateText}>{trip.date}</Text>
              <Text style={styles.timeText}>م {trip.time}</Text>
              <Text style={styles.idText}>{trip.id}#</Text>
            </View>

            <View style={styles.cardRight}>
              <Text style={styles.plateText}>{trip.plate}</Text>
              <View style={styles.starsRow}>
                {Array.from({ length: 5 }).map((_, idx) => (
                  <FontAwesome5
                    key={idx}
                    name="star"
                    size={14}
                    color={idx < trip.rating ? '#f4c430' : COLORS.ExtraLightTextColor}
                  />
                ))}
              </View>
            </View>
            <View style={styles.avatarWrap}>
            <Image source={trip.avatar} style={styles.avatar} />
            <View style={styles.badge}>
                <FontAwesome5 name="user-alt" size={12} color={COLORS.whiteTextColor} />
            </View>
            </View>
          </View>
        ))}
      </ScrollView>
    </View>
  );
};

export default Trips;
