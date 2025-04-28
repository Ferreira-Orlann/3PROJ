import { NotFoundException, UseGuards } from "@nestjs/common";
import {
    MessageBody,
    SubscribeMessage,
    WebSocketGateway,
} from "@nestjs/websockets";
import { SupGatewayService } from "./supgateway.service";
import { WebSocketAuthGuard } from "../authentication/ws.authentication.guard";

@WebSocketGateway()
export class WebSocketAuth {
    constructor(private readonly supGatewayService: SupGatewayService) {}

    @SubscribeMessage("message")
    @UseGuards(WebSocketAuthGuard)
    message(@MessageBody() data) {
        try {
            console.log("Message WebSocket reçu:", data);
            
            // Vérifier si data et data.message existent
            if (!data || !data.message) {
                console.error("Données WebSocket invalides:", data);
                return { success: false, error: "Format de message invalide" };
            }
            
            const callback = this.supGatewayService.getRouteCallback(data.message);
            console.log("Route Callback pour", data.message, ":", callback ? "trouvé" : "non trouvé");
            
            if (!callback) {
                console.warn(`Route WebSocket "${data.message}" inconnue.`);
                return { success: false, error: `Route "${data.message}" inconnue` };
            }
            
            // Appeler le callback avec les données
            return callback(data);
        } catch (error) {
            console.error("Erreur lors du traitement du message WebSocket:", error);
            return { success: false, error: "Erreur interne du serveur" };
        }
    }
}
