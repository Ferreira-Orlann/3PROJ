
import apiClient from './client';
import authService from './endpoints/auth';
import workspaceService from './endpoints/workspaces';
import channelService from './endpoints/channels';
import messageService from './endpoints/messages';
import userService from './endpoints/users';

export * from './config';
export { apiClient };

export const api = {
  auth: authService,
  workspaces: workspaceService,
  channels: channelService,
  messages: messageService,
  users: userService,
};

export default api;
