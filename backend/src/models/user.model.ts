import {Entity, hasOne, model, property} from '@loopback/repository';
import {UserCredentials} from './user-credentials.model';

@model({
  settings: {
    strict: true,
    indexes: {
      uniqueUsername: {
        keys: {
          username: 1,
        },
        options: {
          unique: true,
        },
      },
    },
  },
  name: 'user',
})
export class User extends Entity {
  @property({
    type: 'string',
    id: true,
  })
  id: string;

  @property({
    type: 'string',
  })
  fullName?: string;

 
  @property({
    type: 'string',
    required: true,
  })
  username: string;

  @property({
    type: 'string',
  })
  restaurantName?: string;

  // @property({
  //   type: 'string',
  //   required: true,
  // })
  // mobileNumber: string;
 

  @property({
    type: 'string',
    required: false,
  })
  image: string;
  // @property({
  //   type: 'string',
  //   required: true,
  // })
  // password: string;
  // $2a$10$0oIZ4nxIJx84Iz0VF5jh0.qD0a3yJpZv2KH0jKS50B26TgvgswAme   -----  123456

  @hasOne(() => UserCredentials, {keyTo: 'userId'})
  userCredentials: UserCredentials;

  @property({
    type: 'array',
    itemType: 'string',
  })
  roles?: string[];

  @property({
    type: 'string',
    required: false,
  })
  restaurantId?: string;

// ADDITIONAL PROPERTIES ADD ACCORDING TO FORM


@property({
  type: 'string',
})

mobileNo?: string;

@property({
  type: 'string',
  required: false,
})
password?: string;



@property({
  type: 'array',
  itemType: 'string',
})
pushTokens?: string[];



@property({
  type: 'string',
  required: false,
})
vname?: string;

@property({
  type: 'string',
  required: false,
})
email?: string;

@property({
  type: 'string',
  required: false,
})
link?: string;


@property({ type: 'string', required: false })
  otp?: string;

  @property({ type: 'string', required: false })
  otpGeneratedAt?: string;

  @property({ type: 'boolean', default: false })
  isOtpSent?: boolean;

  @property({ type: 'boolean', default: false })
  isEmailVerified?: boolean;

@property({
  type: 'string',
  required: false,
})
address?: string;
  [prop: string]: any;

  constructor(data?: Partial<User>) {
    super(data);
  }
}

export interface UserRelations {
  // describe navigational properties here
}

export type UserWithRelations = User & UserRelations;
