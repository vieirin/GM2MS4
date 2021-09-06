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
\t`

export const adapterRunnerInterface = () => `interface TaskRunner  { 
    Result run(Result};
}
\t`
