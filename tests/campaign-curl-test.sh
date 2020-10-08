#!/bin/bash

# GET /campaign
# just show the headers since it's a whole page
curl -w "\n" -I http://localhost:7777/campaign

# GET /campaign (xhr)
curl -w "\n" -H "X-Requested-With: XMLHttpRequest" http://localhost:7777/campaign

# GET /campaign (xhr) with filtering
curl -w "\n" -X GET -H "X-Requested-With: XMLHttpRequest" "http://localhost:7777/campaign?limit=50&offset=40&where\[name\]=acme&order\[by\]=name&order\[direction\]=desc"

# GET /campaign (xhr) with filtering
curl -w "\n" -X GET -H "X-Requested-With: XMLHttpRequest" "http://localhost:7777/campaign?limit=10&offset=0&where\[name\]=acme&order\[by\]=name&order\[direction\]=desc"

# GET /campaign (xhr): add an invalid column to filter on
curl -w "\n" -X GET -H "X-Requested-With: XMLHttpRequest" "http://localhost:7777/campaign?limit=10&offset=0&where\[name\]=acme&order\[by\]=name&order\[direction\]=desc&where\[foo\]=bar"

# GET /campaign/:id route for getting a campaign
curl -w "\n" -H "X-Requested-With: XMLHttpRequest" -H "Content-Type: application/json" http://localhost:7777/campaign/1

# DELETE /campaign/:id route for deleting a campaign
curl -w "\n" -H "X-Requested-With: XMLHttpRequest" -H "Content-Type: application/json" -X DELETE http://localhost:7777/campaign/1

# POST /campaign route for creating a campaign
curl -w "\n" -H "X-Requested-With: XMLHttpRequest" -H "Content-Type: application/json" -X POST http://localhost:7777/campaign --data "{ \"company_id\":1,\"name\":\"Acme 123\",\"category\":\"entertainment\",\"description\":\"This is a test campaign\",\"game_id\":1,\"date_start\":\"10/8/2020 10:00:00\",\"date_end\":\"11/8/2020 10:00:00\",\"active\":1}"

# PUT /campaign/:id route for editing a campaign
curl -w "\n" -H "X-Requested-With: XMLHttpRequest" -H "Content-Type: application/json" -X PUT http://localhost:7777/campaign/1 --data "{ \"company_id\":1, \"name\": \"Acme 123\",\"category\":\"entertainment\",\"description\": \"This is a test campaign\",\"game_id\":1,\"date_start\":\"10/8/2020\",\"date_end\":\"11/8/2020\",\"active\":1 }"