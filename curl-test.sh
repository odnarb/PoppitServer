#!/bin/bash

# GET /company
# just show the headers since it's a whole page
curl -w "\n" -I http://localhost:7777/company

# GET /company (xhr)
curl -w "\n" -H "X-Requested-With: XMLHttpRequest" http://localhost:7777/company

# GET /company/:id route for getting a company
curl -w "\n" -I http://localhost:7777/company/1

# PUT /company/:id route for editing a company
curl -w "\n" -X PUT http://localhost:7777/company/1 --data '{ test: 123 }'

# DELETE /company/:id route for deleting a company
curl -w "\n" -X PUT http://localhost:7777/company/1

# POST /company route for creating a company
curl -w "\n" -X POST http://localhost:7777/company --data '{ name: "Acme", description: "test Acme company" }'