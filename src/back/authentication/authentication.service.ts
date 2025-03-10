import { Injectable } from "@nestjs/common";
import { Session } from "./session.entity";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { JwtService } from "@nestjs/jwt";
import { randomUUID, UUID } from "crypto";
import { User } from "../users/users.entity";

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

    createSession(user: User): Promise<Session> {
        const uuid = randomUUID();
        return this.sessionRepo.save({
            owner: user,
            uuid: uuid,
            second_duration: 600,
            token: this.jwtService.sign(uuid),
        });
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
        expirationDate.setSeconds(duration);
        return expirationDate > new Date();
    }
}
