const esbuild = require('esbuild');

async function buildVariants(options) {
    await Promise.all([
        esbuild.build({
            bundle: true,
            platform: 'node',
            target: 'es6',
            sourcemap: true,
            treeShaking: true,
            ...options,
            outfile: __dirname + '/dist/'+options.outfile+'.js',
            dropLabels: [
                'DEBUG'
            ],
        }),
        esbuild.build({
            bundle: true,
            platform: 'browser',
            target: 'es2020',
            sourcemap: true,
            minify: true,
            treeShaking: true,
            ...options,
            outfile: __dirname + '/dist/'+options.outfile+'.min.js',
            dropLabels: [
                'DEBUG'
            ],
        }),
    ]).then((results) => {
        console.log('Build ' + options.entryPoints + ' done');
    });
}

(async () => {
    await buildVariants({
        entryPoints: ['./src/scs.ts'],
        bundle: true,
        platform: 'node',
        target: 'node20',
        format: 'esm',
        sourcemap: true,
        outfile: 'scs',
    })
    await buildVariants({
        entryPoints: ['./src/browser.ts'],
        bundle: true,
        platform: 'browser',
        target: 'node20',
        format: 'iife',
        sourcemap: true,
        outfile: 'scs-browser',
    })
})();
