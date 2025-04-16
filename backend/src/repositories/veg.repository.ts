import {inject} from '@loopback/core';
import {DefaultCrudRepository} from '@loopback/repository';
import {RestaurantApplicationDataSource} from '../datasources';
import {Veg, VegRelations} from '../models';

export class VegRepository extends DefaultCrudRepository<
  Veg,
  typeof Veg.prototype.id,
  VegRelations
> {
  constructor(
    @inject('datasources.restaurantApplication') dataSource: RestaurantApplicationDataSource,
  ) {
    super(Veg, dataSource);
  }
}
