import { Injectable } from "@nestjs/common";
import { Session } from "./session.entity";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { JwtService } from "@nestjs/jwt";
import { randomUUID, UUID } from "crypto";
import { User } from "../users/users.entity";
import { OAuth2Client } from "google-auth-library";


@Injectable()
export class AuthService {
    constructor(
        @InjectRepository(Session)
        private readonly sessionRepo: Repository<Session>,
        private readonly jwtService: JwtService,
    ) {}

    getSessionByToken(token: string): Promise<Session | null> {
        return this.sessionRepo.findOne({
            where: { token: token },
        });
    }

    async createSession(user: User): Promise<Session> {
        const uuid = randomUUID();
        const session = new Session();
        (session.uuid = uuid), (session.token = this.jwtService.sign(uuid));
        session.second_duration = 600;
        session.owner = user;
        const result = await this.sessionRepo.save(session);
        return result;
    }

    isSessionValid(session: Session): boolean {
        return (
            session &&
            !this.verifyDate(session.created_time, session.second_duration) &&
            !session.revoked
        );
    }

    isSessionValidByUuid(uuid: UUID): Promise<boolean> {
        return new Promise(async (resolve, reject) => {
            resolve(
                this.isSessionValid(
                    await this.sessionRepo.findOneBy({ uuid: uuid }),
                ),
            );
        });
    }

    isJwtTokenValid(token: string): Promise<boolean> {
        return new Promise(async (resolve, reject) => {
            const jwtTokenVerified = this.jwtService.verify(token);
            if (!jwtTokenVerified) {
                resolve(jwtTokenVerified);
            }
            resolve(
                await this.isSessionValidByUuid(this.jwtService.decode(token)),
            );
        });
    }

    private verifyDate(date: Date, duration: number) {
        const expirationDate = new Date(date);
        expirationDate.setSeconds(expirationDate.getSeconds() + duration);
        return expirationDate > new Date();
    }

        private client = new OAuth2Client("1045079684157-9m71af2ln6f3capjav5vj05q1cha7ahk.apps.googleusercontent.com");

    async verifyGoogleToken(token: string): Promise<any | null> {
        try {
            const ticket = await this.client.verifyIdToken({
                idToken: token,
                audience: "1045079684157-9m71af2ln6f3capjav5vj05q1cha7ahk.apps.googleusercontent.com",
            });
            return ticket.getPayload(); // payload contient email, name, etc.
        } catch (error) {
            return null;
        }
    }

}
