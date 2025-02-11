import { Controller, Get } from '@nestjs/common';
import { WorkspaceService } from './workspace.service';

@Controller()
export class WorkspaceController {
  constructor(private readonly workspaceService: WorkspaceService) {}

  @Get("hello")
  getHello(): string {
    return this.workspaceService.getHello();
  }
}
