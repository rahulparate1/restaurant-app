import {inject} from '@loopback/core';
import {DefaultCrudRepository} from '@loopback/repository';
import {RestaurantApplicationDataSource} from '../datasources';
import {NonVegCategory, NonVegCategoryRelations} from '../models';

export class NonVegCategoryRepository extends DefaultCrudRepository<
  NonVegCategory,
  typeof NonVegCategory.prototype.id,
  NonVegCategoryRelations
> {
  constructor(
    @inject('datasources.restaurantApplication') dataSource: RestaurantApplicationDataSource,
  ) {
    super(NonVegCategory, dataSource);
  }
}
