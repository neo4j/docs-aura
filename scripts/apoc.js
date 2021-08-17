const fs = require('fs')
const path = require('path')

require('dotenv').config();

const neo4j = require('neo4j-driver')

const { NEO4J_HOST,
    NEO4J_USERNAME,
    NEO4J_PASSWORD,
    AURA_VERSION,
} = process.env

const header = `[.procedures, opts=header, cols='5a,1a', separator=¦]
|===
¦ Qualified Name ¦ Type`

const footer = `
|===`

const driver = new neo4j.driver(NEO4J_HOST, neo4j.auth.basic(NEO4J_USERNAME, NEO4J_PASSWORD))


const session = driver.session()

session.run(`call apoc.help('')`)
    .then(res => res.records.map(row => {
        const name = row.get('name')
        const type = row.get('type')
        const text = row.get('text')

        const namespace = name.split('.').slice(0, 2).join('.')

        // TODO: Some descriptions don't have a dash or a pipe
        const description = text.includes(' - ') ? text.split(' - ')[1] : text.split(' | ')[1]

        return {
            name,
            type,
            text,
            namespace,
            description,
        }
    }))
    .then(procedures => procedures.reduce((acc, current) => {
        if ( !acc[current.namespace] ) {
            acc[current.namespace] = []
        }

        acc[current.namespace].push(current)

        return acc
    }, {}))
    .then(namespaces =>  Object.entries(namespaces).map(([namespace, procedures]) => `
=== ${namespace}

${header}

${procedures.map(({ name, description, type }) => `
¦ link:https://neo4j.com/labs/apoc/${AURA_VERSION}/overview/${namespace}/${name}[${name} icon:book[] ^] +
${description || ''}
¦ label:${type}[]`).join('\n\n')}

${footer}
`).join('\n\n'))
    .then(adoc => {
        const dir = path.join(__dirname, '..', 'modules', 'root', 'partials', 'apoc-procedures.adoc')

        fs.writeFileSync(dir, adoc)
    })
    .then(() => driver.close())
