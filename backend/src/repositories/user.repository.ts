import {Getter, inject} from '@loopback/core';
import {
  DefaultCrudRepository,
  HasOneRepositoryFactory,
  repository,
  Filter,
} from '@loopback/repository';
import {User, UserCredentials, UserRelations} from '../models';

import {UserCredentialsRepository} from './user-credentials.repository';
import {SecurityBindings, securityId, UserProfile} from '@loopback/security';
import { ObjectId } from 'mongodb';  // Import ObjectId from the mongodb package
import { RestaurantApplicationDataSource } from '../datasources';
// import { NotificationRepository } from './notification.repository';
// const { sendPushNotification } = require('../providers/firebase_admin');
export type Credentials = {
  username: string;
  password: string;
};

export class UserRepository extends DefaultCrudRepository<
  User,
  typeof User.prototype.id,
  UserRelations
> {
  public readonly userCredentials: HasOneRepositoryFactory<
    UserCredentials,
    typeof User.prototype.id
  >;

  constructor(
    @inject('datasources.restaurantApplication') dataSource: RestaurantApplicationDataSource,
    // @repository(NotificationRepository)
    // private notification: NotificationRepository,
    @repository.getter('UserCredentialsRepository')
    protected userCredentialsRepositoryGetter: Getter<UserCredentialsRepository>,
  ) {
    super(User, dataSource);
    this.userCredentials = this.createHasOneRepositoryFactoryFor(
      'userCredentials',
      userCredentialsRepositoryGetter,
    );
  }

  async findCredentials(
    userId: typeof User.prototype.id,
  ): Promise<UserCredentials | undefined> {
    try {
      return await this.userCredentials(userId).get();
    } catch (err: any) {
      if (err.code === 'ENTITY_NOT_FOUND') {
        return undefined;
      }
      throw err;
    }
  }

  async findUsers(): Promise<User[] | undefined> {
    try {
      return await this.find({
        fields: {id: true, username: true, firstName: true, lastName: true},
      });
    } catch (err: any) {
      if (err.code === 'ENTITY_NOT_FOUND') {
        return undefined;
      }
      throw err;
    }
  }
  // async getCompanyId(userId: string): Promise<string> {
   
  //   try {
  //     let user = await this.findById(userId);
  //     return user.companyId || user.id;
      
  //   } catch (err: any) {
  //     if (err.code === 'ENTITY_NOT_FOUND') {
  //       return '';
  //     }
  //     throw err;
  //   }
  
  // }

  async getCompanyId(userId: string): Promise<string> {
    try {
      let user = await this.findById(userId);
      return user.companyId ? user.companyId.toString() : user.id.toString();  // Ensure it's a string
    } catch (err: any) {
      if (err.code === 'ENTITY_NOT_FOUND') {
        return '';
      }
      throw err;
    }
  }
  
  
  

  async getRoles(userId: string): Promise<string[]> {
    try {
      let user = await this.findById(userId);
      return user.roles || [];
    } catch (err: any) {
      if (err.code === 'ENTITY_NOT_FOUND') {
        return [];
      }
      throw err;
    }
  }

  // async addCompanyFilter(
  //   filter: any,
  //   currentUserProfile: UserProfile,
  // ): Promise<any> {
  //   const userId = currentUserProfile[securityId];
  //   try {
  //     let companyId = await this.getCompanyId(userId);
  //     let roles = await this.getRoles(userId);

  //     console.log('Company ID:', companyId); // Debugging line
  //     console.log('User Roles:', roles); // Debugging line

  //     // Ensure filter is an object and filter['where'] is initialized
  //     if (typeof filter !== 'object' || filter === null) {
  //       filter = {};
  //     }
  //     if (!filter['where']) {
  //       filter['where'] = {};
  //     }

  //     if (roles.includes('admin')) {
  //       // If role includes admin, show data according to companyId
  //       filter['where']['companyId'] = companyId;
  //     } else {
  //       // If role does not include admin, show data according to userId
  //       filter['where']['userId'] = userId;
  //     }
  //   } catch (error) {
  //     console.error('Error in addCompanyFilter:', error);
  //   }
  //   return filter;
  // }
  // async addCompanyFilter(
  //   filter: any,
  //   currentUserProfile: UserProfile,
  // ): Promise<any> {
  //   const userId = currentUserProfile[securityId]; // Get the logged-in user's ID
  //   try {
  //     let companyId = await this.getCompanyId(userId); // Get the company ID of the logged-in user
  //     let roles = await this.getRoles(userId); // Get roles of the logged-in user
  
  //     console.log('Company ID:', companyId); // Debugging line
  //     console.log('User Roles:', roles); // Debugging line
  
  //     // Ensure filter is properly initialized
  //     if (typeof filter !== 'object' || filter === null) {
  //       filter = {};
  //     }
  //     if (!filter['where']) {
  //       filter['where'] = {};
  //     }
  
  //     if (roles.includes('admin')) {
  //       // If the user is an admin, filter by companyId only
  //       console.log('Admin Role detected. Filtering by companyId...');
  //       filter['where']['companyId'] = new ObjectId(companyId);  // Ensure to use ObjectId for MongoDB
  //     } else {
  //       // If the user is not an admin, filter by userId
  //       console.log('Non-Admin Role detected. Filtering by userId...');
  //       filter['where']['userId'] = userId;
  //     }
  //   } catch (error) {
  //     console.error('Error in addCompanyFilter:', error);
  //   }
  //   return filter;
  // }
  
  


async addCompanyFilter(filter: any, currentUserProfile: UserProfile): Promise<any> {
  const userId = currentUserProfile[securityId];  // Get the logged-in user's ID
  try {
    let companyId = await this.getCompanyId(userId);  // Get the company ID as string
    let roles = await this.getRoles(userId);  // Get roles of the logged-in user

    // Ensure filter is properly initialized
    if (typeof filter !== 'object' || filter === null) {
      filter = {};
    }
    if (!filter['where']) {
      filter['where'] = {};
    }

    if (roles.includes('admin')) {
      console.log('Admin Role detected. Filtering by companyId...');
      // Convert companyId to ObjectId for MongoDB compatibility
      filter['where']['companyId'] = new ObjectId(companyId);  // Convert to ObjectId
    } else {
      console.log('Non-Admin Role detected. Filtering by userId...');
      filter['where']['userId'] = userId;
    }
  } catch (error) {
    console.error('Error in addCompanyFilter:', error);
  }
  return filter;
}
  
  // Function to filter by company ID
  // async addCompanyFilter(filter: any, currentUserProfile: UserProfile): Promise<any> {
  //   const userId = currentUserProfile[securityId]; // Get the logged-in user's ID
  //   try {
  //     let companyId = await this.getCompanyId(userId);
  //     let roles = await this.getRoles(userId); // Get roles of the logged-in user
    
  //     if (typeof filter !== 'object' || filter === null) {
  //       filter = {};
  //     }
    
  //     if (!filter['where']) {
  //       filter['where'] = {};
  //     }
    
  //     // Add company filter only for admins
  //     if (roles.includes('admin')) {
  //       filter['where']['companyId'] = companyId;
  //     } else if (roles.includes('employee')) {
    
  //       filter['where']['userId'] = userId;
  //     } else {
  //       console.warn('User role is neither admin nor employee, applying no specific filter.');
  //     }
    
  //     console.log('Filter after adding company/user filter:', filter); // Log filter here
  //   } catch (error) {
  //     console.error('Error in addCompanyFilter:', error);
  //   }
  //   return filter;
  // }
  
  
  
  async addCompanyFilter2(
    filter: any,
    currentUserProfile: UserProfile,
  ): Promise<any> {
    const userId = currentUserProfile[securityId];
    try {
      let companyId = await this.getCompanyId(userId);
      let roles = await this.getRoles(userId);

      // Ensure filter is an object and filter['where'] is initialized
      if (typeof filter !== 'object' || filter === null) {
        filter = {};
      }
      if (!filter['where']) {
        filter['where'] = {};
      }

      // if (roles.includes('admin')) {
      //   // If role includes admin, show data according to companyId
      //   filter['where']['companyId'] = companyId;
      // } else {
      //   // If role does not include admin, show data according to userId
      //   filter['where']['userId'] = userId;
      // }
      filter['where']['companyId'] = companyId;
    } catch (error) {
      console.error('Error in addCompanyFilter:', error);
    }
    return filter;
  }

  // async getCompanyId(userId: string): Promise<string> {
  //   try {
  //     let user = await this.findById(userId);
  //     return user.companyId || user.id;
  //   } catch (err: any) {
  //     if (err.code === 'ENTITY_NOT_FOUND') {
  //       return '';
  //     }
  //     throw err;
  //   }
  // }

  // async getDesignation(userId: string): Promise<string> {
  //   try {
  //     let user = await this.findById(userId);
  //     return user.roles?.length ? user.roles[0] : '';
  //   } catch (err: any) {
  //     if (err.code === 'ENTITY_NOT_FOUND') {
  //       return '';
  //     }
  //     throw err;
  //   }
  // }

  // async addCompanyFilter(
  //   filter: any,
  //   currentUserProfile: UserProfile,
  // ): Promise<any> {
  //   const userId = currentUserProfile[securityId];
  //   try {
  //     let companyId = await this.getCompanyId(userId);
  //     let designation = await this.getDesignation(userId);
  //     if (designation == 'admin') {
  //       // If designation is admin, show data according to companyId
  //       if (!filter['where']) {
  //         filter['where'] = {
  //           companyId: companyId,
  //         };
  //       } else {
  //         if (filter['where']['and'] || filter['where']['or']) {
  //           if (!filter['where']['and']) {
  //             filter['where']['and'] = [];
  //           }
  //           filter['where']['and'].push({companyId: companyId});
  //         } else {
  //           filter['where']['companyId'] = companyId;
  //         }
  //       }
  //     } else {
  //       // If designation is not admin, show data according to userId
  //       if (!filter['where']) {
  //         filter['where'] = {
  //           userId: userId,
  //         };
  //       } else {
  //         if (filter['where']['and'] || filter['where']['or']) {
  //           if (!filter['where']['and']) {
  //             filter['where']['and'] = [];
  //           }
  //           filter['where']['and'].push({userId: userId});
  //         } else {
  //           filter['where']['userId'] = userId;
  //         }
  //       }
  //     }
  //   } catch (error) {}
  //   return filter;
  // }

  async addCompanyFilter1(
    filter: any,
    currentUserProfile: UserProfile,
  ): Promise<any> {
    const userId = currentUserProfile[securityId];
    try {
      let companyId = await this.getCompanyId(userId);
      let roles = await this.getRoles(userId);
      if (roles.includes('admin')) {
        if (!filter.where) {
          // If 'where' key doesn't exist, create it
          filter.where = {
            companyId: companyId,
          };
        } else if (filter.where.and || filter.where.or) {
          // If 'where' key exists and has 'and'/'or', push the new condition
          filter.where.and = filter.where.and || [];
          filter.where.and.push({companyId: companyId});
        } else {
          // If 'where' key exists, directly set companyId
          filter.where.companyId = companyId;
        }
      } else {
        // If user is admin, no need to add companyId filter
        // Alternatively, you might want to handle admin-specific logic here
      }
    } catch (error) {
      console.error('Error while adding company filter:', error);
    }
    return filter;
  }

  async getUserNameById(userId: string) {
    let userObject = await this.findById(userId);

    if (userObject !== null) {
      return userObject.firstName;
    } else {
      return '';
    }
  }

  // Data sorting by Descending Order (date & time)
  addSortFilter(filter: any) {
    if (!filter['order']) {
      filter['order'] = [];
      filter['order'].push('date DESC', 'time DESC');
    } else {
      filter['order'].push('date DESC', 'time DESC');
    }
    return filter;
  }

  // async sendPushToCompany(companyId: string, title: string, details: string, data:any = {}) {
  //   let tokens: string[] = [];
  //   let allEmployees = await this.find({where: {companyId: companyId}});
  //   if(allEmployees.length > 0){
  //     let userIds = allEmployees.map(a=>a.id);
  //     this.AddInAppNotification(title,details,userIds,companyId,data?.module);
  //   }
  //   for (let i = 0; i < allEmployees.length; i++) {
  //     let userTokens = allEmployees[i]?.pushTokens ?? [];
  //     if (userTokens && userTokens?.length) {        
  //       for (let ti = 0; ti < userTokens.length; ti++) {
  //         tokens.push(userTokens[ti])
  //       }
  //     }
  //   }
  //   if (tokens.length > 0) {
  //     sendPushNotification(tokens, title, details,JSON.stringify(data));
  //   }
  // }
  // async sendPushToCompany(companyId: string, title: string, details: string, data: any = {}) {
  //   let tokens: string[] = [];
  //   let allEmployees = await this.find({ where: { companyId: companyId } });
  
  //   if (allEmployees.length > 0) {
  //     let userIds = allEmployees.map(a => a.id);
  //     this.AddInAppNotification(title, details, userIds, companyId, data?.module);
  //   }
  
  //   for (let i = 0; i < allEmployees.length; i++) {
  //     let userTokens = allEmployees[i]?.pushTokens ?? [];
  //     if (userTokens?.length) {
  //       tokens.push(...userTokens);
  //     }
  //   }
  
  //   if (tokens.length > 0) {
  //     // Convert all data values to strings for Firebase compatibility
  //     const stringifiedData: Record<string, string> = {};
  //     for (const key in data) {
  //       stringifiedData[key] = String(data[key]);
  //     }
  
  //     sendPushNotification(tokens, title, details, stringifiedData);
  //   }
  // }
  // async sendPushToCompany(companyId: string, title: string, details: string, data: any = {}) {
  //   let tokens: string[] = [];
  
  //   console.log('🔄 Fetching employees for company:', companyId);
  //   let allEmployees = await this.find({ where: { companyId: companyId } });
  
  //   console.log(`👥 Found ${allEmployees.length} employees`);
  
  //   if (allEmployees.length > 0) {
  //     let userIds = allEmployees.map(a => a.id);
  //     console.log('📌 Sending in-app notifications to userIds:', userIds);
  //     this.AddInAppNotification(title, details, userIds, companyId, data?.module);
  //   }
  
  //   for (let employee of allEmployees) {
  //     let userTokens = employee?.pushTokens ?? [];
  //     if (userTokens?.length) {
  //       console.log(`📲 Found ${userTokens.length} token(s) for user ${employee.id}`);
  //       tokens.push(...userTokens);
  //     }
  //   }
  
  //   console.log('📦 Total tokens collected for push notification:', tokens.length);
  
  //   if (tokens.length > 0) {
  //     const stringifiedData: Record<string, string> = {};
  //     for (const key in data) {
  //       stringifiedData[key] = String(data[key]);
  //     }
  
  //     console.log('📨 Sending push notifications with data:', stringifiedData);
  //     sendPushNotification(tokens, title, details, stringifiedData);
  //   } else {
  //     console.warn('⚠️ No push tokens found, skipping FCM notification');
  //   }
  // }
  
  // async sendPush(userId: string, title: string, details: string, data:any = {}) {
  //   let tokens: string[] = [];
  //   let user = await this.findById(userId);
  //   this.AddInAppNotification(title,details,[userId],user.companyId,data?.module);
  //   tokens = user.pushTokens ?? [];
  //   if (tokens.length > 0) {
  //     sendPushNotification(tokens, title, details,JSON.stringify(data));
  //   }
  // }

  // async AddInAppNotification(
  //   title: string,
  //   description: string,
  //   users: string[],
  //   companyId:any,
  //   module: string = '',
  // ) {
  //   for (let i = 0; i < users.length; i++) {
  //     try {
  //       this.notification.create({
  //         date: new Date().toString(),
  //         title: title,
  //         description: description,
  //         module:module,
  //         userId: users[i],
  //         companyId:companyId,
  //         isRead:false
  //       });
  //     } catch (error) {}
  //   }
  // }
}