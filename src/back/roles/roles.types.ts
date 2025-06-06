/**
 * Types for roles and permissions system
 */

// Role types available in the system
export type RoleType = 'ADMIN' | 'MEMBER' | 'GUEST' | 'USER';

// Permission types that can be assigned to roles
export type PermissionType = 
  // Content permissions
  | 'PUBLISH' 
  | 'EDIT' 
  | 'DELETE' 
  
  // Moderation permissions
  | 'MODERATE' 
  | 'APPROVE' 
  | 'REJECT' 
  
  // Member management permissions
  | 'MANAGE_MEMBERS' 
  | 'INVITE_MEMBERS' 
  | 'REMOVE_MEMBERS' 
  
  // Workspace permissions
  | 'MANAGE_WORKSPACE' 
  | 'VIEW_WORKSPACE'
  
  // Existing permission
  | 'READ';

// Scope of the permission (global or specific to a resource)
export type PermissionScope = 'GLOBAL' | 'WORKSPACE' | 'CHANNEL' | 'USER';

// Permission assignment target
export type PermissionTarget = 'USER' | 'ROLE';
