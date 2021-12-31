#!/usr/bin/env node
const fs = require('fs')
const path = require('path')
const {
  runok,
} = require('runok')
const glob = require('glob')

module.exports = {
 
  badges() {
    const template = fs.readFileSync(path.join(__dirname,'static/badges/_template.svg')).toString();
    for (const file of glob.sync(path.join(__dirname, 'static/data/**.json'))) {
      const data = JSON.parse(fs.readFileSync(file));
      if (!data.repo) continue;
      const badgeFile = data.repo.replace('/', '__').replace('.', '_') + '.svg';
      if (data.tests && data.tests.length) {
        fs.writeFileSync(path.join(__dirname,'static/badges', badgeFile), template.replace(/\{tests-count\}/g, data.tests.length));
        console.log('Created badge for ', data.repo);
      } else {
        fs.copyFileSync(path.join(__dirname,'static/badges/_unknown.svg'), path.join(__dirname,'static/badges/', badgeFile))
      }
      data.badge = badgeFile;
      fs.writeFileSync(file, JSON.stringify(data, null, 4))
    }
  },

  list() {

  },

  predeploy() {
    
  }



}

if (require.main === module) runok(module.exports)
