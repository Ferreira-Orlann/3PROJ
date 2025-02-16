import { Module } from "@nestjs/common";
import { AuthZModule } from "nest-authz";
import TypeORMAdapter from "typeorm-adapter";

@Module({
    imports: [
      AuthZModule.register({
        model: "../config/basic_with_root_model.conf",
        policy: TypeORMAdapter.newAdapter({
          type: "postgres",
          host: "localhost",
          port: 5432,
          username: "postgres",
          password: "postgres",
          database: "postgres"
        }),
        userFromContext: (ctx) => {
          const request = ctx.switchToHttp().getRequest();
          return request.user && request.user.uuid;
        },
        resourceFromContext: (ctx, perm) => {
          const request = ctx.switchToHttp().getRequest();
          return { type: perm.resource, id: request.id };
        }
      }),
    ],
    controllers: [],
    providers: []
  })
export class WebSocketAuthorizationModule {}
