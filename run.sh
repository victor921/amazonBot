#!/bin/bash

echo "Checking for dependencies..."

if [[ -d "$/node_modules/" ]]
then
    echo "Modules found, skipping this part.."
else
    echo "Installing dependencies.."
    npm i
    npm i dotenv

fi

echo "Finished checking modules"
node index.js