import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import { API_BASE_URL, DEFAULT_TIMEOUT, DEFAULT_HEADERS } from './config';


console.log('Environnement:', __DEV__ ? 'Développement' : 'Production');
console.log('Plateforme:', Platform.OS);
console.log('API URL:', API_BASE_URL);

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: DEFAULT_TIMEOUT,
  headers: DEFAULT_HEADERS,
});

apiClient.interceptors.request.use(
  async (config) => {
    try {
      console.log(`Requête API: ${config.method?.toUpperCase()} ${config.url}`);
      
      const token = await AsyncStorage.getItem('userToken');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
        console.log('Token utilisé pour la requête:', token);
      } else {
        console.log('Aucun token disponible pour cette requête');
      }
      
      if (config.data) {
        console.log('Données envoyées:', JSON.stringify(config.data));
      }
    } catch (error) {
      console.error('Erreur lors de l\'accès au token:', error);
    }
    
    return config;
  },
  (error) => {
    console.error('Erreur dans l\'intercepteur de requête:', error);
    return Promise.reject(error);
  }
);

apiClient.interceptors.response.use(
  (response) => {
    console.log(`Réponse API (${response.status}): ${response.config.method?.toUpperCase()} ${response.config.url}`);
    return response;
  },
  async (error) => {
    if (error.response) {
      console.error(`Erreur API (${error.response.status}):`, error.response.data);
      
      if (error.response.status === 401) {
        console.log('Erreur d\'authentification, suppression des données de session');
        try {
          await AsyncStorage.removeItem('userToken');
          await AsyncStorage.removeItem('userData');
        } catch (storageError) {
          console.error('Erreur lors de la suppression des données d\'authentification:', storageError);
        }
      }
    } else if (error.request) {
      console.error('Erreur réseau - Aucune réponse reçue:', error.request);
      console.log('URL de la requête:', error.config?.url);
      console.log('Méthode:', error.config?.method);
      console.log('Timeout:', error.config?.timeout);
    } else {
      console.error('Erreur lors de la configuration de la requête:', error.message);
    }
    
    return Promise.reject(error);
  }
);

export default apiClient;
