// Copyright IBM Corp. 2020. All Rights Reserved.
// Node module: @loopback/example-access-control-migration
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {UserService} from '@loopback/authentication';
import {BindingKey} from '@loopback/core';
// import {User} from './models';
import {PasswordHasher} from './services';
import { Credentials} from './repositories';
import { User } from './models';

export const RESOURCE_ID = BindingKey.create<string>('resourceId');

export namespace PasswordHasherBindings {
  export const PASSWORD_HASHER = BindingKey.create<PasswordHasher>(
    'services.hasher',
  );
  export const ROUNDS = BindingKey.create<number>('services.hasher.round');
}

export namespace UserServiceBindings {
  export const USER_SERVICE = BindingKey.create<UserService<User, Credentials>>(
    'services.user.service',
  );
}
