// import fs from fs;
import fs from 'fs'
import path from 'path'
import git from 'isomorphic-git'
import http from 'isomorphic-git/http/node'
import glob from 'glob'
import { nanoid } from 'nanoid'
import Analyzer from 'check-tests/src/analyzer'

const testFrameworks = [
  'qunit',
  'mocha',
  'jest',
  'cypress.io',
  'codeceptjs',
  'jasmine',
  'tap',
]

const testDirs = [
  'cypress',
  '__tests__',
  'test',
  'tests',
  'specs',
  'spec',
  'integration-tests',
  'e2e-tests',
  'unit-tests',
]

const testPattern = '**/*[._-]{test,spec,unittest,unit}.{ts,js}'

const tmpDir = path.join('/tmp')
const dir = path.join(tmpDir, `test-clone-${nanoid()}`)

export default async function handler(request, response) {
  const { body } = request
  response.setHeader('Access-Control-Allow-Origin', '*')

  if (!body.repo) return response.json({ error: 'Empty request' })
  const repo = body.repo

  await git.clone({
    fs,
    http,
    dir,
    url: `https://github.com/${repo}`,
    depth: 1,
    singleBranch: true,
    noTags: true,
  })
  // console.log(body);
  let data = {}

  data = await generateConfig(repo)

  if (body.config) {
    data.configs = [body.config]
  }

  if (!data.configs) return response.json({ error: 'Empty request' })

  data.tests = []
  delete data.error

  for (const conf of data.configs) {
    // not supported
    if (!['ts', 'js'].includes(conf.lang)) continue

    const testsPath = path.join(dir, conf.dir || '.')

    if (conf.framework === 'tap') conf.framework = 'jest'

    const analyzer = new Analyzer(conf.framework, testsPath)

    if (conf.lang === 'ts') {
      analyzer.withTypeScript()
    }

    if (conf.lang === 'js') {
      analyzer.addPlugin('@babel/plugin-syntax-jsx')
      analyzer.addPlugin('@babel/plugin-syntax-flow')
      analyzer.addPreset('@babel/preset-react')
      analyzer.addPreset('@babel/preset-flow')

      // analyzer.presets.push('@babel/preset-vue')
    }

    try {
      analyzer.analyze(conf.pattern || '')
    } catch (err) {
      console.log(err)
      data.error = err.message
      return response.json(data)
    }
    const tests = analyzer.rawTests.flat()
    tests.forEach((t) => {
      t.dir = conf.dir
    })
    data.tests = data.tests.concat(tests)
  }

  if (!data.tests.length) {
    console.log(repo, 'no tests detected ')
    data.error = 'No tests found'
    return response.json(data)
  }
  console.log(repo, `${data.tests.length} tests found`)

  response.json(data)
}

async function generateConfig(repo) {
  let framework = null

  const getDirectories = (source) =>
    fs
      .readdirSync(source, { withFileTypes: true })
      .filter((dirent) => dirent.isDirectory())
      .map((dirent) => dirent.name)

  const configs = []

  const detectFwk = (rootDir) => {
    let fwk = null
    let pattern = testPattern

    const pkg = JSON.parse(fs.readFileSync(path.join(rootDir, 'package.json')))
    const deps = [
      ...Object.keys(pkg.dependencies || {}),
      ...Object.keys(pkg.devDependencies || {}),
    ]
    fwk = testFrameworks.filter((value) => deps.includes(value))[0]

    if (!fwk && framework) fwk = framework
    if (!framework) framework = fwk
    if (!fwk && !framework) return

    const dirs = getDirectories(rootDir)
    let testDir = dirs.filter((d) => testDirs.includes(d))[0]

    // react
    if (!testDir && fs.existsSync(path.join(rootDir, 'src', '__tests__'))) {
      testDir = path.join('src', '__tests__')
    }
    // console.log(dirs);
    if (!testDir) return

    let hasTypeScript = false
    if (
      glob.sync(path.join(rootDir, testDir, '*/**.ts'), {
        ignore: 'node_modules/**',
      }).length
    ) {
      hasTypeScript = true
    }

    // no files found? Let's pick all js/ts files then!
    if (
      !glob.sync(path.join(rootDir, testDir, pattern), {
        ignore: 'node_modules/**',
      }).length
    ) {
      pattern = '**/*.{js,ts,cjs,mjs}'
    }

    // avoid duplicate
    if (
      configs.filter((c) => c.package === pkg.name && c.framework === fwk)
        .length
    )
      return

    configs.push({
      package: pkg.name,
      lang: hasTypeScript ? 'ts' : 'js',
      dir: path.join(rootDir, testDir).replace(dir + '/', ''),
      framework: fwk,
      pattern,
    })
  }

  // detectFwk(dir);

  const packages = glob.sync(path.join(dir, '**', 'package.json'), {
    ignore: 'node_modules/**',
  })
  for (const pkg of packages) {
    if (path.dirname(pkg).includes('ode_modules')) continue
    detectFwk(path.dirname(pkg))
  }

  const branch = await git.currentBranch({
    fs,
    dir,
    fullname: false,
  })

  return { repo, url: `https://github.com/${repo}`, branch, configs }
}
