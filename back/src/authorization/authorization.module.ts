import { Module, NotAcceptableException } from "@nestjs/common";
import { AuthZModule } from "nest-authz";
import TypeORMAdapter from "typeorm-adapter";
import { AuthorizationGuard } from "./authorization.guard";

@Module({
    imports: [
        AuthZModule.register({
            model: "./config/casbin.model.conf",
            policy: TypeORMAdapter.newAdapter({
                type: "postgres",
                host: "localhost",
                port: 5432,
                username: "postgres",
                password: "postgres",
                database: "postgres",
            }),
            userFromContext: (ctx) => {
                let request
                const type = ctx.getType()
                if (type == "http") {
                    request = ctx.switchToHttp().getRequest();
                } else if (type == "ws") {
                    request = ctx.switchToWs().getClient() 
                } else {
                    throw new NotAcceptableException("Can't handle RPC context")
                }
                return request.user && request.user.uuid;
            },
        }),
    ],
    controllers: [],
    providers: [AuthorizationGuard],
    exports: [AuthorizationGuard]
})
export class AuthorizationModule {}
