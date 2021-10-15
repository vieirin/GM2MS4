#!/usr/bin/env -S node --experimental-modules --no-warnings

import arg from 'arg'
import marked from 'marked'
import TerminalRenderer from 'marked-terminal'
import { exit } from 'process'
import { generateGoalModelDNLs } from './ms4Builder/ms4Builder.js'
import { sanitizeComponent } from './ms4Builder/naming.js'
import { loadModel } from './ObjectiveTree/objectiveTree.js'

marked.setOptions({
    // Define custom renderer
    renderer: new TerminalRenderer()
})

const usage = () => {
    console.log(
        marked(`# gm2ms4

> gm2ms4 is a model converter from pistar-goda model to MS4 systems model

## SYNOPSIS

\`gm2ms4 [-o outputFile] inputModel\`

## DESCRIPTION

gm2ms4 is a conversor from pistar-goda model to MS4

_-o_, --outputfile overrides the output filename, the default is \`project.zip\`

_-h_, --help opens this manual

## EXAMPLES

\`gm2ms4 [-o ms4model] pistarmodel.txt\`

\`gm2ms4 goalmodel.txt\`
`)
    )
}
const args = arg({
    '--help': Boolean,
    '--output': String, // output file, defaults to project.zip
    '-h': '--help',
    '-o': '--outputfile'
})

if (args['--help']) {
    usage()
    exit(0)
}

if (args['_'].length != 1) {
    console.error('wrong number of arguments')
    usage()
    exit(1)
} else {
    const main = async () => {
        const validModel = loadModel(args['_'][0])

        try {
            const result = await generateGoalModelDNLs(
                validModel,
                sanitizeComponent(args['--output'] || 'project')
            )
            console.log(result)
            exit(0)
        } catch (e) {
            console.error(e)
        }
    }

    main()
}
