import {Entity, model, property} from '@loopback/repository';

@model({settings: {strict: false}})
export class VegCategory extends Entity {
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
  title: string;

  @property({
    type: 'string',
    required: false,
  })
  code: string;

  @property({
    type: 'string',
    required: false,
  })
  description: string;

  // Define well-known properties here

  // Indexer property to allow additional data
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [prop: string]: any;

  constructor(data?: Partial<VegCategory>) {
    super(data);
  }
}

export interface VegCategoryRelations {
  // describe navigational properties here
}

export type VegCategoryWithRelations = VegCategory & VegCategoryRelations;
