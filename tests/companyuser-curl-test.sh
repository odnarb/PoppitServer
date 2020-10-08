# GET /companyuser
# just show the headers since it's a whole page
curl -w "\n" -I http://localhost:7777/companyuser

# GET /companyuser (xhr)
curl -w "\n" -H "X-Requested-With: XMLHttpRequest" http://localhost:7777/companyuser

# GET /companyuser (xhr) with filtering
curl -w "\n" -X GET -H "X-Requested-With: XMLHttpRequest" "http://localhost:7777/companyuser?limit=50&offset=40&where\[first_name\]=acme&order\[by\]=first_name&order\[direction\]=desc"

# GET /companyuser (xhr) with filtering
curl -w "\n" -X GET -H "X-Requested-With: XMLHttpRequest" "http://localhost:7777/companyuser?limit=10&offset=0&where\[first_name\]=brandon&order\[by\]=first_name&order\[direction\]=desc"

# GET /companyuser (xhr): add an invalid column to filter on
curl -w "\n" -X GET -H "X-Requested-With: XMLHttpRequest" "http://localhost:7777/companyuser?limit=10&offset=0&where\[first_name\]=acme&order\[by\]=name&order\[direction\]=desc&where\[foo\]=bar"

# GET /companyuser/:id route for getting a companyuser
curl -w "\n" -H "X-Requested-With: XMLHttpRequest" -H "Content-Type: application/json" http://localhost:7777/companyuser/1

# DELETE /companyuser/:id route for deleting a companyuser
curl -w "\n" -H "X-Requested-With: XMLHttpRequest" -H "Content-Type: application/json" -X DELETE http://localhost:7777/companyuser/1

# POST /companyuser route for creating a companyuser
curl -w "\n" -H "X-Requested-With: XMLHttpRequest" -H "Content-Type: application/json" -X POST http://localhost:7777/companyuser --data "{ \"first_name\": \"Test\",\"last_name\": \"Smith\",\"email_address\":\"test555@gmail.com\" }"

# PUT /companyuser/:id route for editing a companyuser
curl -w "\n" -H "X-Requested-With: XMLHttpRequest" -H "Content-Type: application/json" -X PUT http://localhost:7777/companyuser/1 --data '{ "first_name": "Test","last_name": "Smith","email_address":"test555@gmail.com" }'
