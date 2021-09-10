import { MS4Constants } from '../ms4Builder/constants'
import { transitionMethodName } from '../ms4Builder/naming'
import { relationship } from '../ObjectiveTree/types'
import { Java } from './constants'
import { methodAccess } from './types'

const ident = (s: string[], repeat: number) =>
    s.map((text) => '\t'.repeat(repeat) + text).join('\n')
const methodIdent = (methodName: string) => ident([methodName], 1)
const methodBodyIdent = (body: string, tab = 2) => ident(body.split('\n'), tab)

export const fileStart = (
    className: string,
    extendClass?: string
) => `package ${MS4Constants.packageName};

public class ${className}${extendClass ? ' extends ' + extendClass : ''} {
    ${
        extendClass
            ? `public ${className}() { 
        super();
    }`
            : ''
    }
\n`

export const adapterRunnerInterface = () =>
    methodIdent(`interface ${Java.RUNNER_ITF} { 
        Result run(Result res);
    }\n`)

export const writeProperty = (
    name: string,
    type: string,
    constructor: string,
    access: methodAccess = 'private'
) =>
    methodIdent(
        `${access} ${type} ${name} = new ${type}(${constructor || ''});\n`
    )

export const writeRunner = (
    tasksVar: string,
    method: string,
    functions: string[],
    relation: relationship,
    nextGoal: string
) =>
    methodIdent(
        `public ${Java.RESULT_CLASS} ${transitionMethodName(method)}() {\n
        ${Java.RUNNER_ITF}[] runners = new ${Java.RUNNER_ITF}[] { 
        ${functions
            .map(
                (fn, index) =>
                    `   new ${Java.RUNNER_ITF}() {public Result run(Result res) {return ${tasksVar}.${fn}(res);}}`
            )
            .reverse()
            .join(',\n\t\t')}
        };

        this.result = ${
            Java.RUNNER_METHOD
        }(runners, "${relation}", this.result);
        return this.result;
        //Goes to state: ${nextGoal || MS4Constants.outputState}
    }
\n`
    )

export const writeTaskRunner = () =>
    methodIdent(`private ${Java.RESULT_CLASS} ${Java.RUNNER_METHOD} (${Java.RUNNER_ITF}[] tasks, String relation, ${Java.RESULT_CLASS} result){ 
        ${Java.RESULT_CLASS} lastRes = result;
        for (${Java.RUNNER_ITF} run : tasks) { 
            lastRes = run.run(lastRes);

            if ((lastRes.isSuccess() && relation == "or") || (!lastRes.isSuccess() && relation == "and")) { 
                return lastRes;
            } 

            if ((lastRes.isSuccess() && relation == "and") || (!lastRes.isSuccess() && relation == "or")) { 
                continue;
            }
        }
        return lastRes;
    }`)
