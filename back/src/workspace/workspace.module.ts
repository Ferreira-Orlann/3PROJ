import { Module } from '@nestjs/common';
import { DatabaseModule } from 'src/database/database.module';
import { WorkspaceController } from './workspace.controller';
import { WorkspaceService } from './workspace.service';

@Module({
  imports: [DatabaseModule],
  controllers: [WorkspaceController],
  providers: [WorkspaceService],
})
export class WorkspaceModule {}
