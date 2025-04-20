import {basicAuthorization} from '../../services';

export default class AuthACL {
  private config: any = {};
  constructor(config: any) {
    this.config = config;
  }

  setAuth() {
    const RESOURCE_NAME = this.config.resource_name;
    // const SCOPES = this.config.role_scope.scopes;
    // const ROLES = this.config.role_scope.scopes;

    return {
      count: {
        resource: `${RESOURCE_NAME}`,
        scopes: ['count'],
        // //allowedRoles: ['everyone'],
        voters: [basicAuthorization],
      },
      create: {
        resource: RESOURCE_NAME,
        scopes: ['create'],
        //allowedRoles: ['root', 'admin', 'sales'],
        voters: [basicAuthorization],
      },
      update: {
        resource: RESOURCE_NAME,
        scopes: ['update'],
        //allowedRoles: ['root', 'admin'],
        voters: [basicAuthorization],
      },
      delete: {
        resource: RESOURCE_NAME,
        scopes: ['delete'],
        //allowedRoles: ['root', 'admin', 'sales'],
        voters: [basicAuthorization],
      },
      'update-field': {
        resource: RESOURCE_NAME,
        scopes: ['update-field'],
        //allowedRoles: ['root', 'admin', 'sales'],
        voters: [basicAuthorization],
      },
      'bulk-update': {
        resource: RESOURCE_NAME,
        scopes: ['bulk-update'],
        //allowedRoles: ['root', 'admin', 'sales'],
        voters: [basicAuthorization],
      },
      'view-all': {
        resource: RESOURCE_NAME,
        scopes: ['view-all'],
        //allowedRoles: ['root', 'admin', 'sales'],
        voters: [basicAuthorization],
      },
      view: {
        resource: RESOURCE_NAME,
        scopes: ['view'],
        //allowedRoles: ['root', 'admin', 'sales'],
        voters: [basicAuthorization],
      },
    };
  }
}

// export interface ACL_CONFIG {
//   resource_name: string,
//   role_scope: {
//     scopes: [],
//     roles: []
//   }
// }
