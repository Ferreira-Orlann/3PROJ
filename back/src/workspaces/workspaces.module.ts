import { Module } from "@nestjs/common";
import { WorkspacesController } from "./workspaces.controller";
import { WorkspacesService } from "./workspaces.service";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Workspace } from "./workspaces.entity";
import { AuthModule } from "src/authentication/auth.module";

@Module({
    imports: [AuthModule, TypeOrmModule.forFeature([Workspace])],
    controllers: [WorkspacesController],
    providers: [WorkspacesService],
})
export class WorkspacesModule {}
