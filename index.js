module.exports = function scopeGlobalStypes(prefix, webpackConfig, ngJson) {
    const projectName = singleSpaWebpackConfig.output.uniqueName;
    const project = ngJson.projects[projectName];
    if(project && project.architect.build.options && project.architect.build.options.styles.length < 1) {
        return;
    }
    const { entryPoints, noInjectNames } = normalizeGlobalStyles(project.architect.build.options.styles);
    const filePathRoot = webpackConfig.resolve.roots[0] + "\\";
    for(let i = 0; i < entryPoints.styles.length; i++) {
        entryPoints.styles[i] = filePathRoot + entryPoints.styles[i].replace("/", "\\");
    }

    const postcssPrefixSelector = {
        "postcss-prefix-selector": {
            prefix,
            transform(prefix, selector, prefixedSelector, filePath, rule) {
                if(selector.match(/^(html|body)/)) {
                    return selector.replace(/^([^\s]*)/, `$1 ${prefix}`);
                }

                if(filePath.match(/node_modules/)) {
                    return selector; // Do not prefix styles imported from node_modules
                }

                const annotation = rule.prev();
                if(annotation && annotation.type === 'comment' && annotation.text.trim() === 'no-prefix') {
                    return selector; // Do not prefix style rules that are preceded by: /* no-prefix */
                }

                return prefixedSelector;
            },
            includeFiles: entryPoints.styles
        }
    };

    const postcssLoader = require.resolve('postcss-loader');
    const usePostCssLoader = {
        loader: postcssLoader,
        options: {
            postcssOptions: {
                plugins: {
                    ...postcssPrefixSelector
                }
            }
        }
    }

    const postCssAddPrefixSelectorRule = {
        test: /\.css$/,
        use: [
            usePostCssLoader
        ]
    };
    const scssPostCssAddPrefixSelectorRule = {
        test: /\.scss$/,
        use: [
            usePostCssLoader,
            'sass-loader' // compiles Sass to CSS, using Node Sass by default
        ]
    };
    webpackConfig.module.rules.push(postCssAddPrefixSelectorRule, scssPostCssAddPrefixSelectorRule);
}

function normalizeGlobalStyles (styleEntrypoints) {
    const entryPoints = {};
    const noInjectNames = [];

    if(styleEntrypoints.length === 0) {
        return { entryPoints, noInjectNames };
    }

    for(const style of normalizeExtraEntryPoints(styleEntrypoints, 'styles')) {
        // Add style entry points.
        entryPoints[style.bundleName] !== null && entryPoints[style.bundleName] !== void 0 ? entryPoints[style.bundleName] : (entryPoints[style.bundleName] = []);
        entryPoints[style.bundleName].push(style.input);

        // Add non injected styles to the list.
        if(!style.inject) {
            noInjectNames.push(style.bundleName);
        }
    }

    return { entryPoints, noInjectNames };
}

function normalizeExtraEntryPoints (extraEntryPoints, defaultBundleName,) {
    return extraEntryPoints.map((entry) => {
        if(typeof entry === 'string') {
            return { input: entry, inject: true, bundleName: defaultBundleName };
        }

        const { inject = true, ...newEntry } = entry;
        let bundleName;
        if(entry.bundleName) {
            bundleName = entry.bundleName;
        } else if(!inject) {
            // Lazy entry points use the file name as bundle name.
            bundleName = path.parse(entry.input).name;
        } else {
            bundleName = defaultBundleName;
        }

        return { ...newEntry, inject, bundleName };
    });
}