import { ObjectLiteral, SelectQueryBuilder } from 'typeorm';
import type { PaginationResult, QueryString } from '../types/types';

export class ApiFeatures<T extends ObjectLiteral> {
  private paginationResult?: PaginationResult;

  constructor(
    private dbQuery: SelectQueryBuilder<T>,
    private queryString: QueryString,
  ) {}

  filter() {
    const queryStringObj = { ...this.queryString };

    const excludedFields = ['page', 'sort', 'limit', 'order'];

    excludedFields.forEach((field) => delete queryStringObj[field]);

    const alias = this.dbQuery.alias;

    for (const [field, value] of Object.entries(queryStringObj)) {
      if (value === undefined) continue;

      this.dbQuery.andWhere(`${alias}.${field} = :${field}`, {
        [field]: value,
      });
    }

    return this;
  }

  sort() {
    const sortBy = this.queryString.sort ?? 'createdAt';
    const order =
      this.queryString.order?.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';

    const alias = this.dbQuery.alias;

    this.dbQuery.orderBy(`${alias}.${sortBy}`, order);

    return this;
  }

  paginate(countDocuments: number) {
    const page = Number(this.queryString.page) || 1;
    const limit = Number(this.queryString.limit) || 20;

    const skip = (page - 1) * limit;
    const endIndex = page * limit;

    const pagination: PaginationResult = {
      currentPage: page,
      limit,
      numberOfPages: Math.ceil(countDocuments / limit),
      total: countDocuments,
    };

    if (endIndex < countDocuments) {
      pagination.next = page + 1;
    }

    if (skip > 0) {
      pagination.prev = page - 1;
    }

    this.dbQuery.skip(skip).take(limit);

    this.paginationResult = pagination;

    return this;
  }

  getPaginationResult() {
    return this.paginationResult;
  }

  getQuery() {
    return this.dbQuery;
  }
}
