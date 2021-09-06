const latinChars = `ÀÁÂÃÄÅÆÇÈÉÊËÌÍÎÏÐ
ÑÒÓÔÕÖØÙÚÛÜ
ÝŔÞßàáâãäåæçèéêëìíîïðñòóôõöøùúûüýþÿŕ` as const

const nonLatinChars = `AAAAAAACEEEEIIIIDN
OOOOOOUUUUYRsBaaa
aaaaceeeeiiiionoooooouuuuybyr` as const

const sanitizeText = (text: string) =>
    text
        .split('')
        .map((c) =>
            latinChars.indexOf(c) > -1
                ? nonLatinChars.charAt(latinChars.indexOf(c))
                : c
        )
        .join('')

export const nameText = (text: string) =>
    sanitizeText(text).trim().replace(/ /g, '_')

export const nameInput = (stateName: string) => nameText(stateName) + '_input'

export const nameTaskMethod = (taskName: string) => nameText(taskName) + '_task'

export const transitionClassVarName = (component: string) =>
    nameText(component) + '_transition'

export const transitionMethodName = (state: string) =>
    nameText(state) + '_runner'

const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1)
const sanitizeComponent = (component: string) =>
    capitalize(component).replace(/ /g, '')

export const dnlFileName = (component: string) =>
    sanitizeComponent(component) + '.dnl'
