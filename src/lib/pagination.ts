import { logger } from './logger'
import { PaginationInput } from './validations'

export interface PaginationOptions {
  page?: number
  limit?: number
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
}

export interface PaginationResult<T> {
  data: T[]
  pagination: {
    page: number
    limit: number
    total: number
    pages: number
    hasNext: boolean
    hasPrev: boolean
    nextPage: number | null
    prevPage: number | null
  }
  sort: {
    sortBy: string
    sortOrder: 'asc' | 'desc'
  }
}

export interface PaginationMeta {
  page: number
  limit: number
  total: number
  pages: number
  hasNext: boolean
  hasPrev: boolean
  nextPage: number | null
  prevPage: number | null
  offset: number
}

export class PaginationService {
  /**
   * Calculate pagination metadata
   */
  static calculateMeta(page: number, limit: number, total: number): PaginationMeta {
    const validPage = Math.max(1, page)
    const validLimit = Math.min(Math.max(1, limit), 100) // Max 100 items per page
    const pages = Math.ceil(total / validLimit)
    const hasNext = validPage < pages
    const hasPrev = validPage > 1
    const nextPage = hasNext ? validPage + 1 : null
    const prevPage = hasPrev ? validPage - 1 : null
    const offset = (validPage - 1) * validLimit

    return {
      page: validPage,
      limit: validLimit,
      total,
      pages,
      hasNext,
      hasPrev,
      nextPage,
      prevPage,
      offset,
    }
  }

  /**
   * Create pagination result object
   */
  static createResult<T>(
    data: T[],
    page: number,
    limit: number,
    total: number,
    sortBy = 'createdAt',
    sortOrder: 'asc' | 'desc' = 'desc'
  ): PaginationResult<T> {
    const meta = this.calculateMeta(page, limit, total)

    return {
      data,
      pagination: {
        page: meta.page,
        limit: meta.limit,
        total: meta.total,
        pages: meta.pages,
        hasNext: meta.hasNext,
        hasPrev: meta.hasPrev,
        nextPage: meta.nextPage,
        prevPage: meta.prevPage,
      },
      sort: {
        sortBy,
        sortOrder,
      },
    }
  }

  /**
   * Parse and validate pagination parameters
   */
  static parseOptions(options: PaginationOptions): {
    page: number
    limit: number
    skip: number
    sort: Record<string, 1 | -1>
  } {
    const page = Math.max(1, options.page || 1)
    const limit = Math.min(Math.max(1, options.limit || 20), 100)
    const skip = (page - 1) * limit
    const sortBy = options.sortBy || 'createdAt'
    const sortOrder = options.sortOrder === 'asc' ? 1 : -1

    const sort: Record<string, 1 | -1> = { [sortBy]: sortOrder }

    return { page, limit, skip, sort }
  }

  /**
   * Build MongoDB aggregation pipeline for pagination
   */
  static buildAggregationPipeline(
    matchStage: Record<string, any> = {},
    options: PaginationOptions = {},
    populateFields: string[] = []
  ) {
    const { page, limit, skip, sort } = this.parseOptions(options)

    const pipeline: any[] = []

    // Match stage
    if (Object.keys(matchStage).length > 0) {
      pipeline.push({ $match: matchStage })
    }

    // Populate/lookup stages
    for (const field of populateFields) {
      if (field.includes('.')) {
        const [localField, foreignField] = field.split('.')
        pipeline.push({
          $lookup: {
            from: `${localField}s`, // Assume collection name is plural
            localField: localField,
            foreignField: foreignField || '_id',
            as: localField,
          },
        })
        pipeline.push({
          $unwind: {
            path: `$${localField}`,
            preserveNullAndEmptyArrays: true,
          },
        })
      }
    }

    // Create facet for both data and count
    pipeline.push({
      $facet: {
        data: [
          { $sort: sort },
          { $skip: skip },
          { $limit: limit },
        ],
        count: [
          { $count: 'total' },
        ],
      },
    })

    return { pipeline, page, limit }
  }

  /**
   * Execute paginated query using aggregation
   */
  static async executeAggregation<T>(
    model: any,
    pipeline: any[],
    page: number,
    limit: number,
    sortBy?: string,
    sortOrder?: 'asc' | 'desc'
  ): Promise<PaginationResult<T>> {
    try {
      const [result] = await model.aggregate(pipeline)
      const data = result.data || []
      const totalArray = result.count || []
      const total = totalArray.length > 0 ? totalArray[0].total : 0

      return this.createResult(data, page, limit, total, sortBy, sortOrder)
    } catch (error) {
      const err = error as Error
      logger.error('Pagination aggregation failed', {
        model: model.collection?.name,
        error: err.message,
        pipeline: JSON.stringify(pipeline),
      })
      throw error
    }
  }

  /**
   * Execute simple paginated find query
   */
  static async executeFind<T>(
    model: any,
    filter: Record<string, any> = {},
    options: PaginationOptions = {},
    populateFields: string[] = []
  ): Promise<PaginationResult<T>> {
    try {
      const { page, limit, skip, sort } = this.parseOptions(options)

      // Execute count and find queries in parallel
      const [total, data] = await Promise.all([
        model.countDocuments(filter),
        model
          .find(filter)
          .sort(sort)
          .skip(skip)
          .limit(limit)
          .populate(populateFields.join(' '))
          .lean(),
      ])

      return this.createResult(data, page, limit, total, options.sortBy, options.sortOrder)
    } catch (error) {
      const err = error as Error
      logger.error('Pagination find failed', {
        model: model.collection?.name,
        error: err.message,
        filter: JSON.stringify(filter),
        options,
      })
      throw error
    }
  }

  /**
   * Create cursor-based pagination (for infinite scroll)
   */
  static async executeCursor<T>(
    model: any,
    filter: Record<string, any> = {},
    cursor?: string,
    limit = 20,
    sortField = 'createdAt',
    sortOrder: 'asc' | 'desc' = 'desc'
  ): Promise<{
    data: T[]
    nextCursor: string | null
    hasMore: boolean
  }> {
    try {
      const validLimit = Math.min(Math.max(1, limit), 100)
      const sort = { [sortField]: sortOrder === 'asc' ? 1 : -1 }

      // Add cursor condition to filter
      const cursorFilter = { ...filter }
      if (cursor) {
        const cursorValue = Buffer.from(cursor, 'base64').toString('utf-8')
        const operator = sortOrder === 'asc' ? '$gt' : '$lt'
        cursorFilter[sortField] = { [operator]: cursorValue }
      }

      // Fetch one extra item to determine if there are more results
      const data = await model
        .find(cursorFilter)
        .sort(sort)
        .limit(validLimit + 1)
        .lean()

      const hasMore = data.length > validLimit
      if (hasMore) {
        data.pop() // Remove the extra item
      }

      // Generate next cursor
      let nextCursor: string | null = null
      if (hasMore && data.length > 0) {
        const lastItem = data[data.length - 1]
        const cursorValue = lastItem[sortField]
        nextCursor = Buffer.from(String(cursorValue)).toString('base64')
      }

      return {
        data,
        nextCursor,
        hasMore,
      }
    } catch (error) {
      const err = error as Error
      logger.error('Cursor pagination failed', {
        model: model.collection?.name,
        error: err.message,
        cursor,
        sortField,
        sortOrder,
      })
      throw error
    }
  }

  /**
   * Generate pagination links for API responses
   */
  static generateLinks(
    baseUrl: string,
    pagination: PaginationMeta,
    params: Record<string, any> = {}
  ): {
    first: string
    last: string
    next: string | null
    prev: string | null
    self: string
  } {
    const buildUrl = (page: number) => {
      const url = new URL(baseUrl)
      url.searchParams.set('page', page.toString())
      url.searchParams.set('limit', pagination.limit.toString())
      
      // Add other parameters
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          url.searchParams.set(key, String(value))
        }
      })
      
      return url.toString()
    }

    return {
      first: buildUrl(1),
      last: buildUrl(pagination.pages),
      next: pagination.nextPage ? buildUrl(pagination.nextPage) : null,
      prev: pagination.prevPage ? buildUrl(pagination.prevPage) : null,
      self: buildUrl(pagination.page),
    }
  }

  /**
   * Validate pagination parameters from query string
   */
  static validateParams(query: Record<string, any>): PaginationOptions {
    const page = Math.max(1, parseInt(query.page) || 1)
    const limit = Math.min(Math.max(1, parseInt(query.limit) || 20), 100)
    const sortBy = typeof query.sortBy === 'string' ? query.sortBy : 'createdAt'
    const sortOrder = query.sortOrder === 'asc' ? 'asc' : 'desc'

    return { page, limit, sortBy, sortOrder }
  }
}

// Utility functions for common use cases
export const paginate = PaginationService

// Type-safe pagination hook for React components
export interface UsePaginationOptions {
  initialPage?: number
  initialLimit?: number
  maxLimit?: number
}

export function createPaginationState(options: UsePaginationOptions = {}) {
  const { initialPage = 1, initialLimit = 20, maxLimit = 100 } = options

  return {
    page: Math.max(1, initialPage),
    limit: Math.min(Math.max(1, initialLimit), maxLimit),
    
    setPage(page: number) {
      return Math.max(1, page)
    },
    
    setLimit(limit: number) {
      return Math.min(Math.max(1, limit), maxLimit)
    },
    
    reset() {
      return {
        page: initialPage,
        limit: initialLimit,
      }
    },
    
    nextPage(currentPage: number, totalPages: number) {
      return Math.min(currentPage + 1, totalPages)
    },
    
    prevPage(currentPage: number) {
      return Math.max(currentPage - 1, 1)
    },
  }
}