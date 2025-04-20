import {BootMixin} from '@loopback/boot';
import {ApplicationConfig, BindingKey, createBindingFromClass} from '@loopback/core';
import {
  RestExplorerBindings,
  RestExplorerComponent,
} from '@loopback/rest-explorer';
import {RepositoryMixin} from '@loopback/repository';
import {RestApplication} from '@loopback/rest';
import {ServiceMixin} from '@loopback/service-proxy';
import path from 'path';
import {MySequence} from './sequence';


import { AuthenticationComponent } from '@loopback/authentication';
import { JWTAuthenticationComponent, TokenServiceBindings } from '@loopback/authentication-jwt';
import { AuthorizationComponent } from '@loopback/authorization';
import {PasswordHasherBindings, UserServiceBindings} from './keys';
// import {MyUserService} from './services/my-user-service';
import {
  BcryptHasher,
  JWTService,
  SecuritySpecEnhancer,
  UserManagementService,
} from './services';
// import { PayrollService } from './services/payroll.service';

export {ApplicationConfig};

export interface PackageInfo {
  name: string;
  version: string;
  description: string;
}


const pkg: PackageInfo = require('../package.json');

export const PackageKey = BindingKey.create<PackageInfo>('application.package');

export class BackendApplication extends BootMixin(
  ServiceMixin(RepositoryMixin(RestApplication)),
) {
  constructor(options: ApplicationConfig = {}) {
    super(options);

    this.setUpBindings();
    // Set up the custom sequence
    this.sequence(MySequence);

    // Set up default home page
    this.static('/', path.join(__dirname, '../public'));

    // Customize @loopback/rest-explorer configuration here
    this.configure(RestExplorerBindings.COMPONENT).to({
      path: '/explorer',
    });
    this.component(RestExplorerComponent);

    this.projectRoot = __dirname;
    // Customize @loopback/boot Booter Conventions here
    this.bootOptions = {
      controllers: {
        // Customize ControllerBooter Conventions here
        dirs: ['controllers'],
        extensions: ['.controller.js'],
        nested: true,
      },
    };
  }

  setUpBindings(): void {
    // Bind package.json to the application context
    this.bind(PackageKey).to(pkg);
    this.bind(TokenServiceBindings.TOKEN_SECRET).to('fsdfsdfdsfrewrvxxxdsdf');
    // Bind bcrypt hash services
    this.bind(PasswordHasherBindings.ROUNDS).to(10);
    this.bind(PasswordHasherBindings.PASSWORD_HASHER).toClass(BcryptHasher);
    this.bind(TokenServiceBindings.TOKEN_SERVICE).toClass(JWTService);
    // this.bind(UserServiceBindings.USER_SERVICE).toClass(MyUserService); 
    this.bind(UserServiceBindings.USER_SERVICE).toClass(UserManagementService);
    // this.bind('services.PayrollService').toClass(PayrollService);
    this.add(createBindingFromClass(SecuritySpecEnhancer));
  }
}
