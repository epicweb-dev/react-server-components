import { register } from 'node:module'
import { pathToFileURL } from 'node:url'

register('./server/rsc-loader.js', pathToFileURL('./'))
