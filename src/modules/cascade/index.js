import FixedPicker from '../../components/cascade/fixed-picker.vue'
import Cascade from '../../components/cascade/cascade.vue'
import Locale from '../../common/locale'

Cascade.install = function (Vue) {
  Vue.component(FixedPicker.name, FixedPicker)
  Vue.component(Cascade.name, Cascade)
  Locale.install(Vue)
}

Cascade.FixedPicker = FixedPicker

export default Cascade
