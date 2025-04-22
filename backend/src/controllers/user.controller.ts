import {
  authenticate,
  TokenService,
  UserService,
} from '@loopback/authentication';
import {
  OPERATION_SECURITY_SPEC,
  TokenServiceBindings,
} from '@loopback/authentication-jwt';
import {inject} from '@loopback/core';
import {Filter, model, property, repository} from '@loopback/repository';
import {
  get,
  getModelSchemaRef,
  HttpErrors,
  param,
  post,
  put,
  requestBody,
  response,
} from '@loopback/rest';
import {SecurityBindings, securityId, UserProfile} from '@loopback/security';
import _ from 'lodash';
import {PasswordHasherBindings, UserServiceBindings} from '../keys';
import {
  Restaurant,
  // Employee,
  // EmployeeEmail,
  User,
  UserWithPassword,
} from '../models';
import {
  Credentials,
  RestaurantRepository,
  UserRepository,
 
} from '../repositories';
import {
  basicAuthorization,
  PasswordHasher,
  UserManagementService,
  validateCredentials,
} from '../services';
import * as CryptoJS from 'crypto-js';

import {
  CredentialsRequestBody,
  UserProfileSchema,
} from './specs/user-controller.specs';
import {EmailJS, EmailJSConst, SERVER_URL} from '../services/constant';

@model()
export class NewUserRequest extends User {
  @property({
    type: 'string',
    required: true,
  })
  password: string;
}

@model()
export class OnBoarding {
  // @property({
  //   type: 'object',
  //   required: true,
  // })
  // employee: Employee;
  @property({
    type: 'object',
    required: true,
  })
  restaurant: Restaurant;
}

export class UserController {
  constructor(
    @repository(UserRepository)
    public userRepository: UserRepository,
    @inject(PasswordHasherBindings.PASSWORD_HASHER)
    public passwordHasher: PasswordHasher,
    @inject(TokenServiceBindings.TOKEN_SERVICE)
    public jwtService: TokenService,
    @inject(UserServiceBindings.USER_SERVICE)
    public userService: UserService<User, Credentials>,
    @inject(UserServiceBindings.USER_SERVICE)
    public userManagementService: UserManagementService,
    @repository(RestaurantRepository)
    public restaurantRepository: RestaurantRepository,
    // @repository(EmployeeRepository)
    // public employeeRepository: EmployeeRepository,
  ) {}

  @post('/users', {
    responses: {
      '200': {
        description: 'User',
        content: {
          'application/json': {
            schema: {
              'x-ts-type': User,
            },
          },
        },
      },
    },
  })
  // @authenticate('jwt')
  async create(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(NewUserRequest, {
            title: 'NewUser',
          }),
        },
      },
    })
    newUserRequest: NewUserRequest,
  ): Promise<User> {
    // All new users have the "admin" role by default
    //newUserRequest.roles = ['admin'];
    // ensure a valid username value and password value
    validateCredentials(_.pick(newUserRequest, ['username', 'password']));

    try {
      return await this.userManagementService.createUser(newUserRequest);
    } catch (error: any) {
      // MongoError 11000 duplicate key
      if (
        error.code === 11000 &&
        error.errmsg.includes('index: uniqueUsername')
      ) {
        throw new HttpErrors.Conflict('Username is already taken');
      } else {
        throw error;
      }
    }
  }

  @put('/users/{userId}', {
    security: OPERATION_SECURITY_SPEC,
    responses: {
      '200': {
        description: 'User',
        content: {
          'application/json': {
            schema: {
              'x-ts-type': User,
            },
          },
        },
      },
    },
  })
  // @authenticate('jwt')
  // @authorize(ACL_PROJECT['update'])
  async set(
    @inject(SecurityBindings.USER)
    currentUserProfile: UserProfile,
    @param.path.string('userId') userId: string,
    @requestBody({description: 'update user'}) user: User,
  ): Promise<void> {
    try {
      // Only admin can assign roles
      if (!currentUserProfile.roles.includes('admin')) {
        delete user.roles;
      }
      return await this.userRepository.updateById(userId, user);
    } catch (e) {}
  }

  @get('/users/{userId}', {
    security: OPERATION_SECURITY_SPEC,
    responses: {
      '200': {
        description: 'User',
        content: {
          'application/json': {
            schema: {
              'x-ts-type': User,
            },
          },
        },
      },
    },
  })
  // @authenticate('jwt')
  // @authorize(ACL_PROJECT['view'])
  async findById(@param.path.string('userId') userId: string): Promise<User> {
    return this.userRepository.findById(userId);
  }

  @get('/users/me', {
    security: OPERATION_SECURITY_SPEC,
    responses: {
      '200': {
        description: 'The current user profile',
        content: {
          'application/json': {
            schema: UserProfileSchema,
          },
        },
      },
    },
  })
  @authenticate('jwt')
  async printCurrentUser(
    @inject(SecurityBindings.USER)
    currentUserProfile: UserProfile,
  ): Promise<User> {
    // (@jannyHou)FIXME: explore a way to generate OpenAPI schema
    // for symbol property

    const userId = currentUserProfile[securityId];
    return this.userRepository.findById(userId);
  }

  @get('/users/set-push-token/{token}', {
    security: OPERATION_SECURITY_SPEC,
    responses: {
      '200': {
        description: 'The current user profile',
        content: {
          'application/json': {
            schema: UserProfileSchema,
          },
        },
      },
    },
  })
  @authenticate('jwt')
  async setPushToken(
    @inject(SecurityBindings.USER)
    currentUserProfile: UserProfile,
    @param.path.string('token') token: string,
  ): Promise<User> {
    // (@jannyHou)FIXME: explore a way to generate OpenAPI schema
    // for symbol property
    const userId = currentUserProfile[securityId];
    let user = await this.userRepository.findById(userId);
    if (!user?.pushTokens?.length) {
      user.pushTokens = [];
    }
    if (user.pushTokens.indexOf(token) == -1) {
      user.pushTokens.push(token);
    }
    await this.userRepository.updateById(userId, user);
    return user;
  }

  @get('/users/delete-push-token/{token}', {
    security: OPERATION_SECURITY_SPEC,
    responses: {
      '200': {
        description: 'The current user profile',
        content: {
          'application/json': {
            schema: UserProfileSchema,
          },
        },
      },
    },
  })
  @authenticate('jwt')
  async deletePushToken(
    @inject(SecurityBindings.USER)
    currentUserProfile: UserProfile,
    @param.path.string('token') token: string,
  ): Promise<User> {
    // (@jannyHou)FIXME: explore a way to generate OpenAPI schema
    // for symbol property

    const userId = currentUserProfile[securityId];
    let user = await this.userRepository.findById(userId);
    if (!user?.pushTokens?.length) {
      user.pushTokens = [];
    }
    let index = user.pushTokens.indexOf(token);
    if (index != -1) {
      user.pushTokens.splice(index, 1);
    }
    await this.userRepository.updateById(userId, user);
    return user;
  }
  
  // @authenticate('jwt')
  @post('/users/login', {
    responses: {
      '200': {
        description: 'Token',
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
                token: {type: 'string'},
                profile: {type: 'object'},
              },
            },
          },
        },
      },
      '401': {
        description: 'Unauthorized',
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
                error: {type: 'string'},
              },
            },
          },
        },
      },
    },
  })
  async login(
    @requestBody() encryptedCredentials: {input: string},
  ): Promise<{token: string; profile: any}> {
    try {
      // Decrypt credentials
      const decryptedUsername = this.decryptCredentials(
        encryptedCredentials.input,
        'Xaa3Mivmz5Tllvq',
      );

      const credentials = decryptedUsername;

      if (!credentials) {
        throw new Error('Invalid credentials provided');
      }

      // Verify credentials
      const user =
        await this.userManagementService.verifyCredentials(credentials);
      if (!user) {
        throw new Error('Invalid username or password');
      }

      // Convert user to profile and generate token
      const userProfile = this.userManagementService.convertToUserProfile(user);
      const token = await this.jwtService.generateToken(userProfile);

      // Fetch employee and company details
      // const employee = await this.employeeRepository.findOne({
      //   where: {userId: user.id},
      // });

      let restaurant = null;
      if (user && user.restaurantId) {
        restaurant = await this.restaurantRepository.findById(user.restaurantId);
      }

      // Construct and return response
      return {
        token,
        profile: { restaurant, user: userProfile},
      };
    } catch (error) {
      console.error('Login error:', error);

      // Maintain error handling behavior like in the existing API
      throw new Error('Login failed');
    }
  }

  decryptCredentials(encryptedText: string, key: string): any {
    const decryptedText = CryptoJS.AES.decrypt(encryptedText, key).toString(
      CryptoJS.enc.Utf8,
    );
    try {
      return JSON.parse(decryptedText);
    } catch (error) {
      console.error('JSON Parsing Error:', error);
      return decryptedText;
    }
  }

  @get('/users', {
    responses: {
      '200': {
        description: 'Array of Users model instances',
        content: {
          'application/json': {
            schema: {
              type: 'array',
              items: getModelSchemaRef(User, {includeRelations: true}),
            },
          },
        },
      },
    },
  })
  // @authenticate('jwt')
  // @authorize(ACL_PROJECT['view-all'])
  async findUsers(): Promise<User[] | undefined> {
    const users = await this.userRepository.findUsers();

    return users;
  }

  // @post('/company/onboard', {
  //   responses: {
  //     '200': {
  //       description: 'User',
  //       content: {
  //         'application/json': {
  //           schema: {
  //             'x-ts-type': OnBoarding,
  //           },
  //         },
  //       },
  //     },
  //   },
  // })
  // // @authenticate('jwt')
  // async createOnboard(
  //   @requestBody({})
  //   newUserRequest: OnBoarding,
  // ): Promise<object> {
  //   try {
  //     let employee = newUserRequest.employee;
  //     let userwithPassword = new UserWithPassword();
  //     //--Step 1 : Create User
  //     let mobNo = employee.mobileNo ?? '1234567890';
  //     let password = 'password';
  //     if (employee.email && password) {
  //       userwithPassword['firstName'] = employee.name;
  //       userwithPassword['username'] = employee.email;
  //       userwithPassword['password'] = password || employee.email;

  //       userwithPassword['roles'] = ['company'];

  //       const user =
  //         await this.userManagementService.createUser(userwithPassword);
  //       if (user) {
  //         employee.userId = user.id;
  //       }
  //       let emailObj = {
  //         templateId: EmailJSConst,
  //         username: employee?.email,
  //         password: password,
  //         loginUrl: SERVER_URL + 'account/login',
  //         currentUser: employee?.name,
  //         toEmail: employee?.email,
  //       };

  //       //Step 2 : Create Vendor
  //       let companyResponse = await this.companyRepository.create(
  //         newUserRequest.company,
  //       );
  //       let companyId = companyResponse.id;
  //       employee['companyId'] = companyId || '';
  //       employee.designation = 'secretary';
  //       //Step 3: Create Member

  //       //Step 4: Update user with society id
  //       user.companyId = companyId || '';
  //       // let updatedUser = await this.userRepository.updateById(employee.userId, user);
  //       let employeeResponse = await this.employeeRepository.create(employee);
  //       const emailResp = await this.userManagementService.sendEmail(emailObj);
  //       if (emailResp) {
  //         employeeResponse.isEmailSent = true;
  //         let updateEmployee =
  //           await this.employeeRepository.update(employeeResponse);
  //         return {
  //           employeeId: employeeResponse.id,
  //           companyId: companyId,
  //           success: true,
  //         };
  //       }
  //     }
  //   } catch (error) {}
  //   return {
  //     success: false,
  //   };
  // }

  // @post('/user/generate-otp', {
  //   responses: {
  //     200: {
  //       content: {
  //         'application/json': {},
  //       },
  //       description: '',
  //     },
  //   },
  // })
  // async generateOtp(
  //   @requestBody({})
  //   emp: EmployeeEmail,
  // ): Promise<object> {
  //   const empRes = await this.employeeRepository.findOne({
  //     where: {email: emp.email},
  //   });
  //   let employee: any = empRes;
  //   // const member  = await this.memberRepository.findById(id)
  //   delete employee.otp;
  //   delete employee.otpGeneratedAt;
  //   try {
  //     let otp = Math.floor(1000 + Math.random() * 9000);
  //     let emailObj = {
  //       templateId: EmailJSConst.SIGNUP_TEMPLATE,
  //       otp: otp,
  //       currentUser: employee?.name,
  //       toEmail: employee?.email,
  //       message:
  //         'Please use the verification code below : .' +
  //         otp +
  //         "  If you didn't request this, you can ignore this mail or let us know.",
  //       subject: 'PayOps| Verification Code',
  //     };

  //     const emailResp = await this.userManagementService.sendEmail(emailObj);
  //     if (emailResp) {
  //       employee.isOtpSent = true;
  //       employee.otp = otp;
  //       employee.otpGeneratedAt = new Date().toISOString();
  //       let updateEmployee = await this.employeeRepository.update(employee);

  //       return {email: employee.email, success: true};
  //     }
  //   } catch (error) {}
  //   return {success: false};
  // }

  // @post('/user/verify-otp/{email}', {
  //   responses: {
  //     200: {
  //       content: {
  //         'application/json': {},
  //       },
  //       description: '',
  //     },
  //   },
  // })
  // async verifyOtp(
  //   @param.path.string('email') email: string,
  //   @requestBody()
  //   otp: number,
  // ): Promise<object> {
  //   try {
  //     const empRes = await this.employeeRepository.findOne({
  //       where: {email: email},
  //     });

  //     const employee: any = empRes;
  //     let currentTime = new Date();
  //     let otpGeneratedTime = new Date(employee.otpGeneratedAt);
  //     let timeDiff =
  //       (currentTime.getTime() - otpGeneratedTime?.getTime()) / 1000;
  //     timeDiff /= 60;
  //     timeDiff = Math.abs(Math.round(timeDiff));
  //     if (timeDiff <= 5) {
  //       if (otp == employee.otp) {
  //         employee['isEmailVerify'] = true;
  //         delete employee.otp;
  //         let updateEmployee = await this.employeeRepository.update(employee);

  //         return {message: 'OTP Verified', email: email, success: true};
  //       } else {
  //         return {message: 'Invalid OTP', success: false};
  //       }
  //     } else {
  //       return {message: 'OTP Expired', success: false};
  //     }
  //   } catch (error) {}
  //   return {success: false};
  // }

  // @post('/user/verify-login', {
  //   responses: {
  //     200: {
  //       content: {
  //         'application/json': {},
  //       },
  //       description: '',
  //     },
  //   },
  // })
  // async verifyLogin(
  //   @requestBody({
  //     content: {
  //       'application/json': {
  //         schema: {
  //           type: 'object',
  //           properties: {
  //             email: {type: 'string'},
  //             password: {type: 'string'},
  //           },
  //           required: ['email', 'password'],
  //         },
  //       },
  //     },
  //   })
  //   loginData: {
  //     email: string;
  //     password: string;
  //   },
  // ): Promise<object> {
  //   try {
  //     const {email, password} = loginData;
  //     const employee = await this.employeeRepository.findOne({where: {email}});
  //     if (!employee) {
  //       return {message: 'User not found', success: false};
  //     }
  //     const passwordMatched = await this.userManagementService.verifyPassword(
  //       employee.userId,
  //       password,
  //     );
  //     if (!passwordMatched) {
  //       return {message: 'Invalid password', success: false};
  //     }
  //     return {message: 'Password match', success: true};
  //   } catch (error) {
  //     return {message: 'Error verifying login', success: false};
  //   }
  // }

  @post('/user/update-password1/{email}')
  async updatePassword(
    @param.path.string('email') email: string,
    @requestBody() pwdObj: any,
  ): Promise<object> {
    try {
      // Decrypt the password using the new function
      const decryptedPassword = this.decryptCredentials(
        pwdObj.password,
        'Xaa3Mivmz5Tllvq',
      ); // Make sure the key matches frontend

      if (!decryptedPassword) {
        return {success: false, message: 'Password decryption failed'};
      }
      // Find the user by email
      const userRes = await this.userRepository.findOne({
        where: {username: email},
      });
      if (!userRes) {
        return {success: false, message: 'User not found'};
      }

      let user: any = userRes;

      // Update password (assuming updatePassword hashes the password before storing)
      await this.userManagementService.updatePassword(
        user.id,
        decryptedPassword,
      );

      return {success: true, message: 'Password updated successfully'};
    } catch (error) {
      console.error('Error updating password:', error);
      return {success: false, message: 'Error updating password'};
    }
  }
  
  @authenticate('jwt')
  @get('/admin-users')
  @response(200, {
    description: 'List of users with admin role',
    content: {
      'application/json': {
        schema: {
          type: 'array',
          items: getModelSchemaRef(User, {includeRelations: true}),
        },
      },
    },
  })
  async getAdminUsers(
    @inject(SecurityBindings.USER) currentUserProfile: UserProfile,
    @param.filter(User) filter?: Filter<User>
  ): Promise<User[]> {
    if (!filter) {
      filter = {};
    }

    // Ensure only 'admin' users are fetched
    filter.where = {...filter.where, roles: {inq: ['admin']}};

    // Apply company filter if needed
    filter = await this.userRepository.addCompanyFilter2(filter, currentUserProfile);

    return this.userRepository.find(filter);
  }
}
    


