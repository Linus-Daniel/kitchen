import mongoose, { PipelineStage } from 'mongoose'
import { logger } from './logger'
import { preventMongoInjection } from './security'

export interface SearchOptions {
  query?: string
  filters?: Record<string, any>
  sort?: Record<string, 1 | -1>
  page?: number
  limit?: number
  facets?: string[]
  highlight?: boolean
}

export interface SearchResult<T> {
  data: T[]
  total: number
  page: number
  pages: number
  limit: number
  facets?: Record<string, { count: number; values: any[] }>
  searchTime: number
}

export interface SearchIndex {
  fields: Record<string, number | string>
  options?: mongoose.IndexOptions
}

export class SearchService {
  private static instance: SearchService
  private indexesCreated = new Set<string>()

  private constructor() {}

  public static getInstance(): SearchService {
    if (!SearchService.instance) {
      SearchService.instance = new SearchService()
    }
    return SearchService.instance
  }

  // Create text indexes for better search performance
  async createTextIndex(
    model: mongoose.Model<any>,
    fields: Record<string, number | string>,
    options: mongoose.IndexOptions = {}
  ): Promise<void> {
    try {
      const indexKey = `${model.collection.name}_${JSON.stringify(fields)}`
      
      if (this.indexesCreated.has(indexKey)) {
        return
      }

      await model.collection.createIndex(fields as any, {
        background: true,
        name: `${model.collection.name}_text_search`,
        ...options,
      } as any)

      this.indexesCreated.add(indexKey)
      logger.info(`Created text index for ${model.collection.name}`, { fields })
    } catch (error) {
      logger.error(`Failed to create text index for ${model.collection.name}`, error)
    }
  }

  // Create compound indexes for filtering and sorting
  async createCompoundIndex(
    model: mongoose.Model<any>,
    fields: Record<string, 1 | -1>,
    options: mongoose.IndexOptions = {}
  ): Promise<void> {
    try {
      const indexKey = `${model.collection.name}_${JSON.stringify(fields)}`
      
      if (this.indexesCreated.has(indexKey)) {
        return
      }

      await model.collection.createIndex(fields as any, {
        background: true,
        name: `${model.collection.name}_compound_${Object.keys(fields).join('_')}`,
        ...options,
      } as any)

      this.indexesCreated.add(indexKey)
      logger.info(`Created compound index for ${model.collection.name}`, { fields })
    } catch (error) {
      logger.error(`Failed to create compound index for ${model.collection.name}`, error)
    }
  }

  // Generic search method using aggregation pipeline
  async search<T>(
    model: mongoose.Model<T>,
    options: SearchOptions
  ): Promise<SearchResult<T>> {
    const startTime = Date.now()

    try {
      const {
        query = '',
        filters = {},
        sort = { createdAt: -1 },
        page = 1,
        limit = 20,
        facets = [],
        highlight = false,
      } = options

      // Sanitize inputs
      const sanitizedFilters = preventMongoInjection(filters)
      const validPage = Math.max(1, page)
      const validLimit = Math.min(Math.max(1, limit), 100)
      const skip = (validPage - 1) * validLimit

      // Build aggregation pipeline
      const pipeline: PipelineStage[] = []

      // Match stage for filters
      const matchStage: Record<string, any> = { ...sanitizedFilters }

      // Add text search if query provided
      if (query.trim()) {
        matchStage.$text = { $search: query.trim() }
      }

      if (Object.keys(matchStage).length > 0) {
        pipeline.push({ $match: matchStage })
      }

      // Add score for text search
      if (query.trim()) {
        pipeline.push({
          $addFields: {
            score: { $meta: 'textScore' },
            ...(highlight && {
              highlights: { $meta: 'textScore' }
            }),
          },
        })
      }

      // Create a parallel pipeline for counting and facets
      const facetPipeline: Record<string, PipelineStage[]> = {
        data: [
          { $sort: query.trim() ? { score: { $meta: 'textScore' }, ...sort } : sort },
          { $skip: skip },
          { $limit: validLimit },
        ],
        count: [{ $count: 'total' }],
      }

      // Add facet aggregations
      for (const facetField of facets) {
        facetPipeline[`facet_${facetField}`] = [
          {
            $group: {
              _id: `$${facetField}`,
              count: { $sum: 1 },
            },
          },
          { $sort: { count: -1 } },
          { $limit: 50 }, // Limit facet values
        ]
      }

      pipeline.push({ $facet: facetPipeline as any })

      // Execute aggregation
      const [result] = await model.aggregate(pipeline)

      const data = result.data || []
      const totalArray = result.count || []
      const total = totalArray.length > 0 ? totalArray[0].total : 0
      const pages = Math.ceil(total / validLimit)

      // Process facets
      const processedFacets: Record<string, { count: number; values: any[] }> = {}
      for (const facetField of facets) {
        const facetData = result[`facet_${facetField}`] || []
        processedFacets[facetField] = {
          count: facetData.length,
          values: facetData.map((item: any) => ({
            value: item._id,
            count: item.count,
          })),
        }
      }

      const searchTime = Date.now() - startTime

      logger.debug('Search completed', {
        collection: model.collection.name,
        query,
        total,
        page: validPage,
        limit: validLimit,
        searchTime,
      })

      return {
        data,
        total,
        page: validPage,
        pages,
        limit: validLimit,
        facets: facets.length > 0 ? processedFacets : undefined,
        searchTime,
      }
    } catch (error) {
      const err = error as Error
      const searchTime = Date.now() - startTime
      logger.error('Search failed', {
        collection: model.collection.name,
        query: options.query,
        error: err.message,
        searchTime,
      })
      throw error
    }
  }

  // Autocomplete/suggestions search
  async suggest<T>(
    model: mongoose.Model<T>,
    query: string,
    field: string,
    limit = 10
  ): Promise<string[]> {
    try {
      if (!query.trim()) {
        return []
      }

      const pipeline: PipelineStage[] = [
        {
          $match: {
            [field]: { $regex: query.trim(), $options: 'i' },
          },
        },
        {
          $group: {
            _id: `$${field}`,
            count: { $sum: 1 },
          },
        },
        { $sort: { count: -1 } },
        { $limit: limit },
        {
          $project: {
            _id: 0,
            suggestion: '$_id',
          },
        },
      ]

      const results = await model.aggregate(pipeline)
      return results.map((item: any) => item.suggestion).filter(Boolean)
    } catch (error) {
      const err = error as Error
      logger.error('Suggestion search failed', {
        collection: model.collection.name,
        query,
        field,
        error: err.message,
      })
      return []
    }
  }

  // Geographic search (for location-based searches)
  async geoSearch<T>(
    model: mongoose.Model<T>,
    longitude: number,
    latitude: number,
    maxDistance: number, // in meters
    options: Omit<SearchOptions, 'query'> = {}
  ): Promise<SearchResult<T>> {
    const startTime = Date.now()

    try {
      const {
        filters = {},
        sort = { distance: 1 },
        page = 1,
        limit = 20,
      } = options

      const validPage = Math.max(1, page)
      const validLimit = Math.min(Math.max(1, limit), 100)
      const skip = (validPage - 1) * validLimit

      const pipeline: PipelineStage[] = [
        {
          $geoNear: {
            near: {
              type: 'Point',
              coordinates: [longitude, latitude],
            },
            distanceField: 'distance',
            maxDistance,
            spherical: true,
            query: preventMongoInjection(filters),
          },
        },
        { $sort: sort },
      ]

      // Count pipeline
      const countPipeline = [...pipeline, { $count: 'total' }]
      
      // Data pipeline
      const dataPipeline = [
        ...pipeline,
        { $skip: skip },
        { $limit: validLimit },
      ]

      // Execute both pipelines
      const [countResult, dataResult] = await Promise.all([
        model.aggregate(countPipeline),
        model.aggregate(dataPipeline),
      ])

      const total = countResult.length > 0 ? countResult[0].total : 0
      const pages = Math.ceil(total / validLimit)
      const searchTime = Date.now() - startTime

      logger.debug('Geo search completed', {
        collection: model.collection.name,
        coordinates: [longitude, latitude],
        maxDistance,
        total,
        searchTime,
      })

      return {
        data: dataResult,
        total,
        page: validPage,
        pages,
        limit: validLimit,
        searchTime,
      }
    } catch (error) {
      const err = error as Error
      const searchTime = Date.now() - startTime
      logger.error('Geo search failed', {
        collection: model.collection.name,
        coordinates: [longitude, latitude],
        error: err.message,
        searchTime,
      })
      throw error
    }
  }

  // Initialize all search indexes for a model
  async initializeIndexes(
    model: mongoose.Model<any>,
    indexes: SearchIndex[]
  ): Promise<void> {
    try {
      for (const index of indexes) {
        if (index.fields.$text) {
          await this.createTextIndex(model, index.fields, index.options)
        } else {
          await this.createCompoundIndex(model, index.fields as Record<string, 1 | -1>, index.options)
        }
      }
      logger.info(`Initialized ${indexes.length} indexes for ${model.collection.name}`)
    } catch (error) {
      logger.error(`Failed to initialize indexes for ${model.collection.name}`, error)
    }
  }

  // Get search statistics
  async getSearchStats(model: mongoose.Model<any>): Promise<any> {
    try {
      const stats = await (model.collection as any).stats()
      const indexes = await (model.collection as any).indexes()
      
      return {
        totalDocuments: stats.count,
        totalSize: stats.size,
        avgDocumentSize: stats.avgObjSize,
        indexes: indexes.map((index: any) => ({
          name: index.name,
          keys: index.key,
          size: index.size || 0,
        })),
      }
    } catch (error) {
      logger.error(`Failed to get search stats for ${model.collection.name}`, error)
      return null
    }
  }
}

export const searchService = SearchService.getInstance()