<template>
  <div class="bg-white lg:min-w-0 lg:flex-1">
    <div
      class="pl-4 pr-6 pt-4 pb-4 border-b z-20 bg-white top-0 border-t border-gray-200 sm:pl-6 lg:pl-8 xl:pl-6 xl:pt-6 xl:border-t-0"
    >
      <div class="flex space-x-4 justify-start items-center bg-white">
        <span class="flex-init">
          <AwesomeLogo />
        </span>
        <h1 class="flex-init flex space-x-4 w-1/3 text-lg font-medium">Add</h1>
      </div>
    </div>

    <div class="max-w-2xl mx-auto space-y-8 divide-y divide-gray-200">
      <form>
        <div class="space-y-8 divide-y divide-gray-200">
          <div>
            <div class="mt-6">
              <div class="">
                <label
                  for="username"
                  class="block text-sm font-medium text-gray-700"
                >
                  Repository
                </label>
                <div class="mt-1 flex rounded-md shadow-sm text-xl">
                  <span
                    class="inline-flex items-center px-3 rounded-l-md border border-r-0 py-2 border-gray-300 bg-gray-50 text-gray-500 sm:text-sm"
                  >
                    https://github.com/
                  </span>
                  <input
                    v-model="repo"
                    type="text"
                    autofocus
                    class="flex-1 text-xl py-2 w-full focus:ring-indigo-500 border-gray-100 px-2 border hover:ring-2 outline-0 focus:border-indigo-500 block w-full rounded-none rounded-r-md sm:text-sm border-gray-300"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        <div v-if="!result" class="pt-5">
          <div class="flex justify-end">
            <button
              :disabled="checking"
              type="submit"
              class="ml-3 inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              @click="check"
            >
              <span v-if="!checking">Scan for Tests</span>
              <span v-if="checking" class="flex space-x-2"
                ><solid-cube-icon class="w-5 h-5 animate-spin mr-3" />
                Analyzing... Please wait</span
              >
            </button>
          </div>
        </div>
      </form>
      <div v-if="result" class="mt-4">
        <div v-if="result.error">
          <h4 class="font-bold text-2xl my-8">
            Ups, repository can't be parsed 😿
          </h4>

          <div class="bg-red-100 text-red-600 p-4 mb-4">{{ result.error }}</div>
        </div>

        <p>Repository was analyzed with the following settings:</p>

        <vue-json-pretty class="rounded mt-4" :data="result"></vue-json-pretty>

        <div v-if="!result.error && !saved">
          <h4 class="font-bold text-2xl mt-8">Found {{ testsNum }} tests</h4>

          <div class="flex space-x-4 my-4 items-center">
            <div class="flex-init"><AwesomeBadge :tests="testsNum" /></div>

            <div class="text-sm flex-1 w-2/3 text-gray-600">
              👈 Hey, this is cool! Save the config to get this badge!
            </div>
          </div>
        </div>

        <div v-if="saved">
          <div class="bg-green-100 text-green-600 p-4 my-8">
            Yey! 😺 <br />The repository was added to

            <a
              href="https://github.com/awesomlytested/list"
              class="underline"
              target="_blank"
              >list</a
            >
            so it would be scanned for tests on daily basis.
          </div>

          <div class="flex space-x-4">
            <div class="flex-init"><AwesomeBadge :tests="testsNum" /></div>
            <div class="text-sm flex-1 w-2/3 text-gray-600">
              So now you can grab this badge and <b>add it to the Readme</b> 👇
            </div>
          </div>

          <input
            type="text"
            :value="badge"
            class="border-gray-200 border-4 text-xl p-4 w-full"
            @click="copyBadge"
          />

          <div class="mt-1 text-center">
            <button
              type="button"
              class="inline-flex justify-center py-2 px-4 text-xl border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              @click="copyBadge"
            >
              Copy status badge markdown
            </button>
          </div>
        </div>

        <div v-if="testsNum && !saved">
          <div class="pt-5 mb-16">
            <div class="flex justify-end">
              <button
                :disabled="saving"
                type="submit"
                class="ml-3 inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                @click="save"
              >
                <span v-if="!saving">Save</span>
                <span v-if="saving" class="flex space-x-2"
                  ><solid-upload-icon class="w-5 h-5 animate-bounce mr-3" />
                  Saving...</span
                >
              </button>
            </div>
          </div>
        </div>

        <p v-show="!testsNum" class="my-8 p-4 bg-yellow-100 text-yellow-800">
          Unfortunately, no tests were found 😭. You can try to improve the
          config so our analyzer could match tests and parse them.
        </p>
        <form v-show="!testsNum">
          <div class="mt-6">
            <div class="">
              <label
                for="framework"
                class="block text-sm font-medium text-gray-700"
              >
                Test Framework
              </label>
              <div class="mt-1 flex rounded-md shadow-sm">
                <select
                  v-model="config.framework"
                  class="flex-1 bg-white px-4 py-2 w-full focus:ring-indigo-500 border-gray-100 px-2 border hover:ring-2 outline-0 focus:border-indigo-500 block w-full rounded-none rounded-r-md sm:text-sm border-gray-300"
                >
                  <option
                    v-for="framework of frameworks"
                    :key="framework"
                    class="capitalize"
                    :value="framework"
                  >
                    {{ framework }}
                  </option>
                </select>
              </div>
            </div>
          </div>

          <div class="mt-6">
            <div class="">
              <label class="block text-sm font-medium text-gray-700">
                Language
              </label>
              <div class="mt-1 flex rounded-md shadow-sm">
                <select
                  v-model="config.lang"
                  class="flex-1 bg-white px-4 py-2 w-full focus:ring-indigo-500 border-gray-100 px-2 border hover:ring-2 outline-0 focus:border-indigo-500 block w-full rounded-none rounded-r-md sm:text-sm border-gray-300"
                >
                  <option value="js">JavaScript</option>
                  <option value="ts">TypeScript</option>
                </select>
              </div>
            </div>
          </div>

          <div class="mt-6">
            <div class="">
              <label class="block text-sm font-medium text-gray-700">
                Directory
              </label>
              <div class="mt-1 flex rounded-md shadow-sm">
                <input
                  v-model="config.dir"
                  type="text"
                  class="flex-1 py-2 w-full focus:ring-indigo-500 border-gray-100 px-2 border hover:ring-2 outline-0 focus:border-indigo-500 block w-full rounded-none rounded-r-md sm:text-sm border-gray-300"
                />
              </div>
            </div>
          </div>

          <div class="mt-6">
            <div class="">
              <label class="block text-sm font-medium text-gray-700">
                Pattern
              </label>
              <div class="mt-1 flex rounded-md shadow-sm">
                <input
                  v-model="config.pattern"
                  type="text"
                  class="flex-1 py-2 w-full focus:ring-indigo-500 border-gray-100 px-2 border hover:ring-2 outline-0 focus:border-indigo-500 block w-full rounded-none rounded-r-md sm:text-sm border-gray-300"
                />
              </div>
            </div>
          </div>
          <div class="pt-5 mb-16">
            <div class="flex justify-end">
              <button
                :disabled="checking"
                type="submit"
                class="ml-3 inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                @click="adjust"
              >
                <span v-if="!checking">Save & Analyze</span>
                <span v-if="checking" class="flex space-x-2"
                  ><solid-cube-icon class="w-5 h-5 animate-spin mr-3" />
                  Analyzing... Please wait</span
                >
              </button>
            </div>
          </div>
        </form>

        <div v-if="errorSaving">
          <h4 class="font-bold text-2xl my-8">
            Ups, repository can't be parsed 😿
          </h4>

          <div class="bg-red-100 text-red-600 p-4 mb-4">{{ errorSaving }}</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import VueJsonPretty from 'vue-json-pretty'
import 'vue-json-pretty/lib/styles.css'
import AwesomeBadge from '~/components/AwesomeBadge.vue'

export default {
  name: 'AddPage',
  components: {
    VueJsonPretty,
    AwesomeBadge,
  },

  data() {
    return {
      frameworks: [
        'mocha',
        'jest',
        'qunit',
        'cypress',
        'jasmine',
        'codeceptjs',
        'playwright',
      ],
      config: {
        pattern: '**/*.{js,ts}',
        dir: 'tests',
      },
      checking: false,
      tests: '',
      repo: '',
      result: null,
      testsNum: null,
      withCustomConfig: false,
      saved: false,
      saving: false,
      errorSaving: false,
    }
  },

  computed: {
    badge() {
      const fileName = this.result.repo
        .replace('/', '__')
        .replace('.', '_')
        .toLowerCase()
      return `[![Tests](https://awesomlytested.com/badges/${fileName}.svg)](https://awesomlytested.com/${this.result.repo})`
    },
  },
  methods: {
    check(ev) {
      ev.preventDefault()
      if (!this.repo) return false
      if (this.checking) return false
      this.checking = true
      const baseUrl = this.$axios.defaults.baseURL
      const req = { repo: this.repo }
      if (this.withCustomConfig) req.config = this.config

      this.$axios.post(`${baseUrl}/api/add`, req).then(({ data }) => {
        this.checking = false
        if (data && data.configs[0]) {
          this.config = data.configs[0]
        }
        this.result = Object.assign({}, data)
        if (data.tests) this.testsNum = data.tests.length
        delete this.result.tests
        this.data = data
      })
      return false
    },

    adjust(ev) {
      this.withCustomConfig = true
      return this.check(ev)
    },

    async copyBadge() {
      try {
        await this.$copyText(this.badge)
      } catch (e) {
        console.error(e)
      }
    },

    save(ev) {
      ev.preventDefault()
      if (!this.data) return false
      if (this.checking) return false
      this.saving = true
      const baseUrl = this.$axios.defaults.baseURL

      this.$axios
        .post(`${baseUrl}/api/save`, this.data)
        .then(({ data }) => {
          this.saving = false
          this.saved = true
        })
        .catch((err) => {
          this.saving = false
          console.error(err)
          this.errorSaving = err.message
        })
      return false
    },
  },
}
</script>
