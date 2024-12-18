class AuthManager {
    constructor({ utils }) {
        this.permissions = {
            [utils.roles.SUPER_ADMIN]: {
                school: ['create', 'update', 'delete', 'read'],
                classroom: ['create', 'update', 'delete', 'read'],
                student: ['create', 'update', 'delete', 'read'],
                user: ['createUser']
            },
            [utils.roles.SCHOOL_ADMIN]: {
                school: ['read'],
                classroom: ['create', 'update', 'delete', 'read'],
                student: ['create', 'update', 'delete', 'read']
            },
            [utils.roles.STUDENT]: {
                school: ['read'],
                classroom: ['read'],
                student: ['read']
            }
        };
    }

    isAuthorized({ userRole, action, resource }) {
        if (!userRole || !action || !resource) {
            return false;
        }

        const rolePermissions = this.permissions[userRole];
        if (!rolePermissions) {
            return false;
        }

        const resourcePermissions = rolePermissions[resource];
        return resourcePermissions?.includes(action);
    }
}

module.exports = AuthManager;