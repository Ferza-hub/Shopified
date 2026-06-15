import { Injectable, PipeTransform } from '@nestjs/common';
import { normalizePagination } from '@shopified/shared';

export interface NormalizedPagination {
  page: number;
  limit: number;
  skip: number;
  take: number;
}

@Injectable()
export class ParsePaginationPipe implements PipeTransform {
  transform(value: Record<string, unknown>): Record<string, unknown> & NormalizedPagination {
    const { page, limit, skip, take } = normalizePagination({
      page: value?.page as number | undefined,
      limit: value?.limit as number | undefined,
    });

    return {
      ...value,
      page,
      limit,
      skip,
      take,
    };
  }
}
