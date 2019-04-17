<template>
    <div class="star" :class="starType">
        <span v-for="itemClass in itemClasses" :class="itemClass" class="star-item"></span>
    </div>
</template>

<script type="text/ecmascript-6">
    const LENGTH = 5;
    const CLS_ON = 'on';
    const CLS_HALF = 'half';
    const CLS_OFF = 'off';

    export default {
        props: {
            size: { //传入的size变量,对星星的大小作区分
                type: Number //设置变量类型
            },
            score: { //传入的score变量,评价的分数
                type: Number
            }
        },
        computed: {
            starType() { //通过计算属性,返回组装过的类型,用来对应class类型
                return "star-" + this.size;
            },
            itemClasses() {
                let result = []; //返回的是一个数组,用来遍历输出星星
                let score = Math.floor(this.score *2) / 2;// 向下取整数部分除以2，最终返回数只能为0.5的倍数,计算所有星星的数量
                let hasDecimal = score % 1 !== 0;// 小数部分,控制是否半星
                let integer = Math.floor(score);// 整数部分，控制是否全星
                for(let i=0; i<integer; i++) {
                    result.push(CLS_ON); //一个整数星星就push一个CLS_ON到数组
                }
                if(hasDecimal) { //非整数星星使用half
                    result.push(CLS_HALF);
                }
                while(result.length<LENGTH) { //余下的用无星星补全,使用off
                    result.push(CLS_OFF);
                }
                return result;
            }
        }
    };
</script>

<style lang="stylus" rel="stylesheet/stylus">
@import "../../common/stylus/mixin.styl"

.star
    font-size: 0
    .star-item
        display: inline-block
        background-repeat: no-repeat
    &.star-48
        .star-item
            width: 20px
            height: 20px
            margin-right: 22px
            background-size: 20px 20px
            &:last-child
                margin-right: 0
            &.on
                bg-image("star48_on")
            &.half
                bg-image("star48_half")
            &.off
                bg-image("star48_off")
    &.star-36
        .star-item
            width: 15px
            height: 15px
            margin-right: 6px
            background-size: 15px 15px
            &:last-child
                margin-right: 0
            &.on
                bg-image("star36_on")
            &.half
                bg-image("star36_half")
            &.off
                bg-image("star36_off")
    &.star-24
        .star-item
            width: 10px
            height: 10px
            margin-right: 3px
            background-size: 10px 10px
            &:last-child
                margin-right: 0
            &.on
                bg-image("star24_on")
            &.half
                bg-image("star24_half")
            &.off
                bg-image("star24_off")
</style>

