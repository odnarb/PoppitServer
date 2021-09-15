# GET /location
# just show the headers since it's a whole page
curl -w "\n" -I http://localhost:7777/location

# GET /location (xhr)
curl -w "\n" -H "X-Requested-With: XMLHttpRequest" http://localhost:7777/location

# GET /location (xhr) with filtering
curl -w "\n" -X GET -H "X-Requested-With: XMLHttpRequest" "http://localhost:7777/location?limit=50&offset=40&where[name]=acme&order[by]=name&order[direction]=desc"

# GET /location (xhr) with filtering
curl -w "\n" -X GET -H "X-Requested-With: XMLHttpRequest" "http://localhost:7777/location?limit=10&offset=0&where[name]=acme&order[by]=name&order[direction]=desc&where[zip]=85737&where[city]=tucson&where[state]=AZ&where[address]=123"

# GET /location (xhr): add an invalid column to filter on
curl -w "\n" -X GET -H "X-Requested-With: XMLHttpRequest" "http://localhost:7777/location?limit=10&offset=0&where[name]=acme&order[by]=name&order[direction]=desc&where[foo]=bar"

# GET /location/:id route for getting a location
curl -w "\n" -H "X-Requested-With: XMLHttpRequest" -H "Content-Type: application/json" http://localhost:7777/location/1

# DELETE /location/:id route for deleting a location
curl -w "\n" -H "X-Requested-With: XMLHttpRequest" -H "Content-Type: application/json" -X DELETE http://localhost:7777/location/1

# POST /location route for creating a location
curl -w "\n" -H "X-Requested-With: XMLHttpRequest" -H "Content-Type: application/json" -X POST http://localhost:7777/location --data "{ \"company_id\":1, \"name\":\"Acme\",\"description\":\"this isn't just a test Acme location\",\"address\":\"321 Nowhere Dr.\",\"city\":\"Phoenix\",\"state\":\"AZ\",\"zip\":\"12345\"}"

# PUT /location/:id route for editing a location
curl -w "\n" -H "X-Requested-With: XMLHttpRequest" -H "Content-Type: application/json" -X PUT http://localhost:7777/location/1 --data '{ "company_id":1, "name": "Acme 123","description": "This is a test location","address":"123 Nowhere","city":"Tucson","state":"AZ","zip":"85737" }'
