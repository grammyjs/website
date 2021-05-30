#!/bin/bash

cd grammydocsbot
npm install
cd -

git push heroku `git subtree split --prefix grammydocsbot/ main`:main --force
