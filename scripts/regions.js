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
    // by default we'll use the local file
    // and attempt to fall back to a URL if the local file is not available
    //
    const regionsJSONLocal = path.join(__dirname, '..', 'data', 'regions.json')
    // const regionsJSONUrl = 'https://example.com/regions.json'

    let regionsSource
    
    //
    /* ****************** */

    /* ****************** */
    //
    // define properties of the file to add to contentCatalog
    // can we make any of this smarter? aura is the only component here
    // filename (and other vars) could be a var that can be defined, and the extension added to the playbook
    //
    const componentName = 'aura';
    const componentVersion = '';
    const moduleName = 'ROOT';
    const family = 'partial';
    const regionsPartialFilename = 'regions-generated.adoc';
    //
    /* ****************** */

    this.on('contentClassified', async ({ contentCatalog }) => {

        let regionsData

        /* ****************** */
        //
        // try to load a local file
        try {
            regionsData = fs.readFileSync(regionsJSONLocal, 'utf8')
            regionsSource = 'local'
        } catch (err) {
            logger.info({ }, 'No local JSON file %s', regionsJSONLocal)
        }


        /* ****************** */
        //
        // fallback to a file from a URL
        //
        // if (!regionsData) {

        //     try {
    
        //         const regionsJSON = await new Promise((resolve, reject) => {
        //         const buffer = []
        //         https
        //             .get(regionsJSONUrl, (response) => {
        //             response.on('data', (chunk) => buffer.push(chunk.toString()))
        //             response.on('end', () => resolve(buffer.join('').trim()))
        //             })
        //             .on('error', reject)
        //         })

        //         regionsSource = 'remote'

        //     } catch (err) {
        //         logger.info({ }, 'Error fetching remote regions.json file from %s', regionsJSONUrl)
        //         // throw err
        //     }

        // }
        //
        /* ****************** */

        // exit if no regionsData
        if (!regionsData) {
            logger.error('No regions data source, cannot generate regions partial')
            return
        } else {
            logger.info({ }, 'Using %s regions data source to generate regions partial', regionsSource)
        }

        try {
            regionsData = JSON.parse(regionsData)
        } catch (err) {
            logger.error({ }, 'Error parsing regions data JSON')
            return
        }

        // call the function to process the json into asciidoc
        const regionsAsciidoc = regionsDataToAsciidoc(regionsData)

        const file = new Vinyl({
            contents: Buffer.from(regionsAsciidoc),
            path: regionsPartialFilename,
            stat: {},
        });

        file.src = {
            component: componentName,
            version: componentVersion,
            module: moduleName,
            family: family,
            relative: regionsPartialFilename,
            origin: null,
            basename: regionsPartialFilename,
            extname: '.adoc',
        };

        // file.out = {
        //     path: `${componentName}/${componentVersion}/${moduleName}/${regionsPartialFilename.replace('.adoc', '.html')}`,
        //     url: `${componentName}/${componentVersion}/${moduleName}/${regionsPartialFilename.replace('.adoc', '.html')}`,
        // };
  
        file.family = family;

        // remove the placeholder partial from the contentCatalog
        contentCatalog.removeFile(file)
        // add the generated file to replace it
        contentCatalog.addFile(file)

        logger.info({  }, 'Generated %s and added to the contentCatalog', file.src.relative)

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
            }
        }

    }

    let adoc = ''

    function regionsToAsciidoc(regionsArray) {
        let adoc = ''
        const upperTest = (item) => /^[A-Z]/.test(item);
        const uppers = regionsArray.filter(upperTest).sort();
        const lowers = regionsArray.filter(item => !upperTest(item)).sort();
        regionsArray = lowers.concat(uppers);

        for (const region of regionsArray) {
            adoc += `${listItemSymbol}\`${region}\`${newLine}`
        }

        return adoc
    }

    cspSet.forEach(csp => {
        adoc += (output[csp].header)
        adoc += tabbedHeader
        for (const tier of tierSet) {
            adoc += output[csp].tiers[tier].asciidocRole + listDelimiter + newLine + regionsToAsciidoc(output[csp].tiers[tier].regions) + listDelimiter + newLine + newLine
        }
        adoc += tabbedEnd
    })

    return adoc


}
