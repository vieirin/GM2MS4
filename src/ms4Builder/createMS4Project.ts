import { createWriteStream, readFileSync } from 'fs'
import JSZip from 'jszip'
import path from 'path'
import { buildProperties, classPath } from './projectConfigFiles/classPath.js'
import { Manifest } from './projectConfigFiles/manifest.js'
import { project } from './projectConfigFiles/project.js'

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

    const classesFolder = path.join(__dirname, '..', 'classAssets')
    const errorJava = readFileSync(path.join(classesFolder, 'ErrorSignal.java'))
    const resultJava = readFileSync(path.join(classesFolder, 'Result.java'))

    componentsDir?.file('ErrorSignal.java', errorJava)
    componentsDir?.file('Result.java', resultJava)
    return new Promise<string>((resolve) => {
        jzip.generateNodeStream({ type: 'nodebuffer', streamFiles: true })
            .pipe(
                createWriteStream(
                    path.join(process.cwd(), projectName + '.zip')
                )
            )
            .on('finish', function () {
                resolve(projectName + '.zip written.')
            })
    })
}
