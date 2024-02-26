#! /bin/sh

# git remote add upstream https://github.com/PanJiaChen/vue-element-admin.git

git fetch upstream
git checkout merge_upstream
git merge upstream/master
git push
