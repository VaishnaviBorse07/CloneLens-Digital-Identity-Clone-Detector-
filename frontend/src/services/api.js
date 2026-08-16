/**
 * CloneLens Frontend API Client
 */
import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_URL || '';

export const apiClient = axios.create({
  baseURL: API_BASE,
  timeout: 30000,
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
