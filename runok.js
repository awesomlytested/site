#!/usr/bin/env node
const fs = require('fs')
const path = require('path')
const {
  runok,
  tasks: { git, exec },
  chdir,
} = require('runok')
const Analyzer = require('check-tests/src/analyzer')
const glob = require('glob')

const testFrameworks = ['mocha', 'jest', 'cypress.io', 'codeceptjs', 'jasmine']

const testDirs = ['test', 'tests', 'specs', 'spec']

module.exports = {
  async buildRepositories() {
    // clone repo
    await git.clone('https://github.com/awesometested/list', 'list', {
      shallow: true,
    })
    // go through files
    const files = [] // get list of files

    for (const file of files) {
      process.cwd(path.join(__dirname, 'list'))
      try {
        const data = JSON.parse(fs.readFileSync(file))
        console.log('Processing', file)
        console.log('Repository:', data.repo)

        const repoPath = file + '_cloned'
        await git.clone(data.repo, repoPath, { shallow: true })

        this.analyzeFile(file, repoPath)
      } catch (err) {
        console.error(err)
      }
    }
  },

  async repoAdd(repo) {
    const dir = await ensureRepoDir(repo)

    const getDirectories = (source) =>
      fs
        .readdirSync(source, { withFileTypes: true })
        .filter((dirent) => dirent.isDirectory())
        .map((dirent) => dirent.name)

    const dirs = getDirectories(dir)

    let hasTypeScript = false

    const testDir = dirs.filter((d) => testDirs.includes(d))[0]

    if (!testDir) throw new Error('dir not detected')
    if (glob.sync(path.join(testDir, '**.ts')).length) {
      hasTypeScript = true
    }
    let fwk = null
    let branch = '11'

    await chdir(dir, async () => {
      const pkg = JSON.parse(fs.readFileSync('package.json'))
      const deps = [
        ...Object.keys(pkg.dependencies || {}),
        ...Object.keys(pkg.devDependencies || {}),
      ]
      fwk = testFrameworks.filter((value) => deps.includes(value))[0]
      if (!fwk) throw new Error('framework not detected')
      branch = (await exec('git branch --show-current')).data.stdout.trim()
    })

    fs.writeFileSync(
      repoFile(repo),
      JSON.stringify(
        {
          repo,
          url: `https://github.com/${repo}`,
          branch,
          configs: [
            {
              lang: hasTypeScript ? 'ts' : 'js',
              dir: testDir,
              framework: fwk,
              pattern: hasTypeScript
                ? '**/*{.,_}{test,spec}.ts'
                : '**/*{.,_}{test,spec}.js',
            },
          ],
        },
        null,
        4
      )
    )

    console.log(`${repo} analyzed and saved to ${repoFile(repo)}`)
  },

  async analyzeTests(repo) {
    const data = JSON.parse(fs.readFileSync(repoFile(repo)))

    if (!data.configs) throw new Error('Configs empty')

    const repoPath = await ensureRepoDir(repo)

    data.tests = []

    for (const conf of data.configs) {
      // not supported
      if (!['ts', 'js'].includes(conf.lang)) continue

      const testsPath = path.join(repoPath, conf.dir || '.')

      const analyzer = new Analyzer(conf.framework, testsPath)

      if (conf.lang === 'ts') {
        analyzer.withTypeScript()
      }

      if (conf.lang === 'js') {
        analyzer.addPlugin('@babel/plugin-syntax-jsx')
        analyzer.addPlugin('@babel/plugin-syntax-flow')
      }
      analyzer.analyze(conf.pattern || '')

      const tests = analyzer.rawTests.flat()
      tests.forEach((t) => {
        t.dir = conf.dir
      })
      data.tests = data.tests.concat(tests)
    }

    if (!data.tests.length) {
      console.log('no tests detected')
      return
    }

    fs.writeFileSync(repoFile(repo), JSON.stringify(data, null, 4))
  },
}

function repoFile(repo) {
  return path.join(
    __dirname,
    'static',
    'data',
    repo.replace('/', '__') + '.json'
  )
}

async function ensureRepoDir(repo) {
  const dir = 'tmp/' + repo.replace('/', '__')

  if (!fs.existsSync(dir)) {
    await exec(`git clone git@github.com:${repo}.git ${dir} --shallow`)
  } else {
    // await exec(`git pull --depth=1 --no-tags`, { cwd: dir });
  }
  return dir
}

if (require.main === module) runok(module.exports)
