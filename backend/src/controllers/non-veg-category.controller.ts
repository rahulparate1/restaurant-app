import {
  Count,
  CountSchema,
  Filter,
  FilterExcludingWhere,
  repository,
  Where,
} from '@loopback/repository';
import {
  post,
  param,
  get,
  getModelSchemaRef,
  patch,
  put,
  del,
  requestBody,
  response,
} from '@loopback/rest';
import {NonVegCategory} from '../models';
import {NonVegCategoryRepository} from '../repositories';

export class NonVegCategoryController {
  constructor(
    @repository(NonVegCategoryRepository)
    public nonVegCategoryRepository : NonVegCategoryRepository,
  ) {}

  @post('/non-veg-categories')
  @response(200, {
    description: 'NonVegCategory model instance',
    content: {'application/json': {schema: getModelSchemaRef(NonVegCategory)}},
  })
  async create(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(NonVegCategory, {
            title: 'NewNonVegCategory',
            exclude: ['id'],
          }),
        },
      },
    })
    nonVegCategory: Omit<NonVegCategory, 'id'>,
  ): Promise<NonVegCategory> {
    return this.nonVegCategoryRepository.create(nonVegCategory);
  }

  @get('/non-veg-categories/count')
  @response(200, {
    description: 'NonVegCategory model count',
    content: {'application/json': {schema: CountSchema}},
  })
  async count(
    @param.where(NonVegCategory) where?: Where<NonVegCategory>,
  ): Promise<Count> {
    return this.nonVegCategoryRepository.count(where);
  }

  @get('/non-veg-categories')
  @response(200, {
    description: 'Array of NonVegCategory model instances',
    content: {
      'application/json': {
        schema: {
          type: 'array',
          items: getModelSchemaRef(NonVegCategory, {includeRelations: true}),
        },
      },
    },
  })
  async find(
    @param.filter(NonVegCategory) filter?: Filter<NonVegCategory>,
  ): Promise<NonVegCategory[]> {
    return this.nonVegCategoryRepository.find(filter);
  }

  @patch('/non-veg-categories')
  @response(200, {
    description: 'NonVegCategory PATCH success count',
    content: {'application/json': {schema: CountSchema}},
  })
  async updateAll(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(NonVegCategory, {partial: true}),
        },
      },
    })
    nonVegCategory: NonVegCategory,
    @param.where(NonVegCategory) where?: Where<NonVegCategory>,
  ): Promise<Count> {
    return this.nonVegCategoryRepository.updateAll(nonVegCategory, where);
  }

  @get('/non-veg-categories/{id}')
  @response(200, {
    description: 'NonVegCategory model instance',
    content: {
      'application/json': {
        schema: getModelSchemaRef(NonVegCategory, {includeRelations: true}),
      },
    },
  })
  async findById(
    @param.path.string('id') id: string,
    @param.filter(NonVegCategory, {exclude: 'where'}) filter?: FilterExcludingWhere<NonVegCategory>
  ): Promise<NonVegCategory> {
    return this.nonVegCategoryRepository.findById(id, filter);
  }

  @patch('/non-veg-categories/{id}')
  @response(204, {
    description: 'NonVegCategory PATCH success',
  })
  async updateById(
    @param.path.string('id') id: string,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(NonVegCategory, {partial: true}),
        },
      },
    })
    nonVegCategory: NonVegCategory,
  ): Promise<void> {
    await this.nonVegCategoryRepository.updateById(id, nonVegCategory);
  }

  @put('/non-veg-categories/{id}')
  @response(204, {
    description: 'NonVegCategory PUT success',
  })
  async replaceById(
    @param.path.string('id') id: string,
    @requestBody() nonVegCategory: NonVegCategory,
  ): Promise<void> {
    await this.nonVegCategoryRepository.replaceById(id, nonVegCategory);
  }

  @del('/non-veg-categories/{id}')
  @response(204, {
    description: 'NonVegCategory DELETE success',
  })
  async deleteById(@param.path.string('id') id: string): Promise<void> {
    await this.nonVegCategoryRepository.deleteById(id);
  }
}
