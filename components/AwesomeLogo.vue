<template>
  <NuxtLink to="/" class="hover:rotate-45">
    <svg
      :width="size || '64px'"
      :height="size || '64px'"
      class="hover:rotate-45"
      version="1.1"
      viewBox="0 0 77.877 84.927"
      xmlns="http://www.w3.org/2000/svg"
      xmlns:cc="http://creativecommons.org/ns#"
      xmlns:dc="http://purl.org/dc/elements/1.1/"
      xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#"
    >
      <g transform="translate(-5.8819 -4.515)">
        <g
          style="
            fill: none;
            stroke-opacity: 0.5435;
            stroke-width: 30.236;
            stroke: #9a2ea2;
          "
        >
          <path
            d="m19.697 38.963 5.8265 22.452 9.6492-16.153-8.6191-17.777z"
            points="25.523572,61.415178 35.172803,45.262221 26.553742,27.484894 19.697037,38.96312 "
            style="fill: #0a8; stroke-width: 21.848"
          />
          <path
            d="m25.524 61.415 9.6492-16.153 24.039 1.1272-8.8242 14.772z"
            points="35.172803,45.262221 59.211442,46.389468 50.387288,61.161232 25.523572,61.415178 "
            style="fill: #afe; stroke-width: 21.848"
          />
          <path
            d="m26.554 27.485 8.6191 17.777 24.039 1.1272-14.606-16.976z"
            points="35.172803,45.262221 59.211442,46.389468 44.605926,29.413813 26.553742,27.484894 "
            style="fill: #2affd5; stroke-width: 21.848"
          />
          <path
            d="m19.697 38.963 5.8265 22.452 24.864-0.25395-12.211-20.984z"
            points="25.523572,61.415178 50.387288,61.161232 38.176413,40.176914 19.697037,38.96312 "
            style="fill-rule: evenodd; fill: #4d4d9f; stroke: none"
          />
          <path
            d="m19.697 38.963 6.8567-11.478 18.052 1.9289-6.4295 10.763z"
            points="26.553742,27.484894 44.605926,29.413813 38.176413,40.176914 19.697037,38.96312 "
            style="fill-rule: evenodd; fill: #353564; stroke: none"
          />
          <path
            d="m38.176 40.177 12.211 20.984 8.8242-14.772-14.606-16.976z"
            points="50.387288,61.161232 59.211442,46.389468 44.605926,29.413813 38.176413,40.176914 "
            style="fill-rule: evenodd; fill: #e9e9ff; stroke: none"
          />
        </g>
      </g>
    </svg>
  </NuxtLink>
</template>

<script>
export default {
  props: ['size'],
}
</script>

<style scoped>
svg {
  transition: 0.5s ease-in-out;
}
svg:hover {
  transform: rotate(30deg);
}
</style>
