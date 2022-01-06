import path from 'path'
import fs from 'fs'
import glob from 'glob'

require('dotenv').config()

export default {
  // Target: https://go.nuxtjs.dev/config-target
  target: 'static',

  // Global page headers: https://go.nuxtjs.dev/config-head
  head: {
    title: 'awesomlytested',
    htmlAttrs: {
      lang: 'en',
    },
    meta: [
      { charset: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      { hid: 'description', name: 'description', content: '' },
      { name: 'format-detection', content: 'telephone=no' },
    ],
    link: [{ rel: 'icon', type: 'image/png', href: '/favicon.png' }],
  },

  // Global CSS: https://go.nuxtjs.dev/config-css
  css: ['vue-json-pretty/lib/styles.css'],

  // Plugins to run before rendering page: https://go.nuxtjs.dev/config-plugins
  plugins: [
    { src: '@/plugins/vue-shortkey.js', mode: 'client' },
    { src: '@/plugins/infinite-scroll.js', mode: 'client' },
    { src: '@/plugins/vue-json-pretty.js', mode: 'client' },
  ],

  // Auto import components: https://go.nuxtjs.dev/config-components
  components: true,

  // Modules for dev and build (recommended): https://go.nuxtjs.dev/config-modules
  buildModules: [
    // https://go.nuxtjs.dev/eslint
    '@nuxtjs/eslint-module',
    // https://go.nuxtjs.dev/tailwindcss
    '@nuxtjs/tailwindcss',
    '@nuxt-hero-icons/outline/nuxt',
    '@nuxt-hero-icons/solid/nuxt',
  ],

  // Modules: https://go.nuxtjs.dev/config-modules
  modules: [
    // https://go.nuxtjs.dev/axios
    '@nuxtjs/axios',
    'nuxt-clipboard2',
  ],

  // serverMiddleware: process.env.NODE_ENV === 'production' ? [] : ['~/api/add.js'],

  // Axios module configuration: https://go.nuxtjs.dev/config-axios
  axios: {
    // Workaround to avoid enforcing hard-coded localhost:3000: https://github.com/nuxt-community/axios-module/issues/308
    // baseURL: '/',
    // port: process.env.API_PORT,
    // baseURL: '/'
  },

  // Build Configuration: https://go.nuxtjs.dev/config-build
  build: {
    /*
     ** You can extend webpack config here
     */
    extend(config, ctx) {
      // if (ctx.isServer) {
      // }
    },
  },
  generate: {
    routes() {
      const files = glob.sync(
        path.join(__dirname, 'static', 'data', '*.json'),
        { ignore: 'node_modules' }
      )
      const routes = ['/']
      for (const file of files) {
        // if (!file || !file.name) continue;
        // console.log(file.name);
        const data = JSON.parse(fs.readFileSync(file))
        if (data.error) continue
        if (!data.tests) continue
        // if (!data.tests.length) continue;
        const url = data.repo.toLowerCase().replace('.js', '_js')
        routes.push(`/${url}`)
        // console.log('added route')
      }
      return routes
      // return getData().map(d => `headlines/${d.code}`);
    },
  },
}
