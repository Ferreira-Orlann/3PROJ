import React from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { UUID } from 'crypto';
import { styles } from '../styles/home';
import { Workspace, CreateWorkspaceForm } from './homeScreen.types';
import { Colors } from '../theme/colors';
import useHomeScreen from '../hooks/home';
import { Member } from '../services/workspaces';
import memberService from '../services/api/endpoints/members';

interface SearchBarProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  onCreatePress: () => void;
}

export const SearchBar = ({ searchQuery, setSearchQuery, onCreatePress }: SearchBarProps) => (
  <View style={styles.header}>
    <View style={styles.searchContainer}>
      <Ionicons name="search" size={20} color="#8e9297" style={styles.searchIcon} />
      <TextInput
        style={styles.searchInput}
        placeholder="Rechercher des espaces de travail..."
        placeholderTextColor="#8e9297"
        value={searchQuery}
        onChangeText={setSearchQuery}
      />
    </View>
    <TouchableOpacity 
      style={styles.createButton}
      onPress={onCreatePress}
    >
      <Ionicons name="add-outline" size={22} color="#fff" />
      <Text style={styles.createButtonText}>Créer</Text>
    </TouchableOpacity>
  </View>
);

interface WorkspaceItemProps {
  workspace: Workspace;
  onSelect: (id: UUID) => void;
}

export const WorkspaceItem = ({ workspace, onSelect }: WorkspaceItemProps) => {
  // Utiliser uuid si disponible, sinon workspaceId (pour compatibilité)
  const workspaceId = (workspace as any).uuid || workspace.workspaceId;
  const [memberCount, setMemberCount] = React.useState<number>(workspace.memberCount || 0);
  
  console.log('Workspace dans WorkspaceItem:', workspace);
  console.log('ID utilisé:', workspaceId);

  // Fetch members using useEffect instead of making the component async
  React.useEffect(() => {
    const fetchMembers = async () => {
      try {
        const apiMembers = await memberService.getWorkspaceMembers(workspaceId as UUID);
        console.log('Membres récupérés:', apiMembers);
        const members = (apiMembers).map(apiMember => ({
          ...apiMember,
          uuid: apiMember.uuid,
          name: apiMember.user.username,
          username: apiMember.user.username,
          email: apiMember.user.email,
          avatar: apiMember.user.avatarUrl || '',
          role: 'member',
          status: (apiMember.user.status as 'online' | 'offline' | 'away') || 'online'
        }));
        setMemberCount(members.length);
        console.log('Membres:', members);
        console.log('Membres count:', members.length);
      } catch (memberErr) {
        console.error('Erreur lors de la récupération des membres:', memberErr);
      }
    };
    
    fetchMembers();
  }, [workspaceId]);
  
  return (
  <TouchableOpacity
    key={workspaceId}
    style={styles.workspaceCard}
    onPress={() => onSelect(workspaceId)}
    activeOpacity={0.7}
  >
    <View style={styles.workspaceHeader}>
      <View style={styles.workspaceAvatarContainer}>
        <View style={styles.workspaceAvatar}>
          <Text style={styles.workspaceAvatarText}>{workspace.name && workspace.name.length > 0 ? workspace.name[0] : '?'}</Text>
        </View>
        <View 
          style={[styles.statusBadge, { backgroundColor: workspace.is_public ? '#43b581' : '#faa61a' }]}
        >
          <Ionicons 
            name={workspace.is_public ? "globe-outline" : "lock-closed-outline"} 
            size={12} 
            color="#fff" 
          />
        </View>
      </View>
      
      <Text style={styles.workspaceName}>{workspace.name}</Text>
      
      <View style={styles.workspaceStats}>
        <View style={styles.statItem}>
          <Ionicons name="people-outline" size={14} color="#8e9297" />
          <Text style={styles.statText}>{memberCount} membres</Text>
        </View>
      </View>
    </View>
    
    <View style={styles.workspaceFooter}>
      <TouchableOpacity 
        style={styles.workspaceButton}
        onPress={(e) => {
          e.stopPropagation();
          onSelect(workspaceId);
        }}
      >
        <Text style={styles.workspaceButtonText}>Ouvrir</Text>
        <Ionicons name="chevron-forward" size={14} color={Colors.primary} />
      </TouchableOpacity>
    </View>
  </TouchableOpacity>
)}

interface WorkspaceListProps {
  workspaces: Workspace[];
  onSelectWorkspace: (id: UUID) => void;
  searchQuery: string;
}

export const WorkspaceList = ({ workspaces, onSelectWorkspace, searchQuery }: WorkspaceListProps) => {
  if (workspaces.length === 0) {
    return (
      <View style={styles.emptyState}>
        <Ionicons name="search" size={50} color="#8e9297" style={{ marginBottom: 16 }} />
        <Text style={styles.emptyStateTitle}>Aucun résultat trouvé</Text>
        <Text style={styles.emptyStateText}>
          Aucun espace de travail ne correspond à "{searchQuery}"
        </Text>
      </View>
    );
  }

  return (
    <ScrollView 
      style={styles.workspaceList}
      contentContainerStyle={styles.workspaceListContent}
      showsVerticalScrollIndicator={false}
    >
      {workspaces.map((workspace, index) => {
        // Utiliser uuid si disponible, sinon workspaceId, sinon utiliser l'index comme fallback
        const workspaceId = workspace?.uuid?.toString() || workspace?.workspaceId?.toString() || workspace?.id?.toString() || `workspace-${index}`;
        return (
          <WorkspaceItem 
            key={workspaceId} 
            workspace={workspace} 
            onSelect={onSelectWorkspace} 
          />
        );
      })}
    </ScrollView>
  );
};

interface WorkspaceListContainerProps {
  onSelectWorkspace: (id: UUID) => void;
  initialSearchQuery?: string;
}

export const WorkspaceListContainer = ({ 
  onSelectWorkspace,
  initialSearchQuery = ''
}: WorkspaceListContainerProps) => {
  // Utiliser le hook home pour gérer les données et la logique
  const {
    state,
    filteredWorkspaces,
    setSearchQuery,
    toggleCreateWorkspaceModal,
    updateNewWorkspaceForm,
    handleCreateWorkspace
  } = useHomeScreen();
  
  // Synchroniser la recherche initiale si fournie
  React.useEffect(() => {
    if (initialSearchQuery) {
      setSearchQuery(initialSearchQuery);
    }
  }, [initialSearchQuery]);

  if (state.isLoading) {
    return (
      <View style={styles.emptyState}>
        <ActivityIndicator size="large" color="#7289da" />
        <Text style={[styles.emptyStateText, { marginTop: 16 }]}>Chargement des espaces de travail...</Text>
      </View>
    );
  }

  if (state.error) {
    return (
      <View style={styles.emptyState}>
        <Text style={styles.emptyStateTitle}>Erreur</Text>
        <Text style={styles.emptyStateText}>{state.error}</Text>
      </View>
    );
  }

  return (
    <>
      <SearchBar 
        searchQuery={state.searchQuery} 
        setSearchQuery={setSearchQuery} 
        onCreatePress={() => toggleCreateWorkspaceModal(true)} 
      />
      
      <View style={styles.content}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Vos espaces de travail</Text>
          <Text style={styles.sectionSubtitle}>
            {filteredWorkspaces.length} {filteredWorkspaces.length > 1 ? 'espaces disponibles' : 'espace disponible'}
          </Text>
        </View>
        
        <WorkspaceList 
          workspaces={filteredWorkspaces} 
          onSelectWorkspace={onSelectWorkspace} 
          searchQuery={state.searchQuery} 
        />
      </View>
      
      <CreateWorkspaceModal 
        visible={state.showCreateWorkspaceModal}
        formData={state.newWorkspaceForm}
        onUpdateForm={updateNewWorkspaceForm}
        onClose={() => toggleCreateWorkspaceModal(false)}
        onSubmit={handleCreateWorkspace}
      />
    </>
  );
};

interface CreateWorkspaceModalProps {
  visible: boolean;
  formData: CreateWorkspaceForm;
  onUpdateForm: (field: keyof CreateWorkspaceForm, value: string | boolean) => void;
  onClose: () => void;
  onSubmit: () => void;
}

export const CreateWorkspaceModal = ({ 
  visible, 
  formData, 
  onUpdateForm, 
  onClose, 
  onSubmit 
}: CreateWorkspaceModalProps) => {
  if (!visible) return null;

  return (
    <View style={styles.modalOverlay}>
      <View style={styles.modalContent}>
        <View style={styles.modalHeader}>
          <Text style={styles.modalTitle}>Créer un nouvel espace de travail</Text>
          <TouchableOpacity 
            style={styles.modalCloseButton}
            onPress={onClose}
          >
            <Ionicons name="close" size={24} color="#8e9297" />
          </TouchableOpacity>
        </View>
        
        <View style={styles.modalBody}>
          <View style={styles.formGroup}>
            <Text style={styles.formLabel}>Nom de l'espace de travail</Text>
            <TextInput
              style={styles.formInput}
              placeholder="ex: Marketing"
              placeholderTextColor="#8e9297"
              value={formData.name}
              onChangeText={(value) => onUpdateForm('name', value)}
            />
          </View>
          
          <View style={styles.formGroup}>
            <Text style={styles.formLabel}>Description</Text>
            <TextInput
              style={[styles.formInput, styles.textArea]}
              placeholder="Décrivez l'objectif de cet espace de travail"
              placeholderTextColor="#8e9297"
              multiline
              numberOfLines={3}
              value={formData.description}
              onChangeText={(value) => onUpdateForm('description', value)}
            />
          </View>
          
          <View style={styles.formGroup}>
            <Text style={styles.formLabel}>Visibilité</Text>
            <View style={styles.visibilityOptions}>
              <TouchableOpacity 
                style={[
                  styles.visibilityOption,
                  formData.is_public && styles.selectedVisibility
                ]}
                onPress={() => onUpdateForm('is_public', true)}
              >
                <Ionicons name="globe-outline" size={20} color={formData.is_public ? '#fff' : '#8e9297'} />
                <Text style={[
                  styles.visibilityText,
                  formData.is_public && styles.selectedVisibilityText
                ]}>Public</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[
                  styles.visibilityOption,
                  !formData.is_public && styles.selectedVisibility
                ]}
                onPress={() => onUpdateForm('is_public', false)}
              >
                <Ionicons name="lock-closed-outline" size={20} color={!formData.is_public ? '#fff' : '#8e9297'} />
                <Text style={[
                  styles.visibilityText,
                  !formData.is_public && styles.selectedVisibilityText
                ]}>Privé</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
        
        <View style={styles.modalFooter}>
          <TouchableOpacity 
            style={styles.cancelButton}
            onPress={onClose}
          >
            <Text style={styles.cancelButtonText}>Annuler</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.createWorkspaceButton, !formData.name.trim() && styles.disabledButton]}
            onPress={onSubmit}
            disabled={!formData.name.trim()}
          >
            <Ionicons name="add-circle-outline" size={18} color="#fff" />
            <Text style={styles.createWorkspaceButtonText}>Créer</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};
