import { createWriteStream, readFileSync } from 'fs'
import JSZip from 'jszip'
import path from 'path'
import { buildProperties, classPath } from './projectConfigFiles/classPath'
import { Manifest } from './projectConfigFiles/manifest'
import { project } from './projectConfigFiles/project'

export type inputFiles = [string, string]

export const createMS4Project = (
    projectName: string,
    ses: inputFiles,
    dnl: inputFiles[],
    components: inputFiles[]
) => {
    const jzip = new JSZip()

    jzip.file('META-INF/MANIFEST.MF', Manifest(projectName))
    const src = jzip.folder('src')
    const componentsDir = src?.folder('components')
    components.forEach(([filename, content]) => {
        componentsDir?.file(filename, content)
    })

    const models = src?.folder('Models')
    models?.folder('java')
    models?.folder('pes')
    models?.folder('ses')?.file(ses[0], ses[1])

    const dnlDir = models?.folder('dnl')
    dnl.forEach(([filename, content]) => {
        dnlDir?.file(filename, content)
    })

    jzip.file('.classpath', classPath)
    jzip.file('.project', project(projectName))
    jzip.file('build.properties', buildProperties)

    const classesFolder = path.resolve('classAssets')
    const errorJava = readFileSync(path.join(classesFolder, 'ErrorSignal.java'))
    const resultJava = readFileSync(path.join(classesFolder, 'Result.java'))

    componentsDir?.file('ErrorSignal.java', errorJava)
    componentsDir?.file('Result.java', resultJava)
    jzip.generateNodeStream({ type: 'nodebuffer', streamFiles: true })
        .pipe(createWriteStream('output/project.zip'))
        .on('finish', function () {
            console.log('output/project.zip written.')
        })
}
