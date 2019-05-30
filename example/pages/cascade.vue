<template>
  <cube-page type="cascade-view" title="Cascade">
    <template slot="content">
      <cube-cascade :data="list" title="请选择" @select="select"></cube-cascade>
    </template>
  </cube-page>
</template>

<script type="text/ecmascript-6">
  import CubePage from '../components/cube-page.vue'
  const cascadeData = [
    {
      value: 'Fruit',
      text: 'Fruit',
      children: [
        {
          value: 'Apple',
          text: 'Apple',
          children: [
            {
              value: 1, text: 'One'
            },
            {
              value: 2, text: 'Two'
            }
          ]
        },
        {
          value: 'Orange',
          text: 'Orange',
          children: [
            {
              value: 3, text: 'Three'
            },
            {
              value: 4, text: 'Four'
            }
          ]
        }
      ]
    },
    {
      value: 'Drink',
      text: 'Drink',
      children: [
        {
          value: 'Coffee',
          text: 'Coffee',
          children: [
            {
              value: 1, text: 'One'
            },
            {
              value: 2, text: 'Two'
            }
          ]
        },
        {
          value: 'Tea',
          text: 'Tea',
          children: [
            {
              value: 1, text: 'One'
            },
            {
              value: 3, text: 'Three'
            }
          ]
        }
      ]
    }
  ]
  export default {
    data() {
      return {
        list: cascadeData
      }
    },
    methods: {
      select(vals, idxs, texts) {
        console.log('select', vals, idxs, texts)
      }
    },
    components: {
      CubePage
    }
  }
</script>

<style lang="stylus" rel="stylesheet/stylus">

</style>
