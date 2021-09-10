import { writeFileSync } from 'fs'
import { MS4Constants } from '../ms4Builder/constants'
import { fileStart, writeProperty } from './helpers'
import { methodAccess } from './types'

export class Class {
    private className = ''
    private fileContent = ''
    /**
     *
     */
    constructor(className = '', extendsClass?: string) {
        this.className = className
        this.fileContent = fileStart(this.className, extendsClass)
    }

    protected writeMethodToClass = (access: methodAccess, name: string) => {
        this.fileContent += `\t${access} Result ${name} (Result result) { 

            return new Result();
        }
`
    }

    protected writeContent = (content: string) => {
        this.fileContent += content + '\n'
    }

    protected addProperty = (
        name: string,
        type: string,
        constructor: string,
        access: methodAccess = 'private'
    ) =>
        (this.fileContent +=
            writeProperty(name, type, constructor, access) + '\n')

    public getClassName = () => this.className

    public close = () => {
        this.fileContent += '}\n'
        writeFileSync(
            `output/${MS4Constants.packageName}/${this.className}.java`,
            this.fileContent.trim()
        )
    }

    print() {
        console.log(this.fileContent)
    }
}
