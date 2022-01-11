<!-- This example requires Tailwind CSS v2.0+ -->
<template>
  <vue-final-modal
    v-slot="{ params, close }"
    v-bind="$attrs"
    classes="flex justify-center items-center"
    content-class="relative flex flex-col max-h-full mx-4 p-4 border dark:border-gray-800 rounded bg-white dark:bg-gray-900"
    v-on="$listeners"
  >
    <span class="mr-8 text-center text-2xl font-bold ">
      <slot name="title"></slot>
    </span>
    <div class="flex-grow overflow-y-auto">
      <slot v-bind:params="params"></slot>
    </div>
    <div class="flex-shrink-0 flex justify-center items-center pt-4">
      <button class="vfm-btn bg-gray-50 px-4 py-2 rounded" @click="$emit('confirm', close)">close</button>
    </div>
  </vue-final-modal>
</template>

<script>
export default {
  name: 'BadgeModal',
  inheritAttrs: false
}
</script>