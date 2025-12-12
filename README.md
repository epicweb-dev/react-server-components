<div>
  <h1 align="center"><a href="https://www.epicweb.dev/workshops">React Server Components and Functions</a></h1>
  <strong>
    Understand React Server Components and Server Functions by building a framework with them.
  </strong>
  <p>
    In this workshop we'll be building a framework built on React Server Components and Server Functions from scratch. No build tools. No TypeScript, no Vite, no JSX. Just the Browser, Node.js, and React. This is how you develop a <strong>deep</strong> understanding of something. Let's go!
  </p>
</div>

<hr />

<div align="center">
  <a
    alt="Epic Web logo with the words Deployed Version"
    href="https://server-components.epicreact.dev"
  >
    <img
      width="300px"
      src="https://github-production-user-asset-6210df.s3.amazonaws.com/1500684/254000390-447a3559-e7b9-4918-947a-1b326d239771.png"
    />
  </a>
</div>

<hr />

<!-- prettier-ignore-start -->
[![Build Status][build-badge]][build]
[![GPL 3.0 License][license-badge]][license]
[![Code of Conduct][coc-badge]][coc]
<!-- prettier-ignore-end -->

## Prerequisites

- Deep experience with React and features like Suspense and useDeferredValue
- Some experience with Node.js will be helpful

## Pre-workshop Resources

Here are some resources you can read before taking the workshop to get you up to
speed on some of the tools and concepts we'll be covering:

- [React Suspense Workshop](https://www.epicreact.dev/workshops/react-suspense)
- ["Mind The Gap" by Ryan Florence at Big Sky Dev Con 2024](https://www.youtube.com/watch?v=zqhE-CepH2g)
- [React for Two Computers - Dan Abramov at React Conf 2024](https://www.youtube.com/watch?v=wcj5LSVcxJc)
- [Introducing Zero-Bundle-Size React Server Components](https://react.dev/blog/2020/12/21/data-fetching-with-react-server-components)
- [React Server Components RFC](https://github.com/reactjs/rfcs/pull/188)
- ["React from Another Dimension" by Dan Abramov at Remix Conf 2023](https://www.youtube.com/watch?v=zMf_xeGPn6s)

## System Requirements

- [git][git] v2.18 or greater
- [NodeJS][node] v20 or greater
- [npm][npm] v8 or greater

All of these must be available in your `PATH`. To verify things are set up
properly, you can run this:

```shell
git --version
node --version
npm --version
```

If you have trouble with any of these, learn more about the PATH environment
variable and how to fix it here for [windows][win-path] or
[mac/linux][mac-path].

## Setup

Use the Epic Workshop CLI to get this setup:

```sh nonumber
npx epicshop@latest add react-server-components
```

If you experience errors here, please open [an issue][issue] with as many
details as you can offer.

## Starting the app

Once you have the setup finished, you can start the app with:

```
npm start
```

## The Workshop App

Learn all about the workshop app on the
[Epic Web Getting Started Guide](https://www.epicweb.dev/get-started).

[![Kent with the workshop app in the background](https://github-production-user-asset-6210df.s3.amazonaws.com/1500684/280407082-0e012138-e01d-45d5-abf2-86ffe5d03c69.png)](https://www.epicweb.dev/get-started)

## Credits

This workshop is heavily influenced by
[@sebmarkbage](https://github.com/sebmarkbage)'s work in
[this commit](https://github.com/facebook/react/commit/f181ba8aa6339d62f6e2572109c61242606f16b3).
Also, shout-out to [@gaearon](https://github.com/gaearon) and
[@rickhanlonii](https://github.com/rickhanlonii) for their help on this as well.

<!-- prettier-ignore-start -->
[npm]: https://www.npmjs.com/
[node]: https://nodejs.org
[git]: https://git-scm.com/
[build-badge]: https://img.shields.io/github/actions/workflow/status/epicweb-dev/react-server-components/validate.yml?branch=main&logo=github&style=flat-square
[build]: https://github.com/epicweb-dev/react-server-components/actions?query=workflow%3Avalidate
[license-badge]: https://img.shields.io/badge/license-GPL%203.0%20License-blue.svg?style=flat-square
[license]: https://github.com/epicweb-dev/react-server-components/blob/main/LICENSE
[coc-badge]: https://img.shields.io/badge/code%20of-conduct-ff69b4.svg?style=flat-square
[coc]: https://kentcdodds.com/conduct
[win-path]: https://www.howtogeek.com/118594/how-to-edit-your-system-path-for-easy-command-line-access/
[mac-path]: http://stackoverflow.com/a/24322978/971592
[issue]: https://github.com/epicweb-dev/react-server-components/issues/new
<!-- prettier-ignore-end -->
