import { register } from 'node:module'
import { pathToFileURL } from 'node:url'
register('./loader/region.js', pathToFileURL('./'))
