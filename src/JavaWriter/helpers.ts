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
`
