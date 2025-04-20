import emailjs from '@emailjs/nodejs';
import { EmailJSConst, EmailJSLeave, EmailJSExitProcess } from './constant';
import { UserService } from '@loopback/authentication';
import { inject } from '@loopback/context';
import { repository } from '@loopback/repository';
import { HttpErrors } from '@loopback/rest';
import { securityId, UserProfile } from '@loopback/security';
import _ from 'lodash';
import { PasswordHasherBindings } from '../keys';
import { User, UserWithPassword } from '../models';
import { Credentials, UserCredentialsRepository, UserRepository } from '../repositories';
import { PasswordHasher } from './hash.password.bcryptjs';

export class UserManagementService implements UserService<User, Credentials> {
  constructor(
    @repository(UserRepository)
    public userRepository: UserRepository,
    @repository(UserCredentialsRepository)
    public userCredentialsRepository: UserCredentialsRepository,
    @inject(PasswordHasherBindings.PASSWORD_HASHER)
    public passwordHasher: PasswordHasher,
  ) {

  }

  async verifyCredentials(credentials: { username: string; password: string }): Promise<User> {
    try {
      console.log('🔍 Received credentials:', credentials);
      
      const { username, password } = credentials;
      const invalidCredentialsError = 'Invalid username or password.';
  
      if (!username) {
        console.error('⛔ Username is missing!');
        throw new HttpErrors.Unauthorized(invalidCredentialsError);
      }
  
      // Step 1: Find User
      const foundUser = await this.userRepository.findOne({ where: { username } });
      console.log('🔍 Found user:', foundUser);
  
      if (!foundUser) {
        console.error('⛔ User not found in database:', username);
        throw new HttpErrors.Unauthorized(invalidCredentialsError);
      }
  
      // Step 2: Find User Credentials (Password)
      const credentialsFound = await this.userRepository.findCredentials(foundUser.id);
      console.log('🔍 Found credentials:', credentialsFound);
  
      if (!credentialsFound) {
        console.error('⛔ No credentials found for user:', foundUser.id);
        throw new HttpErrors.Unauthorized(invalidCredentialsError);
      }
  
      // Step 3: Compare Password
      const passwordMatched = await this.passwordHasher.comparePassword(password, credentialsFound.password);
      console.log('🔍 Password match status:', passwordMatched);
  
      if (!passwordMatched) {
        console.error('⛔ Password does not match for user:', username);
        throw new HttpErrors.Unauthorized(invalidCredentialsError);
      }
  
      console.log('✅ User verified successfully:', foundUser);
      return foundUser;
  
    } catch (error) {
      console.error('⛔ Error in verifyCredentials:', error);
      throw new HttpErrors.Unauthorized('Login failed');
    }
  }
  
  // async verifyCredentials(credentials: { username: string; password: string }): Promise<User> {
  //   try {
  //     const { username, password } = credentials;
  //     const invalidCredentialsError = 'Invalid username or password.';

  //     if (!username) {
  //       console.error('Username is missing!');
  //       throw new HttpErrors.Unauthorized(invalidCredentialsError);
  //     }
  
  //     // Step 1: Find User
  //     const foundUser = await this.userRepository.findOne({
  //       where: { username },
  //     });
  
  //     if (!foundUser) {
  //       console.error('User not found in database:', username);
  //       throw new HttpErrors.Unauthorized(invalidCredentialsError);
  //     }
  
  //     // Step 2: Find User Credentials (Password)
  //     const credentialsFound = await this.userRepository.findCredentials(foundUser.id);

  //     if (!credentialsFound) {
  //       console.error('No credentials found for user:', foundUser.id);
  //       throw new HttpErrors.Unauthorized(invalidCredentialsError);
  //     }
  
  //     // Step 3: Compare Password 
  //     const passwordMatched = await this.passwordHasher.comparePassword(password, credentialsFound.password);
  
  //     if (!passwordMatched) {
  //       console.error('Password does not match for user:', username);
  //       throw new HttpErrors.Unauthorized(invalidCredentialsError);
  //     }
  
  //     return foundUser;
  //   } catch (error) {
  //     console.error('Error in verifyCredentials:', error);
  //     throw new HttpErrors.Unauthorized('Login failed');
  //   }
  // }
  

  // async verifyCredentials(credentials: Credentials): Promise<User> {
  //   const {username, password} = credentials;
  //   const invalidCredentialsError = 'Invalid username or password.';

  //   if (!username) {
  //     throw new HttpErrors.Unauthorized(invalidCredentialsError);
  //   }
  //   const foundUser = await this.userRepository.findOne({
  //     where: {username},
  //   });
  //   if (!foundUser) {
  //     throw new HttpErrors.Unauthorized(invalidCredentialsError);
  //   }

  //   const credentialsFound = await this.userRepository.findCredentials(
  //     foundUser.id,
  //   );
  //   if (!credentialsFound) {
  //     throw new HttpErrors.Unauthorized(invalidCredentialsError);
  //   }

  //   const passwordMatched = await this.passwordHasher.comparePassword(
  //     password,
  //     credentialsFound.password,
  //   );

  //   if (!passwordMatched) {
  //     throw new HttpErrors.Unauthorized(invalidCredentialsError);
  //   }

  //   return foundUser;
  // }


convertToUserProfile(user: User): UserProfile {
    // since first name and lastName are optional, no error is thrown if not provided
    let userName = '';
    if (user.fullName) userName = `${user.fullName}`;
    // if (user.lastName)
    //   userName = user.fullName
    //     ? `${userName} ${user.lastName}`
    //     : `${user.lastName}`;
    return {
      [securityId]: user.id,
      name: userName,
      id: user.id,
      roles: user.roles,
      email: user.email,
      mobileNo: user.mobileNo
    };
  }

  async updateUser(userId: string, data: object) {
    const updateUser = await this.userCredentialsRepository.updateById(userId, data);
    return updateUser;
  }

  async createUser(userWithPassword: UserWithPassword): Promise<User> {
    const password = await this.passwordHasher.hashPassword(
      userWithPassword.password,
    );
    userWithPassword.password = password;
    const user = await this.userRepository.create(
      _.omit(userWithPassword, 'password'),
    );
    user.id = user.id.toString();
    await this.userRepository.userCredentials(user.id).create({password});
    return user;
  }

  SendRegistrationEmail(email: string, username: string, password: string) {
    const nodemailer = require('nodemailer');

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: 'sherpakr500@gmail.com',
        pass: 'P@ssword1@3',
      },
    });

    const mailOptions = {
      from: 'sherpakr500@gmail.com',
      to: email,
      subject: 'Sherpa Registration',
      text: '\n Username :' + username + '\n Password :' + password,
    };

    transporter.sendMail(
      mailOptions,
      function (error: any, info: { response: string }) {
        if (error) {

        } else {

        }
      },
    );
  }

  public async sendEmail(emailObj: any) {
    emailjs.send(EmailJSConst.SERVICE_ID, emailObj.templateId, emailObj, {
      publicKey: EmailJSConst.PUBLIC_KEY,
      privateKey: EmailJSConst.PRIVATE_KEY,
    })
      .then((response) => { return true },
        (err) => {
          return false
        },
      );
    return true;
  }

  public async sendLeave(emailObj1: any) {
    emailjs.send(EmailJSLeave.SERVICE_ID, emailObj1.templateId, emailObj1, {
      publicKey: EmailJSLeave.PUBLIC_KEY,
      privateKey: EmailJSLeave.PRIVATE_KEY,
    })
      .then((response) => { return true },
        (err) => {
          return false
        },
      );
    return true;
  }

  public async sendExitProcess(emailObj2: any) {
    emailjs.send(EmailJSExitProcess.SERVICE_ID, emailObj2.templateId, emailObj2, {
      publicKey: EmailJSExitProcess.PUBLIC_KEY,
      privateKey: EmailJSExitProcess.PRIVATE_KEY,
    })
      .then((response) => { return true },
        (err) => {
          return false
        },
      );
    return true;
  }

  async encryptPassword(password: string) {
    const newpassword = await this.passwordHasher.hashPassword(
      password,
    );
    return newpassword
  }
  
  async updatePassword(userId: string, newpassword: string)
  {
    const password = await this.passwordHasher.hashPassword(
      newpassword,
    );
   
    const userCredential: any= await this.userCredentialsRepository.findOne({where: {userId: userId }})
    
    userCredential.password = password;
    const updateUserCred = await this.userCredentialsRepository.update(userCredential);
    
    return updateUserCred;
  }

  async verifyPassword(userId: any, oldPassword: string) {
    console.log("Verifying password for User ID",userId);
    const userCredential: any = await this.userCredentialsRepository.findOne({
      where: {userId: userId},
    });
    console.log(" Retrieved user credentials",userId);
    const passwordMatched = await this.passwordHasher.comparePassword(
      oldPassword,
      userCredential.password,
    );
    return passwordMatched;
  }
  
}