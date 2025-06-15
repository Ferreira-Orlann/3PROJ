import { useState, useCallback } from "react";
import { Alert } from "react-native";
import { UUID } from "crypto";
import { CreateWorkspaceForm } from "../styles/homeScreen.types";
import { useAuth } from "../context/AuthContext";

// Import API hooks from Redux
import { 
  useGetWorkspacesQuery,
  useCreateWorkspaceMutation,
  useDeleteWorkspaceMutation
} from "../store/api/workspacesApi";

/**
 * Hook Redux pour l'écran d'accueil
 */
export const useReduxHome = () => {
  // État local pour la recherche et les modales
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [showCreateWorkspaceModal, setShowCreateWorkspaceModal] = useState<boolean>(false);
  
  // État pour le formulaire de création d'espace de travail
  const [newWorkspaceForm, setNewWorkspaceForm] = useState<CreateWorkspaceForm>({
    name: "",
    description: "",
    is_public: true,
  });

  // Récupérer l'utilisateur actuel
  const { user } = useAuth();

  // Utiliser les hooks Redux pour récupérer les espaces de travail
  const { 
    data: workspaces = [], 
    isLoading, 
    error,
    refetch: refetchWorkspaces
  } = useGetWorkspacesQuery();

  // Mutations Redux
  const [createWorkspace, { isLoading: isCreating }] = useCreateWorkspaceMutation();
  const [deleteWorkspace, { isLoading: isDeleting }] = useDeleteWorkspaceMutation();

  // Filtrer les espaces de travail en fonction de la recherche
  const filteredWorkspaces = workspaces.filter(workspace => 
    workspace.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    workspace.description.toLowerCase().includes(searchQuery.toLowerCase())
  );
  // Fonction pour mettre à jour le formulaire de création d'espace de travail
  const updateNewWorkspaceForm = useCallback((field: keyof CreateWorkspaceForm, value: string | boolean) => {
    setNewWorkspaceForm(prev => ({
      ...prev,
      [field]: value
    }));
  }, []);

  // Fonction pour afficher/masquer la modale de création d'espace de travail
  const toggleCreateWorkspaceModal = useCallback((visible: boolean) => {
    setShowCreateWorkspaceModal(visible);
    
    // Réinitialiser le formulaire si on ferme la modale
    if (!visible) {
      setNewWorkspaceForm({
        name: "",
        description: "",
        is_public: true,
      });
    }
  }, []);

  // Fonction pour créer un nouvel espace de travail
  const handleCreateWorkspace = useCallback(async () => {
    if (!user?.uuid) {
      Alert.alert("Erreur", "Vous devez être connecté pour créer un espace de travail");
      return;
    }

    if (!newWorkspaceForm.name.trim()) {
      Alert.alert("Erreur", "Le nom de l'espace de travail est requis");
      return;
    }

    try {
      await createWorkspace({
        name: newWorkspaceForm.name,
        description: newWorkspaceForm.description,
        is_public: newWorkspaceForm.is_public,
        owner_uuid: user.uuid
      }).unwrap();

      // Fermer la modale et rafraîchir la liste
      toggleCreateWorkspaceModal(false);
      refetchWorkspaces();
      
      Alert.alert("Succès", "L'espace de travail a été créé avec succès");
    } catch (error) {
      console.error("Erreur lors de la création de l'espace de travail:", error);
      Alert.alert("Erreur", "Impossible de créer l'espace de travail");
    }
  }, [newWorkspaceForm, user, createWorkspace, toggleCreateWorkspaceModal, refetchWorkspaces]);

  // Fonction pour supprimer un espace de travail
  const handleDeleteWorkspace = useCallback(async (workspaceId: UUID) => {
    try {
      await Alert.alert(
        "Supprimer l'espace de travail",
        "Êtes-vous sûr de vouloir supprimer cet espace de travail ? Cette action est irréversible.",
        [
          { text: "Annuler", style: "cancel" },
          {
            text: "Supprimer",
            style: "destructive",
            onPress: async () => {
              try {
                await deleteWorkspace(workspaceId).unwrap();
                refetchWorkspaces();
                Alert.alert("Succès", "L'espace de travail a été supprimé avec succès");
              } catch (error) {
                console.error("Erreur lors de la suppression de l'espace de travail:", error);
                Alert.alert("Erreur", "Impossible de supprimer l'espace de travail");
              }
            },
          },
        ]
      );
    } catch (error) {
      console.error("Erreur lors de la suppression de l'espace de travail:", error);
      Alert.alert("Erreur", "Impossible de supprimer l'espace de travail");
    }
  }, [deleteWorkspace, refetchWorkspaces]);

  return {
    // État
    state: {
      workspaces,
      isLoading: isLoading || isCreating || isDeleting,
      error: error ? "Erreur lors du chargement des espaces de travail" : null,
      searchQuery,
      showCreateWorkspaceModal,
      newWorkspaceForm,
    },
    // Actions
    filteredWorkspaces,
    setSearchQuery,
    toggleCreateWorkspaceModal,
    updateNewWorkspaceForm,
    handleCreateWorkspace,
    handleDeleteWorkspace,
    refreshWorkspaces: refetchWorkspaces,
  };
};

export default useReduxHome;
