/**
 * User
 *
 * @module      :: Model
 * @description :: The poppit_users table
 * 
 */

module.exports = {
    tableName: 'poppit_users',
    schema: true,
    primaryKey: 'id',

    attributes: {
        id:{
            type: 'number',
            required: true
        },
        first_name: {
            type: 'string',
            defaultsTo: ''
        },
        last_name: {
            type: 'string',
            defaultsTo: ''
        },
        email_address: {
            type: 'string',
            defaultsTo: ''
        },
        password_hash: {
            type: 'string',
            defaultsTo: ''
        },
        address: {
            type: 'string',
            defaultsTo: ''
        },
        city: {
            type: 'string',
            defaultsTo: ''
        },
        state: {
            type: 'string',
            defaultsTo: ''
        },
        zip: {
            type: 'string',
            defaultsTo: ''
        },
        updated_at:{
            type: 'datetime',
            required: true
        },
        created_at:{
            type: 'datetime',
            required: true
        }
    }
};