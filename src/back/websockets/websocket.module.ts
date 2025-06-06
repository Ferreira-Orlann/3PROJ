import { Module } from "@nestjs/common";
import { WebSocketPool } from "./websocket_pool.gateway";
import { MessagesListener } from "./listeners/messages";
import { MessagesModule } from "../messages/messages.module";
import { AuthModule } from "../authentication/authentication.module";
import { ReactionsModule } from "../reactions/reactions.module";
import { ReactionsListener } from "./listeners/reactions";
import { MessageHandler } from "./handlers/message.handler";
import { NotificationsListener } from "./listeners/notifications";
import { WorkspaceMembersListener } from "./listeners/workspace_members";
import { NotificationsModule } from "../notifications/notifications.module";
import { WorkspacesModule } from "../workspaces/workspaces.module";
@Module({
    imports: [AuthModule, MessagesModule, ReactionsModule, NotificationsModule, WorkspacesModule],
    controllers: [],
    providers: [
        WebSocketPool,
        MessagesListener,
        ReactionsListener,
        MessageHandler,
        NotificationsListener,
        WorkspaceMembersListener,
    ],
})
export class WebSocketModule {}
