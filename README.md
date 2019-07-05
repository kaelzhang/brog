# ![brog](assets/brog.png)

[![Build Status](https://travis-ci.org/kaelzhang/brog.svg?branch=master)](https://travis-ci.org/kaelzhang/brog)
[![Coverage](https://codecov.io/gh/kaelzhang/brog/branch/master/graph/badge.svg)](https://codecov.io/gh/kaelzhang/brog)

# brog

A tool for managing multiple related JavaScript projects, the better replacement of lerna

## What can `brog` do?

With the help of `brog`, we need not to put multiple npm packages into a [monorepo](https://en.wikipedia.org/wiki/Monorepo), such as [`babel`](https://github.com/babel/babel).

`brog` could coordinate multiple arbitrary already-existed standalone but related npm packages.

Generally, if you want to do something as lerna does, and you don't want a monorepo, or can't put everything inside a monorepo (because the npm packages already exist), `brog` will be a good choice.

## Usage

```sh
# Install brog
npm i -g brog

# Create a workstation
brog create foo

cd /path/to/project-1
# Add the current directory to workstation foo,
brog add . foo
#  or you can use `npmw add /path/to/project-1 foo`

brog add /path/to/project-2 foo

# Then make changes to project-1 and project-2,
# inside /path/to/project-2
brog publish
```

A vscode extension is also available to help it much easier to add repos into a single workstation.

## Commands

## Documentations

- Frequently asked questions

## License

[MIT](LICENSE)
