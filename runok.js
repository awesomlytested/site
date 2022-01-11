#!/usr/bin/env node
const fs = require('fs')
const path = require('path')
const axios = require('axios').default;
const {
  runok,
  tasks: { exec },
} = require('runok')
const glob = require('glob')

module.exports = {
 
  async badges() {
    const template = fs.readFileSync(path.join(__dirname,'static/badges/_template.svg')).toString();
    for (const file of glob.sync(path.join(__dirname, 'static/data/**.json'))) {
      const data = JSON.parse(fs.readFileSync(file));
      if (!data.repo) continue;
      const badgeName = data.repo.replace('/', '__').replace('.', '_');
      const badgeFile = badgeName + '.svg';
      const badgeFile2 = badgeName + '.secondary.svg'
      // const badgeFile3 = badgeName + '.third.svg'
      if (data.tests && data.tests.length) {
        fs.writeFileSync(path.join(__dirname,'static/badges', badgeFile), template.replace(/\{tests-count\}/g, data.tests.length));
        
        if (await shieldsIo(badgeFile2, data.tests.length)) {
          data.badge2 = badgeFile2;
        }
        // if (await shieldsIo(badgeFile3,data.tests.length, 'plastic')) {
        //   data.badge3 = badgeFile3;
        // }        
      } else {
        fs.copyFileSync(path.join(__dirname,'static/badges/_unknown.svg'), path.join(__dirname,'static/badges/', badgeFile))
        if (await shieldsIo(badgeFile2, null)) {
          data.badge2 = badgeFile2;
        }  
        // if (await shieldsIo(badgeFile3, data.tests.length, 'plastic')) {
        //   data.badge3 = badgeFile3;
        // }                      
      }
      console.log(`Created badge for`, data.repo);
            
      data.badge = badgeFile;
      fs.writeFileSync(file, JSON.stringify(data, null, 4))
    }
    console.log('Badges generated.');
  },

  async predeploy() {
    if (!fs.existsSync('tmp/list')) {
      await exec('git clone https://github.com/awesomlytested/list.git tmp/list --depth=1');
    } else {
      await exec('git pull');
    }
    await exec(`cp -r ${path.join(__dirname, 'tmp/list/output')} ${path.join(__dirname, 'static/data')}`);
    this.badges();
  }


}

async function shieldsIo(badgeFile, testsNum, style = 'for-the-badge') {
  try {
    const color = testsNum ? 'brightgreen' : 'gray';
    const response = await axios({
      method: "get",
      url: `https://img.shields.io/badge/Tests-${testsNum}-${color}?style=${style}`,
      responseType: "stream"
    });
    response.data.pipe(fs.createWriteStream(path.join(__dirname,'static/badges/', badgeFile)));
    return true;
  } catch (err) {
    console.log('error for secondary badge ', badgeFile);
    return false;
  }
}

if (require.main === module) runok(module.exports)
