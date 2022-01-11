const { Octokit } = require('@octokit/rest')

require('dotenv').config()

const gitUser = {
  name: 'AwesomlyTested Bot',
  email: 'awesomlytested@testomat.io',
}

export default async function handler(request, response) {
  const octokit = new Octokit({
    auth: process.env.GH_TOKEN,
  })

  const { body } = request

  if (!body.repo) {
    response.status(400)
    return response.json({ error: 'You do not have access' })
  }

  const config = Object.assign({}, body)
  delete config.tests
  delete config.error

  try {
    await octokit.rest.repos.createOrUpdateFileContents({
      owner: 'awesomlytested',
      repo: 'list',
      path: 'configs/' + getFileName(body.repo),
      message: `Added ${body.repo} config`,
      content: Buffer.from(JSON.stringify(config, null, 4), 'utf-8').toString(
        'base64'
      ),
      comitter: gitUser,
      author: gitUser,
    })

    await octokit.rest.repos.createOrUpdateFileContents({
      owner: 'awesomlytested',
      repo: 'list',
      path: 'output/' + getFileName(body.repo),
      message: `Added ${body.repo} output`,
      content: Buffer.from(JSON.stringify(body, null, 4), 'utf-8').toString(
        'base64'
      ),
      comitter: gitUser,
      author: gitUser,
    })
  } catch (err) {
    response.status(400)
    response.json({ error: err })
    throw err
  }

  return response.end()
}

function getFileName(repo) {
  return (repo.replace('/', '__').replace('.', '_') + '.json').toLowerCase()
}
