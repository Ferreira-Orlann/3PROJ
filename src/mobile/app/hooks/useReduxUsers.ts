import { useState, useCallback, useEffect } from "react";
import { UUID } from "crypto";
import { useAppSelector, useAppDispatch } from "./useAppRedux";
import { User, UpdateUserData } from "../services/api/endpoints/users";

// Import API hooks from Redux
import { 
  useGetCurrentUserQuery,
  useGetUserByIdQuery,
  useUpdateProfileMutation,
  useChangePasswordMutation,
  useUpdateStatusMutation,
  useSearchUsersQuery
} from "../store/api/usersApi";

// Tentative d'importer useAuth s'il existe
let useAuth: any = null;
try {
  const authModule = require("../context/AuthContext");
  if (authModule && typeof authModule.useAuth === "function") {
    useAuth = authModule.useAuth;
  }
} catch (error) {
  console.log("AuthContext non disponible, utilisation du mode alternatif");
}

/**
 * Hook pour gérer les utilisateurs avec Redux
 */
export const useReduxUsers = (userId?: UUID) => {
  // Utiliser useAuth si disponible, sinon utiliser userId fourni en paramètre
  let currentUserUuid: UUID | undefined;
  
  if (useAuth) {
    try {
      const authContext = useAuth();
      currentUserUuid = authContext?.user?.uuid;
    } catch (error) {
      console.log("Erreur lors de l'utilisation de useAuth:", error);
    }
  }

  // État pour la recherche
  const [searchQuery, setSearchQuery] = useState<string>("");

  // Utiliser les hooks Redux pour récupérer les données utilisateur
  const { 
    data: currentUser, 
    isLoading: isCurrentUserLoading,
    error: currentUserError,
    refetch: refetchCurrentUser
  } = useGetCurrentUserQuery();

  const { 
    data: userById, 
    isLoading: isUserByIdLoading,
    error: userByIdError,
    refetch: refetchUserById
  } = useGetUserByIdQuery(
    userId as UUID,
    { skip: !userId }
  );

  const { 
    data: searchResults = [], 
    isLoading: isSearchLoading,
    refetch: refetchSearch
  } = useSearchUsersQuery(
    searchQuery,
    { skip: !searchQuery }
  );

  // Mutations Redux
  const [updateProfile, { isLoading: isUpdatingProfile }] = useUpdateProfileMutation();
  const [changePassword, { isLoading: isChangingPassword }] = useChangePasswordMutation();
  const [updateStatus, { isLoading: isUpdatingStatus }] = useUpdateStatusMutation();

  // Déterminer l'utilisateur à afficher
  const user = userId ? userById : currentUser;
  
  // État combiné pour le chargement
  const isLoading = userId 
    ? isUserByIdLoading 
    : isCurrentUserLoading;
  
  // État combiné pour les erreurs
  const error = userId
    ? userByIdError
      ? typeof userByIdError === 'string'
        ? userByIdError
        : 'Erreur lors du chargement des données utilisateur'
      : null
    : currentUserError
      ? typeof currentUserError === 'string'
        ? currentUserError
        : 'Erreur lors du chargement des données utilisateur'
      : null;

  // Fonction pour rafraîchir les données utilisateur
  const refreshUser = useCallback(() => {
    if (userId) {
      refetchUserById();
    } else {
      refetchCurrentUser();
    }
  }, [userId, refetchUserById, refetchCurrentUser]);

  // Fonction pour mettre à jour le profil utilisateur
  const handleUpdateProfile = useCallback(async (userData: UpdateUserData) => {
    try {
      await updateProfile(userData).unwrap();
      
      // Rafraîchir les données utilisateur
      refreshUser();
      
      return { success: true };
    } catch (error) {
      console.error("useReduxUsers - handleUpdateProfile - Erreur:", error);
      return { 
        success: false, 
        error: typeof error === 'object' && error !== null && 'message' in error 
          ? (error as any).message 
          : 'Erreur lors de la mise à jour du profil' 
      };
    }
  }, [updateProfile, refreshUser]);

  // Fonction pour changer le mot de passe
  const handleChangePassword = useCallback(async (currentPassword: string, newPassword: string) => {
    try {
      await changePassword({ currentPassword, newPassword }).unwrap();
      return { success: true };
    } catch (error) {
      console.error("useReduxUsers - handleChangePassword - Erreur:", error);
      return { 
        success: false, 
        error: typeof error === 'object' && error !== null && 'message' in error 
          ? (error as any).message 
          : 'Erreur lors du changement de mot de passe' 
      };
    }
  }, [changePassword]);

  // Fonction pour mettre à jour le statut
  const handleUpdateStatus = useCallback(async (status: User["status"]) => {
    try {
      await updateStatus(status).unwrap();
      
      // Rafraîchir les données utilisateur
      refreshUser();
      
      return { success: true };
    } catch (error) {
      console.error("useReduxUsers - handleUpdateStatus - Erreur:", error);
      return { 
        success: false, 
        error: typeof error === 'object' && error !== null && 'message' in error 
          ? (error as any).message 
          : 'Erreur lors de la mise à jour du statut' 
      };
    }
  }, [updateStatus, refreshUser]);

  // Fonction pour rechercher des utilisateurs
  const handleSearch = useCallback((query: string) => {
    setSearchQuery(query);
    if (query) {
      refetchSearch();
    }
  }, [refetchSearch]);

  return {
    user,
    isLoading,
    error,
    searchQuery,
    searchResults,
    isSearchLoading,
    updateProfile: handleUpdateProfile,
    changePassword: handleChangePassword,
    updateStatus: handleUpdateStatus,
    search: handleSearch,
    refreshUser,
    currentUserUuid,
  };
};

export default useReduxUsers;
