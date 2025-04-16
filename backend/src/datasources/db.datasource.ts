import {inject, lifeCycleObserver, LifeCycleObserver} from '@loopback/core';
import {juggler} from '@loopback/repository';

const config = {
  name: 'restaurantApplication',
  connector: 'mongodb',
  url: 'mongodb+srv://rahulparate73:VfyIveZM9b9nXjGM@cluster0.ylvviz9.mongodb.net/restaurantApplication?retryWrites=true&w=majority',
  host: 'cluster0.ylvviz9.mongodb.net',
  port: 27017,
  user: 'rahulparate73',
  password: 'VfyIveZM9b9nXjGM',
  database: 'restaurantApplication',
  useNewUrlParser: true,
};

@lifeCycleObserver('datasource')
export class RestaurantApplicationDataSource extends juggler.DataSource
  implements LifeCycleObserver {
  static dataSourceName = 'restaurantApplication';
  static readonly defaultConfig = config;

  constructor(
    @inject('datasources.config.restaurantApplication', {optional: true})
    dsConfig: object = config,
  ) {
    super(dsConfig);
  }
}
