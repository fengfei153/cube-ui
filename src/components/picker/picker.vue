<template>
  <transition name="cube-picker-fade">
    <!-- Transition animation need use with v-show in the same template. -->
    <cube-popup
      type="picker"
      :mask="true"
      :center="false"
      :z-index="zIndex"
      v-show="isVisible"
      @touchmove.prevent
      @mask-click="maskClick">
      <transition name="cube-picker-move">
        <div class="cube-picker-panel cube-safe-area-pb" v-show="isVisible" @click.stop>
          <div class="cube-picker-choose border-bottom-1px">
            <span class="cube-picker-cancel" @click="cancel">{{_cancelTxt}}</span>
            <span class="cube-picker-confirm" @click="confirm">{{_confirmTxt}}</span>
            <div class="cube-picker-title-group">
              <h1 class="cube-picker-title" v-html="title"></h1>
              <h2 v-if="subtitle" class="cube-picker-subtitle" v-html="subtitle"></h2>
            </div>
          </div>

          <div class="cube-picker-content">
            <i class="border-bottom-1px"></i>
            <i class="border-top-1px"></i>
            <div class="cube-picker-wheel-wrapper" ref="wheelWrapper">
              <div v-for="(data,index) in finalData" :key="index">
                <!-- The class name of the ul and li need be configured to BetterScroll. -->
                <ul class="cube-picker-wheel-scroll">
                  <li v-for="(item,index) in data" class="cube-picker-wheel-item" :key="index" v-html="item[textKey]">
                  </li>
                </ul>
              </div>
            </div>
          </div>

          <div class="cube-picker-footer"></div>
        </div>
      </transition>
    </cube-popup>
  </transition>
</template>

<script type="text/ecmascript-6">
  import BScroll from 'better-scroll'
  import CubePopup from '../popup/popup.vue'
  import visibilityMixin from '../../common/mixins/visibility'
  import popupMixin from '../../common/mixins/popup'
  import basicPickerMixin from '../../common/mixins/basic-picker'
  import pickerMixin from '../../common/mixins/picker'
  import localeMixin from '../../common/mixins/locale'

  const COMPONENT_NAME = 'cube-picker'

  const EVENT_SELECT = 'select'
  const EVENT_VALUE_CHANGE = 'value-change'
  const EVENT_CANCEL = 'cancel'
  const EVENT_CHANGE = 'change'

  export default {
    name: COMPONENT_NAME,
    mixins: [visibilityMixin, popupMixin, basicPickerMixin, pickerMixin, localeMixin],
    props: {
      pending: {
        type: Boolean,
        default: false
      }
    },
    data() {
      return {
        finalData: this.data.slice()
      }
    },
    created() {
      this._values = []
      this._indexes = this.selectedIndex
    },
    methods: {
      confirm() {
        if (!this._canConfirm()) {
          return
        }
        this.hide()

        let changed = false
        let pickerSelectedText = []

        const length = this.finalData.length
        const oldLength = this._values.length

        // when column count has changed.
        if (oldLength !== length) {
          changed = true
          oldLength > length && (this._values.length = this._indexes.length = length)
        }

        for (let i = 0; i < length; i++) {
          let index = this.wheels[i].getSelectedIndex()
          this._indexes[i] = index

          let value = null
          let text = ''
          if (this.finalData[i].length) {
            value = this.finalData[i][index][this.valueKey]
            text = this.finalData[i][index][this.textKey]
          }
          if (this._values[i] !== value) {
            changed = true
          }
          this._values[i] = value
          pickerSelectedText[i] = text
        }

        this.$emit(EVENT_SELECT, this._values, this._indexes, pickerSelectedText)

        if (changed) {
          this.$emit(EVENT_VALUE_CHANGE, this._values, this._indexes, pickerSelectedText)
        }
      },
      maskClick() {
        this.maskClosable && this.cancel()
      },
      cancel() {
        this.hide()
        this.$emit(EVENT_CANCEL)
      },
      show() {
        if (this.isVisible) {
          return
        }

        this.isVisible = true
        if (!this.wheels || this.dirty) {
          this.$nextTick(() => {
            this.wheels = this.wheels || []
            let wheelWrapper = this.$refs.wheelWrapper
            for (let i = 0; i < this.finalData.length; i++) {
              this._createWheel(wheelWrapper, i).enable()
              this.wheels[i].wheelTo(this._indexes[i])
            }
            this.dirty && this._destroyExtraWheels()
            this.dirty = false
          })
        } else {
          for (let i = 0; i < this.finalData.length; i++) {
            this.wheels[i].enable()
            this.wheels[i].wheelTo(this._indexes[i])
          }
        }
      },
      hide() {
        if (!this.isVisible) {
          return
        }
        this.isVisible = false

        for (let i = 0; i < this.finalData.length; i++) {
          this.wheels[i].disable()
        }
      },
      setData(data, selectedIndex) {
        this._indexes = selectedIndex ? [...selectedIndex] : []
        this.finalData = data.slice()
        if (this.isVisible) {
          this.$nextTick(() => {
            const wheelWrapper = this.$refs.wheelWrapper
            this.finalData.forEach((item, i) => {
              this._createWheel(wheelWrapper, i)
              this.wheels[i].wheelTo(this._indexes[i])
            })
            this._destroyExtraWheels()
          })
        } else {
          this.dirty = true
        }
      },
      refill(datas) {
        let ret = []
        if (!datas.length) {
          return ret
        }
        datas.forEach((data, index) => {
          ret[index] = this.refillColumn(index, data)
        })
        return ret
      },
      refillColumn(index, data) {
        const wheelWrapper = this.$refs.wheelWrapper
        let scroll = wheelWrapper.children[index].querySelector('.cube-picker-wheel-scroll')
        let wheel = this.wheels ? this.wheels[index] : false
        let dist = 0
        if (scroll && wheel) {
          let oldData = this.finalData[index]
          this.$set(this.finalData, index, data)
          let selectedIndex = wheel.getSelectedIndex()
          if (oldData.length) {
            let oldValue = oldData[selectedIndex][this.valueKey]
            for (let i = 0; i < data.length; i++) {
              if (data[i][this.valueKey] === oldValue) {
                dist = i
                break
              }
            }
          }
          this._indexes[index] = dist
          this.$nextTick(() => {
            // recreate wheel so that the wrapperHeight will be correct.
            wheel = this._createWheel(wheelWrapper, index)
            wheel.wheelTo(dist)
          })
        }
        return dist
      },
      scrollTo(index, dist) {
        const wheel = this.wheels[index]
        this._indexes[index] = dist
        wheel.wheelTo(dist)
      },
      refresh() {
        this.$nextTick(() => {
          this.wheels.forEach((wheel) => {
            wheel.refresh()
          })
        })
      },
      _createWheel(wheelWrapper, i) {
        if (!this.wheels[i]) {
          const wheel = this.wheels[i] = new BScroll(wheelWrapper.children[i], {
            wheel: {
              selectedIndex: this._indexes[i] || 0,
              wheelWrapperClass: 'cube-picker-wheel-scroll',
              wheelItemClass: 'cube-picker-wheel-item'
            },
            swipeTime: this.swipeTime,
            observeDOM: false
          })
          wheel.on('scrollEnd', () => {
            this.$emit(EVENT_CHANGE, i, wheel.getSelectedIndex())
          })
        } else {
          this.wheels[i].refresh()
        }
        return this.wheels[i]
      },
      _destroyExtraWheels() {
        const dataLength = this.finalData.length
        if (this.wheels.length > dataLength) {
          const extraWheels = this.wheels.splice(dataLength)
          extraWheels.forEach((wheel) => {
            wheel.destroy()
          })
        }
      },
      _canConfirm() {
        return !this.pending && this.wheels.every((wheel) => {
          return !wheel.isInTransition
        })
      }
    },
    beforeDestroy() {
      this.wheels && this.wheels.forEach((wheel) => {
        wheel.destroy()
      })
      this.wheels = null
    },
    components: {
      CubePopup
    }
  }
</script>

<style lang="stylus" rel="stylesheet/stylus">
  @require "../../common/stylus/picker.styl"
</style>
