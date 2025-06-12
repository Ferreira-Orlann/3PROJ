import { useState, useEffect, useCallback } from "react";
import { Alert } from "react-native";
import { UUID } from "crypto";
import { useRouter } from "expo-router";
import { Tab, ModalState, NewChannelForm } from "../services/workspaces";
import { useAppSelector, useAppDispatch } from "./useAppRedux";

// Import API hooks from Redux
import { 
  useGetWorkspacesQuery, 
  useGetWorkspaceByUuidQuery,
  useCreateWorkspaceMutation,
  useUpdateWorkspaceMutation,
  useDeleteWorkspaceMutation,
  useJoinWorkspaceMutation,
  useLeaveWorkspaceMutation
} from "../store/api/workspacesApi";

import {
  useGetChannelsQuery,
  useCreateChannelMutation,
  useUpdateChannelMutation,
  useDeleteChannelMutation
} from "../store/api/channelsApi";

import {
  useGetWorkspaceMembersQuery,
  useAddMemberMutation,
  useRemoveMemberMutation,
  useUpdateMemberRoleMutation
} from "../store/api/membersApi";

// Define local interfaces to match the API responses with our UI needs
interface Channel {
  uuid: UUID;
  name: string;
  is_public: boolean;
  description: string;
  memberCount: number;
}

// Adapter l'interface Member pour qu'elle soit compatible avec l'API
interface Member {
  uuid: UUID;
  joinedAt: string;
  user: {
    uuid: UUID;
    username: string;
    firstname: string;
    lastname: string;
    email: string;
    mdp?: string;
    address?: string;
    status?: string;
    avatarUrl?: string;
  };
  workspace: {
    uuid: UUID;
    name: string;
    is_public: boolean;
    owner_uuid: UUID | null;
  };
  // Propriétés UI supplémentaires pour compatibilité avec l'ancien code
  name?: string;
  avatar?: string;
  username?: string;
  email?: string;
  status?: "online" | "offline" | "away";
}

interface Workspace {
  uuid: UUID;
  name: string;
  description: string;
  is_public: boolean;
  memberCount: number;
  owner: string;
  createdAt: string;
  channels: Channel[];
  members: Member[];
}

// Onglets pour la vue de l'espace de travail
const TABS: Tab[] = [
  { id: "channels", label: "Canaux", icon: "apps-outline" },
  { id: "members", label: "Membres", icon: "people-outline" },
  { id: "settings", label: "Paramètres", icon: "settings-outline" },
];

/**
 * Hook pour gérer un espace de travail avec Redux
 */
const useReduxWorkspaceScreen = (workspaceId: UUID) => {
  const router = useRouter();

  // États pour les onglets et la recherche
  const [activeTab, setActiveTab] = useState<string>("channels");
  const [searchQuery, setSearchQuery] = useState<string>("");

  // États pour les formulaires
  const [newChannelForm, setNewChannelForm] = useState<NewChannelForm>({
    name: "",
    description: "",
    is_public: true,
  });

  // États pour les modals
  const [modalState, setModalState] = useState<ModalState>({
    showNewChannelModal: false,
    showRemoveChannelModal: false,
    showAddMemberModal: false,
    showRemoveMemberModal: false,
    memberToRemove: null,
    channelToRemove: null,
  });

  // Utiliser les hooks Redux pour récupérer les données
  const { 
    data: workspaceData, 
    isLoading: isWorkspaceLoading, 
    error: workspaceError,
    refetch: refetchWorkspace
  } = useGetWorkspaceByUuidQuery(workspaceId);

  const { 
    data: channels = [], 
    isLoading: isChannelsLoading,
    refetch: refetchChannels
  } = useGetChannelsQuery();

  const { 
    data: members = [], 
    isLoading: isMembersLoading,
    refetch: refetchMembers
  } = useGetWorkspaceMembersQuery(workspaceId);

  // Mutations Redux
  const [createChannel, { isLoading: isCreatingChannel }] = useCreateChannelMutation();
  const [updateChannel, { isLoading: isUpdatingChannel }] = useUpdateChannelMutation();
  const [deleteChannel, { isLoading: isDeletingChannel }] = useDeleteChannelMutation();
  const [addMember, { isLoading: isAddingMember }] = useAddMemberMutation();
  const [removeMember, { isLoading: isRemovingMember }] = useRemoveMemberMutation();
  const [updateMemberRole, { isLoading: isUpdatingMemberRole }] = useUpdateMemberRoleMutation();

  // État combiné pour le workspace
  const [workspace, setWorkspace] = useState<Workspace | null>(null);
  
  // État combiné pour le chargement
  const isLoading = isWorkspaceLoading || isChannelsLoading || isMembersLoading;
  
  // État combiné pour les erreurs
  const [error, setError] = useState<string | null>(null);

  // Mettre à jour l'état d'erreur lorsque workspaceError change
  useEffect(() => {
    if (workspaceError) {
      if ('status' in workspaceError) {
        setError(`Erreur ${workspaceError.status}: Impossible de charger l'espace de travail`);
      } else {
        setError('Erreur lors du chargement de l\'espace de travail');
      }
    } else {
      setError(null);
    }
  }, [workspaceError]);

  // Combiner les données pour créer l'objet workspace complet
  useEffect(() => {
    if (workspaceData && !isLoading) {
      // Mapper les membres pour ajouter les propriétés UI
      const mappedMembers = members.map((apiMember) => {
        // Convertir le statut au format attendu
        const userStatus = apiMember.user.status || "online";
        const mappedStatus =
          userStatus === "en ligne"
            ? "online"
            : userStatus === "absent"
              ? "away"
              : userStatus === "hors ligne"
                ? "offline"
                : "online";

        return {
          ...apiMember,
          // Ajouter des propriétés pour compatibilité avec l'ancien code
          name: apiMember.user.username,
          username: apiMember.user.username,
          email: apiMember.user.email,
          avatar: apiMember.user.avatarUrl || "",
          role: "member", // Valeur par défaut pour le rôle
          status: mappedStatus as "online" | "offline" | "away",
        };
      });

      console.log("WorkspaceScreen - workspaceDatas:", workspaceData);
      // Construire l'objet workspace avec toutes les données
      const completeWorkspace: Workspace = {
        uuid: workspaceData.workspaceId || workspaceData.uuid,
        name: workspaceData.name,
        description: workspaceData.description,
        is_public: workspaceData.is_public,
        memberCount: workspaceData.memberCount,
        owner: workspaceData.owner,
        createdAt: workspaceData.createdAt,
        channels: channels
          .filter(channel => channel.workspace_uuid === workspaceId || channel.workspace === workspaceId)
          .map((channel) => ({
            uuid: channel.id || channel.uuid,
            name: channel.name,
            description: channel.description,
            is_public: channel.is_public,
            memberCount: channel.memberCount,
          })),
        members: mappedMembers,
      };
      console.log("WorkspaceScreen - completeWorkspace:", completeWorkspace);

      setWorkspace(completeWorkspace);
    }
  }, [workspaceData, channels, members, isLoading, workspaceId]);

  // Fonction pour rafraîchir toutes les données
  const refreshWorkspace = useCallback(() => {
    refetchWorkspace();
    refetchChannels();
    refetchMembers();
  }, [refetchWorkspace, refetchChannels, refetchMembers]);

  // Fonction pour créer un nouveau canal
  const handleCreateChannel = useCallback(async () => {
    if (!workspace) return;

    try {
      const channelData = {
        name: newChannelForm.name,
        description: newChannelForm.description,
        is_public: newChannelForm.is_public,
        workspaceId: workspace.uuid,
      };

      await createChannel(channelData).unwrap();
      
      // Réinitialiser le formulaire et fermer la modal
      setNewChannelForm({
        name: "",
        description: "",
        is_public: true,
      });
      setModalState((prev) => ({ ...prev, showNewChannelModal: false }));
      
      // Rafraîchir les données
      refetchChannels();
      
      Alert.alert("Succès", "Le canal a été créé avec succès");
    } catch (error) {
      console.error("Erreur lors de la création du canal:", error);
      Alert.alert("Erreur", "Impossible de créer le canal");
    }
  }, [workspace, newChannelForm, createChannel, refetchChannels]);


  // Fonction pour supprimer un canal
  const handleRemoveChannel = useCallback(async (channelId: UUID) => {
    if (!workspace) return;

    try {
      await deleteChannel(channelId).unwrap();
      
      // Fermer la modal
      setModalState((prev) => ({ ...prev, showRemoveChannelModal: false }));
      
      // Rafraîchir les données
      refetchChannels();
      
      Alert.alert("Succès", "Le canal a été supprimé avec succès");
    } catch (error) {
      console.error("Erreur lors de la suppression du canal:", error);
      Alert.alert("Erreur", "Impossible de supprimer le canal");
    }
  }, [workspace, deleteChannel, refetchChannels]);

  // Fonction pour ajouter un membre
  const handleAddMember = useCallback(async (userId: UUID) => {
    if (!workspace) return;

    try {
      await addMember({ 
        workspaceId: workspace.uuid, 
        memberData: { userId } 
      }).unwrap();
      
      // Fermer la modal
      setModalState((prev) => ({ ...prev, showAddMemberModal: false }));
      
      // Rafraîchir les données
      refetchMembers();
      
      Alert.alert("Succès", "Le membre a été ajouté avec succès");
    } catch (error) {
      console.error("Erreur lors de l'ajout du membre:", error);
      Alert.alert("Erreur", "Impossible d'ajouter le membre");
    }
  }, [workspace, addMember, refetchMembers]);

  // Fonction pour supprimer un membre
  const handleRemoveMember = useCallback(async () => {
    if (!workspace || !modalState.memberToRemove) return;

    try {
      await removeMember({ 
        workspaceId: workspace.uuid, 
        memberId: modalState.memberToRemove.uuid 
      }).unwrap();
      
      // Fermer la modal
      setModalState((prev) => ({ 
        ...prev, 
        showRemoveMemberModal: false,
        memberToRemove: null
      }));
      
      // Rafraîchir les données
      refetchMembers();
      
      Alert.alert("Succès", "Le membre a été supprimé avec succès");
    } catch (error) {
      console.error("Erreur lors de la suppression du membre:", error);
      Alert.alert("Erreur", "Impossible de supprimer le membre");
    }
  }, [workspace, modalState.memberToRemove, removeMember, refetchMembers]);

  // Fonction pour naviguer vers un canal
  const navigateToChannel = useCallback((channelId: UUID) => {
    console.log("Naviguant vers le canal avec ID:", channelId)
    router.push({
      pathname: "/screens/workspaces/[id]/channels/[channelId]",
      params: { id: workspaceId, channelId },
  });
  }, [workspace, router]);

  // Fonction pour quitter l'espace de travail
  const [leaveWorkspaceMutation] = useLeaveWorkspaceMutation();
  
  const handleLeaveWorkspace = useCallback(async () => {
    if (!workspace) return;

    try {
      await Alert.alert(
        "Quitter l'espace de travail",
        "Êtes-vous sûr de vouloir quitter cet espace de travail ?",
        [
          { text: "Annuler", style: "cancel" },
          {
            text: "Quitter",
            style: "destructive",
            onPress: async () => {
              try {
                await leaveWorkspaceMutation(workspace.uuid).unwrap();
                router.replace("/screens/homeScreen");
                Alert.alert("Succès", "Vous avez quitté l'espace de travail");
              } catch (error) {
                console.error("Erreur lors de la sortie du workspace:", error);
                Alert.alert(
                  "Erreur",
                  "Impossible de quitter l'espace de travail"
                );
              }
            },
          },
        ]
      );
    } catch (error) {
      console.error("Erreur lors de la sortie du workspace:", error);
      Alert.alert("Erreur", "Impossible de quitter l'espace de travail");
    }
  }, [workspace, router, leaveWorkspaceMutation]);

  return {
    workspace,
    isLoading,
    error,
    activeTab,
    setActiveTab,
    searchQuery,
    setSearchQuery,
    tabs: TABS,
    newChannelForm,
    setNewChannelForm,
    modalState,
    setModalState,
    handleCreateChannel,
    handleRemoveChannel,
    handleAddMember,
    handleRemoveMember,
    navigateToChannel,
    leaveWorkspace: handleLeaveWorkspace,
    refreshWorkspace,
  };
};

export default useReduxWorkspaceScreen;
