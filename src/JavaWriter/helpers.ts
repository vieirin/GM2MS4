import { MS4Constants } from '../ms4Builder/constants'
import { transitionMethodName } from '../ms4Builder/naming'
import { func } from '../ObjectiveTree/treeNavigation'
import { relationship } from '../ObjectiveTree/types'
import { Java } from './constants'
import { methodAccess } from './types'

const ident = (s: string[], repeat: number) =>
    s.map((text) => '\t'.repeat(repeat) + text).join('\n')
const methodIdent = (methodName: string) => ident([methodName], 1)

export const fileStart = (
    className: string,
    extendClass?: string,
    superArg?: string[]
) => `package ${MS4Constants.packageName};

public class ${className}${extendClass ? ' extends ' + extendClass : ''} {
    ${
        extendClass
            ? `public ${className}() { 
        super(${superArg?.map((arg) => `"${arg}"`).join(',') || ''});
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

export const writeRunnerStructure = (
    functions: string[],
    relation: relationship,
    parentRelation: relationship,
    tasksVar?: string
) => `${Java.RUNNER_ITF}[] runners = new ${Java.RUNNER_ITF}[] { 
        ${functions
            .map(
                (fn) =>
                    `   new ${
                        Java.RUNNER_ITF
                    }() {public Result run(Result res) {return ${
                        tasksVar ? tasksVar + '.' : ''
                    }${fn}(res);}}`
            )
            .join(',\n\t\t')}
        };
        return tasksRunner(runners, "${relation}", "${
    parentRelation === 'none' ? relation : parentRelation
}", result);
`

export const writeRefinedTask = (
    method: string,
    childrenTasks: func[],
    relation: relationship,
    parentRelation: relationship,
    taskVar: string
) => `public ${Java.RESULT_CLASS} ${transitionMethodName(method)}(${
    Java.RESULT_CLASS
} result) {\n
        ${writeRunnerStructure(
            childrenTasks.map((task) =>
                task.refiner ? task.name : `${taskVar}.${task.name}`
            ),
            relation,
            parentRelation
        )}
    }`

export const writeRunner = (
    method: string,
    functions: string[],
    parentRelation: relationship,
    relation: relationship,
    nextGoal: string,
    tasksVar?: string
) =>
    methodIdent(
        `public ${Java.RESULT_CLASS} ${transitionMethodName(
            method
        )}(Result result) {

       ${
           parentRelation !== 'none'
               ? `result = ${Java.VERIFY_CONTINUATION_METHOD}(result, "${parentRelation}" , true);`
               : ''
       }
        if (result.locked()) { 
            return result;
        }
        
        ${
            functions?.length
                ? writeRunnerStructure(
                      functions,
                      relation,
                      parentRelation,
                      tasksVar
                  )
                : 'return result;'
        }
       
        //Goes to state: ${nextGoal || MS4Constants.outputState}
    }
\n`
    )

export const writeTaskRunner = () =>
    methodIdent(`private ${Java.RESULT_CLASS} ${Java.RUNNER_METHOD} (${Java.RUNNER_ITF}[] tasks, String relation,  String parentRelation,${Java.RESULT_CLASS} result){ 
        ${Java.RESULT_CLASS} lastRes = result;
        for (${Java.RUNNER_ITF} run : tasks) { 
            ${Java.RESULT_CLASS} res = run.run(lastRes);
            
            res = ${Java.VERIFY_CONTINUATION_METHOD}(res, relation, parentRelation == "and");
            
            lastRes.update(res);
            if (res.locked()) { 
                break;
            }
            
        }
        return lastRes;
    }`)

export const writeResultVerifier = () =>
    methodIdent(`private ${Java.RESULT_CLASS} ${Java.VERIFY_CONTINUATION_METHOD}(${Java.RESULT_CLASS} result, String relation, boolean canLock) { 
    if (((result.getError() == null && result.isSuccess())&& relation == "or") || ((result.getError() != null && !result.isSuccess())&& relation == "and")) { 
        if (canLock) { 
            result.lock();
        }
    }
    // before continuing to next functions  
    if (!result.locked()) { 
        result.resetError();
    }
    return result;
}
`)
