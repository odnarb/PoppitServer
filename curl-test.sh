#!/bin/bash

# GET /company
# just show the headers since it's a whole page
curl -w "\n" -I http://localhost:7777/company

# GET /company (xhr)
curl -w "\n" -H "X-Requested-With: XMLHttpRequest" http://localhost:7777/company

curl -w "\n" -H "X-Requested-With: XMLHttpRequest" http://localhost:7777/company --data-urlencode "limit=50&offset=40"

# GET /company/:id route for getting a company
curl curl -w "\n" -H "X-Requested-With: XMLHttpRequest" -H "Content-Type: application/json" http://localhost:7777/company/1

# PUT /company/:id route for editing a company
curl -w "\n" -H "X-Requested-With: XMLHttpRequest" -H "Content-Type: application/json" -X PUT http://localhost:7777/company/1 --data '{ "name": "Acme 123","description": "This is a test company","address":"123 Nowhere","city":"Tucson","state":"AZ","zip":"85737" }'

# DELETE /company/:id route for deleting a company
curl -w "\n" -H "X-Requested-With: XMLHttpRequest" -H "Content-Type: application/json" -X DELETE http://localhost:7777/company/1

# POST /company route for creating a company
curl -w "\n" -H "X-Requested-With: XMLHttpRequest" -H "Content-Type: application/json" -X POST http://localhost:7777/company --data "{ \"name\":\"Acme\",\"description\":\"this isn't just a test Acme company\",\"address\":\"321 Nowhere Dr.\",\"city\":\"Phoenix\",\"state\":\"AZ\",\"zip\":\"12345\"}"
