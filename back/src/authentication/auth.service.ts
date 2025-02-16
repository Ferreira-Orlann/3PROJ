import { Injectable } from "@nestjs/common";
import { Session } from "./session.entity";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { User } from "src/users/users.entity";
import { JwtService } from "@nestjs/jwt";
import { randomUUID } from "crypto";

@Injectable()
export class AuthService {
    constructor(
        @InjectRepository(Session)
        private readonly sessionRepo: Repository<Session>,
        private readonly jwtService: JwtService,
    ) {}

    createSession(user: User): Promise<Session> {
        const uuid = randomUUID();
        return this.sessionRepo.save({
            user: user,
            uuid: uuid,
            second_duration: 600,
            token: this.jwtService.sign(uuid),
        });
    }

    getSession(token: string): Promise<Session | null> {
        return new Promise((resolve, reject) => {
            if (!token) {
                reject();
            }
            try {
                this.jwtService
                    .verifyAsync(token)
                    .then((payload) => {
                        this.sessionRepo
                            .findOneBy({
                                uuid: payload,
                                revoked: false,
                            })
                            .then((session) => {
                                resolve(session);
                            })
                            .catch(() => {
                                reject();
                            });
                    })
                    .catch(() => {
                        reject();
                    });
            } catch {
                reject();
            }
        });
    }
}
