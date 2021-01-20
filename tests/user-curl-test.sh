# GET /user
# just show the headers since it's a whole page
curl -w "\n" -I http://localhost:7777/user

# GET /user (xhr)
curl -w "\n" -H "X-Requested-With: XMLHttpRequest" http://localhost:7777/user

# GET /user (xhr) with filtering
curl -w "\n" -X GET -H "X-Requested-With: XMLHttpRequest" "http://localhost:7777/user?limit=50&offset=40&where\[first_name\]=acme&order\[by\]=first_name&order\[direction\]=desc"

# GET /user (xhr) with filtering
curl -w "\n" -X GET -H "X-Requested-With: XMLHttpRequest" "http://localhost:7777/user?limit=10&offset=0&where\[first_name\]=brandon&order\[by\]=first_name&order\[direction\]=desc"

# GET /user (xhr): add an invalid column to filter on
curl -w "\n" -X GET -H "X-Requested-With: XMLHttpRequest" "http://localhost:7777/user?limit=10&offset=0&where\[first_name\]=acme&order\[by\]=name&order\[direction\]=desc&where\[foo\]=bar"

# GET /user/:id route for getting a user
curl -w "\n" -H "X-Requested-With: XMLHttpRequest" -H "Content-Type: application/json" http://localhost:7777/user/1

# DELETE /user/:id route for deleting a user
curl -w "\n" -H "X-Requested-With: XMLHttpRequest" -H "Content-Type: application/json" -X DELETE http://localhost:7777/user/1

# POST /user route for creating a user
curl -w "\n" -H "X-Requested-With: XMLHttpRequest" -H "Content-Type: application/json" -X POST http://localhost:7777/user --data "{ \"first_name\": \"Test\",\"last_name\": \"Smith\",\"email_address\":\"test555@gmail.com\",\"city\":\"Tucson\",\"state\":\"AZ\" }"

# PUT /user/:id route for editing a user
curl -w "\n" -H "X-Requested-With: XMLHttpRequest" -H "Content-Type: application/json" -X PUT http://localhost:7777/user/1 --data '{ "first_name": "Test","last_name": "Smith","email_address":"test555@gmail.com","city":"Tucson","state":"AZ" }'
