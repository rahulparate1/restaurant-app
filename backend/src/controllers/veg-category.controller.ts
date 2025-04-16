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
import {VegCategory} from '../models';
import {VegCategoryRepository} from '../repositories';

export class VegCategoryController {
  constructor(
    @repository(VegCategoryRepository)
    public vegCategoryRepository : VegCategoryRepository,
  ) {}

  @post('/veg-categories')
  @response(200, {
    description: 'VegCategory model instance',
    content: {'application/json': {schema: getModelSchemaRef(VegCategory)}},
  })
  async create(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(VegCategory, {
            title: 'NewVegCategory',
            exclude: ['id'],
          }),
        },
      },
    })
    vegCategory: Omit<VegCategory, 'id'>,
  ): Promise<VegCategory> {
    return this.vegCategoryRepository.create(vegCategory);
  }

  @get('/veg-categories/count')
  @response(200, {
    description: 'VegCategory model count',
    content: {'application/json': {schema: CountSchema}},
  })
  async count(
    @param.where(VegCategory) where?: Where<VegCategory>,
  ): Promise<Count> {
    return this.vegCategoryRepository.count(where);
  }

  @get('/veg-categories')
  @response(200, {
    description: 'Array of VegCategory model instances',
    content: {
      'application/json': {
        schema: {
          type: 'array',
          items: getModelSchemaRef(VegCategory, {includeRelations: true}),
        },
      },
    },
  })
  async find(
    @param.filter(VegCategory) filter?: Filter<VegCategory>,
  ): Promise<VegCategory[]> {
    return this.vegCategoryRepository.find(filter);
  }

  @patch('/veg-categories')
  @response(200, {
    description: 'VegCategory PATCH success count',
    content: {'application/json': {schema: CountSchema}},
  })
  async updateAll(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(VegCategory, {partial: true}),
        },
      },
    })
    vegCategory: VegCategory,
    @param.where(VegCategory) where?: Where<VegCategory>,
  ): Promise<Count> {
    return this.vegCategoryRepository.updateAll(vegCategory, where);
  }

  @get('/veg-categories/{id}')
  @response(200, {
    description: 'VegCategory model instance',
    content: {
      'application/json': {
        schema: getModelSchemaRef(VegCategory, {includeRelations: true}),
      },
    },
  })
  async findById(
    @param.path.string('id') id: string,
    @param.filter(VegCategory, {exclude: 'where'}) filter?: FilterExcludingWhere<VegCategory>
  ): Promise<VegCategory> {
    return this.vegCategoryRepository.findById(id, filter);
  }

  @patch('/veg-categories/{id}')
  @response(204, {
    description: 'VegCategory PATCH success',
  })
  async updateById(
    @param.path.string('id') id: string,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(VegCategory, {partial: true}),
        },
      },
    })
    vegCategory: VegCategory,
  ): Promise<void> {
    await this.vegCategoryRepository.updateById(id, vegCategory);
  }

  @put('/veg-categories/{id}')
  @response(204, {
    description: 'VegCategory PUT success',
  })
  async replaceById(
    @param.path.string('id') id: string,
    @requestBody() vegCategory: VegCategory,
  ): Promise<void> {
    await this.vegCategoryRepository.replaceById(id, vegCategory);
  }

  @del('/veg-categories/{id}')
  @response(204, {
    description: 'VegCategory DELETE success',
  })
  async deleteById(@param.path.string('id') id: string): Promise<void> {
    await this.vegCategoryRepository.deleteById(id);
  }
}
