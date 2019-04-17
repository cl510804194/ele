//存储
//传入三个参数,seller的id,要存储的key和value
export function saveToLocal(id, key, value) {
  //需要加上window对象来使用localstorage
  let seller = window.localStorage.__seller__; //使用__只是一种标记写法,标记是自定义的某种编码规范,这里代表这只是seller的数据
  if (!seller) { //第一次生成seller的时候初始化
    seller = {};
    seller[id] = {};
  }
  else {
    seller = JSON.parse(seller); //json字符串需要解析
    if (!seller[id]) { //不同seller的时候初始化
      seller[id] = {};
    }
  }
  seller[id][key] = value; //生成当前的seller对象
  //localStorage只能存储字符串,需要转成json字符串
  window.localStorage.__seller__ = JSON.stringify(seller);
};

export function loadFromLocal(id, key, def) {// 读取收藏商家信息
  let seller = window.localStorage.__seller__;
  if (!seller) { //读取不到返回默认值
    return def;
  }
  seller = JSON.parse(seller)[id]; //json解析
  if (!seller) { //解析失败返回默认值
    return def;
  }
  let ret = seller[key];
  return ret || def; //解析成功但是没有这个seller的id的也返回默认值
};
