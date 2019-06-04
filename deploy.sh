set -e

# build docs
npm run typedoc

# navigate into the docs directory
cd docs

# add .nojekyll
touch .nojekyll

git init
git add -A
git commit -m 'deploy'

# if you are deploying to https://<USERNAME>.github.io/<REPO>
git push -f git@github.com:sopherapps/mtn-pay-js.git master:gh-pages

cd -