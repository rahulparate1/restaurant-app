import {Entity, model, property} from '@loopback/repository';

@model({settings: {strict: false}})
export class Veg extends Entity {
  @property({
    type: 'string',
    id: true,
    generated: true,
  })
  id?: string;

  // Define well-known properties here

  // Indexer property to allow additional data
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [prop: string]: any;

  constructor(data?: Partial<Veg>) {
    super(data);
  }
}

export interface VegRelations {
  // describe navigational properties here
}

export type VegWithRelations = Veg & VegRelations;
