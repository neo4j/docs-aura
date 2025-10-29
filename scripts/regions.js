// Read a json file containing Aura region information and output an asciidoc table.
    
const fs = require('fs')
const https = require('https')
const path = require('path')
const Vinyl = require('vinyl');

module.exports.register = function ({ config }) {

    const {defaultLogLevel = 'info' } = config

    const logger = this.getLogger('aura-regions', defaultLogLevel)

    /* ****************** */
    //
    // define properties of the file to add to contentCatalog
    // can we make any of this smarter? aura is the only component here
    // filename (and other vars) could be a var that can be defined, and the extension added to the playbook
    //
    const componentName = 'aura';
    const componentVersion = ''; // Must match a component Antora collected
    const moduleName = 'ROOT';
    const family = 'partial';
    const filename = 'scp-regions-generated.adoc';
    //
    /* ****************** */

    this.on('contentClassified', async ({ contentCatalog }) => {
    
        /* ****************** */
        //
        // for prod we want to fetch a remote file from a URL
        //
        // const regionsJSONUrl = 'https://raw.githubusercontent.com/neo4j/aura-regions/main/regions.json'
    
        // const regionsJSON = await new Promise((resolve, reject) => {
        // const buffer = []
        // https
        //     .get(regionsJSONUrl, (response) => {
        //     response.on('data', (chunk) => buffer.push(chunk.toString()))
        //     response.on('end', () => resolve(buffer.join('').trim()))
        //     })
        //     .on('error', reject)
        // })

        // const regionsData = JSON.parse(regionsJSON)
        //
        /* ****************** */


        /* ****************** */
        //
        // test by using a local file
        //
        const regionsData = require('./regions.json')
        //
        /* ****************** */

        // call the function to process the json into asciidoc
        const regionsAsciidoc = regionsDataToAsciidoc(regionsData)

        const file = new Vinyl({
            contents: Buffer.from(regionsAsciidoc),
            path: filename,
            stat: {},
        });

        file.src = {
            component: componentName,
            version: componentVersion,
            module: moduleName,
            family: family,
            relative: filename,
            origin: null,
            basename: filename,
            extname: '.adoc',
        };

        file.out = {
            path: `${componentName}/${componentVersion}/${moduleName}/${filename.replace('.adoc', '.html')}`,
            url: `${componentName}/${componentVersion}/${moduleName}/${filename.replace('.adoc', '.html')}`,
        };
  
        file.family = family;

        contentCatalog.addFile(file)

    })

    // log a message after the documents have been conveted
    // we are adding a partial, so I guess we don't get a lot of contentCatalog information from this
    // it is not a page, so no out info etc.

    this.on('documentsConverted', async ({ contentCatalog }) => {

        const generated = contentCatalog.findBy({ family: 'partial'}).filter(f => f.src.relative === filename)

        // for (const file of generated) {
        //     console.log(file.src)
        // }

        // log an info message about adding the file
        // this is not a good way to do it though
        logger.info({  }, 'Generated %s and added to the contentCatalog', generated[0].src.relative)

    })

}

function regionsDataToAsciidoc(regionsJSON) {

    const output = {}

    const newLine = '\n'
    const tabbedHeader = `[.tabbed-example]${newLine}${newLine}====${newLine}${newLine}`
    const tabbedEnd = `====${newLine}`
    const listDelimiter = '======'
    const listItemSymbol = '** '

    // collect the region.csp values
    const cspSet = new Set()
    for (const region of regionsJSON.regions) {
    cspSet.add(region.csp)
    }

    // collect the tiers
    const tierSet = new Set()
    for (const region of regionsJSON.regions) {
        for (const [key, value] of Object.entries(region.tiers)) {
            tierSet.add(key)
        }
    }

    for (const csp of cspSet) {
        output[csp] = {
            header: `== ${csp} Regions by Aura tier${newLine}${newLine}`,
            tiers: {}
        }
        for (const tier of tierSet) {
            // split the tier string at the underscore
            const tierParts = tier.split('_')
            // in the second part, insert a dash between any lowercase letter followed by an uppercase letter
            const formattedTier = tierParts[0] + '-' + tierParts[1].replace(/([a-z])([A-Z])/g, '$1-$2')

            output[csp].tiers[tier] = {
                displayName: tier.replaceAll('_', ' '),
                regions: [],
                asciidocRole: `[.include-with-${formattedTier}]${newLine}`,
                asciidocContent: ''
            }
        }
    }

    for (const region of regionsJSON.regions) {

        if (region.status !== 'GA') continue

        // for every tier in region.tiers, if the value is true, add the region.id to output[csp][tier]
        for (const [key, value] of Object.entries(region.tiers)) {
            if (value === true) {
                output[region.csp].tiers[key].regions.push(region.display_name)
                output[region.csp].tiers[key].asciidocContent += `${listItemSymbol}${region.display_name}${newLine}`
            }
        }

    }

    let adoc = ''

    cspSet.forEach(csp => {
        adoc += (output[csp].header)
        adoc += tabbedHeader
        for (const tier of tierSet) {
            adoc += output[csp].tiers[tier].asciidocRole + listDelimiter + newLine + output[csp].tiers[tier].asciidocContent + listDelimiter + newLine + newLine
        }
        adoc += tabbedEnd
    })

    return adoc


}




// // local file for now - use remote file in production
// const regionsJSON = require('./regions.json')

// const output = {}

// const newLine = '\n'
// const tabbedHeader = `[.tabbed-example]${newLine}${newLine}====${newLine}${newLine}`
// const tabbedEnd = `====${newLine}`
// const listDelimiter = '======'
// const listItemSymbol = '** '

// // collect the region.csp values
// const cspSet = new Set()
// for (const region of regionsJSON.regions) {
//   cspSet.add(region.csp)
// }

// // collect the tiers
// const tierSet = new Set()
// for (const region of regionsJSON.regions) {
//     for (const [key, value] of Object.entries(region.tiers)) {
//         tierSet.add(key)
//     }
// }

// for (const csp of cspSet) {
//     output[csp] = {
//         header: `== ${csp} Regions by Aura tier${newLine}${newLine}`,
//         tiers: {}
//     }
//     for (const tier of tierSet) {
//         // split the tier string at the underscore
//         const tierParts = tier.split('_')
//         // in the second part, insert a dash between any lowercase letter followed by an uppercase letter
//         const formattedTier = tierParts[0] + '-' + tierParts[1].replace(/([a-z])([A-Z])/g, '$1-$2')

//         output[csp].tiers[tier] = {
//             displayName: tier.replaceAll('_', ' '),
//             regions: [],
//             asciidocRole: `[.include-with-${formattedTier}]${newLine}`,
//             asciidocContent: ''
//         }
//     }
// }

// for (const region of regionsJSON.regions) {

//     if (region.status !== 'GA') continue

//     // for every tier in region.tiers, if the value is true, add the region.id to output[csp][tier]
//     for (const [key, value] of Object.entries(region.tiers)) {
//         if (value === true) {
//             output[region.csp].tiers[key].regions.push(region.display_name)
//             output[region.csp].tiers[key].asciidocContent += `${listItemSymbol}${region.display_name}${newLine}`
//         }
//     }

// }

// let adoc = ''

// cspSet.forEach(csp => {
//     adoc += (output[csp].header)
//     adoc += tabbedHeader
//     for (const tier of tierSet) {
//         adoc += output[csp].tiers[tier].asciidocRole + listDelimiter + newLine + output[csp].tiers[tier].asciidocContent + listDelimiter + newLine + newLine
//     }
//     adoc += tabbedEnd
// })

// const dir = path.join(__dirname, '..', 'modules', 'root', 'partials', 'scp-tiers.adoc')

// fs.writeFileSync(dir,`// This file is auto-generated by scripts/regions.js
// // Do not edit!
// ${adoc}`)
