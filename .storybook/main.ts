import type { StorybookConfig } from '@storybook/react-vite'
import type { Plugin } from 'vite'

const config: StorybookConfig = {
  stories: ['../src/**/*.stories.@(ts|tsx)'],
  addons: [
    '@storybook/addon-essentials',
    '@storybook/addon-interactions',
  ],
  framework: {
    name: '@storybook/react-vite',
    options: {},
  },
  async viteFinal(config) {
    // Remove CRXJS plugin — it breaks Storybook's Vite build
    config.plugins = (config.plugins ?? []).filter(
      (p) => !(p && 'name' in (p as Plugin) && String((p as Plugin).name).includes('crx')),
    )
    return config
  },
}

export default config
