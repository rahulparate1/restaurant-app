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
import {NonVeg} from '../models';
import {NonVegRepository} from '../repositories';

export class NonVegController {
  constructor(
    @repository(NonVegRepository)
    public nonVegRepository : NonVegRepository,
  ) {}

  @post('/non-vegs')
  @response(200, {
    description: 'NonVeg model instance',
    content: {'application/json': {schema: getModelSchemaRef(NonVeg)}},
  })
  async create(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(NonVeg, {
            title: 'NewNonVeg',
            exclude: ['id'],
          }),
        },
      },
    })
    nonVeg: Omit<NonVeg, 'id'>,
  ): Promise<NonVeg> {
    return this.nonVegRepository.create(nonVeg);
  }

  @get('/non-vegs/count')
  @response(200, {
    description: 'NonVeg model count',
    content: {'application/json': {schema: CountSchema}},
  })
  async count(
    @param.where(NonVeg) where?: Where<NonVeg>,
  ): Promise<Count> {
    return this.nonVegRepository.count(where);
  }

  @get('/non-vegs')
  @response(200, {
    description: 'Array of NonVeg model instances',
    content: {
      'application/json': {
        schema: {
          type: 'array',
          items: getModelSchemaRef(NonVeg, {includeRelations: true}),
        },
      },
    },
  })
  async find(
    @param.filter(NonVeg) filter?: Filter<NonVeg>,
  ): Promise<NonVeg[]> {
    return this.nonVegRepository.find(filter);
  }

  @patch('/non-vegs')
  @response(200, {
    description: 'NonVeg PATCH success count',
    content: {'application/json': {schema: CountSchema}},
  })
  async updateAll(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(NonVeg, {partial: true}),
        },
      },
    })
    nonVeg: NonVeg,
    @param.where(NonVeg) where?: Where<NonVeg>,
  ): Promise<Count> {
    return this.nonVegRepository.updateAll(nonVeg, where);
  }

  @get('/non-vegs/{id}')
  @response(200, {
    description: 'NonVeg model instance',
    content: {
      'application/json': {
        schema: getModelSchemaRef(NonVeg, {includeRelations: true}),
      },
    },
  })
  async findById(
    @param.path.string('id') id: string,
    @param.filter(NonVeg, {exclude: 'where'}) filter?: FilterExcludingWhere<NonVeg>
  ): Promise<NonVeg> {
    return this.nonVegRepository.findById(id, filter);
  }

  @patch('/non-vegs/{id}')
  @response(204, {
    description: 'NonVeg PATCH success',
  })
  async updateById(
    @param.path.string('id') id: string,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(NonVeg, {partial: true}),
        },
      },
    })
    nonVeg: NonVeg,
  ): Promise<void> {
    await this.nonVegRepository.updateById(id, nonVeg);
  }

  @put('/non-vegs/{id}')
  @response(204, {
    description: 'NonVeg PUT success',
  })
  async replaceById(
    @param.path.string('id') id: string,
    @requestBody() nonVeg: NonVeg,
  ): Promise<void> {
    await this.nonVegRepository.replaceById(id, nonVeg);
  }

  @del('/non-vegs/{id}')
  @response(204, {
    description: 'NonVeg DELETE success',
  })
  async deleteById(@param.path.string('id') id: string): Promise<void> {
    await this.nonVegRepository.deleteById(id);
  }
}
