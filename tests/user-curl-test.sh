# GET /appuser
# just show the headers since it's a whole page
curl -w "\n" -I http://localhost:7777/appuser

# GET /appuser (xhr)
curl -w "\n" -H "X-Requested-With: XMLHttpRequest" http://localhost:7777/appuser

# GET /appuser (xhr) with filtering
curl -w "\n" -X GET -H "X-Requested-With: XMLHttpRequest" "http://localhost:7777/appuser?limit=50&offset=40&where\[first_name\]=acme&order\[by\]=first_name&order\[direction\]=desc"

# GET /appuser (xhr) with filtering
curl -w "\n" -X GET -H "X-Requested-With: XMLHttpRequest" "http://localhost:7777/appuser?limit=10&offset=0&where\[first_name\]=brandon&order\[by\]=first_name&order\[direction\]=desc"

# GET /appuser (xhr): add an invalid column to filter on
curl -w "\n" -X GET -H "X-Requested-With: XMLHttpRequest" "http://localhost:7777/appuser?limit=10&offset=0&where\[first_name\]=acme&order\[by\]=name&order\[direction\]=desc&where\[foo\]=bar"

# GET /appuser/:id route for getting a appuser
curl -w "\n" -H "X-Requested-With: XMLHttpRequest" -H "Content-Type: application/json" http://localhost:7777/appuser/1

# DELETE /appuser/:id route for deleting a appuser
curl -w "\n" -H "X-Requested-With: XMLHttpRequest" -H "Content-Type: application/json" -X DELETE http://localhost:7777/appuser/1

# POST /appuser route for creating a appuser
curl -w "\n" -H "X-Requested-With: XMLHttpRequest" -H "Content-Type: application/json" -X POST http://localhost:7777/appuser --data "{ \"first_name\": \"Test\",\"last_name\": \"Smith\",\"email_address\":\"test555@gmail.com\",\"city\":\"Tucson\",\"state\":\"AZ\" }"

# PUT /appuser/:id route for editing a appuser
curl -w "\n" -H "X-Requested-With: XMLHttpRequest" -H "Content-Type: application/json" -X PUT http://localhost:7777/appuser/1 --data '{ "first_name": "Test","last_name": "Smith","email_address":"test555@gmail.com","city":"Tucson","state":"AZ" }'
