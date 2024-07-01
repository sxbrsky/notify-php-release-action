import * as process from 'node:process'
import { resolve } from 'node:path'
import { readFileSync } from 'node:fs'
import { error, info } from '@actions/core'
import { getOctokit } from '@actions/github'

const getReleasesFromEnv = (): object[] => {
  if (!process.env.RELEASES) {
    throw new Error('Enviroment variable "RELEASES" was not set.')
  }

  return JSON.parse(process.env.RELEASES)
}

const getCurrentReleases = (localfile: string | null): string[] => {
  if (localfile) {
    return readFileSync(resolve(localfile)).toString().split(/\r?\n/)
  }

  return []
}

const main = async () => {
  const localfile = process.env.LOCALFILE || null
  const owner = process.env.OWNER || ''
  const repo = process.env.REPO || ''
  const repo_token = process.env.REPO_TOKEN || ''

  if (!repo_token || !repo || !owner) {
    error('Missing REPO_TOKEN')
    return
  }

  const octokit = getOctokit(repo_token)
  const current = getCurrentReleases(localfile)

  for (const value of getReleasesFromEnv()) {
    const release = value as { version: string; sources: object[] }

    if (!current.includes(release.version)) {
      const title = `build: bump PHP release to ${release.version}`

      const response = await octokit.request(
        'GET /search/issues?q=' +
          encodeURIComponent(`${title} in:title repo:${owner}/${repo}`),
      )

      if (response.data.total_count == 0) {
        octokit
          .request('POST /repos/{owner}/{repo}/issues', {
            owner,
            repo,
            title,
            body: 'bump PHP version to latest one.',
            headers: {
              'X-GitHub-Api-Version': '2022-11-28',
            },
          })
          .catch((err) => {
            if (err.response) {
              error(err)
            }
          })
      } else {
        /* eslint-disable */
        info(
          `Found similar issues: ${response.data.items.map((item: any) => item.html_url, '\n')}`,
        )
        /* eslint-enable */
      }
    }
  }
}

main()
