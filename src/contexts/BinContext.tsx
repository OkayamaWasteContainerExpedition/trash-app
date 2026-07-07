import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type BinCategory = '燃えるごみ' | 'ペットボトル' | '缶' | 'ビン' | 'プラスチック' | '紙' | 'その他';
export type AvailableTime = '24時間利用可' | '施設の営業時間のみ' | 'その他（メモに記載）';

export interface TrashBin {
  id: string;
  latitude: number;
  longitude: number;
  title: string;
  distance?: number;
  categories: BinCategory[];
  cleanliness: 'きれい' | '普通' | '少し注意';
  visibility: 'すぐ見つかる' | '少し探す' | '目印が必要';
  availableTime?: AvailableTime;
  memo: string;
  helpfulCount: number;
  lastChecked: string;
  imageUrl?: string;
  isMine?: boolean;
}

interface BinContextType {
  bins: TrashBin[];
  addBin: (bin: Omit<TrashBin, 'id'>) => Promise<void>;
  updateBin: (bin: TrashBin) => Promise<void>;
  removeBin: (id: string) => Promise<void>;
  selectedBin: TrashBin | null;
  setSelectedBin: (bin: TrashBin | null) => void;
  capturedImage: string | null;
  setCapturedImage: (uri: string | null) => void;
}

const BinContext = createContext<BinContextType | undefined>(undefined);

const STORAGE_KEY = '@trash_bins_v1';

export const BinProvider = ({ children }: { children: ReactNode }) => {
  const [bins, setBins] = useState<TrashBin[]>([]);
  const [selectedBin, setSelectedBin] = useState<TrashBin | null>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);

  useEffect(() => {
    loadBins();
  }, []);

  const loadBins = async () => {
    try {
      const stored = await AsyncStorage.getItem(STORAGE_KEY);
      if (stored) {
        setBins(JSON.parse(stored));
      } else {
        // 初期ダミーデータ
        const dummyBins: TrashBin[] = [
          {
            id: '1',
            latitude: 34.6663,
            longitude: 133.9185,
            title: '岡山駅東口 ベンチ横',
            categories: ['燃えるごみ', 'ペットボトル', '缶'],
            cleanliness: 'きれい',
            visibility: 'すぐ見つかる',
            memo: '観光案内所の近く。人通りが多いので見つけやすいです。',
            helpfulCount: 24,
            lastChecked: '今日',
            distance: 120,
          }
        ];
        setBins(dummyBins);
        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(dummyBins));
      }
    } catch (e) {
      console.error('Failed to load bins', e);
    }
  };

  const addBin = async (bin: Omit<TrashBin, 'id'>) => {
    const newBin = { ...bin, id: Math.random().toString(), isMine: true };
    const updatedBins = [...bins, newBin];
    setBins(updatedBins);
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updatedBins));
    } catch (e) {
      console.error('Failed to save bins', e);
    }
  };

  const removeBin = async (id: string) => {
    const updatedBins = bins.filter(b => b.id !== id);
    setBins(updatedBins);
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updatedBins));
    } catch (e) {
      console.error('Failed to save bins', e);
    }
  };

  const updateBin = async (updatedBin: TrashBin) => {
    const updatedBins = bins.map(b => b.id === updatedBin.id ? updatedBin : b);
    setBins(updatedBins);
    if (selectedBin?.id === updatedBin.id) {
      setSelectedBin(updatedBin);
    }
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updatedBins));
    } catch (e) {
      console.error('Failed to save bins', e);
    }
  };

  return (
    <BinContext.Provider value={{ bins, addBin, updateBin, removeBin, selectedBin, setSelectedBin, capturedImage, setCapturedImage }}>
      {children}
    </BinContext.Provider>
  );
};

export const useBinContext = () => {
  const context = useContext(BinContext);
  if (!context) {
    throw new Error('useBinContext must be used within a BinProvider');
  }
  return context;
};
