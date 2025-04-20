import {Entity, model, property} from '@loopback/repository';

@model({settings: {strict: false}})
export class Restaurant extends Entity {
  @property({
    type: 'string',
    id: true,
    generated: true,
  })
  id?: string;

  @property({
    type: 'string',
    required: false,
  })
  logo: string;

  @property({
    type: 'boolean',
    required: false,
  })
  isActive: boolean;
  
  @property({
    type: 'string',
    required: false,
  })
  restaurantName?: string;

  // Define well-known properties here

  // Indexer property to allow additional data
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [prop: string]: any;

  constructor(data?: Partial<Restaurant>) {
    super(data);
  }
}

export interface RestaurantRelations {
  // describe navigational properties here
}

export type RestaurantWithRelations = Restaurant & RestaurantRelations;
