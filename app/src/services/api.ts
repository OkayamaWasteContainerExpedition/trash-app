import { Platform } from 'react-native';

declare const process: {
  env?: {
    EXPO_PUBLIC_API_BASE_URL?: string;
  };
};

const DEFAULT_API_BASE_URL = Platform.select({
  android: 'http://10.0.2.2:8000',
  default: 'http://127.0.0.1:8000',
});
const ENV_API_BASE_URL =
  typeof process !== 'undefined' ? process.env?.EXPO_PUBLIC_API_BASE_URL : undefined;

export const API_BASE_URL = (
  ENV_API_BASE_URL || DEFAULT_API_BASE_URL
).replace(/\/$/, '');

export interface WasteContainer {
  id: number;
  name: string;
  latitude: number;
  longitude: number;
  memo: string | null;
  image_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface WasteContainerPayload {
  name: string;
  latitude: number;
  longitude: number;
  memo?: string | null;
  image_url?: string | null;
}

interface ContainerImageResponse {
  image_url: string;
}

export class ApiError extends Error {
  constructor(message: string, public readonly status?: number) {
    super(message);
    this.name = 'ApiError';
  }
}

const apiPath = (path: string) => `${API_BASE_URL}${path}`;

const readErrorMessage = async (response: Response) => {
  try {
    const body = await response.json();
    if (typeof body.detail === 'string') {
      return body.detail;
    }
    if (Array.isArray(body.detail)) {
      return body.detail.map((item: unknown) => {
        if (
          typeof item === 'object' &&
          item !== null &&
          'msg' in item &&
          typeof (item as { msg?: unknown }).msg === 'string'
        ) {
          return (item as { msg: string }).msg;
        }
        return JSON.stringify(item);
      }).join('\n');
    }
  } catch {
    // JSONではないエラー本文は既定メッセージに任せる。
  }
  return `API request failed with status ${response.status}`;
};

const requestJson = async <T>(path: string, init?: RequestInit): Promise<T> => {
  const response = await fetch(apiPath(path), {
    ...init,
    headers: {
      Accept: 'application/json',
      ...init?.headers,
    },
  });

  if (!response.ok) {
    throw new ApiError(await readErrorMessage(response), response.status);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return response.json() as Promise<T>;
};

export const listWasteContainers = () =>
  requestJson<WasteContainer[]>('/api/v1/containers');

export const createWasteContainer = (payload: WasteContainerPayload) =>
  requestJson<WasteContainer>('/api/v1/containers', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

export const updateWasteContainer = (id: string, payload: WasteContainerPayload) =>
  requestJson<WasteContainer>(`/api/v1/containers/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

export const deleteWasteContainer = async (id: string) => {
  await requestJson<void>(`/api/v1/containers/${id}`, {
    method: 'DELETE',
  });
};

export const uploadContainerImage = async (uri: string) => {
  const formData = new FormData();

  if (Platform.OS === 'web') {
    const response = await fetch(uri);
    const blob = await response.blob();
    const type = blob.type || guessImageType(uri);
    formData.append('file', blob, imageFileName(uri, type));
  } else {
    const type = guessImageType(uri);
    formData.append('file', {
      uri,
      name: imageFileName(uri, type),
      type,
    } as unknown as Blob);
  }

  const response = await fetch(apiPath('/api/v1/container-images'), {
    method: 'POST',
    headers: {
      Accept: 'application/json',
    },
    body: formData,
  });

  if (!response.ok) {
    throw new ApiError(await readErrorMessage(response), response.status);
  }

  const body = (await response.json()) as ContainerImageResponse;
  return body.image_url;
};

export const toAbsoluteAssetUrl = (path?: string | null) => {
  if (!path) {
    return undefined;
  }
  if (/^https?:\/\//i.test(path) || path.startsWith('file:') || path.startsWith('data:')) {
    return path;
  }
  return `${API_BASE_URL}${path.startsWith('/') ? path : `/${path}`}`;
};

export const toUploadPath = (url?: string | null) => {
  if (!url) {
    return null;
  }
  if (url.startsWith('/uploads/')) {
    return url;
  }
  if (url.startsWith(`${API_BASE_URL}/uploads/`)) {
    return url.slice(API_BASE_URL.length);
  }
  return null;
};

const guessImageType = (uri: string) => {
  const path = uri.split('?')[0].toLowerCase();
  if (path.endsWith('.png')) {
    return 'image/png';
  }
  if (path.endsWith('.webp')) {
    return 'image/webp';
  }
  return 'image/jpeg';
};

const imageFileName = (uri: string, type: string) => {
  const fileName = uri.split('/').pop()?.split('?')[0];
  if (fileName && /\.[a-z0-9]+$/i.test(fileName)) {
    return fileName;
  }

  const extension = type === 'image/png' ? 'png' : type === 'image/webp' ? 'webp' : 'jpg';
  return `container-image.${extension}`;
};
