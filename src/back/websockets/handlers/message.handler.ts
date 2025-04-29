import { Injectable, UsePipes, ValidationPipe } from "@nestjs/common";
import { Events } from "../../events.enum";
import { MessagesService } from "../../messages/messages.service";
import { UUID } from "crypto";
import { SubscribeMessage, WebSocketGateway, WsException } from "@nestjs/websockets";

@Injectable()
@UsePipes(new ValidationPipe({ exceptionFactory: (errors) => new WsException(errors) }))
@WebSocketGateway()
export class MessageHandler {
    constructor(private readonly messagesService: MessagesService) {}

    @SubscribeMessage("message.create")
    async handleMessageCreated(data: any) {
        console.log(
            "🔄 Traitement du message WebSocket message.created:",
            data,
        );

        try {
            if (!data || !data.data) {
                return { success: false, error: "Format de données invalide" };
            }

            const messageData = data.data;

            // Vérifier si les données nécessaires sont présentes
            if (!messageData.message || !messageData.destination_channel) {
                return {
                    success: false,
                    error: "Données de message incomplètes",
                };
            }

            // Créer le message via le service de messages
            // Note: Vous devrez adapter ceci en fonction de la structure exacte de vos données
            const source_uuid = data.user?.uuid || messageData.source;
            const destination_uuid = messageData.destination_channel;

            if (!source_uuid) {
                return { success: false, error: "UUID source manquant" };
            }

            const newMessage = await this.messagesService.add({
                message: messageData.message,
                is_public: messageData.is_public || true,
                source_uuid: source_uuid as UUID,
                destination_uuid: destination_uuid as UUID,
            });

            return {
                success: true,
                message: "Message créé avec succès",
                data: newMessage,
            };
        } catch (error) {
            console.error(
                "Erreur lors du traitement du message WebSocket:",
                error,
            );
            return {
                success: false,
                error: "Erreur lors de la création du message",
            };
        }
    }

    @SubscribeMessage("message.update")
    async handleMessageUpdated(data: any) {
        console.log(
            "🔄 Traitement du message WebSocket message.updated:",
            data,
        );

        try {
            if (!data || !data.data) {
                return { success: false, error: "Format de données invalide" };
            }

            const messageData = data.data;

            // Vérifier si les données nécessaires sont présentes
            if (!messageData.uuid || !messageData.message) {
                return {
                    success: false,
                    error: "Données de message incomplètes",
                };
            }

            // Mettre à jour le message via le service de messages
            const updatedMessage = await this.messagesService.update(
                messageData.uuid as UUID,
                messageData.message,
            );

            return {
                success: true,
                message: "Message mis à jour avec succès",
                data: updatedMessage,
            };
        } catch (error) {
            console.error(
                "Erreur lors du traitement de la mise à jour du message WebSocket:",
                error,
            );
            return {
                success: false,
                error: "Erreur lors de la mise à jour du message",
            };
        }
    }
}
