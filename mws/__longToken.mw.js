const { roles } = require("../libs/utils");

module.exports = ({ meta, config, managers }) =>{
    const permissions = {
        [roles.SUPER_ADMIN]: {
            school: ['create', 'update', 'delete', 'getAll', 'getByID'],
            classroom: ['create', 'update', 'delete', 'getAll', 'getByID'],
            student: ['create', 'update', 'delete', 'getAll', 'getByID'],
            user: ['createUser']
        },
        [roles.SCHOOL_ADMIN]: {
            school: ['getByID'],
            classroom: ['create', 'update', 'delete', 'getAll', 'getByID'],
            student: ['create', 'update', 'delete', 'getAll', 'getByID']
        },
        [roles.STUDENT]: {
            school: ['getByID'],
            classroom: ['getByID'],
            student: ['getByID']
        }
    };

    return ({req, res, next})=>{
        if(!req.headers.token){
            console.log('token required but not found')
            return managers.responseDispatcher.dispatch(res, {ok: false, code:401, errors: 'unauthorized'});
        }
        let decoded = null;
        try {
            decoded = managers.token.verifyLongToken({token: req.headers.token});
            if(!decoded){
                console.log('failed to decode-1')
                return managers.responseDispatcher.dispatch(res, {ok: false, code:401, errors: 'unauthorized'});
            };
        } catch(err){
            console.log('failed to decode-2')
            return managers.responseDispatcher.dispatch(res, {ok: false, code:401, errors: 'unauthorized'});
        }

        const { role } = decoded;
        const action = req.params.fnName;
        const resource = req.params.moduleName;
        
        const rolePermissions = permissions[role];
        if (!rolePermissions) {
            console.log('failed to get permissions')
            return managers.responseDispatcher.dispatch(res, {ok: false, code:401, errors: `unauthorized to get permissions for ${role}`});
        }

        const resourcePermissions = rolePermissions[resource];
        if (!resourcePermissions?.includes(action)) {
            console.log('failed to access to the resource')
            return managers.responseDispatcher.dispatch(res, {ok: false, code:401, errors: `unauthorized to access ${resource}:${action} from ${role}`});
        }

        next(decoded);
    }
}