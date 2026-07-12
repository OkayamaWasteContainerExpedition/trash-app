import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, Platform, Alert } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import * as Location from 'expo-location';
import { useRouter } from 'expo-router';
import { useBinContext, TrashBin } from '../contexts/BinContext';
import { Colors } from '../constants/theme';

export default function MapScreen() {
  const router = useRouter();
  const { bins, selectedBin, setSelectedBin, removeBin } = useBinContext();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('すべて');
  const [location, setLocation] = useState<Location.LocationObject | null>(null);
  const [region, setRegion] = useState({
    latitude: 34.665,
    longitude: 133.918,
    latitudeDelta: 0.05,
    longitudeDelta: 0.05,
  });

  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('権限エラー', '位置情報の利用が許可されていません。');
        return;
      }
      let loc = await Location.getCurrentPositionAsync({});
      setLocation(loc);
      setRegion({
        latitude: loc.coords.latitude,
        longitude: loc.coords.longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      });
    })();
  }, []);

  const handleBinPress = (bin: TrashBin) => {
    setSelectedBin(bin);
  };

  const goToDetail = () => {
    router.push('/detail');
  };

  const goToCamera = () => {
    router.push('/camera');
  };

  const centerOnUser = () => {
    if (location) {
      setRegion({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      });
    }
  };

  const handleDeleteBin = (id: string) => {
    Alert.alert('ゴミ箱の削除', '本当にこのゴミ箱を削除しますか？', [
      { text: 'キャンセル', style: 'cancel' },
      { text: '削除する', style: 'destructive', onPress: () => {
         removeBin(id);
         setSelectedBin(null);
      }}
    ]);
  };

  const filteredBins = bins.filter(bin => 
    selectedCategory === 'すべて' || bin.categories.includes(selectedCategory as any)
  );

  return (
    <View style={styles.container}>
      <MapView
        style={styles.mapBackground}
        region={region}
        onRegionChangeComplete={setRegion}
        showsUserLocation={true}
        showsMyLocationButton={false}
      >
        {filteredBins.map((bin) => (
          <Marker
            key={bin.id}
            coordinate={{ latitude: bin.latitude, longitude: bin.longitude }}
            onPress={() => handleBinPress(bin)}
          >
            <View style={[styles.pin, selectedBin?.id === bin.id && styles.selectedPin]}>
              <Text style={styles.pinIcon}>🗑️</Text>
            </View>
          </Marker>
        ))}
      </MapView>

      {/* 検索・絞り込みエリア */}
      <View style={styles.header}>
        <View style={styles.searchBar}>
          <Text style={styles.searchIcon}>🔍</Text>
          <TextInput
            style={styles.searchInput}
            placeholder="岡山駅・後楽園・表町で探す"
            placeholderTextColor={Colors.textSub}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipContainer}>
          {['すべて', '燃えるごみ', 'ペットボトル', '缶', 'ビン', 'プラスチック', '紙', 'その他'].map(cat => {
            const isActive = selectedCategory === cat;
            return (
              <TouchableOpacity 
                key={cat} 
                style={[styles.chip, isActive && styles.chipActive]}
                onPress={() => setSelectedCategory(cat)}
              >
                <Text style={isActive ? styles.chipTextActive : styles.chipText}>{cat}</Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* 現在地ボタン */}
      <TouchableOpacity style={styles.locationButton} onPress={centerOnUser}>
        <Text style={styles.locationIcon}>📍</Text>
      </TouchableOpacity>

      {/* 下部コンテンツ */}
      <View style={styles.bottomContainer}>
        {selectedBin && (
          <TouchableOpacity style={styles.miniCard} onPress={goToDetail}>
            <View style={styles.miniCardIcon}><Text>🗑️</Text></View>
            <View style={styles.miniCardContent}>
              <Text style={styles.miniCardTitle}>{selectedBin.title}</Text>
              <Text style={styles.miniCardDistance}>現在地から 約{selectedBin.distance || '?'}m</Text>
              <View style={styles.miniCardCategories}>
                {selectedBin.categories.slice(0,3).map(cat => (
                  <View key={cat} style={styles.smallChip}><Text style={styles.smallChipText}>{cat}</Text></View>
                ))}
              </View>
            </View>
            <TouchableOpacity 
              style={styles.deleteIconBtn} 
              onPress={(e) => { e.stopPropagation(); handleDeleteBin(selectedBin.id); }}
            >
              <Text style={styles.deleteIconText}>削除</Text>
            </TouchableOpacity>
            <Text style={styles.chevron}>＞</Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity style={styles.fab} onPress={goToCamera}>
          <Text style={styles.fabText}>＋ ゴミ箱を登録</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  mapBackground: { ...StyleSheet.absoluteFillObject },
  pin: { width: 44, height: 44, borderRadius: 22, backgroundColor: Colors.primary, justifyContent: 'center', alignItems: 'center', borderWidth: 3, borderColor: Colors.surface, shadowColor: Colors.primary, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.4, shadowRadius: 6, elevation: 5 },
  selectedPin: { transform: [{ scale: 1.25 }], borderColor: Colors.primaryLight, borderWidth: 4 },
  pinIcon: { fontSize: 20 },
  header: { paddingHorizontal: 20, paddingTop: Platform.OS === 'ios' ? 60 : 40, zIndex: 5 },
  searchBar: { flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.surface, borderRadius: 24, paddingHorizontal: 16, height: 48, shadowColor: Colors.shadow, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 1, shadowRadius: 12, elevation: 4, marginBottom: 16 },
  searchIcon: { fontSize: 18, marginRight: 8 },
  searchInput: { flex: 1, fontSize: 15, color: Colors.textMain, fontWeight: '500' },
  chipContainer: { flexDirection: 'row', marginBottom: 10 },
  chip: { backgroundColor: Colors.surface, paddingHorizontal: 18, paddingVertical: 10, borderRadius: 999, marginRight: 8, shadowColor: Colors.shadow, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.5, shadowRadius: 4, elevation: 2 },
  chipActive: { backgroundColor: Colors.textMain },
  chipText: { color: Colors.textMain, fontSize: 13, fontWeight: '600' },
  chipTextActive: { color: Colors.surface, fontSize: 13, fontWeight: '600' },
  locationButton: { position: 'absolute', right: 20, bottom: 200, width: 56, height: 56, borderRadius: 28, backgroundColor: Colors.surface, justifyContent: 'center', alignItems: 'center', shadowColor: Colors.shadow, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 1, shadowRadius: 8, elevation: 4 },
  locationIcon: { fontSize: 24 },
  bottomContainer: { position: 'absolute', bottom: 40, left: 20, right: 20, alignItems: 'center' },
  miniCard: { width: '100%', backgroundColor: Colors.surface, borderRadius: 24, padding: 16, flexDirection: 'row', alignItems: 'center', marginBottom: 20, shadowColor: Colors.shadow, shadowOffset: { width: 0, height: 8 }, shadowOpacity: 1, shadowRadius: 16, elevation: 6 },
  miniCardIcon: { width: 56, height: 56, borderRadius: 16, backgroundColor: Colors.primaryLight, justifyContent: 'center', alignItems: 'center', marginRight: 16 },
  miniCardContent: { flex: 1 },
  miniCardTitle: { fontSize: 16, fontWeight: 'bold', color: Colors.textMain, marginBottom: 6 },
  miniCardDistance: { fontSize: 13, color: Colors.textSub, marginBottom: 8 },
  miniCardCategories: { flexDirection: 'row' },
  smallChip: { backgroundColor: Colors.background, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8, marginRight: 6, borderWidth: 1, borderColor: Colors.border },
  smallChipText: { fontSize: 11, color: Colors.textMain, fontWeight: '500' },
  deleteIconBtn: { padding: 8, backgroundColor: '#FFE6E6', borderRadius: 8, marginRight: 8 },
  deleteIconText: { fontSize: 12, color: '#D32F2F', fontWeight: 'bold' },
  chevron: { fontSize: 20, color: Colors.textSub, fontWeight: 'bold' },
  fab: { backgroundColor: Colors.primary, paddingHorizontal: 32, paddingVertical: 18, borderRadius: 999, shadowColor: Colors.primary, shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.4, shadowRadius: 16, elevation: 8 },
  fabText: { color: Colors.surface, fontSize: 16, fontWeight: 'bold' },
});
