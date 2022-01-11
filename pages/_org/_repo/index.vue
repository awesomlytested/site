<template>
  <div v-hotkey="keymap" class="bg-white lg:min-w-0 lg:flex-1">
    <div
      class="pl-4 pr-6 pt-4 pb-4 border-b z-20 bg-white shadow-lg sticky top-0 border-t border-gray-200 sm:pl-6 lg:pl-8 xl:pl-6 xl:pt-6 xl:border-t-0"
    >
      <div class="flex space-x-4 justify-between items-center bg-white">
        <span class="flex-init">
          <AwesomeLogo />
        </span>
        <h1 class="flex-init flex space-x-4 w-1/3 text-lg font-medium">
          <span>
            {{ data.repo }}
          </span>
          <GitHub :repo="data.repo" />
        </h1>
        <div class="flex-1 w-1/3 max-w-1/3 flex space-x-4">
          <no-ssr>
            <VueAutosuggest
              v-model="query"
              :suggestions="suggestions"
              :input-props="{
                id: 'autosuggest__input',
                placeholder: 'Search for tests ' + searchHotkey,
                class: 'w-full',
              }"
              :get-suggestion-value="(s) => s.item.item.name"
              class="w-full"
              @input="suggest"
              @selected="highlightTest"
            >
              <template slot-scope="{ suggestion }">
                <div class="cursor-pointer rounded-lg px-4 py-2">
                  <b>{{ suggestion.item.item.name }}</b>
                  - {{ suggestion.item.item.suites.join(' > ') }}
                </div>
              </template>
            </VueAutosuggest>

            <button
              type="button"
              :class="[
                filtered ? 'bg-blue-100' : 'bg-white ',
                'inline-flex items-center content-center p-1 border border-transparent rounded-2xl shadow-sm text-gray-600 hover:bg-blue-100 focus:outline-none',
              ]"
              @click="toggleFilter"
            >
              <outline-search-icon v-if="!filtered" class="h-5 w-10" />
              <outline-x-circle-icon v-if="filtered" class="h-5 w-10" />
            </button>
          </no-ssr>
        </div>
        <div class="flex-1 w-1/3 flex justify-end items-end">
          <div
          role="button" 
            v-if="data.tests"
            @click="showBadgeModal = true"
            class="flex-init cursor-pointer relative space-x-1 text-center text-xs text-gray-400"
          >
            <img
              :src="'/badges/' + data.badge"
              style="width: 135px; height: 30px"
            />
            <div class="text-center">Copy this badge! &uarr;</div>


          </div>

    <BadgeModal v-model="showBadgeModal" @confirm="confirm" @cancel="cancel">
      <template v-slot:title>Badges</template>
      <div>
        <div class="text-sm text-gray-400 text-center text-sm mb-8 font-bold">
          &darr; Select and copy the badge you like &darr;
        </div>
        
        <div class="mb-4">
          <img :src="'/badges/' + data.badge" />
          <input class="copy-input" onClick="this.select();" type="text"  :value="mainBadgeMarkdown">
        </div>

        <div v-if="data.badge2" class="mb-4">
          <img :src="'/badges/' + data.badge2" />
          <input class="copy-input" onClick="this.select();" type="text" :value="secondaryBadgeMarkdown">
        </div>

        <div v-if="data.badge3" class="mb-4">
          <img :src="'/badges/' + data.badge3" />
          <input class="copy-input" onClick="this.select();" type="text" :value="thirdBadgeMarkdown">
        </div>
      </div>
    </BadgeModal>
        </div>
      </div>
    </div>

    <div v-if="!data.tests" class="p-4">Tests not analyzed yet</div>

    <div v-if="data.error" class="p-4 bg-red-100 text-red-600">
      There was error analyzing tests. Probably config should be updated.
      <br />{{ data.error }}
    </div>

    <div v-if="filtered" class="text-sm text-blue-600 bg-blue-100 p-4">
      Filtered by "{{ query }}", {{ tests.length }} tests found.
    </div>

    <ul
      role="list"
      class="relative z-0 divide-y divide-gray-200 border-b border-gray-200"
    >
      <li
        v-for="test in tests"
        :key="test.id"
        :class="[
          test.highlighted ? 'ring-4' : '',
          ' rounded relative pl-4 pr-6 py-5 hover:bg-gray-50 sm:py-6 sm:pl-6 lg:pl-8 xl:pl-6',
        ]"
      >
        <div
          :id="'test-' + test.id"
          class="flex items-center justify-between space-x-4"
        >
          <!-- Repo name and link -->
          <div class="min-w-0 space-y-3 overflow-hidden">
            <div class="flex items-center space-x-3">
              <span
                :class="[
                  !test.skipped ? 'bg-green-100' : 'bg-gray-100',
                  'h-4 w-4 rounded-full flex items-center justify-center',
                ]"
                aria-hidden="true"
              >
                <span
                  :class="[
                    !test.skipped ? 'bg-green-400' : 'bg-gray-400',
                    'h-2 w-2 rounded-full',
                  ]"
                />
              </span>

              <span class="block" @click="toggle(test, $event)">
                <h2 class="text-sm font-medium">
                  <a href="#">
                    <span class="absolute inset-0" aria-hidden="true" />

                    <span
                      v-for="suite in test.suites"
                      :key="suite.name"
                      class="whitespace-nowrap text-gray-600 inline-block max-w-10 overflow-ellipsis text-ellipsis"
                    >
                      <span v-if="suite.trim">{{ suite.trim() }}</span>
                      <outline-chevron-double-right-icon
                        class="mr-1 w-3 h-3 inline"
                      />
                      <!-- <span aria-hidden="true">&raquo;</span> -->
                    </span>

                    <span class="font-bold whitespace-nowrap">
                      {{ test.name }}
                    </span>
                  </a>
                </h2>
              </span>
            </div>
          </div>
          <div
            class="relative group flex items-center space-x-1 w-40 text-left block overflow-ellipsis"
          >
            <outline-document-icon
              class="w-4 text-gray-400 text-xs"
              aria-hidden="true"
            />
            <a
              :href="
                data.url +
                '/blob/' +
                data.branch +
                '/' +
                test.dir +
                '/' +
                test.file
              "
              target="_blank"
              class="text-sm cursor-pointer text-gray-500 group-hover:text-gray-900 font-medium truncate"
            >
              {{ test.file }}
            </a>
          </div>
          <div class="sm:hidden"></div>
          <!-- Repo meta info -->
        </div>
        <no-ssr>
          <div v-show="test.codeIsShown">
            <VueCodeHighlight class="rounded mt-4" language="javascript">
              <pre>{{ test.code }}</pre>
            </VueCodeHighlight>
          </div>
        </no-ssr>
      </li>
    </ul>
    <div v-if="!filtered">
      <div
        v-infinite-scroll="loadMore"
        class="bg-yellow-100 py-4 px-4 text-sm"
        infinite-scroll-distance="10"
      >
        Load More
      </div>
    </div>
  </div>
</template>

<script>
import { debounce } from 'vue-debounce'
import { nanoid } from 'nanoid'
import { component as VueCodeHighlight } from 'vue-code-highlight'
import 'vue-code-highlight/themes/prism-solarizedlight.css'
import { VueAutosuggest } from 'vue-autosuggest'
import Fuse from 'fuse.js'
import GitHub from '~/components/GitHub.vue'
import BadgeModal from '~/components/BadgeModal.vue'
// import "vue-code-highlight/themes/window.css";

const perPage = 50

export default {
  name: 'RepoPage',
  components: {
    VueAutosuggest,
    VueCodeHighlight,
    GitHub,
    BadgeModal
},

  asyncData({ $axios, params }) {
    const dataFile = `${params.org.toLowerCase()}__${params.repo.toLowerCase().replace('.', '_')}`;

    if (process.static) {      
      return import('~/static/data/' + dataFile + '.json').then(data => {
        if (data.tests) {
          data.tests.forEach((t) => {
            t.codeIsShown = false;
            t.id = nanoid();
          });
        }
        return {
          data,
          tests: data.tests.slice(0, perPage),
        }
      });
    }

    const baseUrl = this.$axios.defaults.baseURL;

    return (
      $axios
        .get(`${baseUrl}/data/${dataFile}.json`)
        // eslint-disable-next-line arrow-body-style
        .then(({ data }) => {
          if (data.tests)
            data.tests.forEach((t) => {
              t.codeIsShown = false
              t.id = nanoid()
            })
          return {
            data,
            tests: data.tests.slice(0, perPage),
          }
        })
    )
  },
  data() {
    return {
      suggestions: [],
      tests: '',
      testsIndex: 0,
      filtered: false,
      query: null,
      showBadgeModal: false,
    }
  },

  computed: {
    mainBadgeMarkdown() {
      return `[![Tests](https://awesomlytested.com/badges/${this.data.badge})](https://awesomlytested.com/${this.data.repo})`;
    },
    secondaryBadgeMarkdown() {
      return `[![Tests](https://awesomlytested.com/badges/${this.data.badge2})](https://awesomlytested.com/${this.data.repo})`;
    },    
    thirdBadgeMarkdown() {
      return `[![Tests](https://awesomlytested.com/badges/${this.data.badge3})](https://awesomlytested.com/${this.data.repo})`;
    },    


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
    confirm() {
      // some code...
      this.showBadgeModal = false
    },
    cancel(close) {
      // some code...
      close()
    },

    focusSearch() {
      document.getElementById('autosuggest__input').focus()
    },

    loadMore() {
      if (!this.data.tests) return
      this.tests.push(
        ...this.data.tests.slice(
          this.tests.length - 1,
          this.tests.length - 1 + perPage
        )
      )
    },

    toggle(test, event) {
      test.codeIsShown = !test.codeIsShown
      if (test.codeIsShown) {
        this.scrollToTest(test)
      }
      event.preventDefault()
      return false
    },

    toggleFilter() {
      if (!this.filtered) {
        this.tests = this.suggestions[0].data.map((i) => i.item)
        this.filtered = true
        window.scrollTo({
          top: 0,
          behavior: 'smooth',
        })
      } else {
        this.tests = this.data.tests.slice(0, perPage)
        this.filtered = false
      }
    },

    highlightTest(item) {
      if (!item) {
        this.filtered = false
        this.toggleFilter()
        // console.log(item);
        // this.tests = data.tests.
        return
      }
      const test = item.item.item
      if (!this.tests.includes(test)) {
        this.tests = [test]
        this.filtered = true
      }
      this.scrollToTest(test)
      test.codeIsShown = true
      test.highlighted = true
      setTimeout(() => {
        test.highlighted = false
      }, 2000)
    },

    scrollToTest(test) {
      const el = document.getElementById('test-' + test.id)
      if (!el) return

      const top = el.getBoundingClientRect().top

      window.scrollTo({
        top: top + window.pageYOffset - 100,
        behavior: 'smooth',
      })
    },

    suggest(query) {
      if (query.length < 4) {
        this.suggestions = []
        return
      }

      const dbf = debounce(() => {
        const options = {
          includeScore: true,
          threshold: 0.2,
          // Search in `author` and in `tags` array
          keys: ['name', 'suites'],
        }

        const fuse = new Fuse(this.data.tests, options)

        const result = fuse.search(query)

        this.suggestions = [{ data: result.slice(0, 100) }]
      }, '200ms')

      dbf()
    },

    getSuggestionValue(test) {
      const { name, suites } = test
      return suites.join(' > ') + ' ' + name
    },
  },
}
</script>
<style lang="css" scoped>
#autosuggest {
  position: relative;
}

#autosuggest-autosuggest__results {
  position: absolute;
  top: 60px;
}

.autosuggest__results-item {
  @apply border-b-4 border-t-4 border-white;
}

.autosuggest__results-item:hover {
  @apply bg-blue-50;
}

.autosuggest__results-item--highlighted {
  @apply bg-blue-50 border-blue-200;
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

.copy-input {
  @apply w-96 p-4 rounded border border-gray-200 text-sm text-gray-400 font-mono mb-8;
}
</style>
