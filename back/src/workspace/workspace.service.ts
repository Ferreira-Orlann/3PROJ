import { Injectable } from '@nestjs/common';

@Injectable()
export class WorkspaceService {
  getHello(): string {
    return 'Hello World!';
  }
}
