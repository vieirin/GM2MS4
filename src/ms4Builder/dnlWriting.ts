export const blockseparator = (block: string) => block + '\n'.repeat(2)

export const holdState = (state: string, nextstate?: string) =>
    blockseparator(
        [
            `hold in ${state} for time 5!`,
            `from ${state} go to ${nextstate || ''}!`
        ].join('\n')
    )

export const outputMessage = (state: string) =>
    blockseparator(`after ${state} output MESSAGE_OUTPUT`)

export const runTaskAndOutput = (state: string, taskName: string) =>
    blockseparator(
        `internal event for ${state}\n` + '<%\n' + `\tapiImpl.${taskName}`
    )
