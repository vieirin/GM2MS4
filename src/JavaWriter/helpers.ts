import { JavaConstants } from './constants'
import { methodAccess } from './types'

const ident = (repeat: number) => '\t'.repeat(repeat)
const methodIdent = ident(1)
const methodBodyIdent = ident(2)

export const fileStart = (
    className: string,
    extendClass?: string
) => `package Models.java

public class ${className}${extendClass ? ' extends ' + extendClass : ''} {
    ${
        extendClass
            ? `\tpublic ${className}() { 
            super();
        }`
            : ''
    }
\n`

export const adapterRunnerInterface =
    () => `${methodIdent}interface ${JavaConstants.ADAPTER_RUNNER_INTERFACE_NAME} { 
${methodBodyIdent}Result run(Result};
${methodIdent}}
\n`

export const writeProperty = (
    name: string,
    type: string,
    access: methodAccess = 'private'
) => `${methodIdent}${access} ${type} ${name};\n`

export const writeRunner = (
    method: string,
    functions: string[]
) => `${methodIdent}public ${method}() {
${methodBodyIdent}${
    JavaConstants.ADAPTER_RUNNER_INTERFACE_NAME
}[] runner = new ${JavaConstants.ADAPTER_RUNNER_INTERFACE_NAME}[] { 
    ${functions
        .map(
            (fn) =>
                `${ident(3)}new ${
                    JavaConstants.ADAPTER_RUNNER_INTERFACE_NAME
                }() {public Result run(Result) {return ${fn}}}`
        )
        .join('\n')}
${methodBodyIdent}}
${methodIdent}}`
