export class CreateMessageDto {
    message: string;
    isPublic?: boolean;
    userUuid: string;
}
