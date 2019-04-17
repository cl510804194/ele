import Vue from 'vue';
import VueRouter from 'vue-router';
import VueResource from 'vue-resource';
import App from './App';
import goods from './components/goods/goods.vue';
import ratings from './components/ratings/ratings.vue';
import seller from './components/seller/seller.vue';
import './common/stylus/index.styl'
Vue.use(VueRouter);
Vue.use(VueResource);// 全局注册vue-resource
const routes = [
  {
    path: '/',
    redirect: '/goods'
  },
  {
    path: '/goods',
    component: goods
  },
  {
    path: '/ratings',
    component: ratings
  },
  {
    path: '/seller',
    component: seller
  },
];
const router = new VueRouter({
  routes,
  linkActiveClass: 'active'
});
new Vue({
  el: '#app',
  router,
  template: '<App/>',
  components: {App}
});