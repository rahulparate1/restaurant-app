import {
  Count,
  CountSchema,
  Filter,
  FilterExcludingWhere,
  model,
  property,
  repository,
  Where,
} from '@loopback/repository';
import {
  post,
  param,
  get,
  getModelSchemaRef,
  patch,
  Request,
  Response,
  RestBindings,
  put,
  del,
  requestBody,
  response,
  HttpErrors,
} from '@loopback/rest';
import { User, Restaurant, UserWithPassword } from '../models';
import { Credentials, RestaurantRepository } from '../repositories';
// import { allowedCompanyEntities } from '../utils/constants';
import { EmailJS, EmailJSConst, SERVER_URL } from '../services/constant';
import { inject } from '@loopback/core';
import {
  UserRepository,
  UserServiceBindings,
} from '@loopback/authentication-jwt';
import { UserManagementService } from '../services';
// import multer from 'multer';
import { authenticate, UserService } from '@loopback/authentication';

// const upload = multer({ dest: 'uploads/' });
// const { uploadFile, deleteFile, awsS3BaseUrl } = require('../providers/awss3/s3');

@model()
export class OnBoarding {
  @property({
    type: 'object',
    required: true,
  })
  user: User;
  @property({
    type: 'object',
    required: true,
  })
  restaurant: Restaurant;
}


export class RestaurantController {
  constructor(
    @repository(UserRepository)
    public userRepository: UserRepository,
    // @repository(CompanyRepository)
    // public companyRepository: CompanyRepository,
    @inject(UserServiceBindings.USER_SERVICE)
    public userManagementService: UserManagementService,
    @repository(RestaurantRepository)
    public restaurantRepository: RestaurantRepository,
    // @repository(EmployeeRepository)
    // public employeeRepository: EmployeeRepository,
    
  ) { }

  // @authenticate('jwt')
  // @post('/restaurants/onboard', {
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
  
  // @authenticate('jwt')
  // async createOnboard(
  //   @requestBody({})
  //   newUserRequest: OnBoarding,
  // ): Promise<object> {
  //   try {
  //     const userWithPassword = new UserWithPassword();
  //     const userInfo:any = newUserRequest.user;
  
  //     if (userInfo?.email && userInfo?.password) {
  //       userWithPassword.fullName = userInfo.fullName;
  //       userWithPassword.email = userInfo.email;
  //       userWithPassword.username = userInfo.email;
  //       userWithPassword.password = userInfo.password;
  //       userWithPassword.roles = ['admin'];
  //       userWithPassword.mobileNo = userInfo.mobileNo;
  
  //       const user = await this.userManagementService.createUser(userWithPassword);
  
  //       if (user) {
  //         const otp = Math.floor(100000 + Math.random() * 900000);
  //         const emailObj = {
  //           templateId: EmailJSConst.Verify_OTP_Template,
  //           otp: otp,
  //           loginUrl: SERVER_URL + 'account/login',
  //           currentUser: userInfo.fullName,
  //           toEmail: userInfo.email,
  //         };
  //         console.log('emailObj',emailObj)
  
  //         const restaurantResponse = await this.restaurantRepository.create({
  //           restaurantName: newUserRequest.restaurant.restaurantName,
  //         });
  
  //         const restaurantId = restaurantResponse.id;
  //         user.restaurantId = restaurantId;
  
  //         await this.userRepository.updateById(user.id, user);
  
  //         const emailResp = await this.userManagementService.sendEmail(emailObj);
  //         if (emailResp) {
  //           return {
  //             userId: user.id,
  //             restaurantId: restaurantId,
  //             success: true,
  //           };
  //         }
  //       }
  //     }
  //   } catch (error) {
  //     console.error('Error in onboarding:', error);
  //   }
  
  //   return { success: false };
  // }

  // @authenticate('jwt')
  // @post('/restaurants/generate-otp', {
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
  //   userInfo: { email: string },
  // ): Promise<object> {
  //   const user = await this.userRepository.findOne({ where: { email: userInfo.email } });
  
  //   if (!user) {
  //     return { message: 'User not found', success: false };
  //   }
  
  //   if (user.isOtpSent) {
  //     return { message: 'OTP already sent', success: false };
  //   }
  
  //   try {
  //     const otp = Math.floor(100000 + Math.random() * 900000);
  //     const emailObj = {
  //       templateId: EmailJS.SIGNUP_TEMPLATE,
  //       currentUser: user.fullName,
  //       toEmail: user.email,
  //       message: `Please use the verification code below ${otp}`,
  //     };
  //     console.log('otp',otp)
  
  //     const emailResp = await this.userManagementService.sendEmail(emailObj);
  //     if (emailResp) {
  //       user.isOtpSent = true;
  //       user.otp = String(otp);
  //       user.otpGeneratedAt = new Date().toISOString();
  
  //       await this.userRepository.updateById(user.id, user);
  
  //       return { email: user.email, success: true };
  //     }
  //   } catch (error) {
  //     console.error('Error generating OTP:', error);
  //   }
  
  //   return { success: false };
  // }

  // @authenticate('jwt')
  // @post('/restaurants/verify-otp/{email}', {
  //   responses: {
  //     200: {
  //       description: '',
  //       content: {
  //         'application/json': {},
  //       },
  //     },
  //   },
  // })
  // async verifyOtp(
  //   @param.path.string('email') email: string,
  //   @requestBody() data: any,
  // ): Promise<object> {
  //   try {
  //     const user = await this.userRepository.findOne({ where: { email: email } });
  
  //     if (!user) {
  //       return { message: 'User not found', success: false };
  //     }
  
  //     const otpGeneratedAt = new Date(user.otpGeneratedAt);
  //     const currentTime = new Date();
  //     const timeDiff = Math.abs((currentTime.getTime() - otpGeneratedAt.getTime()) / 60000);
  
  //     if (timeDiff <= 5 && String(data.otp) === String(user.otp)) {
  //       user.isEmailVerified = true;
  //       delete user.otp;
  //       delete user.otpGeneratedAt;
  
  //       await this.userRepository.updateById(user.id, user);
  //       return { message: 'OTP Verified', email: email, success: true };
  //     }
  
  //     return { message: 'Invalid or expired OTP', success: false };
  //   } catch (error) {
  //     console.error('Error verifying OTP:', error);
  //     return { message: 'Internal server error', success: false };
  //   }
  // }
  
//   @authenticate('jwt')
// @post('/restaurants/verify-otp/{email}', {
//   responses: {
//     200: {
//       description: 'Verify user OTP',
//       content: {
//         'application/json': {},
//       },
//     },
//   },
// })
// async verifyOtp(
//   @param.path.string('email') email: string,
//   @requestBody() data: { otp: string },
// ): Promise<object> {
//   try {
//     const user = await this.userRepository.findOne({ where: { email } });

//     if (!user) {
//       console.warn(`[VERIFY OTP] User not found for email: ${email}`);
//       return { message: 'User not found', success: false };
//     }

//     console.log(`[VERIFY OTP] Stored OTP: ${user.otp}`);
//     console.log(`[VERIFY OTP] Received OTP: ${data.otp}`);

//     if (!user.otp || !user.otpGeneratedAt) {
//       console.warn(`[VERIFY OTP] OTP missing for user: ${email}`);
//       return { message: 'OTP not generated or expired', success: false };
//     }

//     const otpGeneratedAt = new Date(user.otpGeneratedAt);
//     const currentTime = new Date();
//     const timeDiffInMinutes = Math.abs((currentTime.getTime() - otpGeneratedAt.getTime()) / 60000);

//     console.log(`[VERIFY OTP] OTP age in minutes: ${timeDiffInMinutes}`);

//     if (timeDiffInMinutes <= 5 && String(data.otp) === String(user.otp)) {
//       user.isEmailVerified = true;
//       delete user.otp;
//       delete user.otpGeneratedAt;
//       user.isOtpSent = false;

//       await this.userRepository.updateById(user.id, user);

//       console.log(`[VERIFY OTP] OTP verified successfully for user: ${email}`);
//       return { message: 'OTP Verified', email, success: true };
//     }

//     console.warn(`[VERIFY OTP] Invalid or expired OTP for user: ${email}`);
//     return { message: 'Invalid or expired OTP', success: false };
//   } catch (error) {
//     console.error('[VERIFY OTP] Internal server error:', error);
//     return { message: 'Internal server error', success: false };
//   }
// }






@post('/restaurants/onboard', {
  responses: {
    '200': {
      description: 'User',
      content: {
        'application/json': {
          schema: { 'x-ts-type': OnBoarding },
        },
      },
    },
  },
})
@authenticate('jwt')
async createOnboard(@requestBody() newUserRequest: OnBoarding): Promise<object> {
  try {
    const userInfo: any = newUserRequest.user;
    const userWithPassword = new UserWithPassword();

    if (userInfo?.email && userInfo?.password) {
      userWithPassword.fullName = userInfo.fullName;
      userWithPassword.email = userInfo.email;
      userWithPassword.username = userInfo.email;
      userWithPassword.password = userInfo.password;
      userWithPassword.roles = ['admin'];
      userWithPassword.mobileNo = userInfo.mobileNo;

      const user = await this.userManagementService.createUser(userWithPassword);

      if (user) {
        const otp = Math.floor(100000 + Math.random() * 900000);
        console.log(`[ONBOARD] OTP: ${otp} for user: ${user.email}`);

        const emailObj = {
          templateId: EmailJSConst.Verify_OTP_Template,
          otp: otp,
          loginUrl: SERVER_URL + 'account/login',
          currentUser: userInfo.fullName,
          toEmail: userInfo.email,
        };

        const restaurantResponse = await this.restaurantRepository.create({
          restaurantName: newUserRequest.restaurant.restaurantName,
        });

        const restaurantId = restaurantResponse.id;
        user.restaurantId = restaurantId;

        await this.userRepository.updateById(user.id, {
          ...user,
          otp: String(otp),
          otpGeneratedAt: new Date().toISOString(),
          isOtpSent: true,
        });

        const emailResp = await this.userManagementService.sendEmail(emailObj);
        if (emailResp) {
          return {
            userId: user.id,
            restaurantId: restaurantId,
            success: true,
          };
        }
      }
    }
  } catch (error) {
    console.error('[ONBOARD] Error:', error);
  }

  return { success: false };
}




@authenticate('jwt')
@post('/restaurants/generate-otp', {
  responses: {
    200: {
      content: { 'application/json': {} },
      description: '',
    },
  },
})
async generateOtp(@requestBody() userInfo: { email: string }): Promise<object> {
  const user = await this.userRepository.findOne({ where: { email: userInfo.email } });

  if (!user) {
    return { message: 'User not found', success: false };
  }

  if (user.isOtpSent) {
    return { message: 'OTP already sent', success: false };
  }

  try {
    const otp = Math.floor(100000 + Math.random() * 900000);
    console.log(`[GENERATE OTP] OTP: ${otp} for user: ${user.email}`);

    const emailObj = {
      templateId: EmailJS.SIGNUP_TEMPLATE,
      currentUser: user.fullName,
      toEmail: user.email,
      message: `Please use the verification code below: ${otp}`,
    };

    const emailResp = await this.userManagementService.sendEmail(emailObj);
    if (emailResp) {
      await this.userRepository.updateById(user.id, {
        otp: String(otp),
        otpGeneratedAt: new Date().toISOString(),
        isOtpSent: true,
      });

      console.log(`[GENERATE OTP] OTP saved and sent to ${user.email}`);
      return { email: user.email, success: true };
    }
  } catch (error) {
    console.error('[GENERATE OTP] Error:', error);
  }

  return { success: false };
}





@authenticate('jwt')
@post('/restaurants/verify-otp/{email}', {
  responses: {
    200: {
      description: '',
      content: { 'application/json': {} },
    },
  },
})
async verifyOtp(@param.path.string('email') email: string, @requestBody() data: { otp: string }): Promise<object> {
  try {
    const user = await this.userRepository.findOne({ where: { email: email } });

    if (!user) {
      return { message: 'User not found', success: false };
    }

    console.log('[VERIFY OTP] Stored OTP:', user.otp);
    console.log('[VERIFY OTP] Received OTP:', data.otp);

    if (!user.otp) {
      console.warn(`[VERIFY OTP] OTP missing for user: ${email}`);
      return { message: 'Invalid or expired OTP', success: false };
    }

    const otpGeneratedAt = new Date(user.otpGeneratedAt);
    const currentTime = new Date();
    const timeDiff = Math.abs((currentTime.getTime() - otpGeneratedAt.getTime()) / 60000);

    if (timeDiff <= 5 && String(data.otp) === String(user.otp)) {
      await this.userRepository.updateById(user.id, {
        isEmailVerified: true,
        otp: undefined,
        otpGeneratedAt: undefined,
        isOtpSent: false,
      });

      return { message: 'OTP Verified', email: email, success: true };
    }

    return { message: 'Invalid or expired OTP', success: false };
  } catch (error) {
    console.error('[VERIFY OTP] Error:', error);
    return { message: 'Internal server error', success: false };
  }
}


  
}
