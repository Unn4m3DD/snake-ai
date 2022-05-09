import { createApp } from 'vue';
import App from './App.vue';


import { library } from '@fortawesome/fontawesome-svg-core'

import { faArrowCircleUp } from '@fortawesome/free-solid-svg-icons'

import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import { Quasar } from 'quasar'
// eslint-disable-next-line
// @ts-ignore
import quasarUserOptions from './quasar-user-options'

library.add(faArrowCircleUp)



createApp(App).use(Quasar, quasarUserOptions).component('font-awesome-icon', FontAwesomeIcon).mount('#app');
