import * as process from 'node:process'
import { resolve } from 'node:path'
import { readFileSync } from 'node:fs'
import { error } from '@actions/core'
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

  getReleasesFromEnv().forEach((value: object) => {
    const release = value as { version: string; sources: object[] }

    if (!current.includes(release.version)) {
      octokit
        .request('POST /repos/{owner}/{repo}/issues', {
          owner,
          repo,
          title: `build: bump PHP release to ${release.version}`,
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
    }
  })
}

main()
