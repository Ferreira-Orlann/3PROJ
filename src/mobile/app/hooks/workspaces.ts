import { useState, useEffect } from "react";
import { Alert } from "react-native";
import { UUID } from "crypto";
import { useRouter } from "expo-router";
import { Tab, ModalState, NewChannelForm } from "../services/workspaces";

// Import API services
import workspaceService from "../services/api/endpoints/workspaces";
import channelService, {
    CreateChannelData,
} from "../services/api/endpoints/channels";
import memberService from "../services/api/endpoints/members";
import userService from "../services/api/endpoints/users";

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

const useWorkspaceScreen = (workspaceId: UUID) => {
    const router = useRouter();

    // États pour les onglets et la recherche
    const [activeTab, setActiveTab] = useState<string>("channels");
    const [searchQuery, setSearchQuery] = useState<string>("");

    // États pour les données
    const [workspace, setWorkspace] = useState<Workspace | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    // États pour les formulaires
    const [newChannelForm, setNewChannelForm] = useState<NewChannelForm>({
        name: "",
        description: "",
        is_public: true,
    });

    // États pour les modals
    const [modalState, setModalState] = useState<ModalState>({
        showNewChannelModal: false,
        showAddMemberModal: false,
        showRemoveMemberModal: false,
        memberToRemove: null,
    });

    // Charger les données de l'espace de travail depuis l'API
    useEffect(() => {
        const fetchWorkspaceData = async () => {
            if (!workspaceId) {
                console.error("Erreur: workspaceId est undefined ou null");
                setError("ID de workspace invalide");
                setIsLoading(false);
                return;
            }

            setIsLoading(true);
            console.log(
                "Tentative de récupération du workspace avec ID:",
                workspaceId,
            );
            console.log("Type de workspaceId:", typeof workspaceId);

            try {
                // Récupérer les détails de l'espace de travail
                // S'assurer que l'ID est bien une chaîne de caractères
                const uuid = String(workspaceId);
                console.log("UUID formaté pour la requête API:", uuid);

                const workspaceData = await workspaceService.getWorkspaceByUuid(
                    uuid as UUID,
                );
                console.log("Données du workspace récupérées:", workspaceData);

                // Récupérer les canaux de l'espace de travail
                const channels = await channelService.getChannels();

                // Récupérer les membres du workspace depuis l'API
                let members: Member[] = [];
                try {
                    const apiMembers = await memberService.getWorkspaceMembers(
                        uuid as UUID,
                    );
                    console.log("Membres récupérés:", apiMembers);

                    // Utiliser directement les membres de l'API et ajouter des propriétés pour compatibilité
                    members = apiMembers.map((apiMember) => {
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
                            status: mappedStatus as
                                | "online"
                                | "offline"
                                | "away",
                        };
                    });
                } catch (memberErr) {
                    console.error(
                        "Erreur lors de la récupération des membres:",
                        memberErr,
                    );
                    // Continuer même si la récupération des membres échoue
                }

                // Construire l'objet workspace avec toutes les données
                const completeWorkspace: Workspace = {
                    uuid: workspaceData.workspaceId,
                    name: workspaceData.name,
                    description: workspaceData.description,
                    is_public: workspaceData.is_public,
                    memberCount: workspaceData.memberCount,
                    owner: workspaceData.owner,
                    createdAt: workspaceData.createdAt,
                    channels: channels.map((channel) => ({
                        uuid: channel.id,
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

        if (workspaceId) {
            fetchWorkspaceData();
        }
    }, [workspaceId]);

    // Filtrer les canaux en fonction de la recherche
    const filteredChannels =
        workspace?.channels.filter((channel) =>
            channel.name && searchQuery
                ? channel.name.toLowerCase().includes(searchQuery.toLowerCase())
                : true,
        ) || [];

    // Filtrer les membres en fonction de la recherche
    const filteredMembers =
        workspace?.members.filter((member) => {
            // Utiliser username si name n'est pas défini
            const displayName = member.user.username || "";
            return searchQuery
                ? displayName.toLowerCase().includes(searchQuery.toLowerCase())
                : true;
        }) || [];

    // Gérer la sélection d'un canal
    const handleChannelSelect = (channelId: UUID) => {
        router.push({
            pathname: "/screens/workspaces/[id]/channels/[channelId]",
            params: { id: workspaceId, channelId },
        });
    };

    // Gérer la création d'un nouveau canal
    const handleCreateChannel = async () => {
        if (!workspace) return;

        try {
            // Créer le canal via l'API
            const channelData: CreateChannelData = {
                name: newChannelForm.name,
                description: newChannelForm.description,
                is_public: newChannelForm.is_public,
                workspaceId: workspace.uuid,
            };

            const createdChannel =
                await channelService.createChannel(channelData);

            // Mettre à jour l'état local avec le nouveau canal
            if (workspace) {
                setWorkspace({
                    ...workspace,
                    channels: [
                        ...workspace.channels,
                        {
                            uuid: createdChannel.id,
                            name: createdChannel.name,
                            description: createdChannel.description,
                            is_public: createdChannel.is_public,
                            memberCount: 1, // Initialement, seul le créateur est membre
                        },
                    ],
                });
            }

            // Réinitialiser le formulaire et fermer le modal
            setNewChannelForm({
                name: "",
                description: "",
                is_public: true,
            });

            setModalState((prev) => ({
                ...prev,
                showNewChannelModal: false,
            }));
        } catch (err) {
            console.error("Erreur lors de la création du canal:", err);
            // Ici, vous pourriez ajouter un état pour gérer les erreurs et les afficher dans l'UI
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
            setWorkspace((prev) => {
                if (!prev) return prev;

                return {
                    ...prev,
                    members: prev.members.filter((m) => m.uuid !== memberId),
                    memberCount: prev.memberCount - 1,
                };
            });

            setModalState((prev) => ({
                ...prev,
                showRemoveMemberModal: false,
                selectedMemberId: null,
            }));

            Alert.alert(
                "Succès",
                "Le membre a été retiré de l'espace de travail.",
            );
        } catch (err) {
            console.error("Erreur lors de la suppression du membre:", err);
            Alert.alert("Erreur", "Impossible de supprimer le membre.");
        } finally {
            setIsLoading(false);
        }
    };

    // Gérer l'ouverture du modal de suppression d'un membre
    const handleOpenRemoveMemberModal = (member: Member) => {
        setModalState((prev) => ({
            ...prev,
            showRemoveMemberModal: true,
            selectedMemberId: member.uuid,
        }));
    };

    // Gérer l'ouverture du modal de création d'un canal
    const handleOpenNewChannelModal = () => {
        setModalState((prev) => ({
            ...prev,
            showNewChannelModal: true,
        }));
    };

    // Gérer l'ouverture du modal d'ajout d'un membre
    const handleOpenAddMemberModal = () => {
        setModalState((prev) => ({
            ...prev,
            showAddMemberModal: true,
        }));
    };

    // Gérer la fermeture des modals
    const handleCloseModals = () => {
        setModalState({
            showNewChannelModal: false,
            showAddMemberModal: false,
            showRemoveMemberModal: false,
            memberToRemove: null,
        });
    };

    // Gérer la mise à jour du formulaire de nouveau canal
    const updateNewChannelForm = (
        field: keyof NewChannelForm,
        value: string | boolean,
    ) => {
        setNewChannelForm((prev) => ({
            ...prev,
            [field]: value,
        }));
    };

    return {
        workspace,
        activeTab,
        searchQuery,
        filteredChannels,
        filteredMembers,
        newChannelForm,
        modalState,
        tabs: TABS,
        isLoading,
        error,

        // Méthodes
        setActiveTab,
        setSearchQuery,
        handleChannelSelect,
        handleCreateChannel,
        handleRemoveMember,
        handleOpenRemoveMemberModal,
        handleOpenNewChannelModal,
        handleOpenAddMemberModal,
        handleCloseModals,
        updateNewChannelForm,
    };
};

export default useWorkspaceScreen;
