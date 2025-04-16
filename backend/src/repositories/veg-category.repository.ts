import {inject} from '@loopback/core';
import {DefaultCrudRepository} from '@loopback/repository';
import {RestaurantApplicationDataSource} from '../datasources';
import {VegCategory, VegCategoryRelations} from '../models';

export class VegCategoryRepository extends DefaultCrudRepository<
  VegCategory,
  typeof VegCategory.prototype.id,
  VegCategoryRelations
> {
  constructor(
    @inject('datasources.restaurantApplication') dataSource: RestaurantApplicationDataSource,
  ) {
    super(VegCategory, dataSource);
  }
}
