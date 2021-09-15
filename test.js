let BaseModel = require('./test-models.js');
let CompanyModel = require('./test-company.js');

global['Company'] = new BaseModel({opt1: "test"});

Company.prototype = "Company";

console.log( Company );

Company.find({ id: 123, name: "Brandon" }, () => {
    console.log("Done")
});
