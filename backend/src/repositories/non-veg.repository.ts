import {inject} from '@loopback/core';
import {DefaultCrudRepository} from '@loopback/repository';
import {RestaurantApplicationDataSource} from '../datasources';
import {NonVeg, NonVegRelations} from '../models';

export class NonVegRepository extends DefaultCrudRepository<
  NonVeg,
  typeof NonVeg.prototype.id,
  NonVegRelations
> {
  constructor(
    @inject('datasources.restaurantApplication') dataSource: RestaurantApplicationDataSource,
  ) {
    super(NonVeg, dataSource);
  }
}
