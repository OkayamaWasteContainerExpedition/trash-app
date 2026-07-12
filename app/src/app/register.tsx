import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, ScrollView, TextInput, Platform, Image, Modal, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import * as Location from 'expo-location';
import MapView, { Marker } from 'react-native-maps';
import { useBinContext, BinCategory, AvailableTime } from '../contexts/BinContext';
import { Colors } from '../constants/theme';

const ALL_CATEGORIES: BinCategory[] = ['燃えるごみ', 'ペットボトル', '缶', 'ビン', 'プラスチック', '紙', 'その他'];

export default function RegisterScreen() {
  const router = useRouter();
  const { addBin, capturedImage, setCapturedImage } = useBinContext();
  
  const [categories, setCategories] = useState<BinCategory[]>([]);
  const [cleanliness, setCleanliness] = useState<'きれい' | '普通' | '少し注意'>('きれい');
  const [visibility, setVisibility] = useState<'すぐ見つかる' | '少し探す' | '目印が必要'>('すぐ見つかる');
  const [availableTime, setAvailableTime] = useState<AvailableTime>('24時間利用可');
  const [memo, setMemo] = useState('');
  const [address, setAddress] = useState('新しいゴミ箱');
  
  const [location, setLocation] = useState<Location.LocationObject | null>(null);
  
  // 地図調整モーダル用ステート
  const [isMapModalVisible, setMapModalVisible] = useState(false);
  const [tempRegion, setTempRegion] = useState({ latitude: 34.665, longitude: 133.918, latitudeDelta: 0.005, longitudeDelta: 0.005 });

  // AI解析モック用ステート
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  useEffect(() => {
    if (capturedImage) {
      setIsAnalyzing(true);
      const timer = setTimeout(() => {
        setCategories(['ペットボトル', '缶']);
        setCleanliness('きれい');
        setVisibility('すぐ見つかる');
        setAvailableTime('24時間利用可');
        setIsAnalyzing(false);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [capturedImage]);

  useEffect(() => {
    (async () => {
      let loc = await Location.getCurrentPositionAsync({});
      setLocation(loc);
    })();
  }, []);

  const toggleCategory = (cat: BinCategory) => {
    setCategories(prev => prev.includes(cat) ? prev.filter(c => c !== cat) : [...prev, cat]);
  };

  const handleRegister = async () => {
    await addBin({
      latitude: location ? location.coords.latitude : 34.665,
      longitude: location ? location.coords.longitude : 133.918,
      title: address || '新しいゴミ箱',
      categories,
      cleanliness,
      visibility,
      availableTime,
      memo,
      helpfulCount: 0,
      lastChecked: '今日',
      imageUrl: capturedImage || undefined,
    });
    setCapturedImage(null);
    router.replace('/');
  };

  const openMapModal = () => {
    if (location) {
      setTempRegion({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        latitudeDelta: 0.005,
        longitudeDelta: 0.005,
      });
    }
    setMapModalVisible(true);
  };

  const confirmLocation = () => {
    setLocation({
      ...location,
      coords: { ...location?.coords, latitude: tempRegion.latitude, longitude: tempRegion.longitude }
    } as any);
    setMapModalVisible(false);
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* 画面上部へ飛ぶ原因となる KeyboardAvoidingView を削除し、ScrollView の automaticallyAdjustKeyboardInsets を利用 */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => { setCapturedImage(null); router.back(); }}>
          <Text style={styles.backIcon}>＜</Text>
        </TouchableOpacity>
        <Text style={styles.title}>新しいゴミ箱を登録</Text>
        <View style={{ width: 44 }} />
      </View>
      <Text style={styles.subtitle}>見つけた場所を、みんなのマップに追加しましょう。</Text>

      <ScrollView 
        style={styles.content} 
        showsVerticalScrollIndicator={false} 
        contentContainerStyle={{ paddingBottom: 150 }}
        automaticallyAdjustKeyboardInsets={true}
        keyboardDismissMode="on-drag"
      >
        {capturedImage ? (
          <Image source={{ uri: capturedImage }} style={styles.photoPreviewCard} />
        ) : (
          <View style={styles.photoPreviewCardFallback}>
            <View style={styles.photoStatus}><Text style={styles.photoStatusText}>写真なし</Text></View>
            <Text style={styles.photoIcon}>🗑️</Text>
          </View>
        )}

        <View style={styles.locationCard}>
          <View style={styles.miniMapMock}>
             {location ? (
               <MapView
                 style={StyleSheet.absoluteFillObject}
                 region={{
                   latitude: location.coords.latitude,
                   longitude: location.coords.longitude,
                   latitudeDelta: 0.005,
                   longitudeDelta: 0.005,
                 }}
                 scrollEnabled={false}
                 zoomEnabled={false}
                 pitchEnabled={false}
                 rotateEnabled={false}
               >
                 <Marker coordinate={{ latitude: location.coords.latitude, longitude: location.coords.longitude }} />
               </MapView>
             ) : (
               <View style={styles.miniMapPin}></View>
             )}
          </View>
          <View style={styles.locationInfo}>
            <TextInput
              style={styles.locationTitleInput}
              placeholder="住所・場所名を入力"
              placeholderTextColor={Colors.textSub}
              value={address}
              onChangeText={setAddress}
            />
            <Text style={styles.locationDesc}>{location ? '現在地周辺' : '現在地から自動取得中...'}</Text>
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
        <TouchableOpacity style={styles.submitButton} onPress={handleRegister}>
          <Text style={styles.submitButtonText}>＋ マップに追加する</Text>
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
          {/* 中央のピン */}
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

      {/* AI解析中のオーバーレイ */}
      {isAnalyzing && (
        <View style={styles.aiOverlay}>
          <View style={styles.aiDialog}>
            <ActivityIndicator size="large" color={Colors.primary} />
            <Text style={styles.aiDialogText}>🤖 写真からAIが情報を解析中...</Text>
          </View>
        </View>
      )}
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
  photoPreviewCard: { width: '100%', height: 160, borderRadius: 24, marginBottom: 20 },
  photoPreviewCardFallback: { backgroundColor: '#EBE9EA', borderRadius: 24, height: 160, justifyContent: 'center', alignItems: 'center', marginBottom: 20 },
  photoStatus: { position: 'absolute', top: 16, left: 16, backgroundColor: Colors.surface, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 999, flexDirection: 'row', alignItems: 'center' },
  photoStatusText: { fontSize: 12, color: Colors.textMain, fontWeight: 'bold' },
  photoIcon: { fontSize: 64 },
  locationCard: { backgroundColor: Colors.surface, borderRadius: 24, padding: 16, flexDirection: 'row', alignItems: 'center', marginBottom: 24, shadowColor: Colors.shadow, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.5, shadowRadius: 8, elevation: 2 },
  miniMapMock: { width: 48, height: 48, borderRadius: 16, backgroundColor: '#E8F4F8', justifyContent: 'center', alignItems: 'center', marginRight: 16, overflow: 'hidden' },
  miniMapPin: { width: 12, height: 12, borderRadius: 6, backgroundColor: Colors.primary, borderWidth: 2, borderColor: Colors.surface },
  locationInfo: { flex: 1 },
  locationTitleInput: { fontSize: 16, fontWeight: 'bold', color: Colors.textMain, marginBottom: 4, padding: 0, borderBottomWidth: 1, borderBottomColor: Colors.border, paddingBottom: 4 },
  locationDesc: { fontSize: 11, color: Colors.textSub },
  adjustButton: { backgroundColor: Colors.background, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 999, borderWidth: 1, borderColor: Colors.border },
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
  
  // モーダル用スタイル
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
  
  aiOverlay: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'center', alignItems: 'center', zIndex: 100 },
  aiDialog: { backgroundColor: Colors.surface, padding: 32, borderRadius: 24, alignItems: 'center', shadowColor: Colors.shadow, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.5, shadowRadius: 12, elevation: 5 },
  aiDialogText: { marginTop: 20, fontSize: 16, fontWeight: 'bold', color: Colors.textMain },
});
