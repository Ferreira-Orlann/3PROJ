import { Injectable } from "@nestjs/common";
import { OnEvent } from "@nestjs/event-emitter";
import { WebSocketPool } from "../websocket_pool.gateway";
import { Events } from "../../events.enum";
import { WorkspaceMember } from "../../workspaces/members/workspace_members.entity";
import { User } from "../../users/users.entity";

@Injectable()
export class WorkspaceMembersListener {
    constructor(private readonly pool: WebSocketPool) {}

    @OnEvent(Events.WORKSPACE_MEMBER_ADDED)
    async handleWorkspaceMemberAdded(data: { member: WorkspaceMember, addedBy: User }) {
        console.log("👥 Nouveau membre ajouté au workspace:", data);
        
        // Récupérer les informations nécessaires
        const member = data.member;
        const workspace = await member.workspace;
        const user = await member.user;
        const addedBy = data.addedBy;
        
        // Notifier l'utilisateur qui a été ajouté
        const userRecord = this.pool.getUserPoolRecord(user.uuid);
        if (userRecord) {
            this.pool.sendEvent(userRecord.socket, Events.WORKSPACE_MEMBER_ADDED, {
                member,
                workspace,
                addedBy,
                timestamp: new Date(),
            });
        }
        
        // Notifier tous les membres du workspace qu'un nouveau membre a été ajouté
        const workspaceSockets = this.pool.getWorkspaceWebsockets(workspace.uuid);
        if (workspaceSockets) {
            workspaceSockets.forEach(socket => {
                // Ne pas notifier le membre qui vient d'être ajouté ni celui qui l'a ajouté
                if (socket["user"] && socket["user"].uuid !== user.uuid && socket["user"].uuid !== addedBy.uuid) {
                    this.pool.sendEvent(socket, Events.WORKSPACE_MEMBER_ADDED, {
                        member,
                        workspace,
                        addedBy,
                        timestamp: new Date(),
                    });
                }
            });
        }
    }

    @OnEvent(Events.WORKSPACE_MEMBER_REMOVED)
    async handleWorkspaceMemberRemoved(data: { member: WorkspaceMember, removedBy: User }) {
        console.log("👥 Membre retiré du workspace:", data);
        
        // Récupérer les informations nécessaires
        const member = data.member;
        const workspace = await member.workspace;
        const user = await member.user;
        const removedBy = data.removedBy;
        
        // Notifier l'utilisateur qui a été retiré
        const userRecord = this.pool.getUserPoolRecord(user.uuid);
        if (userRecord) {
            this.pool.sendEvent(userRecord.socket, Events.WORKSPACE_MEMBER_REMOVED, {
                member,
                workspace,
                removedBy,
                timestamp: new Date(),
            });
        }
        
        // Notifier tous les membres du workspace qu'un membre a été retiré
        const workspaceSockets = this.pool.getWorkspaceWebsockets(workspace.uuid);
        if (workspaceSockets) {
            workspaceSockets.forEach(socket => {
                // Ne pas notifier le membre qui vient d'être retiré ni celui qui l'a retiré
                if (socket["user"] && socket["user"].uuid !== user.uuid && socket["user"].uuid !== removedBy.uuid) {
                    this.pool.sendEvent(socket, Events.WORKSPACE_MEMBER_REMOVED, {
                        member,
                        workspace,
                        removedBy,
                        timestamp: new Date(),
                    });
                }
            });
        }
    }
}
