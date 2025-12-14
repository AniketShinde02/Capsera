import React from 'react'
import { DocsThemeConfig } from 'nextra-theme-docs'

const config: DocsThemeConfig = {
    logo: (
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <img src="/docs/site-logo.png" alt="Capsera Logo" width={24} height={24} />
            <span style={{ fontWeight: 700, fontSize: '1.2rem' }}>Capsera Docs</span>
        </div>
    ),
    project: {
        link: 'https://github.com/AniketShinde02/Capsera',
    },
    chat: {
        link: 'https://discord.gg/capsera',
    },
    docsRepositoryBase: 'https://github.com/Start-Capsera/Next.js/tree/main/capsera-docs',
    footer: {
        text: (
            <span>
                © {new Date().getFullYear()} <a href="https://capsera.online" target="_blank">Capsera AI</a>. All rights reserved.
            </span>
        )
    },
    head: (
        <>
            <meta name="viewport" content="width=device-width, initial-scale=1.0" />
            <meta property="og:title" content="Capsera Documentation" />
            <meta property="og:description" content="Official documentation for Capsera AI Caption Generator" />
        </>
    ),
    primaryHue: 200,
    primarySaturation: 90,
    useNextSeoProps() {
        return {
            titleTemplate: '%s – Capsera Docs'
        }
    },
    sidebar: {
        defaultMenuCollapseLevel: 1,
        toggleButton: true
    }
}

export default config
