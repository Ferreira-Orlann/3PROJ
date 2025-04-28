import { useState, useEffect } from 'react';
import { Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { UUID } from 'crypto';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { HomeScreenState, CreateWorkspaceForm, Workspace } from '../screens/homeScreen.types';
import workspaceService from '../services/api/endpoints/workspaces';
import { useAuth } from '../context/AuthContext';

export const useHomeScreen = () => {
  const router = useRouter();
  const auth = useAuth();
  const [state, setState] = useState<HomeScreenState>({
    searchQuery: '',
    showCreateWorkspaceModal: false,
    newWorkspaceForm: {
      name: '',
      description: '',
      is_public: true
    },
    workspaces: [],
    isLoading: true,
    error: null
  });

  // Fetch workspaces data when component mounts
  useEffect(() => {
    fetchWorkspaces();
  }, []);

  // Fetch workspaces from API
  const fetchWorkspaces = async () => {
    try {
      setState(prev => ({ ...prev, isLoading: true }));
      const apiWorkspaces = await workspaceService.getWorkspaces();
      
      // Convert API workspaces to UI workspaces with the correct type
      const uiWorkspaces: Workspace[] = apiWorkspaces.map(workspace => ({
        workspaceId: workspace.uuid || workspace.workspaceId,
        name: workspace.name,
        description: workspace.description || '',
        is_public: workspace.is_public,
        memberCount: workspace.memberCount || 0,
        owner: workspace.owner || '',
        createdAt: typeof workspace.createdAt === 'string' 
          ? workspace.createdAt 
          : new Date().toISOString()
      }));
      
      setState(prev => ({ 
        ...prev, 
        workspaces: uiWorkspaces,
        isLoading: false,
        error: null
      }));
    } catch (error) {
      console.error('Error fetching workspaces:', error);
      setState(prev => ({ 
        ...prev, 
        isLoading: false, 
        error: 'Impossible de charger les espaces de travail.'
      }));
    }
  };

  // Filter workspaces based on search query
  const getFilteredWorkspaces = () => {
    return state.workspaces.filter(workspace => 
      state.searchQuery.trim() === '' || 
      workspace.name.toLowerCase().includes(state.searchQuery.toLowerCase())
    );
  };

  // Handle workspace selection - navigate to workspace screen
  const handleWorkspaceSelect = (workspaceId: UUID) => {
    router.push({ pathname: '/screens/workspaces/[id]', params: { id: workspaceId } });
  };

  // Update search query
  const setSearchQuery = (query: string) => {
    setState(prev => ({ ...prev, searchQuery: query }));
  };

  // Toggle create workspace modal
  const toggleCreateWorkspaceModal = (show: boolean) => {
    setState(prev => ({ ...prev, showCreateWorkspaceModal: show }));
    
    // Reset form if closing
    if (!show) {
      setState(prev => ({ 
        ...prev, 
        newWorkspaceForm: {
          name: '',
          description: '',
          is_public: true
        }
      }));
    }
  };

  // Update new workspace form
  const updateNewWorkspaceForm = (field: keyof CreateWorkspaceForm, value: string | boolean) => {
    setState(prev => ({
      ...prev,
      newWorkspaceForm: {
        ...prev.newWorkspaceForm,
        [field]: value
      }
    }));
  };

  // Handle creating a new workspace
  const handleCreateWorkspace = async () => {
    const { name, description, is_public } = state.newWorkspaceForm;
    
    if (!name.trim()) {
      Alert.alert("Erreur", "Le nom de l'espace de travail est requis.");
      return;
    }
    
    // Check if user is authenticated
    if (!auth || !auth.user || !auth.user.uuid) {
      Alert.alert("Erreur", "Vous devez être connecté pour créer un espace de travail.");
      return;
    }
    
    try {
      setState(prev => ({ ...prev, isLoading: true }));
      
      // Create workspace via API using the authenticated user's UUID
      const workspaceData = {
        name,
        description,
        is_public,
        owner_uuid: auth.user.uuid as UUID,
        createdAt: new Date().toISOString() // Convert to ISO string to ensure consistency
      };
      
      console.log('Creating workspace with data:', workspaceData);
      
      const apiWorkspace = await workspaceService.createWorkspace(workspaceData);
      console.log('New workspace created:', JSON.stringify(apiWorkspace));
      
      // Convert API workspace to the format expected by the UI
      const uiWorkspace: Workspace = {
        workspaceId: apiWorkspace.uuid || apiWorkspace.workspaceId,
        name: apiWorkspace.name,
        description: apiWorkspace.description || '',
        is_public: apiWorkspace.is_public,
        memberCount: apiWorkspace.memberCount || 0,
        owner: apiWorkspace.owner || auth.user?.username || '',
        createdAt: new Date().toISOString() // Ensure createdAt is always a string
      };
      
      // Update local state with the new workspace
      setState(prev => ({
        ...prev,
        workspaces: [...prev.workspaces, uiWorkspace],
        showCreateWorkspaceModal: false,
        newWorkspaceForm: {
          name: '',
          description: '',
          is_public: true
        },
        isLoading: false
      }));
      
      // Get the workspace ID safely from our UI workspace object
      const workspaceId = uiWorkspace.workspaceId;
      
      if (workspaceId) {
        // Navigate to the newly created workspace
        console.log('Navigating to workspace with ID:', workspaceId);
        router.push({ 
          pathname: '/screens/workspaces/[id]', 
          params: { id: String(workspaceId) } 
        });
      } else {
        console.error('Could not determine workspace ID from response:', apiWorkspace);
        Alert.alert("Information", "L'espace de travail a été créé, mais la navigation automatique a échoué. Veuillez rafraîchir la liste des espaces de travail.");
      }
      
    } catch (error) {
      console.error('Error creating workspace:', error);
      setState(prev => ({ 
        ...prev, 
        isLoading: false, 
        error: "Impossible de créer l'espace de travail."
      }));
      Alert.alert("Erreur", "Une erreur est survenue lors de la création de l'espace de travail.");
    }
  };

  return {
    state,
    filteredWorkspaces: getFilteredWorkspaces(),
    setSearchQuery,
    toggleCreateWorkspaceModal,
    updateNewWorkspaceForm,
    handleCreateWorkspace,
    handleWorkspaceSelect
  };
};

export default useHomeScreen;
