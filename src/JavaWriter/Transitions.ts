import { capitalize } from '../ms4Builder/naming'
import { Class } from './Class'
import { adapterRunnerInterface } from './helpers'

export class Transitions extends Class {
    taskClassVarName: string

    /**
     *
     */
    constructor(component: string, tasksClassName: string) {
        super(`${capitalize(component)}TransitionsClass`, 'API')

        this.taskClassVarName = component + 'Runner'
        this.writeContent(adapterRunnerInterface())
        this.addProperty(this.taskClassVarName, tasksClassName)
        this.print()
    }
}
