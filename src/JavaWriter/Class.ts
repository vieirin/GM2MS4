import { fileStart } from './helpers'
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

    protected writeMethodToClass(access: methodAccess, name: string) {
        this.fileContent += `\t${access} Result ${name} (Result result) { 

            return new Result();
        }
`
    }

    public getClassName = () => this.className

    print() {
        console.log(this.fileContent)
    }
}
