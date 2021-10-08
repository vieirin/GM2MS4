import JSZip from 'jszip'

type inputFiles = [string, string]

export const createMS4Project = (
    ses: inputFiles,
    dnl: inputFiles[],
    components: inputFiles
) => {
    const jzip = new JSZip()
}
