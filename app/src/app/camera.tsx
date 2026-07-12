import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, Alert } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import { Colors } from '../constants/theme';
import { useBinContext } from '../contexts/BinContext';

export default function CameraScreen() {
  const router = useRouter();
  const [permission, requestPermission] = useCameraPermissions();
  const cameraRef = useRef<CameraView>(null);
  const { setCapturedImage } = useBinContext();

  useEffect(() => {
    if (!permission?.granted) {
      requestPermission();
    }
  }, [permission]);

  const handleCapture = async () => {
    if (cameraRef.current) {
      const photo = await cameraRef.current.takePictureAsync();
      if (photo) {
        setCapturedImage(photo.uri);
        router.replace('/register');
      }
    }
  };

  const handlePickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: 'images',
      allowsEditing: true,
      quality: 1,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      setCapturedImage(result.assets[0].uri);
      router.replace('/register');
    }
  };

  const handleClose = () => {
    router.back();
  };

  if (!permission || !permission.granted) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <Text>カメラへのアクセスが必要です。</Text>
        <TouchableOpacity onPress={requestPermission} style={{ marginTop: 20 }}>
          <Text style={{ color: Colors.primary }}>許可する</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.closeButton} onPress={handleClose}>
          <Text style={styles.closeIcon}>✕</Text>
        </TouchableOpacity>
        <Text style={styles.title}>ゴミ箱を撮ろう！</Text>
        <View style={{ width: 44 }} />
      </View>

      <View style={styles.previewContainer}>
        <CameraView style={styles.previewBackground} ref={cameraRef} facing="back" />
        
        <View style={styles.guideOverlay}>
          <View style={styles.guideFrame}>
            <View style={styles.mockCameraCenter}>
              <Text style={styles.mockCameraIcon}>🗑️</Text>
            </View>
          </View>
        </View>

        <View style={styles.tipsCard}>
          <Text style={styles.tipsTitle}>ゴミ箱が中央に入るように撮影してください</Text>
          <Text style={styles.tipsDesc}>きれいな写真だと、次の人が見つけやすくなります</Text>
        </View>
      </View>

      <View style={styles.footer}>
        <TouchableOpacity style={styles.sideButton} onPress={handlePickImage}>
          <View style={styles.iconCircle}><Text>🖼️</Text></View>
          <Text style={styles.sideButtonText}>写真から選ぶ</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.shutterOuter} onPress={handleCapture}>
          <View style={styles.shutterInner}>
            <Text style={styles.cameraIcon}>📷</Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity style={styles.sideButton} onPress={handleClose}>
          <View style={styles.iconCircle}><Text>✕</Text></View>
          <Text style={styles.sideButtonText}>閉じる</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: 20, paddingBottom: 20 },
  closeButton: { width: 44, height: 44, borderRadius: 22, backgroundColor: Colors.surface, justifyContent: 'center', alignItems: 'center', shadowColor: Colors.shadow, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.5, shadowRadius: 4, elevation: 2 },
  closeIcon: { fontSize: 18, color: Colors.textMain, fontWeight: 'bold' },
  title: { fontSize: 18, fontWeight: 'bold', color: Colors.textMain },
  previewContainer: { flex: 1, marginHorizontal: 20, borderRadius: 32, overflow: 'hidden', position: 'relative', marginBottom: 40 },
  previewBackground: { flex: 1 },
  guideOverlay: { ...StyleSheet.absoluteFillObject, justifyContent: 'center', alignItems: 'center' },
  guideFrame: { width: '70%', height: '50%', borderWidth: 2, borderColor: 'rgba(255,255,255,0.6)', borderStyle: 'dashed', borderRadius: 24, justifyContent: 'center', alignItems: 'center' },
  mockCameraCenter: { width: 120, height: 160, backgroundColor: 'rgba(255,255,255,0.3)', borderRadius: 24, justifyContent: 'center', alignItems: 'center' },
  mockCameraIcon: { fontSize: 64, opacity: 0.5 },
  tipsCard: { position: 'absolute', bottom: 20, left: 20, right: 20, backgroundColor: Colors.surface, borderRadius: 20, padding: 16, shadowColor: Colors.shadow, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.8, shadowRadius: 12, elevation: 4 },
  tipsTitle: { fontSize: 14, fontWeight: 'bold', color: Colors.textMain, marginBottom: 4 },
  tipsDesc: { fontSize: 12, color: Colors.textSub },
  footer: { flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center', paddingHorizontal: 20, paddingBottom: 40 },
  sideButton: { alignItems: 'center' },
  iconCircle: { width: 48, height: 48, borderRadius: 24, backgroundColor: Colors.surface, justifyContent: 'center', alignItems: 'center', marginBottom: 8, shadowColor: Colors.shadow, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.5, shadowRadius: 4, elevation: 2 },
  sideButtonText: { fontSize: 12, color: Colors.textSub, fontWeight: '500' },
  shutterOuter: { width: 88, height: 88, borderRadius: 44, backgroundColor: Colors.surface, justifyContent: 'center', alignItems: 'center', borderWidth: 6, borderColor: Colors.primary, shadowColor: Colors.primary, shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.3, shadowRadius: 16, elevation: 8 },
  shutterInner: { width: 66, height: 66, borderRadius: 33, backgroundColor: Colors.primaryLight, justifyContent: 'center', alignItems: 'center' },
  cameraIcon: { fontSize: 24 },
});
