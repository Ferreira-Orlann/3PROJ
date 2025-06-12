import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
import authService from '../../services/api/endpoints/auth';
import apiClient from '../../services/api/client';
import { UUID } from 'crypto';

// Types
export type User = {
  uuid: UUID;
  username: string;
  email: string;
  mdp: string;
  avatar?: string;
  status: 'online' | 'away' | 'offline';
};

interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  error: string | null;
}

const initialState: AuthState = {
  user: null,
  token: null,
  isLoading: false,
  error: null,
};

// Async thunks
export const loginUser = createAsyncThunk(
  'auth/login',
  async ({ email, password }: { email: string; password: string }, { rejectWithValue }) => {
    try {
      // Utiliser directement le service d'authentification avec email/password
      const authResponse = await authService.login(email, password);

      // Extraire le token de la réponse
      const { token: authToken, uuid } = authResponse;

      // Récupérer les informations utilisateur
      try {
        const userResponse = await apiClient.get(`/users/${email}`, {
          headers: {
            Authorization: `Bearer ${authToken}`,
          },
        });

        const userData = userResponse.data;

        // Récupérer le bon utilisateur qui correspond à l'email et au mot de passe
        const currentUser = Array.isArray(userData)
          ? userData.find((user) => user.email === email)
          : userData;

        // Créer l'objet utilisateur à partir des données
        const mappedUser: User = {
          uuid: currentUser.uuid,
          username:
            currentUser?.firstname && currentUser?.lastname
              ? currentUser.firstname + ' ' + currentUser.lastname
              : email.split('@')[0],
          email: currentUser?.email || email,
          mdp: password,
          status: (currentUser?.status as 'online' | 'away' | 'offline') || 'online',
        };

        // Configurer le client API avec le token
        apiClient.defaults.headers.common['Authorization'] = `Bearer ${authToken}`;
        
        // Stocker les données de session
        await AsyncStorage.setItem('userToken', authToken);
        await AsyncStorage.setItem('userData', JSON.stringify(mappedUser));

        router.replace('/screens/homeScreen');
        
        return { user: mappedUser, token: authToken };
      } catch (userError) {
        console.error('Error fetching user data:', userError);
        // Même en cas d'erreur, on stocke le token
        await AsyncStorage.setItem('userToken', authToken);
        router.replace('/screens/homeScreen');
        return { user: null, token: authToken };
      }
    } catch (error: any) {
      console.error('Login error:', error);
      return rejectWithValue(error.message || 'Login failed');
    }
  }
);

export const registerUser = createAsyncThunk(
  'auth/register',
  async (
    { username, email, password }: { username: string; email: string; password: string },
    { rejectWithValue }
  ) => {
    try {
      // Préparer les données d'inscription
      const registerData = {
        username,
        email,
        password,
        firstname: username.split(' ')[0] || username,
        lastname: username.split(' ')[1] || 'User',
        mdp: password,
        address: 'Default Address',
        status: 'online',
      };

      // Utiliser le service d'authentification pour l'inscription
      await authService.register(registerData);

      // Après l'inscription réussie, connecter l'utilisateur
      const authResponse = await authService.login(email, password);

      // Extraire le token et l'UUID
      const { token: authToken, uuid } = authResponse;

      // Récupérer les informations utilisateur
      try {
        const userDataResponse = await apiClient.get(`/users/${uuid}`, {
          headers: {
            Authorization: `Bearer ${authToken}`,
          },
        });

        const userData = userDataResponse.data;

        // Récupérer le bon utilisateur qui correspond à l'email
        const currentUser = Array.isArray(userData)
          ? userData.find((user) => user.email === email)
          : userData;

        // Créer l'objet utilisateur
        const mappedUser: User = {
          uuid: currentUser.uuid,
          username:
            currentUser?.firstname && currentUser?.lastname
              ? currentUser.firstname + ' ' + currentUser.lastname
              : registerData.firstname + ' ' + registerData.lastname,
          email: currentUser?.email || email,
          mdp: password,
          status: (currentUser?.status as 'online' | 'away' | 'offline') || 'online',
        };

        // Stocker les données de session
        await AsyncStorage.setItem('userToken', authToken);
        await AsyncStorage.setItem('userData', JSON.stringify(mappedUser));

        router.replace('/screens/homeScreen');
        
        return { user: mappedUser, token: authToken };
      } catch (userError) {
        console.error('Error fetching user data after registration:', userError);
        // Même en cas d'erreur, on stocke le token
        await AsyncStorage.setItem('userToken', authToken);
        router.replace('/screens/homeScreen');
        return { user: null, token: authToken };
      }
    } catch (error: any) {
      console.error('Registration error:', error);
      return rejectWithValue(error.message || 'Registration failed');
    }
  }
);

export const logoutUser = createAsyncThunk('auth/logout', async (_, { rejectWithValue }) => {
  try {
    // Clear stored data
    await AsyncStorage.removeItem('userToken');
    await AsyncStorage.removeItem('userData');

    // Navigate to login screen
    router.replace('../auth/login');
    
    return null;
  } catch (error: any) {
    console.error('Logout error:', error);
    return rejectWithValue(error.message || 'Logout failed');
  }
});

export const checkAuth = createAsyncThunk('auth/check', async (_, { rejectWithValue }) => {
  try {
    const storedToken = await AsyncStorage.getItem('userToken');
    const storedUser = await AsyncStorage.getItem('userData');

    if (storedToken && storedUser) {
      // Configurer le client API avec le token
      apiClient.defaults.headers.common['Authorization'] = `Bearer ${storedToken}`;
      
      return { 
        user: JSON.parse(storedUser), 
        token: storedToken 
      };
    }
    
    return { user: null, token: null };
  } catch (error: any) {
    console.error('Error restoring token:', error);
    // En cas d'erreur, effacer les données de session pour éviter des problèmes
    await AsyncStorage.removeItem('userToken');
    await AsyncStorage.removeItem('userData');
    
    return rejectWithValue(error.message || 'Authentication check failed');
  }
});

// Slice
export const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    resetError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Login
      .addCase(loginUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      
      // Register
      .addCase(registerUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      
      // Logout
      .addCase(logoutUser.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(logoutUser.fulfilled, (state) => {
        state.isLoading = false;
        state.user = null;
        state.token = null;
      })
      .addCase(logoutUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      
      // Check Auth
      .addCase(checkAuth.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(checkAuth.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
      })
      .addCase(checkAuth.rejected, (state) => {
        state.isLoading = false;
        state.user = null;
        state.token = null;
      });
  },
});

export const { resetError } = authSlice.actions;

export default authSlice.reducer;
