import { Injectable } from "@nestjs/common";
import { User } from "../users/users.entity";
import { UUIDHolder } from "../uuid";
import { Permission } from "./permissions";
import { AuthZService } from "nest-authz";
import { UUID } from "crypto";

@Injectable()
export class AuthorizationService {
    constructor(private readonly authzService: AuthZService) {}

    async enforce(user: User, domain: UUID | "0", resource: UUID, permission: Permission): Promise<boolean> {
        console.log("Get Users", domain, resource, permission);
        // console.log("Bool:", en);
        console.log(await this.authzService.getAllSubjects());
        console.log(await this.authzService.getAllRoles());
        console.log(await this.authzService.getAllObjects());
        console.log(await this.authzService.getAllActions());
        // console.log(await this.authzService.getUsersForRole("admin", "test"));
        // return await this.authzService.enforce(
        //     req.user?.uuid,
        //     "test",
        //     "message",
        //     "CREATE",
        // );;
        return this.authzService.enforce(
            user.uuid,
            domain,
            resource,
            permission,
        );
    }
}