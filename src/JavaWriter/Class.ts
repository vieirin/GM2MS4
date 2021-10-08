import { inputFiles } from '../ms4Builder/createMS4Project'
import { component } from '../ObjectiveTree/types'
import { fileStart, writeProperty } from './helpers'
import { methodAccess } from './types'

export class Class {
    private className = ''
    private fileContent = ''
    /**
     *
     */
    constructor(className = '', extendsClass?: string, component?: component) {
        this.className = className
        this.fileContent = fileStart(
            this.className,
            extendsClass,
            component ? [component] : undefined
        )
    }

    protected writeMethodToClass = (access: methodAccess, name: string) => {
        this.fileContent += `\t${access} Result ${name} (Result result) { 

            return result;
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

    public close = (): inputFiles => {
        this.fileContent += '}\n'
        return [`${this.className}.java`, this.fileContent.trim()]
    }

    print() {
        console.log(this.fileContent)
    }
}
