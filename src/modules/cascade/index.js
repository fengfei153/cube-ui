import Cascade from '../../components/cascade/cascade.vue'
import Locale from '../../common/locale'

Cascade.install = function (Vue) {
  Vue.component(Cascade.name, Cascade)
  Locale.install(Vue)
}

export default Cascade
