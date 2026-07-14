import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, ScrollView, Platform, Image, Alert } from 'react-native';
import MapView, { Marker } from '../components/app-map';
import { useRouter } from 'expo-router';
import { useBinContext } from '../contexts/BinContext';
import { Colors } from '../constants/theme';

export default function DetailScreen() {
  const router = useRouter();
  const { selectedBin, setSelectedBin, removeBin } = useBinContext();

  const handleDelete = () => {
    Alert.alert(
      'ゴミ箱の削除',
      '本当にこのゴミ箱を削除しますか？',
      [
        { text: 'キャンセル', style: 'cancel' },
        { 
          text: '削除する', 
          style: 'destructive', 
          onPress: async () => {
            if (selectedBin) {
              try {
                await removeBin(selectedBin.id);
                setSelectedBin(null);
                router.back();
              } catch {
                Alert.alert('削除できませんでした', 'バックエンドとの通信を確認してください。');
              }
            }
          }
        }
      ]
    );
  };

  if (!selectedBin) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <Text style={styles.backIcon}>＜</Text>
          </TouchableOpacity>
        </View>
        <Text style={{ textAlign: 'center', marginTop: 50, color: Colors.textMain }}>データが見つかりません</Text>
      </SafeAreaView>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.topArea}>
        <MapView
          style={StyleSheet.absoluteFillObject}
          initialRegion={{
            latitude: selectedBin.latitude,
            longitude: selectedBin.longitude,
            latitudeDelta: 0.005,
            longitudeDelta: 0.005,
          }}
          scrollEnabled={false}
          zoomEnabled={false}
        >
          <Marker coordinate={{ latitude: selectedBin.latitude, longitude: selectedBin.longitude }}>
            <View style={{ width: 16, height: 16, borderRadius: 8, backgroundColor: Colors.primary, borderWidth: 3, borderColor: Colors.surface }} />
          </Marker>
        </MapView>

        {selectedBin.imageUrl ? (
          <Image source={{ uri: selectedBin.imageUrl }} style={styles.photoMock} />
        ) : (
          <View style={styles.photoMockFallback}>
            <Text style={styles.photoMockIcon}>🗑️</Text>
          </View>
        )}
      </View>

      <TouchableOpacity style={styles.backButtonAbsolute} onPress={() => router.back()}>
        <Text style={styles.backIcon}>＜</Text>
      </TouchableOpacity>

      <View style={styles.detailCard}>
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>
          
          <View style={styles.titleRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.screenTitle}>ゴミ箱の詳細</Text>
              <Text style={styles.binTitle}>{selectedBin.title}</Text>
            </View>
            <View style={styles.helpfulBadge}>
              <Text style={styles.helpfulBadgeText}>助かった！ {selectedBin.helpfulCount}</Text>
            </View>
          </View>

          <Text style={styles.distanceText}>現在地から 約{selectedBin.distance || '?'}m</Text>
          <Text style={styles.lastCheckedText}>最終確認：{selectedBin.lastChecked}</Text>

          <View style={styles.categoriesRow}>
            {selectedBin.categories.map(cat => (
              <View key={cat} style={styles.chip}><Text style={styles.chipText}>{cat}</Text></View>
            ))}
          </View>

          <View style={styles.infoBox}>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>利用時間：</Text>
              <Text style={styles.infoValue}>{selectedBin.availableTime || '24時間利用可'}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>清潔度：</Text>
              <Text style={styles.infoValue}>{selectedBin.cleanliness}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>見つけやすさ：</Text>
              <Text style={styles.infoValue}>{selectedBin.visibility}</Text>
            </View>
            <View style={styles.memoBox}>
              <Text style={styles.memoText}>{selectedBin.memo}</Text>
            </View>
          </View>

          <View style={styles.actionGroup}>
            <Text style={styles.wikiText}>この情報はみんなで更新できます</Text>
            <TouchableOpacity style={styles.secondaryButton}>
              <Text style={styles.secondaryButtonIcon}>👍</Text>
              <Text style={styles.secondaryButtonText}>助かった！</Text>
            </TouchableOpacity>
            <View style={styles.rowButtons}>
              <TouchableOpacity style={styles.tertiaryButton} onPress={() => router.push('/edit')}>
                <Text style={styles.tertiaryButtonText}>✎ 情報を編集提案</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.tertiaryButton}>
                <Text style={styles.tertiaryButtonText}>⚠ 問題を報告</Text>
              </TouchableOpacity>
            </View>
            
            <TouchableOpacity style={styles.deleteButton} onPress={handleDelete}>
              <Text style={styles.deleteButtonText}>🗑️ このゴミ箱を削除</Text>
            </TouchableOpacity>
          </View>

        </ScrollView>
      </View>

      <View style={styles.footer}>
        <TouchableOpacity style={styles.mainCtaButton}>
          <Text style={styles.mainCtaButtonText}>📍 ここへ行く</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  topArea: { height: '35%', backgroundColor: '#E8F4F8', position: 'relative' },
  photoMock: { position: 'absolute', right: 20, bottom: 40, width: 80, height: 80, borderRadius: 16 },
  photoMockFallback: { position: 'absolute', right: 20, bottom: 40, width: 80, height: 80, borderRadius: 16, backgroundColor: Colors.surface, justifyContent: 'center', alignItems: 'center', shadowColor: Colors.shadow, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 1, shadowRadius: 8, elevation: 4 },
  photoMockIcon: { fontSize: 32 },
  backButtonAbsolute: { position: 'absolute', top: Platform.OS === 'ios' ? 60 : 40, left: 20, width: 44, height: 44, borderRadius: 22, backgroundColor: Colors.surface, justifyContent: 'center', alignItems: 'center', shadowColor: Colors.shadow, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.5, shadowRadius: 4, elevation: 2, zIndex: 10 },
  backButton: { width: 44, height: 44, borderRadius: 22, backgroundColor: Colors.surface, justifyContent: 'center', alignItems: 'center' },
  backIcon: { fontSize: 18, color: Colors.textMain, fontWeight: 'bold' },
  header: { padding: 20, paddingTop: 60 },
  detailCard: { flex: 1, backgroundColor: Colors.surface, borderTopLeftRadius: 32, borderTopRightRadius: 32, marginTop: -32, padding: 24, paddingBottom: 0, shadowColor: Colors.shadow, shadowOffset: { width: 0, height: -4 }, shadowOpacity: 1, shadowRadius: 16, elevation: 10 },
  titleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 },
  screenTitle: { fontSize: 12, color: Colors.textSub, marginBottom: 4, fontWeight: 'bold' },
  binTitle: { fontSize: 22, fontWeight: 'bold', color: Colors.textMain },
  helpfulBadge: { backgroundColor: Colors.primaryLight, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 999 },
  helpfulBadgeText: { color: Colors.primary, fontSize: 12, fontWeight: 'bold' },
  distanceText: { fontSize: 14, color: Colors.textMain, marginBottom: 4, fontWeight: '500' },
  lastCheckedText: { fontSize: 12, color: Colors.textSub, marginBottom: 20 },
  categoriesRow: { flexDirection: 'row', flexWrap: 'wrap', marginBottom: 24 },
  chip: { backgroundColor: Colors.background, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8, marginRight: 8, marginBottom: 8, borderWidth: 1, borderColor: Colors.border },
  chipText: { fontSize: 12, color: Colors.textMain, fontWeight: '500' },
  infoBox: { backgroundColor: Colors.background, borderRadius: 16, padding: 16, marginBottom: 24 },
  infoRow: { flexDirection: 'row', marginBottom: 8 },
  infoLabel: { width: 100, fontSize: 13, color: Colors.textSub, fontWeight: 'bold' },
  infoValue: { flex: 1, fontSize: 13, color: Colors.textMain, fontWeight: '600' },
  memoBox: { marginTop: 8, paddingTop: 12, borderTopWidth: 1, borderTopColor: Colors.border },
  memoText: { fontSize: 13, color: Colors.textMain, lineHeight: 20 },
  actionGroup: { alignItems: 'center', marginTop: 10 },
  wikiText: { fontSize: 12, color: Colors.textSub, marginBottom: 12 },
  secondaryButton: { flexDirection: 'row', backgroundColor: Colors.surface, paddingHorizontal: 24, paddingVertical: 12, borderRadius: 999, borderWidth: 2, borderColor: Colors.primaryLight, alignItems: 'center', marginBottom: 16 },
  secondaryButtonIcon: { fontSize: 16, marginRight: 8 },
  secondaryButtonText: { fontSize: 14, color: Colors.primary, fontWeight: 'bold' },
  rowButtons: { flexDirection: 'row', justifyContent: 'space-between', width: '100%' },
  tertiaryButton: { backgroundColor: Colors.surface, paddingVertical: 10, paddingHorizontal: 16, borderRadius: 8, borderWidth: 1, borderColor: Colors.border },
  tertiaryButtonText: { fontSize: 12, color: Colors.textSub, fontWeight: 'bold' },
  deleteButton: { marginTop: 24, paddingVertical: 12, alignItems: 'center', backgroundColor: '#FFF0F0', borderRadius: 8, borderWidth: 1, borderColor: '#FFB3B3', width: '100%' },
  deleteButtonText: { color: '#D32F2F', fontSize: 13, fontWeight: 'bold' },
  footer: { position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: Colors.surface, paddingHorizontal: 20, paddingVertical: 20, paddingTop: 10, borderTopWidth: 1, borderTopColor: Colors.border },
  mainCtaButton: { backgroundColor: Colors.primary, borderRadius: 999, paddingVertical: 18, alignItems: 'center', shadowColor: Colors.primary, shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.4, shadowRadius: 16, elevation: 8 },
  mainCtaButtonText: { color: Colors.surface, fontSize: 16, fontWeight: 'bold' },
});
