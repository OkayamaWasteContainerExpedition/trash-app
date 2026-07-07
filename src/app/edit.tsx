import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, ScrollView, TextInput, Platform, Image, Modal, KeyboardAvoidingView } from 'react-native';
import { useRouter } from 'expo-router';
import MapView, { Marker } from 'react-native-maps';
import { useBinContext, BinCategory, AvailableTime } from '../contexts/BinContext';
import { Colors } from '../constants/theme';

const ALL_CATEGORIES: BinCategory[] = ['燃えるごみ', 'ペットボトル', '缶', 'ビン', 'プラスチック', '紙', 'その他'];

export default function EditScreen() {
  const router = useRouter();
  const { selectedBin, updateBin } = useBinContext();
  
  const [categories, setCategories] = useState<BinCategory[]>(selectedBin?.categories || []);
  const [cleanliness, setCleanliness] = useState(selectedBin?.cleanliness || 'きれい');
  const [visibility, setVisibility] = useState(selectedBin?.visibility || 'すぐ見つかる');
  const [availableTime, setAvailableTime] = useState<AvailableTime>(selectedBin?.availableTime || '24時間利用可');
  const [memo, setMemo] = useState(selectedBin?.memo || '');
  const [address, setAddress] = useState(selectedBin?.title || '');
  
  const [location, setLocation] = useState({ latitude: selectedBin?.latitude || 34.665, longitude: selectedBin?.longitude || 133.918 });
  
  const [isMapModalVisible, setMapModalVisible] = useState(false);
  const [tempRegion, setTempRegion] = useState({ latitude: location.latitude, longitude: location.longitude, latitudeDelta: 0.005, longitudeDelta: 0.005 });

  if (!selectedBin) {
    return (
      <SafeAreaView style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <Text>データが見つかりません</Text>
        <TouchableOpacity onPress={() => router.back()} style={{ marginTop: 20 }}><Text style={{ color: Colors.primary }}>戻る</Text></TouchableOpacity>
      </SafeAreaView>
    );
  }

  const toggleCategory = (cat: BinCategory) => {
    setCategories(prev => prev.includes(cat) ? prev.filter(c => c !== cat) : [...prev, cat]);
  };

  const handleUpdate = async () => {
    await updateBin({
      ...selectedBin,
      latitude: location.latitude,
      longitude: location.longitude,
      title: address || '名称未設定のゴミ箱',
      categories,
      cleanliness,
      visibility,
      availableTime,
      memo,
      lastChecked: '今日',
    });
    router.back();
  };

  const openMapModal = () => {
    setTempRegion({
      latitude: location.latitude,
      longitude: location.longitude,
      latitudeDelta: 0.005,
      longitudeDelta: 0.005,
    });
    setMapModalVisible(true);
  };

  const confirmLocation = () => {
    setLocation({ latitude: tempRegion.latitude, longitude: tempRegion.longitude });
    setMapModalVisible(false);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Text style={styles.backIcon}>✕</Text>
        </TouchableOpacity>
        <Text style={styles.title}>ゴミ箱情報の編集</Text>
        <View style={{ width: 44 }} />
      </View>
      <Text style={styles.subtitle}>みんなが正しい情報を共有できるように修正します。</Text>

      <ScrollView 
        style={styles.content} 
        showsVerticalScrollIndicator={false} 
        contentContainerStyle={{ paddingBottom: 150 }}
        automaticallyAdjustKeyboardInsets={true}
        keyboardDismissMode="on-drag"
      >
        <View style={styles.locationCard}>
          <View style={styles.miniMapMock}>
             <MapView
               style={StyleSheet.absoluteFillObject}
               region={{
                 latitude: location.latitude,
                 longitude: location.longitude,
                 latitudeDelta: 0.005,
                 longitudeDelta: 0.005,
               }}
               scrollEnabled={false}
               zoomEnabled={false}
               pitchEnabled={false}
               rotateEnabled={false}
             >
               <Marker coordinate={{ latitude: location.latitude, longitude: location.longitude }} />
             </MapView>
          </View>
          <View style={styles.locationInfo}>
            <TextInput
              style={styles.locationTitleInput}
              placeholder="住所・場所名を入力"
              placeholderTextColor={Colors.textSub}
              value={address}
              onChangeText={setAddress}
            />
          </View>
          <TouchableOpacity style={styles.adjustButton} onPress={openMapModal}>
            <Text style={styles.adjustButtonText}>位置を調整</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.sectionTitle}>分別カテゴリ</Text>
        <View style={styles.chipGrid}>
          {ALL_CATEGORIES.map(cat => {
            const isActive = categories.includes(cat);
            return (
              <TouchableOpacity
                key={cat}
                style={[styles.chip, isActive && styles.chipActive]}
                onPress={() => toggleCategory(cat)}
              >
                <Text style={[styles.chipText, isActive && styles.chipTextActive]}>{cat}</Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <Text style={styles.sectionTitle}>利用可能時間</Text>
        <View style={styles.chipGrid}>
          {(['24時間利用可', '施設の営業時間のみ', 'その他（メモに記載）'] as AvailableTime[]).map(option => {
            const isActive = availableTime === option;
            return (
              <TouchableOpacity
                key={option}
                style={[styles.chip, isActive && styles.chipActive]}
                onPress={() => setAvailableTime(option)}
              >
                <Text style={[styles.chipText, isActive && styles.chipTextActive]}>{option}</Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <Text style={styles.sectionTitle}>清潔度</Text>
        <View style={styles.selectionGrid}>
          {(['きれい', '普通', '少し注意'] as const).map(option => (
            <TouchableOpacity
              key={option}
              style={[styles.selectBox, cleanliness === option && styles.selectBoxActive]}
              onPress={() => setCleanliness(option)}
            >
              <Text style={styles.selectBoxIcon}>
                {option === 'きれい' ? '✨' : option === '普通' ? '🙂' : '⚠️'}
              </Text>
              <Text style={[styles.selectBoxText, cleanliness === option && styles.selectBoxTextActive]}>{option}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.sectionTitle}>見つけやすさ</Text>
        <View style={styles.selectionGrid}>
          {(['すぐ見つかる', '少し探す', '目印が必要'] as const).map(option => (
            <TouchableOpacity
              key={option}
              style={[styles.selectBox, visibility === option && styles.selectBoxActive]}
              onPress={() => setVisibility(option)}
            >
              <Text style={styles.selectBoxIcon}>
                {option === 'すぐ見つかる' ? '👀' : option === '少し探す' ? '🔍' : '📍'}
              </Text>
              <Text style={[styles.selectBoxText, visibility === option && styles.selectBoxTextActive]}>{option}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.memoContainer}>
          <TextInput
            style={styles.memoInput}
            placeholder="使える時間・注意点などをメモ"
            placeholderTextColor={Colors.textSub}
            value={memo}
            onChangeText={setMemo}
            multiline
          />
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity style={styles.submitButton} onPress={handleUpdate}>
          <Text style={styles.submitButtonText}>更新内容を保存する</Text>
        </TouchableOpacity>
      </View>

      {/* 地図調整用モーダル */}
      <Modal visible={isMapModalVisible} animationType="slide" transparent={false}>
        <View style={{ flex: 1 }}>
          <MapView 
            style={{ flex: 1 }}
            region={tempRegion}
            onRegionChangeComplete={setTempRegion}
          />
          <View style={styles.centerPinAbsolute} pointerEvents="none">
            <Text style={styles.centerPinIcon}>📍</Text>
          </View>
          
          <SafeAreaView style={styles.mapModalFooter}>
            <View style={styles.mapModalFooterContent}>
              <Text style={styles.mapModalInstruction}>マップを動かして位置を調整してください</Text>
              <View style={styles.mapModalButtons}>
                <TouchableOpacity style={styles.mapModalCancel} onPress={() => setMapModalVisible(false)}>
                  <Text style={styles.mapModalCancelText}>キャンセル</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.mapModalConfirm} onPress={confirmLocation}>
                  <Text style={styles.mapModalConfirmText}>この位置に決定</Text>
                </TouchableOpacity>
              </View>
            </View>
          </SafeAreaView>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: Platform.OS === 'ios' ? 20 : 40, paddingBottom: 10 },
  backButton: { width: 44, height: 44, borderRadius: 22, backgroundColor: Colors.surface, justifyContent: 'center', alignItems: 'center', shadowColor: Colors.shadow, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.5, shadowRadius: 4, elevation: 2 },
  backIcon: { fontSize: 18, color: Colors.textMain, fontWeight: 'bold' },
  title: { fontSize: 18, fontWeight: 'bold', color: Colors.textMain },
  subtitle: { fontSize: 13, color: Colors.textSub, paddingHorizontal: 20, marginBottom: 20, textAlign: 'center' },
  content: { paddingHorizontal: 20 },
  locationCard: { backgroundColor: Colors.surface, borderRadius: 24, padding: 16, flexDirection: 'row', alignItems: 'center', marginBottom: 24, shadowColor: Colors.shadow, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.5, shadowRadius: 8, elevation: 2 },
  miniMapMock: { width: 48, height: 48, borderRadius: 16, backgroundColor: '#E8F4F8', justifyContent: 'center', alignItems: 'center', marginRight: 16, overflow: 'hidden' },
  locationInfo: { flex: 1 },
  locationTitleInput: { fontSize: 16, fontWeight: 'bold', color: Colors.textMain, padding: 0, borderBottomWidth: 1, borderBottomColor: Colors.border, paddingBottom: 4 },
  adjustButton: { backgroundColor: Colors.background, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 999, borderWidth: 1, borderColor: Colors.border, marginLeft: 10 },
  adjustButtonText: { fontSize: 11, color: Colors.textMain, fontWeight: 'bold' },
  sectionTitle: { fontSize: 15, fontWeight: 'bold', color: Colors.textMain, marginBottom: 12 },
  chipGrid: { flexDirection: 'row', flexWrap: 'wrap', marginBottom: 24 },
  chip: { backgroundColor: Colors.surface, paddingHorizontal: 16, paddingVertical: 10, borderRadius: 999, marginRight: 8, marginBottom: 8, borderWidth: 1, borderColor: Colors.border },
  chipActive: { backgroundColor: Colors.primaryLight, borderColor: Colors.primary },
  chipText: { color: Colors.textMain, fontSize: 13, fontWeight: '600' },
  chipTextActive: { color: Colors.primary, fontSize: 13, fontWeight: 'bold' },
  selectionGrid: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 24 },
  selectBox: { flex: 1, backgroundColor: Colors.surface, borderRadius: 16, paddingVertical: 16, alignItems: 'center', marginHorizontal: 4, borderWidth: 1, borderColor: Colors.border },
  selectBoxActive: { backgroundColor: Colors.primaryLight, borderColor: Colors.primary },
  selectBoxIcon: { fontSize: 24, marginBottom: 8 },
  selectBoxText: { fontSize: 12, color: Colors.textMain, fontWeight: '600' },
  selectBoxTextActive: { color: Colors.primary },
  memoContainer: { backgroundColor: Colors.surface, borderRadius: 16, padding: 16, minHeight: 80, borderWidth: 1, borderColor: Colors.border },
  memoInput: { fontSize: 14, color: Colors.textMain },
  footer: { position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: Colors.background, paddingHorizontal: 20, paddingVertical: 20, paddingTop: 10 },
  submitButton: { backgroundColor: Colors.primary, borderRadius: 999, paddingVertical: 18, alignItems: 'center', shadowColor: Colors.primary, shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.4, shadowRadius: 16, elevation: 8 },
  submitButtonText: { color: Colors.surface, fontSize: 16, fontWeight: 'bold' },
  
  centerPinAbsolute: { position: 'absolute', top: '50%', left: '50%', marginLeft: -20, marginTop: -40, zIndex: 10 },
  centerPinIcon: { fontSize: 40 },
  mapModalFooter: { position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: Colors.surface, borderTopLeftRadius: 24, borderTopRightRadius: 24, shadowColor: '#000', shadowOffset: { width: 0, height: -4 }, shadowOpacity: 0.1, shadowRadius: 8, elevation: 10 },
  mapModalFooterContent: { padding: 20 },
  mapModalInstruction: { textAlign: 'center', fontSize: 14, color: Colors.textMain, fontWeight: 'bold', marginBottom: 20 },
  mapModalButtons: { flexDirection: 'row', justifyContent: 'space-between' },
  mapModalCancel: { flex: 1, backgroundColor: Colors.background, paddingVertical: 16, borderRadius: 999, alignItems: 'center', marginRight: 10, borderWidth: 1, borderColor: Colors.border },
  mapModalCancelText: { color: Colors.textSub, fontSize: 16, fontWeight: 'bold' },
  mapModalConfirm: { flex: 1, backgroundColor: Colors.primary, paddingVertical: 16, borderRadius: 999, alignItems: 'center', marginLeft: 10 },
  mapModalConfirmText: { color: Colors.surface, fontSize: 16, fontWeight: 'bold' },
});
