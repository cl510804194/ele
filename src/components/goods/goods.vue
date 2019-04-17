<template>
  <div>
    <div class="goods">
      <div class="menu-wrapper" ref="menuWrapper">
        <ul class="list-left">
          <li v-for="(item,index) in goods" class="menu-item" :class="{'current':currentIndex===index}" @click="selectMenu(index,$event)" ref="menuList">
            <span class="text border-1px">
              <span v-show="item.type>0" class="icon" :class="classMap[item.type]"></span>{{item.name}}
            </span>
          </li>
        </ul>
      </div>
      <div class="foods-wrapper" ref="foodsWrapper">
        <ul class="list-right">
          <li v-for="item in goods" class="food-list" ref="foodList">
            <h1 class="title">{{item.name}}</h1>
            <ul class="list-right">
              <li @click="selectFood(food,$event)" v-for="food in item.foods" class="food-item border-1px">
                <div class="icon">
                  <img width="57" height="57" :src="food.icon">
                </div>
                <div class="content">
                  <h2 class="name">{{food.name}}</h2>
                  <p class="desc">{{food.description}}</p>
                  <div class="extra">
                    <span class="count">月售{{food.sellCount}}份</span><span>好评率{{food.rating}}%</span>
                  </div>
                  <div class="price">
                    <span class="now">￥{{food.price}}</span><span class="old" v-show="food.oldPrice">￥{{food.oldPrice}}</span>
                  </div>
                  <div class="cartcontrol-wrapper">
                    <cartcontrol @add="addFood" :food="food"></cartcontrol>
                  </div>
                </div>
              </li>
            </ul>
          </li>
        </ul>
      </div>
      <shopcart ref="shopcart" :selectFoods="selectFoods" :deliveryPrice="seller.deliveryPrice" :minPrice="seller.minPrice"></shopcart>
    </div>
    <food @add="addFood" :food="selectedFood" ref="food"></food>
  </div>
</template>

<script type="text/ecmascript-6">
  import BScroll from 'better-scroll';
  import shopcart from '../shopcart/shopcart.vue';
  import cartcontrol from '../cartcontrol/cartcontrol.vue';
  import food from '../food/food.vue';
  const ERR_OK = 0;
  export default {
    props: {
      seller: {
        type: Object
      }
    },
    data() {
      return {
        goods: [],
        listHeight: [], //用来储存foods区域的各个区块的高度(clientHeight)
        scrollY: 0, //用来存储foods区域的滚动的Y坐标
        selectedFood: {} //用来存储foods区域的滚动的Y坐标
      };
    },
    computed: {
      currentIndex() { //计算到达哪个区域的区间的时候的对应的索引值
        for (let i = 0; i < this.listHeight.length; i++) {
          let height1 = this.listHeight[i]; //当前menu子块的高度
          let height2 = this.listHeight[i + 1]; //下一个menu子块的高度
          //滚动到底部的时候,height2为undefined,需要考虑这种情况
          //需要确定是在两个menu子块的高度区间
          if (!height2 || (this.scrollY >= height1 && this.scrollY < height2)) {
            this._followScroll(i);
            return i; //返回这个menu子块的索引
          }
        }
        return 0;
      },
      selectFoods() { //自动将所有的goods.food添加一个count属性,方便做数量运算
        let foods = [];
        this.goods.forEach((good) => {
          good.foods.forEach((food) => {
            if (food.count) {
              foods.push(food);
            }
          });
        });
        return foods;
      }
    },
    created() {
      this.classMap = ['decrease', 'discount', 'special', 'invoice', 'guarantee'];
      this.$http.get('/api/goods').then((response) => {
        response = response.body;
        if (response.errno === ERR_OK) {
          this.goods = response.data;
          this.$nextTick(() => { //使用$nextTick来等待异步完成之后更新dom
            this._initScroll(); //绑定滚动dom
            this._calculateHeight(); //计算foods区域的各个区域的高度
          });
        }
      });
    },
    methods: {
      selectMenu(index, event) {
        if (!event._constructed) { //忽略掉BScroll的事件
          return;
        }
        let foodList = this.$refs.foodList;
        let el = foodList[index]; //类似jump to的功能,通过这个方法,跳转到指定的dom
        this.foodsScroll.scrollToElement(el, 300);
      },
      selectFood(food, event) {
        if (!event._constructed) {
          return;
        }
        this.selectedFood = food;
        this.$refs.food.show();
      },
      addFood(target) {
        this._drop(target);
      },
      _drop(target) { // 体验优化,异步执行下落动画
        this.$nextTick(() => {
          this.$refs.shopcart.drop(target); //调用shopcart的下落动画
        });
      },
      _initScroll() { //初始化scroll区域
        this.meunScroll = new BScroll(this.$refs.menuWrapper, {
          click: true //结合BScroll的接口使用,是否将click事件传递,默认被拦截了
        });
        this.foodsScroll = new BScroll(this.$refs.foodsWrapper, {
          click: true,
          probeType: 3 //结合BScroll的接口使用,3实时派发scroll事件
        });
        this.foodsScroll.on('scroll', (pos) => { //结合BScroll的接口使用,监听scroll事件(实时派发的),并获取鼠标坐标
          // 判断滑动方向，避免下拉时分类高亮错误（如第一分类商品数量为1时，下拉使得第二分类高亮）
          if (pos.y <= 0) {
            this.scrollY = Math.abs(Math.round(pos.y)); //滚动坐标会出现负的,并且是小数,所以需要处理一下
          }
        });
      },
      _calculateHeight() {
        let foodList = this.$refs.foodList; //获取每一个food的dom对象
        let height = 0;
        this.listHeight.push(height); //初始化第一个高度为0
        for (let i = 0; i < foodList.length; i++) {
          let item = foodList[i]; //每一个item都是刚才获取的food的每一个dom
          height += item.clientHeight; //主要是为了获取每一个foods内部块的高度
          this.listHeight.push(height);
        }
      },
      _followScroll(index) {
        let menuList = this.$refs.menuList;
        let el = menuList[index];
        this.meunScroll.scrollToElement(el, 300, 0, -100);
      }
    },
    components: {
      shopcart,
      cartcontrol,
      food
    }
  };
</script>

<style lang="stylus" rel="stylesheet/stylus">
  @import "../../common/stylus/mixin.styl"
  .goods
    display: flex
    position: absolute
    top: 174px
    bottom: 46px
    width: 100%
    overflow: hidden
    .menu-wrapper
      flex: 0 0 80px
      width: 80px
      background: #f3f5f7
      .list-left
        list-style-type: none
        padding-top: 0
        padding-left: 0
        .menu-item
          display: table
          height: 54px
          width: 56px
          padding: 0 12px
          line-height: 14px
          &.current
            position: relative
            z-index: 10
            margin-top: -1px
            background: #fff
            font-weight: 700
            .text
              border-none()
          .icon
            display: inline-block
            vertical-align: top
            width: 12px
            height: 12px
            margin-right: 2px
            background-size: 12px 12px
            background-repeat: no-repeat
            &.decrease
              bg-image('decrease_3')
            &.discount
              bg-image('discount_3')
            &.guarantee
              bg-image('guarantee_3')
            &.invoice
              bg-image('invoice_3')
            &.special
              bg-image('special_3')
          .text
            display: table-cell
            width: 56px
            vertical-align: middle
            border-1px(rgba(7, 17, 27, 0.1))
            font-size: 12px
    .foods-wrapper
      flex: 1
      .list-right
        list-style-type: none
        padding-top: 0
        padding-left: 0
        .food-list
          .title
            padding-left: 14px
            height: 26px
            line-height: 26px
            border-left: 2px solid #d9dde1
            font-size: 12px
            color: rgb(147, 153, 159)
            background: #f3f5f7
          .food-item
            display: flex
            margin: 18px
            padding-bottom: 18px
            border-1px(rgba(7, 17, 27, 0.1))
            &:last-child
              border-none()
              margin-bottom: 0
            .icon
              flex: 0 0 57px
              margin-right: 10px
            .content
              flex: 1
              .name
                margin: 2px 0 8px 0
                height: 14px
                line-height: 14px
                font-size: 14px
                color: rgb(7, 17, 27)
              .desc, .extra
                line-height: 10px
                font-size: 10px
                color: rgb(147, 153, 159)
              .desc
                line-height: 12px
                margin-bottom: 8px
              .extra
                .count
                  margin-right: 12px
              .price
                font-weight: 700
                line-height: 24px
                .now
                  margin-right: 8px
                  font-size: 14px
                  color: rgb(240, 20, 20)
                .old
                  text-decoration: line-through
                  font-size: 10px
                  color: rgb(147, 153, 159)
              .cartcontrol-wrapper
                position: absolute
                right: 0
                bottom: 12px
</style>