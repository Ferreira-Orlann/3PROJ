import React from "react";
import {
    View,
    Text,
    ScrollView,
    TouchableOpacity,
    TextInput,
    Modal,
    FlatList,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import Sidebar from "@/app/components/layout/Sidebar";
import BottomBar from "@/app/components/layout/bottomBar";
import { Colors } from "@/app/theme/colors";
import { UUID } from "crypto";

// Importation des hooks et styles
import styles from "../../../styles/workspaces";
import { Channel, Member } from "../../../services/workspaces";

// Import des hooks séparés
import { useState, useEffect } from "react";
import workspaceService from "../../../services/api/endpoints/workspaces";
import channelService from "../../../services/api/endpoints/channels";
import memberService from "../../../services/api/endpoints/members";

export default function WorkspaceScreen() {
    const insets = useSafeAreaInsets();
    const router = useRouter();
    const params = useLocalSearchParams();
    const workspaceId = params.id as UUID;

    const [workspace, setWorkspace] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState("channels");
    const [searchQuery, setSearchQuery] = useState("");

    // États pour les formulaires
    const [newChannelForm, setNewChannelForm] = useState({
        name: "",
        description: "",
        is_public: true,
    });

    // État pour l'édition des informations du workspace
    const [isEditingInfo, setIsEditingInfo] = useState<boolean>(false);
    const [editedWorkspaceInfo, setEditedWorkspaceInfo] = useState<{
        name: string;
        description: string;
        is_public: boolean;
    }>({ name: "", description: "", is_public: true });

    // État pour les modals
    const [modalState, setModalState] = useState({
        showNewChannelModal: false,
        showAddMemberModal: false,
        showRemoveMemberModal: false,
        showRemoveChannelModal: false,
        showEditChannelModal: false,
        channelToRemove: null,
        channelToEdit: null,
        memberToRemove: null,
    });
    
    // État pour l'édition des informations du canal
    const [editedChannelInfo, setEditedChannelInfo] = useState<{
        name: string;
        description: string;
        is_public: boolean;
    }>({ name: "", description: "", is_public: true });

    // État pour stocker les membres du canal en cours d'édition
    const [channelMembers, setChannelMembers] = useState<Member[]>([]);
    
    // État pour indiquer si une invitation est en cours
    const [invitingMember, setInvitingMember] = useState<UUID | null>(null);

    // Définition des onglets
    const tabs = [
        { id: "channels", label: "Canaux", icon: "chatbubbles-outline" },
        { id: "members", label: "Membres", icon: "people-outline" },
        { id: "settings", label: "Paramètres", icon: "settings-outline" },
    ];

    useEffect(() => {
        if (workspace) {
            setEditedWorkspaceInfo({
                name: workspace.name,
                description: workspace.description,
                is_public: workspace.is_public,
            });
        }
    }, [workspace]);

    useEffect(() => {
        const fetchWorkspaceData = async () => {
            if (!workspaceId) {
                setError("ID de workspace invalide");
                setIsLoading(false);
                return;
            }

            setIsLoading(true);
            console.log(
                "Tentative de récupération du workspace avec ID:",
                workspaceId,
            );

            try {
                const uuid = String(workspaceId);
                const workspaceData = await workspaceService.getWorkspaceByUuid(
                    uuid as UUID,
                );
                console.log("Données du workspace récupérées:", workspaceData);

                const allChannels = await channelService.getChannels();
                const channels = allChannels.filter(
                    (channel) => channel.workspace === uuid,
                );

                console.log("Canaux récupérés:", channels);

                let members: Member[] = [];
                try {
                    const apiMembers = await memberService.getWorkspaceMembers(
                        uuid as UUID,
                    );
                    console.log("membersApi", apiMembers);
                    members = apiMembers.map((apiMember) => ({
                        ...apiMember,
                        uuid: apiMember.uuid,
                        name: apiMember.user.username,
                        username: apiMember.user.username,
                        email: apiMember.user.email,
                        avatar: apiMember.user.avatarUrl || "",
                        role: "member",
                        status:
                            (apiMember.user.status as
                                | "online"
                                | "offline"
                                | "away") || "online",
                    }));
                    console.log("Membres récupérés:", members);
                } catch (memberErr) {
                    console.error(
                        "Erreur lors de la récupération des membres:",
                        memberErr,
                    );
                }

                // Construire l'objet workspace avec toutes les données
                const completeWorkspace = {
                    uuid: workspaceData.workspaceId,
                    name: workspaceData.name,
                    description: workspaceData.description,
                    is_public: workspaceData.is_public,
                    memberCount: workspaceData.memberCount,
                    owner: workspaceData.owner,
                    createdAt: workspaceData.createdAt,
                    channels: channels.map((channel) => ({
                        uuid: channel.uuid,
                        name: channel.name,
                        description: channel.description,
                        is_public: channel.is_public,
                        memberCount: channel.memberCount,
                    })),
                    members: members,
                };

                setWorkspace(completeWorkspace);
                setError(null);
            } catch (err) {
                console.error(
                    "Erreur lors du chargement de l'espace de travail:",
                    err,
                );
                setError(
                    "Impossible de charger les données de l'espace de travail.",
                );
            } finally {
                setIsLoading(false);
            }
        };

        fetchWorkspaceData();
    }, [workspaceId]);

    const filteredChannels =
        workspace?.channels?.filter((channel: Channel) =>
            channel.name && searchQuery
                ? channel.name.toLowerCase().includes(searchQuery.toLowerCase())
                : true,
        ) || [];

    const filteredMembers =
        workspace?.members?.filter((member: Member) => {
            const displayName = member.name || member.user.username || "";
            return searchQuery
                ? displayName.toLowerCase().includes(searchQuery.toLowerCase())
                : true;
        }) || [];

    const handleOpenDirectMessage = (member: Member) => {
        // Get the user ID from either member.uuid or member.user.uuid if available
        const userId = member.user?.uuid || member.uuid;

        if (!userId) {
            console.error(
                "Erreur: UUID de l'utilisateur non disponible",
                member,
            );
            alert(
                "Impossible d'ouvrir la conversation: identifiant utilisateur manquant",
            );
            return;
        }

        const dmId = `${userId}`;
        console.log("Navigation vers message privé avec ID:", dmId);

        router.push({
            pathname: "/screens/private_messages/[userId]",
            params: { userId: dmId },
        });
    };

    const handleChannelSelect = (channelId: UUID) => {
        if (!channelId) {
            console.error("Error: Channel ID is undefined");
            return;
        }

        console.log("Selected channel ID:", channelId);
        console.log("Workspace ID:", workspaceId);

        // Make sure we have string values for both IDs
        const channelIdStr = String(channelId);
        const workspaceIdStr = String(workspaceId);

        // Use the correct path format for Expo Router
        router.push({
            pathname: "/screens/workspaces/[id]/channels/[channelId]",
            params: { id: workspaceIdStr, channelId: channelIdStr },
        });
    };

    const handleCreateChannel = async () => {
        if (!workspace) return;

        try {
            setIsLoading(true);

            // Créer le canal via l'API
            const channelData = {
                name: newChannelForm.name,
                description: newChannelForm.description,
                is_public: newChannelForm.is_public,
                workspaceId: workspaceId, // Utiliser workspaceId au lieu de workspace_uuid pour correspondre à l'interface CreateChannelData
            };
            console.log("Data envoyée pour création de canal:", channelData);

            const createdChannel =
                await channelService.createChannel(channelData);
            console.log("Canal créé avec succès:", createdChannel);

            // S'assurer que nous avons un UUID valide pour le canal créé
            const channelUuid = createdChannel.uuid || createdChannel.id;

            if (!channelUuid) {
                console.error(
                    "Erreur: UUID du canal créé non disponible",
                    createdChannel,
                );
                throw new Error("UUID du canal non disponible");
            }

            // Mettre à jour l'état local
            setWorkspace({
                ...workspace,
                channels: [
                    ...workspace.channels,
                    {
                        uuid: channelUuid,
                        name: createdChannel.name,
                        description: createdChannel.description || "",
                        is_public: createdChannel.is_public,
                        memberCount: 1,
                    },
                ],
            });

            setNewChannelForm({
                name: "",
                description: "",
                is_public: true,
            });

            handleCloseModals();

            // Rediriger vers le nouveau canal
            // Utiliser le channelUuid qu'on a déjà vérifié au lieu de createdChannel.id
            handleChannelSelect(channelUuid);
        } catch (err) {
            console.error("Erreur lors de la création du canal:", err);
            // Utiliser alert au lieu de Alert.alert pour la compatibilité
            alert("Erreur: Impossible de créer le canal.");
        } finally {
            setIsLoading(false);
        }
    };

    // Gérer la suppression d'un membre
    const handleRemoveMember = async (memberId: UUID) => {
        try {
            setIsLoading(true);

            if (!workspace) {
                throw new Error("Workspace non défini");
            }

            // Appeler l'API pour supprimer le membre
            await memberService.removeMember(workspace.uuid as UUID, memberId);

            // Mettre à jour l'état local
            setWorkspace({
                ...workspace,
                members: workspace.members.filter((m) => m.uuid !== memberId),
                memberCount: workspace.memberCount - 1,
            });

            handleCloseModals();

            window.alert("Le membre a été retiré de l'espace de travail.");
        } catch (err) {
            console.error("Erreur lors de la suppression du membre:", err);
            window.alert("Impossible de supprimer le membre.");
        } finally {
            setIsLoading(false);
        }
    };

    // Gérer la suppression d'un canal
    const handleRemoveChannel = async (channelId: UUID) => {
        try {
            setIsLoading(true);

            if (!workspace) {
                throw new Error("Workspace non défini");
            }

            // Appeler l'API pour supprimer le canal
            await channelService.deleteChannel(channelId);

            // Mettre à jour l'état local
            setWorkspace({
                ...workspace,
                channels: workspace.channels.filter(
                    (c) => c.uuid !== channelId,
                ),
                channelCount: workspace.channelCount - 1,
            });

            handleCloseModals();

            window.alert("Le canal a été supprimé de l'espace de travail.");
        } catch (err) {
            console.error("Erreur lors de la suppression du canal:", err);
            window.alert("Impossible de supprimer le canal.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleOpenRemoveMemberModal = (member: Member) => {
        setModalState({
            ...modalState,
            showRemoveMemberModal: true,
            memberToRemove: member,
        });
    };
    
    // Ouvrir le modal de suppression de canal
    const handleOpenRemoveChannelModal = (channel: Channel) => {
        setModalState({
            ...modalState,
            showRemoveChannelModal: true,
            channelToRemove: channel,
        });
    };
    
    // Ouvrir le modal d'édition de canal
    const handleOpenEditChannelModal = async (channel: Channel) => {
        setEditedChannelInfo({
            name: channel.name,
            description: channel.description,
            is_public: channel.is_public,
        });
        
        // Récupérer les membres du canal
        try {
            const channelMembersList = await channelService.getChannelMembers(channel.uuid);
            setChannelMembers(channelMembersList);
        } catch (error) {
            console.error("Erreur lors de la récupération des membres du canal:", error);
            setChannelMembers([]);
        }
        
        setModalState({
            ...modalState,
            showEditChannelModal: true,
            channelToEdit: channel,
        });
    };
    
    // Mettre à jour le formulaire d'édition de canal
    const updateEditedChannelInfo = (field: string, value: any) => {
        setEditedChannelInfo({
            ...editedChannelInfo,
            [field]: value,
        });
    };
    
    // Inviter un membre à rejoindre le canal
    const handleInviteMemberToChannel = async (memberId: UUID) => {
        if (!modalState.channelToEdit) return;
        
        setInvitingMember(memberId);
        
        try {
            await channelService.inviteMemberToChannel(
                modalState.channelToEdit.uuid,
                memberId
            );
            
            // Mettre à jour la liste des membres du canal
            const updatedMembers = await channelService.getChannelMembers(modalState.channelToEdit.uuid);
            setChannelMembers(updatedMembers);
            
            window.alert("Invitation envoyée avec succès.");
        } catch (error) {
            console.error("Erreur lors de l'invitation du membre:", error);
            window.alert("Erreur lors de l'envoi de l'invitation.");
        } finally {
            setInvitingMember(null);
        }
    };
    
    // Vérifier si un membre est déjà dans le canal
    const isMemberInChannel = (memberId: UUID): boolean => {
        return channelMembers.some(member => member.uuid === memberId);
    };
    
    // Gérer la mise à jour d'un canal
    const handleUpdateChannel = async () => {
        try {
            setIsLoading(true);
            
            if (!workspace || !modalState.channelToEdit) {
                throw new Error("Workspace ou canal non défini");
            }
            
            // Préparer les données à mettre à jour
            const channelData = {
                name: editedChannelInfo.name,
                description: editedChannelInfo.description,
                is_public: editedChannelInfo.is_public,
            };
            
            const updatedChannel = await channelService.updateChannel(
                workspaceId as UUID,
                modalState.channelToEdit.uuid,
                channelData
            );
            
            // Mettre à jour l'état local
            setWorkspace({
                ...workspace,
                channels: workspace.channels.map(c => 
                    c.uuid === modalState.channelToEdit?.uuid 
                        ? {
                            ...c,
                            name: updatedChannel.name,
                            description: updatedChannel.description,
                            is_public: updatedChannel.is_public,
                          }
                        : c
                ),
            });
            
            handleCloseModals();
            window.alert("Les informations du canal ont été mises à jour avec succès.");
        } catch (err) {
            console.error("Erreur lors de la mise à jour du canal:", err);
            window.alert("Impossible de mettre à jour les informations du canal.");
        } finally {
            setIsLoading(false);
        }
    };


    const handleOpenNewChannelModal = () => {
        setModalState({
            ...modalState,
            showNewChannelModal: true,
        });
    };

    const handleOpenAddMemberModal = () => {
        setModalState({
            ...modalState,
            showAddMemberModal: true,
        });
    };

    const handleCloseModals = () => {
        setModalState({
            showNewChannelModal: false,
            showAddMemberModal: false,
            showRemoveMemberModal: false,
            showRemoveChannelModal: false,
            showEditChannelModal: false,
            channelToRemove: null,
            channelToEdit: null,
            memberToRemove: null,
        });
        // Réinitialiser les états liés au modal d'édition de canal
        setChannelMembers([]);
        setInvitingMember(null);
    };

    const updateNewChannelForm = (field: string, value: any) => {
        setNewChannelForm({
            ...newChannelForm,
            [field]: value,
        });
    };

    const handleUpdateWorkspaceInfo = async () => {
        try {
            setIsLoading(true);

            if (!workspace) {
                throw new Error("Workspace non défini");
            }

            // Préparer les données à mettre à jour
            const workspaceData = {
                name: editedWorkspaceInfo.name,
                description: editedWorkspaceInfo.description,
                is_public: editedWorkspaceInfo.is_public,
            };

            const updatedWorkspace = await workspaceService.updateWorkspace(
                workspaceId as UUID,
                workspaceData,
            );

            setWorkspace({
                ...workspace,
                name: updatedWorkspace.name,
                description: updatedWorkspace.description,
                is_public: updatedWorkspace.is_public,
            });

            setIsEditingInfo(false);
            window.alert(
                "Les informations de l'espace de travail ont été mises à jour avec succès.",
            );
        } catch (err) {
            console.error("Erreur lors de la mise à jour du workspace:", err);
            window.alert(
                "Impossible de mettre à jour les informations de l'espace de travail.",
            );
        } finally {
            setIsLoading(false);
        }
    };

    if (!workspace) {
        return (
            <>
                <View style={[styles.container, { paddingTop: insets.top }]}>
                    <Sidebar />
                    <View style={styles.mainContent}>
                        <View style={styles.errorContainer}>
                            <Text style={styles.errorText}>
                                Espace de travail non trouvé
                            </Text>
                            <TouchableOpacity
                                style={styles.backButton}
                                onPress={() => handleCloseModals()}
                            >
                                <Text style={styles.backButtonText}>
                                    Retour
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
                <BottomBar />
            </>
        );
    }

    const renderChannelItem = ({ item }: { item: Channel }) => (
        <TouchableOpacity
            style={styles.channelCard}
            onPress={() => handleChannelSelect(item.uuid)}
            activeOpacity={0.7}
        >
            <View style={styles.channelIconContainer}>
                <View
                    style={[
                        styles.channelIconBadge,
                        {
                            backgroundColor: item.is_public
                                ? "#43b581"
                                : "#faa61a",
                        },
                    ]}
                >
                    <Ionicons
                        name={
                            item.is_public
                                ? "apps-outline"
                                : "lock-closed-outline"
                        }
                        size={24}
                        color="#fff"
                    />
                </View>
            </View>

            <View style={styles.channelContent}>
                <Text style={styles.channelTitle}>{item.name}</Text>
                <Text style={styles.channelDescription} numberOfLines={2}>
                    {item.description}
                </Text>

                <View style={styles.channelMeta}>
                    <View style={styles.channelMetaItem}>
                        <Ionicons
                            name="people-outline"
                            size={14}
                            color="#8e9297"
                        />
                        <Text style={styles.channelMetaText}>
                            {item.memberCount}
                        </Text>
                    </View>

                    <View style={styles.memberActions}>
                        <TouchableOpacity
                            style={styles.memberActionButton}
                            onPress={(e) => {
                                e.stopPropagation();
                                handleOpenEditChannelModal(item);
                            }}
                        >
                            <Ionicons
                                name="create-outline"
                                size={22}
                                color="#8e9297"
                            />
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={styles.memberActionButton}
                            onPress={(e) => {
                                e.stopPropagation();
                                handleOpenRemoveChannelModal(item);
                            }}
                        >
                            <Ionicons
                                name="trash-outline"
                                size={22}
                                color="#ED4245"
                            />
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </TouchableOpacity>
    );

    const renderMemberItem = ({ item }: { item: Member }) => {
        const displayName = item.name || item.user.username || "U";
        let status = item.status || "offline";
        const statusMapping: Record<string, string> = {
            online: "en ligne",
            away: "absent",
            offline: "hors ligne",
        };
        const displayStatus = statusMapping[status] || status;

        console.log("Rendering member item:", item);

        return (
            <TouchableOpacity
                style={styles.memberCard}
                activeOpacity={0.7}
                onPress={() => handleOpenDirectMessage(item)}
            >
                <View style={styles.memberAvatarContainer}>
                    <View
                        style={[
                            styles.memberAvatar,
                            {
                                borderColor:
                                    displayStatus === "en ligne"
                                        ? "#43b581"
                                        : displayStatus === "absent"
                                          ? "#faa61a"
                                          : "#747f8d",
                            },
                        ]}
                    >
                        <Text style={styles.memberAvatarText}>
                            {displayName.charAt(0)}
                        </Text>
                    </View>
                    <View
                        style={[
                            styles.statusIndicator,
                            {
                                backgroundColor:
                                    displayStatus === "en ligne"
                                        ? "#43b581"
                                        : displayStatus === "absent"
                                          ? "#faa61a"
                                          : "#747f8d",
                            },
                        ]}
                    />
                </View>

                <View style={styles.memberInfo}>
                    <View style={styles.memberNameContainer}>
                        <Text style={styles.memberName}>{displayName}</Text>
                        <View
                            style={[
                                styles.memberRoleBadge,
                                {
                                    backgroundColor:
                                        item.role === "admin"
                                            ? "#ed4245"
                                            : "#0721f8",
                                },
                            ]}
                        >
                            <Text style={styles.memberRoleText}>
                                {item.role || "member"}
                            </Text>
                        </View>
                    </View>

                    <Text style={styles.memberStatusText}>{status}</Text>
                </View>

                <View style={styles.memberActions}>
                    <TouchableOpacity
                        style={styles.memberActionButton}
                        onPress={(e) => {
                            e.stopPropagation();
                            handleOpenRemoveMemberModal(item);
                        }}
                    >
                        <Ionicons
                            name="remove-circle-outline"
                            size={22}
                            color="#8e9297"
                        />
                    </TouchableOpacity>
                </View>
            </TouchableOpacity>
        );
    };

    return (
        <>
            <Sidebar />
            <View style={[styles.container, { paddingTop: insets.top }]}>
                <View style={styles.mainContent}>
                    {/* Workspace Header - Style amélioré */}
                    <View style={styles.header}>
                        <View style={styles.headerContent}>
                            <View style={styles.workspaceAvatarContainer}>
                                <View style={styles.workspaceAvatar}>
                                    <Text style={styles.workspaceAvatarText}>
                                        {workspace.name[0]}
                                    </Text>
                                </View>
                                <View style={styles.badgeContainer}>
                                    <View
                                        style={[
                                            styles.statusBadge,
                                            {
                                                backgroundColor:
                                                    workspace.is_public
                                                        ? "#43b581"
                                                        : "#faa61a",
                                            },
                                        ]}
                                    >
                                        <Text style={styles.statusBadgeText}>
                                            {workspace.is_public
                                                ? "Public"
                                                : "Privé"}
                                        </Text>
                                    </View>
                                </View>
                            </View>

                            <View style={styles.workspaceInfoContainer}>
                                <Text style={styles.workspaceName}>
                                    {workspace.name}
                                </Text>
                                <Text style={styles.workspaceDescription}>
                                    {workspace.description}
                                </Text>

                                <View style={styles.workspaceStats}>
                                    <View style={styles.statItem}>
                                        <Ionicons
                                            name="people-outline"
                                            size={16}
                                            color="#8e9297"
                                        />
                                        <Text style={styles.statText}>
                                            {workspace.members.length} membres
                                        </Text>
                                    </View>
                                    <View style={styles.statItem}>
                                        <Ionicons
                                            name="calendar-outline"
                                            size={16}
                                            color="#8e9297"
                                        />
                                        <Text style={styles.statText}>
                                            Créé le{" "}
                                            {workspace.createdAt
                                                ? workspace.createdAt.toLocaleDateString(
                                                      "fr-FR",
                                                  )
                                                : "date inconnue"}
                                        </Text>
                                    </View>
                                </View>
                            </View>
                        </View>

                        <View style={styles.headerActions}>
                            <TouchableOpacity
                                style={styles.inviteButton}
                                onPress={() => handleOpenAddMemberModal()}
                            >
                                <Ionicons
                                    name="person-add"
                                    size={18}
                                    color="#fff"
                                />
                                <Text style={styles.inviteButtonText}>
                                    Inviter
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </View>

                    {/* Tabs - Style amélioré */}
                    <View style={styles.tabsContainer}>
                        {tabs.map((tab) => (
                            <TouchableOpacity
                                key={tab.id}
                                style={[
                                    styles.tab,
                                    activeTab === tab.id && styles.activeTab,
                                ]}
                                onPress={() => setActiveTab(tab.id)}
                            >
                                <View style={styles.tabContent}>
                                    <Ionicons
                                        name={tab.icon as any}
                                        size={22}
                                        color={
                                            activeTab === tab.id
                                                ? Colors.primary
                                                : "#8e9297"
                                        }
                                    />
                                    <Text
                                        style={[
                                            styles.tabText,
                                            activeTab === tab.id &&
                                                styles.activeTabText,
                                        ]}
                                    >
                                        {tab.label}
                                    </Text>
                                </View>
                                {activeTab === tab.id && (
                                    <View style={styles.activeTabIndicator} />
                                )}
                            </TouchableOpacity>
                        ))}
                    </View>

                    {/* Search and Action Bar - Style amélioré */}
                    <View style={styles.actionBar}>
                        <View style={styles.searchContainer}>
                            <Ionicons name="search" size={18} color="#8e9297" />
                            <TextInput
                                style={styles.searchInput}
                                placeholder={`Rechercher des ${activeTab === "channels" ? "canaux" : activeTab === "members" ? "membres" : "paramètres"}...`}
                                placeholderTextColor="#8e9297"
                                value={searchQuery}
                                onChangeText={setSearchQuery}
                            />
                        </View>

                        <View style={styles.actionButtonContainer}>
                            {activeTab === "channels" && (
                                <TouchableOpacity
                                    style={styles.addButton}
                                    onPress={() => handleOpenNewChannelModal()}
                                >
                                    <Ionicons
                                        name="add-circle"
                                        size={24}
                                        color="#fff"
                                    />
                                    <Text style={styles.addButtonText}>
                                        Nouveau
                                    </Text>
                                </TouchableOpacity>
                            )}

                            {activeTab === "members" && (
                                <TouchableOpacity
                                    style={styles.addButton}
                                    onPress={() => handleOpenAddMemberModal()}
                                >
                                    <Ionicons
                                        name="person-add"
                                        size={24}
                                        color="#fff"
                                    />
                                    <Text style={styles.addButtonText}>
                                        Inviter
                                    </Text>
                                </TouchableOpacity>
                            )}
                        </View>
                    </View>

                    {/* Content based on active tab */}
                    <View style={styles.contentContainer}>
                        {/* Channels Tab */}
                        {activeTab === "channels" && (
                            <FlatList
                                data={filteredChannels}
                                renderItem={renderChannelItem}
                                keyExtractor={(item) => item.uuid}
                                contentContainerStyle={styles.listContent}
                                showsVerticalScrollIndicator={false}
                                numColumns={1}
                            />
                        )}

                        {/* Members Tab */}
                        {activeTab === "members" && (
                            <FlatList
                                data={filteredMembers}
                                renderItem={renderMemberItem}
                                keyExtractor={(item) => item.uuid}
                                contentContainerStyle={styles.listContent}
                                showsVerticalScrollIndicator={false}
                            />
                        )}

                        {/* Settings Tab - Style amélioré */}
                        {activeTab === "settings" && (
                            <ScrollView
                                style={styles.settingsContainer}
                                showsVerticalScrollIndicator={false}
                            >
                                {/* En-tête des paramètres */}
                                <View style={styles.settingsHeader}>
                                    <Ionicons
                                        name="settings-outline"
                                        size={24}
                                        color="#fff"
                                    />
                                    <Text style={styles.settingsHeaderTitle}>
                                        Paramètres de l'espace de travail
                                    </Text>
                                </View>

                                {/* Informations générales */}
                                <View style={styles.settingSection}>
                                    <View style={styles.sectionHeader}>
                                        <Ionicons
                                            name="information-circle-outline"
                                            size={22}
                                            color={Colors.primary}
                                        />
                                        <Text
                                            style={styles.settingSectionTitle}
                                        >
                                            Informations générales
                                        </Text>

                                        {!isEditingInfo && (
                                            <TouchableOpacity
                                                style={styles.editButton}
                                                onPress={() =>
                                                    setIsEditingInfo(true)
                                                }
                                            >
                                                <Ionicons
                                                    name="create-outline"
                                                    size={20}
                                                    color={Colors.primary}
                                                />
                                                <Text
                                                    style={
                                                        styles.editButtonText
                                                    }
                                                >
                                                    Modifier
                                                </Text>
                                            </TouchableOpacity>
                                        )}

                                        {isEditingInfo && (
                                            <View style={styles.editActions}>
                                                <TouchableOpacity
                                                    style={[
                                                        styles.editActionButton,
                                                        styles.saveButton,
                                                    ]}
                                                    onPress={
                                                        handleUpdateWorkspaceInfo
                                                    }
                                                >
                                                    <Ionicons
                                                        name="checkmark-outline"
                                                        size={18}
                                                        color="#fff"
                                                    />
                                                    <Text
                                                        style={
                                                            styles.saveButtonText
                                                        }
                                                    >
                                                        Enregistrer
                                                    </Text>
                                                </TouchableOpacity>

                                                <TouchableOpacity
                                                    style={[
                                                        styles.editActionButton,
                                                        styles.cancelButton,
                                                    ]}
                                                    onPress={() => {
                                                        setIsEditingInfo(false);
                                                        setEditedWorkspaceInfo({
                                                            name: workspace.name,
                                                            description:
                                                                workspace.description,
                                                            is_public:
                                                                workspace.is_public,
                                                        });
                                                    }}
                                                >
                                                    <Ionicons
                                                        name="close-outline"
                                                        size={18}
                                                        color="#fff"
                                                    />
                                                    <Text
                                                        style={
                                                            styles.cancelButtonText
                                                        }
                                                    >
                                                        Annuler
                                                    </Text>
                                                </TouchableOpacity>
                                            </View>
                                        )}
                                    </View>

                                    <View style={styles.settingCard}>
                                        <View style={styles.settingItem}>
                                            <Text style={styles.settingLabel}>
                                                Nom de l'espace
                                            </Text>
                                            <View style={styles.inputContainer}>
                                                <TextInput
                                                    style={[
                                                        styles.settingInput,
                                                        isEditingInfo &&
                                                            styles.activeInput,
                                                    ]}
                                                    value={
                                                        editedWorkspaceInfo.name
                                                    }
                                                    onChangeText={(text) =>
                                                        setEditedWorkspaceInfo({
                                                            ...editedWorkspaceInfo,
                                                            name: text,
                                                        })
                                                    }
                                                    placeholder="Nom de l'espace de travail"
                                                    placeholderTextColor="#8e9297"
                                                    editable={isEditingInfo}
                                                />
                                                {isEditingInfo && (
                                                    <Ionicons
                                                        name="pencil-outline"
                                                        size={20}
                                                        color={Colors.primary}
                                                        style={styles.inputIcon}
                                                    />
                                                )}
                                            </View>
                                        </View>

                                        <View style={styles.settingDivider} />

                                        <View style={styles.settingItem}>
                                            <Text style={styles.settingLabel}>
                                                Description
                                            </Text>
                                            <View style={styles.inputContainer}>
                                                <TextInput
                                                    style={[
                                                        styles.settingInput,
                                                        styles.textArea,
                                                        isEditingInfo &&
                                                            styles.activeInput,
                                                    ]}
                                                    value={
                                                        editedWorkspaceInfo.description
                                                    }
                                                    onChangeText={(text) =>
                                                        setEditedWorkspaceInfo({
                                                            ...editedWorkspaceInfo,
                                                            description: text,
                                                        })
                                                    }
                                                    placeholder="Description de l'espace de travail"
                                                    placeholderTextColor="#8e9297"
                                                    multiline
                                                    numberOfLines={3}
                                                    editable={isEditingInfo}
                                                />
                                                {isEditingInfo && (
                                                    <Ionicons
                                                        name="pencil-outline"
                                                        size={20}
                                                        color={Colors.primary}
                                                        style={[
                                                            styles.inputIcon,
                                                            {
                                                                alignSelf:
                                                                    "flex-start",
                                                                marginTop: 8,
                                                            },
                                                        ]}
                                                    />
                                                )}
                                            </View>
                                        </View>

                                        <View style={styles.settingDivider} />

                                        <View style={styles.settingItem}>
                                            <Text style={styles.settingLabel}>
                                                Visibilité
                                            </Text>
                                            <View
                                                style={styles.visibilityOptions}
                                            >
                                                <TouchableOpacity
                                                    style={[
                                                        styles.visibilityOption,
                                                        editedWorkspaceInfo.is_public &&
                                                            styles.selectedVisibility,
                                                    ]}
                                                    onPress={() =>
                                                        isEditingInfo &&
                                                        setEditedWorkspaceInfo({
                                                            ...editedWorkspaceInfo,
                                                            is_public: true,
                                                        })
                                                    }
                                                    disabled={!isEditingInfo}
                                                >
                                                    <Ionicons
                                                        name="globe-outline"
                                                        size={20}
                                                        color={
                                                            editedWorkspaceInfo.is_public
                                                                ? "#fff"
                                                                : "#8e9297"
                                                        }
                                                    />
                                                    <Text
                                                        style={[
                                                            styles.visibilityText,
                                                            editedWorkspaceInfo.is_public &&
                                                                styles.selectedVisibilityText,
                                                        ]}
                                                    >
                                                        Public
                                                    </Text>
                                                </TouchableOpacity>

                                                <TouchableOpacity
                                                    style={[
                                                        styles.visibilityOption,
                                                        !editedWorkspaceInfo.is_public &&
                                                            styles.selectedVisibility,
                                                    ]}
                                                    onPress={() =>
                                                        isEditingInfo &&
                                                        setEditedWorkspaceInfo({
                                                            ...editedWorkspaceInfo,
                                                            is_public: false,
                                                        })
                                                    }
                                                    disabled={!isEditingInfo}
                                                >
                                                    <Ionicons
                                                        name="lock-closed-outline"
                                                        size={20}
                                                        color={
                                                            !editedWorkspaceInfo.is_public
                                                                ? "#fff"
                                                                : "#8e9297"
                                                        }
                                                    />
                                                    <Text
                                                        style={[
                                                            styles.visibilityText,
                                                            !editedWorkspaceInfo.is_public &&
                                                                styles.selectedVisibilityText,
                                                        ]}
                                                    >
                                                        Privé
                                                    </Text>
                                                </TouchableOpacity>
                                            </View>
                                        </View>
                                    </View>
                                </View>

                                {/* Permissions */}
                                <View style={styles.settingSection}>
                                    <View style={styles.sectionHeader}>
                                        <Ionicons
                                            name="shield-checkmark-outline"
                                            size={22}
                                            color={Colors.primary}
                                        />
                                        <Text
                                            style={styles.settingSectionTitle}
                                        >
                                            Permissions
                                        </Text>
                                    </View>

                                    <View style={styles.settingCard}>
                                        <View style={styles.settingItem}>
                                            <View>
                                                <Text
                                                    style={styles.settingLabel}
                                                >
                                                    Qui peut créer des canaux
                                                </Text>
                                                <Text
                                                    style={
                                                        styles.settingSubLabel
                                                    }
                                                >
                                                    Définir qui peut ajouter de
                                                    nouveaux canaux
                                                </Text>
                                            </View>
                                            <TouchableOpacity
                                                style={styles.settingDropdown}
                                            >
                                                <Text
                                                    style={styles.dropdownText}
                                                >
                                                    Administrateurs
                                                </Text>
                                                <Ionicons
                                                    name="chevron-down"
                                                    size={16}
                                                    color="#8e9297"
                                                />
                                            </TouchableOpacity>
                                        </View>

                                        <View style={styles.settingDivider} />

                                        <View style={styles.settingItem}>
                                            <View>
                                                <Text
                                                    style={styles.settingLabel}
                                                >
                                                    Qui peut inviter des membres
                                                </Text>
                                                <Text
                                                    style={
                                                        styles.settingSubLabel
                                                    }
                                                >
                                                    Contrôler qui peut ajouter
                                                    de nouveaux membres
                                                </Text>
                                            </View>
                                            <TouchableOpacity
                                                style={styles.settingDropdown}
                                            >
                                                <Text
                                                    style={styles.dropdownText}
                                                >
                                                    Tous les membres
                                                </Text>
                                                <Ionicons
                                                    name="chevron-down"
                                                    size={16}
                                                    color="#8e9297"
                                                />
                                            </TouchableOpacity>
                                        </View>
                                    </View>
                                </View>

                                {/* Actions avancées */}
                                <View style={styles.settingSection}>
                                    <View style={styles.sectionHeader}>
                                        <Ionicons
                                            name="alert-circle-outline"
                                            size={22}
                                            color="#ed4245"
                                        />
                                        <Text
                                            style={[
                                                styles.settingSectionTitle,
                                                { color: "#ed4245" },
                                            ]}
                                        >
                                            Actions avancées
                                        </Text>
                                    </View>

                                    <View style={styles.dangerCard}>
                                        <View style={styles.dangerItem}>
                                            <View>
                                                <Text
                                                    style={
                                                        styles.dangerItemTitle
                                                    }
                                                >
                                                    Quitter l'espace de travail
                                                </Text>
                                                <Text
                                                    style={
                                                        styles.dangerItemDescription
                                                    }
                                                >
                                                    Vous ne pourrez plus accéder
                                                    aux canaux et messages de
                                                    cet espace
                                                </Text>
                                            </View>
                                            <TouchableOpacity
                                                style={
                                                    styles.dangerActionButton
                                                }
                                            >
                                                <Ionicons
                                                    name="exit-outline"
                                                    size={22}
                                                    color="#fff"
                                                />
                                            </TouchableOpacity>
                                        </View>

                                        {workspace.owner ===
                                            "Sophie Martin" && (
                                            <>
                                                <View
                                                    style={
                                                        styles.settingDivider
                                                    }
                                                />
                                                <View style={styles.dangerItem}>
                                                    <View>
                                                        <Text
                                                            style={
                                                                styles.dangerItemTitle
                                                            }
                                                        >
                                                            Supprimer l'espace
                                                            de travail
                                                        </Text>
                                                        <Text
                                                            style={
                                                                styles.dangerItemDescription
                                                            }
                                                        >
                                                            Cette action est
                                                            irréversible. Tous
                                                            les canaux et
                                                            messages seront
                                                            supprimés
                                                            définitivement.
                                                        </Text>
                                                    </View>
                                                    <TouchableOpacity
                                                        style={[
                                                            styles.dangerActionButton,
                                                            {
                                                                backgroundColor:
                                                                    "#ed4245",
                                                            },
                                                        ]}
                                                    >
                                                        <Ionicons
                                                            name="trash-outline"
                                                            size={22}
                                                            color="#fff"
                                                        />
                                                    </TouchableOpacity>
                                                </View>
                                            </>
                                        )}
                                    </View>
                                </View>

                                {/* Espace en bas pour le défilement */}
                                <View style={{ height: 40 }} />
                            </ScrollView>
                        )}
                    </View>
                </View>
            </View>

            {/* New Channel Modal - Style amélioré */}
            <Modal
                visible={modalState.showNewChannelModal}
                transparent={true}
                animationType="slide"
                onRequestClose={() => handleCloseModals()}
                statusBarTranslucent={true}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <View style={styles.modalHeaderContent}>
                                <Ionicons
                                    name="add-circle"
                                    size={24}
                                    color={Colors.primary}
                                />
                                <Text style={styles.modalTitle}>
                                    Nouveau canal
                                </Text>
                            </View>
                            <TouchableOpacity
                                style={styles.modalCloseButton}
                                onPress={() => handleCloseModals()}
                            >
                                <Ionicons
                                    name="close"
                                    size={24}
                                    color="#8e9297"
                                />
                            </TouchableOpacity>
                        </View>

                        <ScrollView
                            style={styles.modalBody}
                            showsVerticalScrollIndicator={false}
                        >
                            <View style={styles.formGroup}>
                                <View style={styles.formLabelContainer}>
                                    <Ionicons
                                        name="text-outline"
                                        size={18}
                                        color="#8e9297"
                                    />
                                    <Text style={styles.formLabel}>
                                        Nom du canal
                                    </Text>
                                </View>
                                <TextInput
                                    style={styles.formInput}
                                    placeholder="ex: marketing-général"
                                    placeholderTextColor="#8e9297"
                                    value={newChannelForm.name}
                                    onChangeText={(text) =>
                                        updateNewChannelForm("name", text)
                                    }
                                />
                            </View>

                            <View style={styles.formGroup}>
                                <View style={styles.formLabelContainer}>
                                    <Ionicons
                                        name="document-text-outline"
                                        size={18}
                                        color="#8e9297"
                                    />
                                    <Text style={styles.formLabel}>
                                        Description
                                    </Text>
                                </View>
                                <TextInput
                                    style={[styles.formInput, styles.textArea]}
                                    placeholder="À quoi servira ce canal?"
                                    placeholderTextColor="#8e9297"
                                    multiline
                                    numberOfLines={3}
                                    value={newChannelForm.description}
                                    onChangeText={(text) =>
                                        updateNewChannelForm(
                                            "description",
                                            text,
                                        )
                                    }
                                />
                            </View>

                            <View style={styles.formGroup}>
                                <View style={styles.formLabelContainer}>
                                    <Ionicons
                                        name="eye-outline"
                                        size={18}
                                        color="#8e9297"
                                    />
                                    <Text style={styles.formLabel}>
                                        Visibilité
                                    </Text>
                                </View>
                                <View style={styles.visibilityOptions}>
                                    <TouchableOpacity
                                        style={[
                                            styles.visibilityOption,
                                            newChannelForm.is_public &&
                                                styles.selectedVisibility,
                                        ]}
                                        onPress={() =>
                                            updateNewChannelForm(
                                                "is_public",
                                                true,
                                            )
                                        }
                                    >
                                        <Ionicons
                                            name="globe-outline"
                                            size={20}
                                            color={
                                                newChannelForm.is_public
                                                    ? "#fff"
                                                    : "#8e9297"
                                            }
                                        />
                                        <Text
                                            style={[
                                                styles.visibilityText,
                                                newChannelForm.is_public &&
                                                    styles.selectedVisibilityText,
                                            ]}
                                        >
                                            Public
                                        </Text>
                                        {newChannelForm.is_public && (
                                            <View
                                                style={
                                                    styles.visibilityCheckmark
                                                }
                                            >
                                                <Ionicons
                                                    name="checkmark"
                                                    size={12}
                                                    color="#fff"
                                                />
                                            </View>
                                        )}
                                    </TouchableOpacity>

                                    <TouchableOpacity
                                        style={[
                                            styles.visibilityOption,
                                            !newChannelForm.is_public &&
                                                styles.selectedVisibility,
                                        ]}
                                        onPress={() =>
                                            updateNewChannelForm(
                                                "is_public",
                                                false,
                                            )
                                        }
                                    >
                                        <Ionicons
                                            name="lock-closed-outline"
                                            size={20}
                                            color={
                                                !newChannelForm.is_public
                                                    ? "#fff"
                                                    : "#8e9297"
                                            }
                                        />
                                        <Text
                                            style={[
                                                styles.visibilityText,
                                                !newChannelForm.is_public &&
                                                    styles.selectedVisibilityText,
                                            ]}
                                        >
                                            Privé
                                        </Text>
                                        {!newChannelForm.is_public && (
                                            <View
                                                style={
                                                    styles.visibilityCheckmark
                                                }
                                            >
                                                <Ionicons
                                                    name="checkmark"
                                                    size={12}
                                                    color="#fff"
                                                />
                                            </View>
                                        )}
                                    </TouchableOpacity>
                                </View>
                                <Text style={styles.visibilityDescription}>
                                    {newChannelForm.is_public
                                        ? "Les canaux publics sont accessibles à tous les membres de l'espace de travail."
                                        : "Les canaux privés ne sont accessibles que sur invitation."}
                                </Text>
                            </View>
                        </ScrollView>

                        <View style={styles.modalFooter}>
                            <TouchableOpacity
                                style={styles.cancelButton}
                                onPress={() => handleCloseModals()}
                            >
                                <Text style={styles.cancelButtonText}>
                                    Annuler
                                </Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={[
                                    styles.createButton,
                                    !newChannelForm.name.trim() &&
                                        styles.disabledButton,
                                ]}
                                onPress={handleCreateChannel}
                                disabled={!newChannelForm.name.trim()}
                            >
                                <Ionicons
                                    name="add-circle-outline"
                                    size={18}
                                    color="#fff"
                                />
                                <Text style={styles.createButtonText}>
                                    Créer le canal
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>

            {/* Add Member Modal - Style amélioré */}
            <Modal
                visible={modalState.showAddMemberModal}
                transparent={true}
                animationType="slide"
                onRequestClose={() => handleCloseModals()}
                statusBarTranslucent={true}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <View style={styles.modalHeaderContent}>
                                <Ionicons
                                    name="people"
                                    size={24}
                                    color={Colors.primary}
                                />
                                <Text style={styles.modalTitle}>
                                    Inviter des membres
                                </Text>
                            </View>
                            <TouchableOpacity
                                style={styles.modalCloseButton}
                                onPress={() => handleCloseModals()}
                            >
                                <Ionicons
                                    name="close"
                                    size={24}
                                    color="#8e9297"
                                />
                            </TouchableOpacity>
                        </View>

                        <ScrollView
                            style={styles.modalBody}
                            showsVerticalScrollIndicator={false}
                        >
                            <View style={styles.formGroup}>
                                <View style={styles.formLabelContainer}>
                                    <Ionicons
                                        name="link-outline"
                                        size={18}
                                        color="#8e9297"
                                    />
                                    <Text style={styles.formLabel}>
                                        Lien d'invitation
                                    </Text>
                                </View>
                                <View style={styles.inviteLinkContainer}>
                                    <Text style={styles.inviteLink}>
                                        https://supchat.com/invite/abc123
                                    </Text>
                                    <TouchableOpacity style={styles.copyButton}>
                                        <Ionicons
                                            name="copy-outline"
                                            size={18}
                                            color="#fff"
                                        />
                                    </TouchableOpacity>
                                </View>
                                <Text style={styles.inviteLinkHint}>
                                    Partagez ce lien pour inviter des personnes
                                    à rejoindre cet espace de travail
                                </Text>
                            </View>

                            <View style={styles.formDivider} />

                            <View style={styles.formGroup}>
                                <View style={styles.formLabelContainer}>
                                    <Ionicons
                                        name="mail-outline"
                                        size={18}
                                        color="#8e9297"
                                    />
                                    <Text style={styles.formLabel}>
                                        Inviter par email
                                    </Text>
                                </View>
                                <TextInput
                                    style={styles.formInput}
                                    placeholder="nom@exemple.com"
                                    placeholderTextColor="#8e9297"
                                    keyboardType="email-address"
                                />
                                <TouchableOpacity
                                    style={styles.sendInviteButton}
                                >
                                    <Ionicons
                                        name="paper-plane"
                                        size={18}
                                        color="#fff"
                                    />
                                    <Text style={styles.sendInviteText}>
                                        Envoyer l'invitation
                                    </Text>
                                </TouchableOpacity>
                            </View>

                            <View style={styles.formGroup}>
                                <View style={styles.formLabelContainer}>
                                    <Ionicons
                                        name="people-outline"
                                        size={18}
                                        color="#8e9297"
                                    />
                                    <Text style={styles.formLabel}>
                                        Invitations récentes
                                    </Text>
                                </View>
                                <View style={styles.recentInvitesList}>
                                    <View style={styles.recentInviteItem}>
                                        <View style={styles.recentInviteInfo}>
                                            <Text
                                                style={styles.recentInviteEmail}
                                            >
                                                jean.dupont@exemple.com
                                            </Text>
                                            <Text
                                                style={
                                                    styles.recentInviteStatus
                                                }
                                            >
                                                En attente • Envoyé il y a 2h
                                            </Text>
                                        </View>
                                        <TouchableOpacity
                                            style={styles.recentInviteAction}
                                        >
                                            <Ionicons
                                                name="refresh-outline"
                                                size={20}
                                                color="#8e9297"
                                            />
                                        </TouchableOpacity>
                                    </View>
                                </View>
                            </View>
                        </ScrollView>
                    </View>
                </View>
            </Modal>

            {/* Modal pour supprimer un canal */}
            <Modal
                visible={modalState.showRemoveChannelModal}
                transparent={true}
                animationType="fade"
                onRequestClose={handleCloseModals}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>
                                Supprimer le canal
                            </Text>
                            <TouchableOpacity
                                onPress={handleCloseModals}
                                style={styles.closeButton}
                            >
                                <Ionicons
                                    name="close"
                                    size={24}
                                    color="#8e9297"
                                />
                            </TouchableOpacity>
                        </View>

                        <View style={styles.modalBody}>
                            <Text style={styles.modalText}>
                                Êtes-vous sûr de vouloir supprimer le canal
                                {modalState.channelToRemove?.name
                                    ? ` "${modalState.channelToRemove.name}"`
                                    : ""}? Cette action est irréversible.
                            </Text>

                            <View style={styles.modalActions}>
                                <TouchableOpacity
                                    style={styles.cancelButton}
                                    onPress={handleCloseModals}
                                >
                                    <Text style={styles.cancelButtonText}>
                                        Annuler
                                    </Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={styles.deleteButton}
                                    onPress={() =>
                                        modalState.channelToRemove &&
                                        handleRemoveChannel(
                                            modalState.channelToRemove.uuid,
                                        )
                                    }
                                >
                                    <Text style={styles.deleteButtonText}>
                                        Supprimer
                                    </Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>
                </View>
            </Modal>

            {/* Modal pour éditer un canal */}
            <Modal
                visible={modalState.showEditChannelModal}
                transparent={true}
                animationType="fade"
                onRequestClose={handleCloseModals}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>
                                Modifier le canal
                            </Text>
                            <TouchableOpacity
                                onPress={handleCloseModals}
                                style={styles.closeButton}
                            >
                                <Ionicons
                                    name="close"
                                    size={24}
                                    color="#8e9297"
                                />
                            </TouchableOpacity>
                        </View>

                        <View style={styles.modalBody}>
                            <View style={styles.formGroup}>
                                <Text style={styles.formLabel}>Nom du canal</Text>
                                <TextInput
                                    style={styles.formInput}
                                    value={editedChannelInfo.name}
                                    onChangeText={(text) =>
                                        updateEditedChannelInfo("name", text)
                                    }
                                    placeholder="Nom du canal"
                                    placeholderTextColor="#8e9297"
                                />
                            </View>

                            <View style={styles.formGroup}>
                                <Text style={styles.formLabel}>Description</Text>
                                <TextInput
                                    style={[styles.formInput, styles.textArea]}
                                    value={editedChannelInfo.description}
                                    onChangeText={(text) =>
                                        updateEditedChannelInfo("description", text)
                                    }
                                    placeholder="Description du canal"
                                    placeholderTextColor="#8e9297"
                                    multiline={true}
                                    numberOfLines={4}
                                />
                            </View>

                            <View style={styles.formGroup}>
                                <Text style={styles.formLabel}>Visibilité</Text>
                                <View style={styles.visibilityOptions}>
                                    <TouchableOpacity
                                        style={[
                                            styles.visibilityOption,
                                            editedChannelInfo.is_public &&
                                                styles.visibilityOptionActive,
                                        ]}
                                        onPress={() =>
                                            updateEditedChannelInfo("is_public", true)
                                        }
                                    >
                                        <Ionicons
                                            name="globe-outline"
                                            size={20}
                                            color={
                                                editedChannelInfo.is_public
                                                    ? "#fff"
                                                    : "#8e9297"
                                            }
                                        />
                                        <Text
                                            style={[
                                                styles.visibilityOptionText,
                                                editedChannelInfo.is_public &&
                                                    styles.visibilityOptionTextActive,
                                            ]}
                                        >
                                            Public
                                        </Text>
                                    </TouchableOpacity>

                                    <TouchableOpacity
                                        style={[
                                            styles.visibilityOption,
                                            !editedChannelInfo.is_public &&
                                                styles.visibilityOptionActive,
                                        ]}
                                        onPress={() =>
                                            updateEditedChannelInfo("is_public", false)
                                        }
                                    >
                                        <Ionicons
                                            name="lock-closed-outline"
                                            size={20}
                                            color={
                                                !editedChannelInfo.is_public
                                                    ? "#fff"
                                                    : "#8e9297"
                                            }
                                        />
                                        <Text
                                            style={[
                                                styles.visibilityOptionText,
                                                !editedChannelInfo.is_public &&
                                                    styles.visibilityOptionTextActive,
                                            ]}
                                        >
                                            Privé
                                        </Text>
                                    </TouchableOpacity>
                                </View>
                            </View>
                            
                            {/* Section des membres du workspace */}
                            <View style={styles.formGroup}>
                                <Text style={styles.formLabel}>Membres du workspace</Text>
                                <Text style={styles.formDescription}>
                                    Cliquez sur un membre pour l'inviter à rejoindre ce canal.
                                </Text>
                                
                                <View style={styles.channelMembersList}>
                                    {workspace?.members.map((member) => {
                                        const isInChannel = isMemberInChannel(member.uuid);
                                        const isInviting = invitingMember === member.uuid;
                                        
                                        return (
                                            <View key={member.uuid} style={styles.channelMemberItem}>
                                                <View style={styles.channelMemberItemAvatar}>
                                                    <Text style={styles.channelMemberItemAvatarText}>
                                                        {(member.name || member.user.username || "U").charAt(0)}
                                                    </Text>
                                                </View>
                                                <View style={styles.channelMemberItemInfo}>
                                                    <Text style={styles.channelMemberItemName}>
                                                        {member.name || member.user.username}
                                                    </Text>
                                                    
                                                    <TouchableOpacity
                                                        style={[
                                                            styles.channelInviteButton, 
                                                            isInviting && styles.channelInvitingButton,
                                                            isInChannel && styles.channelMemberButton
                                                        ]}
                                                        onPress={() => !isInChannel && handleInviteMemberToChannel(member.uuid)}
                                                        disabled={isInChannel || isInviting}
                                                    >
                                                        {isInviting ? (
                                                            <>
                                                                <Ionicons name="hourglass-outline" size={16} color="#fff" />
                                                                <Text style={styles.channelInviteButtonText}>En cours...</Text>
                                                            </>
                                                        ) : isInChannel ? (
                                                            <>
                                                                <Ionicons name="checkmark" size={16} color="#fff" />
                                                                <Text style={styles.channelInviteButtonText}>Membre</Text>
                                                            </>
                                                        ) : (
                                                            <>
                                                                <Ionicons name="add-circle-outline" size={16} color="#fff" />
                                                                <Text style={styles.channelInviteButtonText}>Inviter</Text>
                                                            </>
                                                        )}
                                                    </TouchableOpacity>
                                                </View>
                                            </View>
                                        );
                                    })}
                                </View>
                            </View>

                            <View style={styles.modalActions}>
                                <TouchableOpacity
                                    style={styles.cancelButton}
                                    onPress={handleCloseModals}
                                >
                                    <Text style={styles.cancelButtonText}>
                                        Annuler
                                    </Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={styles.saveButton}
                                    onPress={handleUpdateChannel}
                                >
                                    <Text style={styles.saveButtonText}>
                                        Enregistrer
                                    </Text>
                                </TouchableOpacity>
                            </View>

                            <View style={styles.dangerZone}>
                                <Text style={styles.dangerZoneTitle}>Zone de danger</Text>
                                <TouchableOpacity
                                    style={styles.deleteButton}
                                    onPress={() => {
                                        handleCloseModals();
                                        if (modalState.channelToEdit) {
                                            handleOpenRemoveChannelModal(modalState.channelToEdit);
                                        }
                                    }}
                                >
                                    <Text style={styles.deleteButtonText}>
                                        Supprimer ce canal
                                    </Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>
                </View>
            </Modal>

            {/* Remove Member Confirmation Modal */}
            <Modal
                visible={modalState.showRemoveMemberModal}
                transparent={true}
                animationType="fade"
                onRequestClose={() => handleCloseModals()}
                statusBarTranslucent={true}
            >
                <View style={styles.confirmModalOverlay}>
                    <View style={styles.confirmModalContent}>
                        <View style={styles.confirmModalHeader}>
                            <Ionicons
                                name="warning"
                                size={28}
                                color="#ED4245"
                            />
                            <Text style={styles.confirmModalTitle}>
                                Supprimer un membre
                            </Text>
                        </View>

                        <View style={styles.confirmModalBody}>
                            <Text style={styles.confirmModalText}>
                                Êtes-vous sûr de vouloir supprimer{" "}
                                <Text style={styles.confirmModalHighlight}>
                                    {modalState.memberToRemove?.name ||
                                        modalState.memberToRemove?.username ||
                                        "ce membre"}
                                </Text>{" "}
                                de cet espace de travail ?
                            </Text>
                            <Text style={styles.confirmModalSubtext}>
                                Cette action est irréversible et le membre
                                perdra immédiatement l'accès à tous les canaux
                                de cet espace de travail.
                            </Text>
                        </View>

                        <View style={styles.confirmModalFooter}>
                            <TouchableOpacity
                                style={styles.confirmCancelButton}
                                onPress={() => handleCloseModals()}
                            >
                                <Text style={styles.confirmCancelButtonText}>
                                    Annuler
                                </Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={styles.confirmDeleteButton}
                                onPress={() =>
                                    modalState.memberToRemove &&
                                    handleRemoveMember(
                                        modalState.memberToRemove.uuid,
                                    )
                                }
                            >
                                <Ionicons
                                    name="trash-outline"
                                    size={18}
                                    color="#fff"
                                />
                                <Text style={styles.confirmDeleteButtonText}>
                                    Supprimer
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
            <BottomBar />
        </>
    );
}
