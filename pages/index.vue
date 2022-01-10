<template>
  <div v-hotkey="keymap">
    <div class="mb-8 space-x-2 items-center text-center overflow-hidden">
      <h4
        class="site_title tracking-wide py-2 bg-purple-400 uppercase text-2xl pl-10 pr-4 text-white font-bold hover:text-gray-500"
      >
        Awesomly Tested
      </h4>
      <div class="flex justify-center">
        <AwesomeLogo size="128px" />
      </div>
    </div>

    <main class="mt-16 mx-auto max-w-7xl px-4 mb-8 sm:mt-24">
      <div class="text-center">
        <h1
          class="text-4xl leading-8 tracking-tight font-extrabold text-gray-900 sm:text-5xl md:text-6xl"
        >
          Ever wondered<br />
          how your favorite<br />
          <span class="block text-purple-600 xl:inline"
            >libraries are tested?</span
          >
        </h1>
        <p
          class="mt-4 max-w-md mx-auto text-base leading-9 text-gray-500 text-lg leading-loose"
        >
          Their tests are passing, but <br />do you know
          <span class="font-bold">what they actually test?</span> 🤔
          <br /><br />

          <span class="text-sm">
            😎 So we analyzed all popular JavaScript & TypeScript repositories
            so you could see all their tests on one page:
          </span>
        </p>
      </div>

      <div class="flex mt-4 justify-center uppercase space-x-8">
        <a
          href="/facebook/react"
          class="flex items-middle space-x-2 text-sm text-gray-400"
        >
          <span>React</span>
          <img
            src="/badges/facebook__react.svg"
            style="width: 90px; height: 20px"
          />
        </a>

        <a
          href="/vuejs/vue"
          class="flex items-middle space-x-2 text-sm text-gray-400"
        >
          <span>VueJS</span>
          <img src="/badges/vuejs__vue.svg" style="width: 90px; height: 20px" />
        </a>

        <a
          href="/angular/angular"
          class="flex items-middle space-x-2 text-sm text-gray-400"
        >
          <span>Angular</span>
          <img
            src="/badges/angular__angular.svg"
            style="width: 90px; height: 20px"
          />
        </a>

        <a
          href="/vercel/next_js"
          class="flex items-middle space-x-2 text-sm text-gray-400"
        >
          <span>Next.js</span>
          <img
            src="/badges/vercel__next_js.svg"
            style="width: 90px; height: 20px"
          />
        </a>

        <div class="text-sm text-gray-400">
          and <b>{{ data.length - 4 }}</b> more...
        </div>
      </div>
    </main>

    <div class="bg-purple-100 py-16 mt-4">
      <div class="text-center">
        <h4 class="font-extrabold text-gray-600 text-2xl">
          Are your tests awesome? Yes, they are! 😻<br />
        </h4>

        <div class="max-w-md mx-auto sm:flex sm:justify-center md:mt-4">
          <div class="rounded-md shadow">
            <a
              href="#"
              class="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-purple-600 hover:bg-purple-700 md:py-4 md:text-lg md:px-10"
            >
              Create a Badge
            </a>
          </div>
        </div>

        <div class="flex justify-center mt-4 space-x-4">
          <span class="text-gray-400 text-sm">Like this one &rarr;</span>

          <AwesomeBadge tests="140" />

          <span class="text-gray-400 text-sm">to make them visible</span>
        </div>
      </div>
    </div>

    <div class="flex px-8 justify-between items-center">
      <h4
        class="flex-1 w-1/3 font-extrabold text-gray-600 space-x-4 text-2xl my-8"
      >
        Awesomly Tested Repositories:
      </h4>

      <div class="flex-1 w-1/3">
        <no-ssr>
          <VueAutosuggest
            v-model="query"
            :suggestions="suggestions"
            :input-props="{
              id: 'autosuggest__input',
              placeholder: 'Search Repositories ' + searchHotkey,
            }"
            :get-suggestion-value="(s) => s.item.item.name"
            @input="suggest"
            @selected="openRepo"
          >
            <template slot-scope="{ suggestion }">
              <nuxt-link
                :to="'/' + suggestion.item.item.repo"
                class="cursor-pointer rounded-lg px-4 py-2"
              >
                <b>{{ suggestion.item.item.repo }}</b>
              </nuxt-link>
            </template>
          </VueAutosuggest>
        </no-ssr>
      </div>
      <div class="w-1/3 text-right">
        <nuxt-link
          class="inline-flex items-center px-4 py-2 border border-transparent text-base font-medium rounded-md text-indigo-700 bg-indigo-100 hover:bg-indigo-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          to="/add"
        >
          Add Repo
        </nuxt-link>
      </div>
    </div>
    <div class="grid grid-cols-1 z-0 gap-4 sm:grid-cols-2 lg:grid-cols-4 px-4">
      <div
        v-for="item in list"
        :key="item"
        class="z-0 relative rounded-lg border border-gray-300 bg-white px-6 py-5 shadow-sm flex items-center space-x-3 hover:border-gray-400 focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-indigo-500"
      >
        <solid-check-icon
          v-if="item.count < 1000"
          class="w-5 h-5 inline-block text-green-400"
        />
        <solid-check-circle-icon
          v-if="item.count >= 1000"
          class="w-5 h-5 inline-block text-green-400"
        />
        <div class="flex-1 min-w-0">
          <a
            :href="'/' + item.repo.replace('.', '_')"
            class="focus:outline-none"
          >
            <span class="absolute inset-0" aria-hidden="true" />
            <p class="text-sm font-medium text-gray-900">
              {{ item.repo }}
            </p>

            <p class="text-sm text-gray-500 truncate">{{ item.count }} tests</p>
          </a>
        </div>
      </div>
    </div>
    <div class="flex justify-center my-4">
      <button
        v-if="!filtered && list.length !== data.length"
        type="button"
        class="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-indigo-700 bg-indigo-100 hover:bg-indigo-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        @click="showAll"
      >
        SHOW ME ALL!
      </button>
    </div>
  </div>
</template>

<script>
import { VueAutosuggest } from 'vue-autosuggest'
import Fuse from 'fuse.js'
import { debounce } from 'vue-debounce'
import AwesomeBadge from '~/components/AwesomeBadge.vue'

export default {
  name: 'IndexPage',
  components: {
    VueAutosuggest,
    AwesomeBadge,
  },
  asyncData({ $axios, params }) {
    if (process.static) {
      return import('@/static/data/list.json').then((data) => {
        console.log(data);
        return {
          data,
          list: data.slice(0, 32).filter(d => !!d.repo),
        }
      });
    }
    const baseUrl = this.$axios.defaults.baseURL;

    return (
      $axios
        .get(`${baseUrl}/data/list.json`)
        // eslint-disable-next-line arrow-body-style
        .then(({ data }) => {
          return {
            data,
            list: data.slice(0, 32).filter(d => !!d.repo),
          }
        })
    )
  },
  data() {
    return {
      filtered: false,
      query: '',
      suggestions: [],
    }
  },
  computed: {
    searchHotkey() {
      if (typeof navigator === 'undefined') return ''
      if (/(Mac|iPhone|iPod|iPad)/i.test(navigator.platform)) return '[Cmd+K]'
      return '[Ctrl+K]'
    },

    keymap() {
      return {
        'cmd+k': this.focusSearch,
        'ctrl+k': this.focusSearch,
      }
    },
  },
  methods: {
    openRepo(item) {
      if (item) {
        window.location.pathname = `/${item.item.item.repo}`
      }
      // if (!item) {
      //   // const repo = item.item.item;
      // }
      // return
      //
    },

    suggest(query) {
      if (query.length < 3) {
        this.suggestions = []
        return
      }

      const dbf = debounce(() => {
        const options = {
          includeScore: true,
          threshold: 0.2,
          // Search in `author` and in `tags` array
          keys: ['repo'],
        }

        const fuse = new Fuse(this.data, options)

        const result = fuse.search(query)

        this.suggestions = [{ data: result.slice(0, 100) }]
      }, '100ms')

      dbf()
    },

    focusSearch() {
      document.getElementById('autosuggest__input').focus()
    },
    showAll() {
      this.list = this.data
    },
  },
}
</script>

<style lang="css">
#autosuggest {
  position: relative;
}

#autosuggest-autosuggest__results {
  position: absolute;
  z-index: 200;
  top: 60px;
}

.autosuggest__results-item {
  @apply py-2;
  /* @apply border-b-4 border-t-4 border-white; */
}

.autosuggest__results-item:hover {
  @apply bg-blue-50;
}

.autosuggest__results-item--highlighted {
  @apply bg-blue-50;
}

.autosuggest__results {
  height: 280px;
  overflow-y: auto;
  overflow-x: auto;
  @apply bg-white py-4 my-2 rounded-2xl shadow-2xl border border-gray-200;
}

#autosuggest input[type='text'] {
  @apply w-full rounded-2xl px-4 py-2 border-2 inset-2 border-gray-200;
}

#autosuggest input[type='text']:focus {
  outline: 2px solid transparent;
  outline-offset: 2px;
  @apply ring-2;
}

.site_title {
  transform: skew(0deg, 6deg);
  letter-spacing: 10px;
  padding-top: 200px;
  margin-top: -180px;
  overflow: hidden;
  z-index: -1;
  border-bottom: 5px dashed #eee;
}
</style>
