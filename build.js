const esbuild = require('esbuild');

async function buildVariants(options) {
    await Promise.all([
        esbuild.build({
            bundle: true,
            platform: 'node',
            target: 'node20',
            sourcemap: true,
            ...options,
            outfile: __dirname + '/dist/'+options.outfile+'.js',
        }),
        esbuild.build({
            bundle: true,
            platform: 'browser',
            target: 'node20',
            sourcemap: true,
            minify: true,
            ...options,
            outfile: __dirname + '/dist/'+options.outfile+'.min.js',
        }),
    ]);
}

(async () => {
    await buildVariants({
        entryPoints: ['./src/scs.ts'],
        bundle: true,
        platform: 'node',
        target: 'node20',
        sourcemap: true,
        outfile: 'scs',
    })
    await buildVariants({
        entryPoints: ['./src/browser.ts'],
        bundle: true,
        platform: 'browser',
        target: 'node20',
        sourcemap: true,
        outfile: 'scs-browser',
    })
})();
