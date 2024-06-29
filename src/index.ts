import * as process from 'node:process'
import { resolve } from 'node:path'
import { readFileSync } from 'node:fs'
import { getInput } from '@actions/core'
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
  const localfile = getInput('localfile') || null
  const owner = getInput('owner')
  const repo = getInput('repo')
  const token = getInput('token')

  const octokit = getOctokit(token)
  const current = getCurrentReleases(localfile)

  getReleasesFromEnv().forEach((release: any) => {
    if (!current.includes(release.version)) {
      octokit.rest.issues.create({
        owner,
        repo,
        title: `build: bump PHP release to ${release.version}`,
      })
    }
  })
}

main()
