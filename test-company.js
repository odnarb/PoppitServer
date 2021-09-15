module.exports = {
    table: "poppit_companies",

    identity_column: "id",

    attributes: {
        name: {
            type: "varchar",
            length: 80
        },
        description: {
            type: "varchar",
            length: 80
        },
        address: {
            type: "varchar",
            length: 80
        },
        city: {
            type: "varchar",
            length: 80
        },
        state: {
            type: "varchar",
            length: 80
        },
        zip: {
            type: "varchar",
            length: 80
        },
        created_at: {
            type: "datetime"
        },
        upated_at: {
            type: "datetime"
        }
    }
};