import { ADAPTER_RUNNER_METHOD_NAME } from './constants'
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
    () => `${methodIdent}interface ${ADAPTER_RUNNER_METHOD_NAME} { 
${methodBodyIdent}Result run(Result};
${methodIdent}}
\n`

export const writeProperty = (
    name: string,
    type: string,
    access: methodAccess = 'private'
) => `${methodIdent}${access} ${type} ${name};\n`
