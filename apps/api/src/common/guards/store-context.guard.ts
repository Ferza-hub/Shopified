import { BadRequestException, CanActivate, ExecutionContext, Injectable } from '@nestjs/common';

@Injectable()
export class StoreContextGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();

    const headerStoreId = request.headers['x-store-id'] as string | undefined;
    const userStoreId = request.user?.storeId as string | undefined;

    const storeId = headerStoreId || userStoreId;

    if (!storeId) {
      throw new BadRequestException(
        'Store context is required. Provide an x-store-id header or authenticate with a store-scoped token.',
      );
    }

    request.storeId = storeId;
    return true;
  }
}
