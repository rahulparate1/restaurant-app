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
import {Veg} from '../models';
import {VegRepository} from '../repositories';

export class VegController {
  constructor(
    @repository(VegRepository)
    public vegRepository : VegRepository,
  ) {}

  @post('/vegs')
  @response(200, {
    description: 'Veg model instance',
    content: {'application/json': {schema: getModelSchemaRef(Veg)}},
  })
  async create(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Veg, {
            title: 'NewVeg',
            exclude: ['id'],
          }),
        },
      },
    })
    veg: Omit<Veg, 'id'>,
  ): Promise<Veg> {
    return this.vegRepository.create(veg);
  }

  @get('/vegs/count')
  @response(200, {
    description: 'Veg model count',
    content: {'application/json': {schema: CountSchema}},
  })
  async count(
    @param.where(Veg) where?: Where<Veg>,
  ): Promise<Count> {
    return this.vegRepository.count(where);
  }

  @get('/vegs')
  @response(200, {
    description: 'Array of Veg model instances',
    content: {
      'application/json': {
        schema: {
          type: 'array',
          items: getModelSchemaRef(Veg, {includeRelations: true}),
        },
      },
    },
  })
  async find(
    @param.filter(Veg) filter?: Filter<Veg>,
  ): Promise<Veg[]> {
    return this.vegRepository.find(filter);
  }

  @patch('/vegs')
  @response(200, {
    description: 'Veg PATCH success count',
    content: {'application/json': {schema: CountSchema}},
  })
  async updateAll(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Veg, {partial: true}),
        },
      },
    })
    veg: Veg,
    @param.where(Veg) where?: Where<Veg>,
  ): Promise<Count> {
    return this.vegRepository.updateAll(veg, where);
  }

  @get('/vegs/{id}')
  @response(200, {
    description: 'Veg model instance',
    content: {
      'application/json': {
        schema: getModelSchemaRef(Veg, {includeRelations: true}),
      },
    },
  })
  async findById(
    @param.path.string('id') id: string,
    @param.filter(Veg, {exclude: 'where'}) filter?: FilterExcludingWhere<Veg>
  ): Promise<Veg> {
    return this.vegRepository.findById(id, filter);
  }

  @patch('/vegs/{id}')
  @response(204, {
    description: 'Veg PATCH success',
  })
  async updateById(
    @param.path.string('id') id: string,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Veg, {partial: true}),
        },
      },
    })
    veg: Veg,
  ): Promise<void> {
    await this.vegRepository.updateById(id, veg);
  }

  @put('/vegs/{id}')
  @response(204, {
    description: 'Veg PUT success',
  })
  async replaceById(
    @param.path.string('id') id: string,
    @requestBody() veg: Veg,
  ): Promise<void> {
    await this.vegRepository.replaceById(id, veg);
  }

  @del('/vegs/{id}')
  @response(204, {
    description: 'Veg DELETE success',
  })
  async deleteById(@param.path.string('id') id: string): Promise<void> {
    await this.vegRepository.deleteById(id);
  }
}
