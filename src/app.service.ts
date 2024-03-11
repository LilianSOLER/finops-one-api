import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  /**
   * Retrieves the "Hello World!" message.
   * @returns Returns the "Hello World!" message.
   */
  getHello(): string {
    return 'Hello World!';
  }
}
