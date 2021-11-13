## _[Deployed - Amaze Scrape](https://amaze-scrape.herokuapp.com/)_

If you get "At Walmart: undefined" on products, that means walmart CAPTCHA checker caught our bot! need to wait some time and retry.

## THIS PROJECT IS FOR LEARNING PURPOSES ONLY!!!

# Puppeteer-heroku-buildpack

Install dependencies needed in order to run puppeteer on heroku. Be sure to include `{ args: ['--no-sandbox'] }` in your call to `puppeteer.launch`. 

Puppeteer defaults to `headless: true` in `puppeteer.launch` and this shouldn't be changed. Heroku doesn't have a GUI to show you chrome when running `headless: false` and Heroku will throw an error.

If you want to use puppeteer with firefox instead of chrome, use this buildpack instead: https://github.com/jontewks/heroku-buildpack-puppeteer-firefox

## Usage

To use the latest stable version run:

```sh-session
$ heroku buildpacks:add jontewks/puppeteer
```

Or use the source code in this repository:

```sh-session
$ heroku buildpacks:add https://github.com/jontewks/puppeteer-heroku-buildpack.git
```

A common issue that people run into often is a cache issue with heroku. Often when you start seeing errors that chrome won't start and some libraries are missing, you can resolve it by clearing your heroku cache.

```Instructions: ```

Clear The Build Cache
You can clear the build cache for an app by using the Heroku Builds plugin:

First install the plugin:

heroku plugins:install heroku-builds
Then use the following command to clear the cache:
```sh-session
heroku builds:cache:purge -a example-app
```
The cache will be rebuilt on the next deploy. If you do not have any new code to deploy, you can push an empty commit.
```sh-session
$ git commit --allow-empty -m "Purge cache"
$ git push heroku master
```
Where appname is replaced by the name of the app you want to clear the cache for.

## License

## [![License](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## Questions?

For any questions, please contact me with the information below:

---

## Contact me:  [<img src="https://image.flaticon.com/icons/png/512/726/726623.png" width="40" >](mailto:zoneam@gmail.com)  [<img src="https://image.flaticon.com/icons/png/512/270/270798.png" width="40" >](https://github.com/zoneam)
