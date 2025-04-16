import {Entity, model, property} from '@loopback/repository';

@model({settings: {strict: false}})
export class NonVeg extends Entity {
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

  constructor(data?: Partial<NonVeg>) {
    super(data);
  }
}

export interface NonVegRelations {
  // describe navigational properties here
}

export type NonVegWithRelations = NonVeg & NonVegRelations;
