import { Injectable } from "@nestjs/common";
import { OnEvent } from "@nestjs/event-emitter";

@Injectable()
export class ChannelsListener {
    @OnEvent("channel.created")
    channelCreated() {
        
    }
}