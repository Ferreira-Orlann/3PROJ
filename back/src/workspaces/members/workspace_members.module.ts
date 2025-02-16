import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { AuthModule } from "src/authentication/auth.module";
import { WorkspaceMember } from "./workspace_members.entity";

@Module({
    imports: [AuthModule, TypeOrmModule.forFeature([WorkspaceMember])],
    controllers: [],
    providers: [],
})
export class WorkspaceMembersModule {}
