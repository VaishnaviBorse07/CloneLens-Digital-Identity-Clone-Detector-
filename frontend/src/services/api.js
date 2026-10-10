/**
 * CloneLens Frontend API Client
 */
import axios from 'axios';

const getBaseUrl = () => {
  if (typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')) {
    return import.meta.env.VITE_API_URL && !import.meta.env.VITE_API_URL.includes('devtunnels.ms')
      ? import.meta.env.VITE_API_URL
      : 'http://localhost:8000';
  }
  return import.meta.env.VITE_API_URL || 'http://localhost:8000';
};

const API_BASE = getBaseUrl();

export const apiClient = axios.create({
  baseURL: API_BASE,
  timeout: 20000,
});

export const checkHealth = async () => {
  const startTime = performance.now();
  const response = await apiClient.get('/api/health');
  const latency = Math.round(performance.now() - startTime);
  return {
    data: response.data,
    latencyMs: latency,
  };
};

export const getModelInfo = async () => {
  const response = await apiClient.get('/api/model/info/image');
  return response.data;
};

export const analyzeImage = async (file) => {
  const formData = new FormData();
  formData.append('file', file);
  const response = await apiClient.post('/api/analyze/image', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data;
};

export const analyzeText = async (text) => {
  const response = await apiClient.post('/api/analyze/text', { text });
  return response.data;
};

export const analyzeMultimodal = async (file, text) => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('text', text);
  const response = await apiClient.post('/api/analyze/multimodal', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data;
};

export const getResultById = async (analysisId) => {
  const response = await apiClient.get(`/api/results/${analysisId}`);
  return response.data;
};
