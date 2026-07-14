import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  createWasteContainer,
  deleteWasteContainer,
  listWasteContainers,
  toAbsoluteAssetUrl,
  toUploadPath,
  updateWasteContainer,
  uploadContainerImage,
  WasteContainer,
  WasteContainerPayload,
} from '../services/api';

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
const MEMO_META_PREFIX = '__trash_app_meta__:';

interface BinMemoMeta {
  memo?: string;
  categories?: BinCategory[];
  cleanliness?: TrashBin['cleanliness'];
  visibility?: TrashBin['visibility'];
  availableTime?: AvailableTime;
  helpfulCount?: number;
}

const dummyBins: TrashBin[] = [
  {
    id: 'dummy-1',
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

export const BinProvider = ({ children }: { children: ReactNode }) => {
  const [bins, setBins] = useState<TrashBin[]>([]);
  const [selectedBin, setSelectedBin] = useState<TrashBin | null>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);

  useEffect(() => {
    loadBins();
  }, []);

  const loadBins = async () => {
    try {
      const containers = await listWasteContainers();
      const apiBins = containers.map(toTrashBin);
      setBins(apiBins);
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(apiBins));
    } catch (e) {
      console.error('Failed to load bins from API', e);
      setBins(await loadCachedBins());
    }
  };

  const addBin = async (bin: Omit<TrashBin, 'id'>) => {
    const payload = await toWasteContainerPayload(bin);
    const createdContainer = await createWasteContainer(payload);
    const newBin = { ...toTrashBin(createdContainer), isMine: true };
    const updatedBins = [...bins, newBin];
    setBins(updatedBins);
    await saveCachedBins(updatedBins);
  };

  const removeBin = async (id: string) => {
    if (isServerBackedId(id)) {
      await deleteWasteContainer(id);
    }
    const updatedBins = bins.filter(b => b.id !== id);
    setBins(updatedBins);
    await saveCachedBins(updatedBins);
  };

  const updateBin = async (updatedBin: TrashBin) => {
    let savedBin = updatedBin;
    if (isServerBackedId(updatedBin.id)) {
      const payload = await toWasteContainerPayload(updatedBin);
      savedBin = toTrashBin(await updateWasteContainer(updatedBin.id, payload));
    }

    const updatedBins = bins.map(b => b.id === savedBin.id ? savedBin : b);
    setBins(updatedBins);
    if (selectedBin?.id === savedBin.id) {
      setSelectedBin(savedBin);
    }
    await saveCachedBins(updatedBins);
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

const loadCachedBins = async () => {
  const stored = await AsyncStorage.getItem(STORAGE_KEY);
  if (stored) {
    try {
      return JSON.parse(stored) as TrashBin[];
    } catch {
      await AsyncStorage.removeItem(STORAGE_KEY);
    }
  }

  await saveCachedBins(dummyBins);
  return dummyBins;
};

const saveCachedBins = async (nextBins: TrashBin[]) => {
  try {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(nextBins));
  } catch (e) {
    console.error('Failed to save bins', e);
  }
};

const toTrashBin = (container: WasteContainer): TrashBin => {
  const meta = decodeMemoMeta(container.memo);

  return {
    id: String(container.id),
    latitude: container.latitude,
    longitude: container.longitude,
    title: container.name,
    categories: normalizeCategories(meta.categories),
    cleanliness: meta.cleanliness || '普通',
    visibility: meta.visibility || '少し探す',
    availableTime: meta.availableTime || '24時間利用可',
    memo: meta.memo || '',
    helpfulCount: meta.helpfulCount ?? 0,
    lastChecked: formatLastChecked(container.updated_at),
    imageUrl: toAbsoluteAssetUrl(container.image_url),
  };
};

const toWasteContainerPayload = async (
  bin: Omit<TrashBin, 'id'> | TrashBin,
): Promise<WasteContainerPayload> => {
  let imageUrl = toUploadPath(bin.imageUrl);
  if (bin.imageUrl && !imageUrl) {
    imageUrl = await uploadContainerImage(bin.imageUrl);
  }

  return {
    name: bin.title,
    latitude: bin.latitude,
    longitude: bin.longitude,
    memo: encodeMemoMeta(bin),
    image_url: imageUrl,
  };
};

const encodeMemoMeta = (bin: Omit<TrashBin, 'id'> | TrashBin) => {
  const meta: BinMemoMeta = {
    memo: bin.memo,
    categories: bin.categories,
    cleanliness: bin.cleanliness,
    visibility: bin.visibility,
    availableTime: bin.availableTime,
    helpfulCount: bin.helpfulCount,
  };

  return `${MEMO_META_PREFIX}${JSON.stringify(meta)}`;
};

const decodeMemoMeta = (memo?: string | null): BinMemoMeta => {
  if (!memo) {
    return {};
  }
  if (!memo.startsWith(MEMO_META_PREFIX)) {
    return { memo };
  }

  try {
    return JSON.parse(memo.slice(MEMO_META_PREFIX.length)) as BinMemoMeta;
  } catch {
    return { memo: memo.slice(MEMO_META_PREFIX.length) };
  }
};

const normalizeCategories = (categories?: BinCategory[]) => {
  if (!categories?.length) {
    return ['その他'] as BinCategory[];
  }
  return categories;
};

const isServerBackedId = (id: string) => /^\d+$/.test(id);

const formatLastChecked = (value: string) => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return '今日';
  }

  const formatter = new Intl.DateTimeFormat('ja-JP', {
    timeZone: 'Asia/Tokyo',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
  const checkedDate = formatter.format(date);
  const today = formatter.format(new Date());

  return checkedDate === today ? '今日' : checkedDate;
};
