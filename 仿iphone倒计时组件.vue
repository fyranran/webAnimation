<template>
  <!-- <VueDragResize :isActive="true" :w="200" :h="200" > -->
  <div class="bellwrap dragDiv" @drop="drop($event)" @dragover="drop($event)" @dragleave="drop($event)"
    @dragenter="drop($event)" :style="`left: ${moveleft};top: ${movetop}`" ref="dragDiv" @mousedown="putDown">
    <div class="timepicker">
      <div class="close" @click.stop="closetimepicker">
        <i class="iconfont icon-off"></i>
      </div>
      <div class="time">
        <div class="selecttime flex" v-if="!progressVisible">
          <div class="hour_prive">
            <input type="text" v-model="hour" />
            <p>小时</p>
          </div>
          <div class="minite">
            <input type="text" v-model="minite" />
            <p>分钟</p>
          </div>
        </div>
        <div class="progress" v-else>
          <!-- <n-progress type="circle" :percentage="percent" :width="210"  /> -->

          <el-progress color="#FE9F0A" type="circle" :width="210" :percentage="percent" />
          <div class="timelist" v-if="!bellshake">
            <span v-if="houred > 0">{{ houred }}:</span><span>{{ miniteed }}</span>:<span>{{ second }}</span>
          </div>
          <div class="endtime" :class="{ opacity50: !suspendStatus, bell: bellshake }">
            <i class="iconfont icon-bell" :class="{ bell: bellshake }"></i>
            <span>{{ endTimeHour }}</span>:<span>{{ endTimeminite }}</span>
          </div>
        </div>
      </div>
      <div class="button" v-if="!bellshake">
        <div class="dd" @click="cancel" :style="`color: ${progressVisible ? '#fff' : 'rgba(255,255,255,0.4)'}`">
          结束
        </div>
        <div class="dd color2" @click="start" v-if="!suspendVisible">开始计时</div>
        <div class="dd" :class="`${suspendStatus ? 'orange2' : 'color2'}`" @click="handleSuspend" v-else>
          <span v-if="suspendStatus">暂停</span>
          <span v-else>继续</span>
        </div>
      </div>
      <div class="button" v-else>
        <div class="dd dd2" style="margin: 0 auto" @click="cancel">重新开始</div>
      </div>
      <div class="bottom" v-if="!bellshake">
        <div class="left" @click="openSelectAudio">
          <span>计时结束时启用</span>
          <span class="select">
            铃声{{ currentAudio }}
            <i class="iconfont icon-yingyongtupianjiantou"></i>
          </span>
        </div>
        <div class="box selectaudiobox" :class="{ on: buttonVisble == true }">
          <div class="top flex">
            <span class="orange" @click="handleCloseAudio(0)">取消</span>
            <span>计时结束时启用</span>
            <span class="orange" @click="handleCloseAudio(1)">设定</span>
          </div>
          <div class="list">
            <el-radio-group v-model="radio1">
              <div class="dd" v-for="(item, index) in audioList" :key="index">
                <el-radio :label="item" size="">铃声{{ index + 1 }}</el-radio>
              </div>
            </el-radio-group>
          </div>
        </div>
      </div>
      <audio controls ref="audioref" id="audio" :src="radio1">
        您的浏览器不支持 audio 元素。
      </audio>
    </div>
  </div>
  <!-- </VueDragResize> -->
</template>
<script lang="ts" setup>
import { computed, onMounted, ref, watch, nextTick, reactive } from "vue";
import { Store, storeToRefs } from "pinia";

// import { useKeepStore } from "@/store/keep";
const bellshake = ref(false);
// const { timepickstate } = storeToRefs(useKeepStore());

const drawer = ref(false);
const drawer2 = ref(false);
const direction = ref("rtl");
const radio1 = ref("");
const oldRadio1 = ref(""); //未修改时的铃声
const dialogVisible = ref(true);
const dialogVisible2 = ref(false);
const buttonVisble = ref(false);
const minite = ref(10);
const hour = ref(0);
const percent = ref(100); //倒计时进度条百分比
const value = ref("");
const houred = ref<any>(0); //倒计时的时分秒
const miniteed = ref<any>(0);
const second = ref<any>(0);
const endTimeHour = ref<any>(0);
const endTimeminite = ref<any>("0");
const audioref = ref();
const sumTime = computed(() => {
  return minite.value * 60 + hour.value * 3600;
});

const progressVisible = ref(false);
const suspendStatus = ref(false); //暂停状态
const suspendVisible = ref(false); //暂停按钮
let i: any = ref(0); //倒计时时间 秒
const audioFiles = import.meta.globEager("./mp3/*.mp3");

const requireURL = (url: string) => {
  try {
    return new URL(url, import.meta.url).href;
  } catch (error) {
    return "";
  }
};
const closetimepicker = () => {
  cancel();
  // useKeepStore().$patch({
  //   timepickstate: false,
  // });
};
const open = () => {
  dialogVisible.value = true;
};
const audioList = computed(() => {
  // return Object.keys(audioFiles).map((item: any) => {
  //     return requireURL(item)
  // })
  return [
    "https://vrar-obs-production.obs.cn-north-4.myhuaweicloud.com/ssc-develop/audio/5/335335754494021ls3.mp3",
    "https://vrar-obs-production.obs.cn-north-4.myhuaweicloud.com/ssc-develop/audio/5/335335753596997ls1.mp3",
    "https://vrar-obs-production.obs.cn-north-4.myhuaweicloud.com/ssc-develop/audio/5/335335753695301ls2.mp3",
    "https://vrar-obs-production.obs.cn-north-4.myhuaweicloud.com/ssc-develop/audio/5/335335753486405ls7.mp3",
    "https://vrar-obs-production.obs.cn-north-4.myhuaweicloud.com/ssc-develop/audio/5/335335751721029ls4.mp3",
    "https://vrar-obs-production.obs.cn-north-4.myhuaweicloud.com/ssc-develop/audio/5/335335751725125ls5.mp3",
    "https://vrar-obs-production.obs.cn-north-4.myhuaweicloud.com/ssc-develop/audio/5/335335751729221ls6.mp3",
  ];
});
const currentAudio = computed(() => {
  let num = 1;
  audioList.value.map((item: any, i: number) => {
    if (radio1.value == item) {
      num = i + 1;
    }
  });
  return num;
});
const audio: any = document.getElementById("audio");
const openSelectAudio = () => {
  buttonVisble.value = true;
  oldRadio1.value = radio1.value;
};
onMounted(() => {
  radio1.value = audioList.value[0];
  nextTick(() => {
    audioref.value.pause();
  });
  // buttonVisble.value = false
  // selectaudiobox
  document.addEventListener(
    "mouseup",
    (e: any) => {
      var _con = document.querySelector(".selectaudiobox");
      if (_con) {
        if (!_con.contains(e.target)) {
          buttonVisble.value = false;
          audioref.value.pause();
        }
      }
    },
    { passive: true }
  );
});
watch(
  () => radio1.value,
  (val) => {
    console.log(val);
    nextTick(() => {
      audioref.value.play();
    });
  }
);
const drop = (e: MouseEvent) => {
  e.preventDefault();
};
const handleCloseAudio = (i: number) => {
  if (i == 0) {
    radio1.value = oldRadio1.value;
    setTimeout(() => {
      audioref.value.pause();
    }, 10);
  }
  buttonVisble.value = false;
  audioref.value.pause();
};
watch(
  () => i.value,
  (val) => {
    const H = Math.floor(val / 3600);
    const M = Math.floor((val % 3600) / 60);
    const S = val % 60;
    houred.value = H;
    miniteed.value = M < 10 ? "0" + M : M;
    second.value = S < 10 ? "0" + S : S;
  },
  { deep: true, immediate: true }
);
const interval: any = ref();
const getTime = () => {
  //获取倒计时完成时候的时间
  const datestring = new Date().getTime();
  const date = new Date(datestring + i.value * 1000);
  const H = date.getHours(); // 小时
  const M = date.getMinutes(); // 分钟
  const S = date.getSeconds();
  endTimeHour.value = H < 10 ? "0" + H : H;
  endTimeminite.value = M < 10 ? "0" + M : M;
  console.log(datestring, "sdsd", H, M, S);
};
const start = () => {
  progressVisible.value = true;
  suspendVisible.value = true;
  if (!suspendStatus.value) {
    i.value = minite.value * 60 + hour.value * 3600;
  }
  getTime();
  suspendStatus.value = true;
  interval.value = setInterval(() => {
    if (i.value > 0) {
      i.value--;
      let progress = document.querySelector(".el-progress-circle__path") as HTMLElement;
      percent.value = (i.value * 100) / sumTime.value;
      // console.log(i.value,'p',percent.value)
    } else {
      clearInterval(interval.value);
      //放音乐
      audioref.value.play();
      bellshake.value = true;
    }
  }, 1000);
};
const handleSuspend = () => {
  //暂停
  clearInterval(interval.value);
  suspendStatus.value = !suspendStatus.value;
  suspendStatus.value ? start() : "";
  audioref.value.pause();
};
const handleContinue = () => {
  //继续
  // start()
};
const cancel = () => {
  clearInterval(interval.value);
  percent.value = 100;
  progressVisible.value = false;
  suspendStatus.value = false;
  suspendVisible.value = false;
  audioref.value.pause();
  bellshake.value = false;
};
const handleClose = (done: () => void) => {
  dialogVisible.value = false;
  cancel();
};
const handleClose2 = (done: () => void) => {
  dialogVisible2.value = false;
};

// 获取DOM元素
const dragDiv = ref();
const moveleft = ref<any>("50%");
const movetop = ref<any>("50%");
// let dragDiv = document.getElementsByClassName('bell')[0] as HTMLElement
// 鼠标按下事件 处理程序
const putDown = (event: MouseEvent) => {
  let isMouseDown = true;
  let isMisoperation: boolean | null = null;

  let offsetX = dragDiv.value.offsetLeft; // 获取当前的x轴距离
  let offsetY = dragDiv.value.offsetTop; // 获取当前的y轴距离
  let innerX = event.clientX; // 获取鼠标在方块内的x轴距
  let innerY = event.clientY; // 获取鼠标在方块内的y轴距

  const startPageX = event.pageX;
  const startPageY = event.pageY;
  // 鼠标移动的时候不停的修改div的left和top值
  document.onmousemove = function (e) {
    const currentPageX = e.pageX;
    const currentPageY = e.pageY;
    if (isMisoperation !== false) {
      isMisoperation =
        Math.abs(startPageX - currentPageX) < 5 &&
        Math.abs(startPageY - currentPageY) < 5;
    }
    if (!isMouseDown || isMisoperation) return;
    const moveX = currentPageX - startPageX;
    const moveY = currentPageY - startPageY;

    // moveleft.value = event.pageX+'px'
    // movetop.value = event.pageY+'px'

    moveleft.value = offsetX + moveX + "px";
    movetop.value = offsetY + moveY + "px";
  };
  // 鼠标抬起时，清除绑定在文档上的mousemove和mouseup事件
  // 否则鼠标抬起后还可以继续拖拽方块
  document.onmouseup = function () {
    isMouseDown = false;
    document.onmousemove = null;
    document.onmouseup = null;
  };
};
</script>

<style>
.el-progress__text {
  display: none;
}

.bellwrap .el-radio__input {
  opacity: 0 !important;
  padding-right: 10px;
}

.bellwrap .is-checked .el-radio__label {
  color: #fff;
}

.bellwrap .is-checked {
  background: url(../PrivatePage/images/checked.png) no-repeat left center;
  background-size: 16px;
}
</style>
<style lang="scss">
#audio {
  position: absolute;
  z-index: -1;
  opacity: 0;
}

.bellwrap {
  width: 260px;
  // height: 450px;
  background: rgb(21, 28, 44);
  // @include key_value("background", "card_bg_1_opacity");
  position: fixed;
  z-index: 9;
  padding: 20px;
  border-radius: 20px;
  cursor: move;
  transform: translate(-130px, -225px);
  // left: 50%;
  // top: 50%;
  // margin-top: -225px;
  // margin-left: -130px;
  box-shadow: 0 0 8px rgba(0, 0, 0, 0.6);
  transition: 0s;
}

.timepicker {
  padding: 10px 0;
  position: relative;

  .close {
    position: absolute;
    right: 0px;
    top: 0px;
    font-size: 14px;
    cursor: pointer;
    transition: 0.5s all ease;
    width: 30px;
    height: 30px;
    text-align: center;

    &:hover {
      transform: scale(1.1);
    }
  }

  .flex {
    display: flex;
    justify-content: space-between;
  }

  .time {
    display: flex;
    justify-content: space-between;
    height: 244px;
    align-items: center;

    .selecttime {
      width: 100%;
      color: #fff;

      input {
        color: #333;
      }

      >div {
        flex: 1;
        text-align: center;
        margin: 74px 0;
      }
    }

    .progress {
      text-align: center;
      margin: 0px auto;
      width: 100%;
      position: relative;
      width: 210px;

      :deep(.el-progress-circle) {
        margin: 0 auto;
      }

      :deep(.el-progress-circle__track) {
        // @include key_value("stroke", "card_bg_1_time");
      }

      .timelist {
        font-size: 44px;
        font-weight: bold;
        position: absolute;
        top: 60px;
        width: 100%;
        text-align: center;
        color: #fff;
      }

      .endtime {
        font-size: 16px;
        color: #80909d;
        position: absolute;
        bottom: 60px;
        width: 100%;
        text-align: center;

        i {
          padding-right: 5px;
        }
      }
    }

    input {
      // background: #222F48;
      // @include key_value("background", "card_bg_1_time4");
      border-radius: 8.1px;
      border: 0;
      font-size: 48px;
      color: #fff;
      width: 74px;
      height: 68px;
      text-align: center;
      margin-bottom: 10px;
    }

    .hour_prive {
      text-align: center;
    }

    .minite {
      text-align: center;
    }
  }

  .button {
    display: flex;
    justify-content: space-between;
    margin-bottom: 27px;
    font-size: 15px;

    span {
      display: block;
    }

    .dd {
      width: 64px;
      height: 64px;
      border-radius: 50%;
      line-height: 64px;
      cursor: pointer;
      text-align: center;
      background: #232E48;
      // @include key_value("background", "card_bg_1_time");

      position: relative;

      &:after {
        width: calc(100% + 4px);
        height: calc(100% + 4px);
        position: absolute;
        display: block;
        content: "";
        border: 1px solid;
        left: -3px;
        top: -3px;
        border-radius: 50%;
        border-color: #232e48;
      }
    }

    .dd2 {
      width: 70px;
      height: 70px;
      line-height: 70px;
      color: #fff;
    }

    .color2 {
      background: rgba(53, 252, 72, 0.3);
      // @include key_value("background", "card_bg_1_time2");

      &:after {
        border-color: rgba(53, 252, 72, 0.3);
        // @include key_value("border-color", "card_bg_1_time2");
      }
    }

    .orange2 {
      background: rgba(254, 159, 10, 0.3);
      // @include key_value("background", "card_bg_1_time3");

      &:after {
        border-color: rgba(254, 159, 10, 0.3);
      }
    }
  }

  .bottom {
    background: #232E48;
    // @include key_value("background", "card_bg_1_time");

    border-radius: 10px;
    height: 40px;
    line-height: 40px;
    position: relative;

    .left {
      padding: 0 10px;
      display: flex;
      font-size: 14px;
      justify-content: space-between;
      cursor: pointer;
      color: #f1f1f1;
    }

    .select {
      font-size: 14px;

      i {
        display: inline-block;
        transform: rotateY(180deg);
      }
    }

    .box {
      background: #232E48;
      // @include key_value("background", "card_bg_1_time4");

      border-radius: 10px;
      padding: 10px;
      position: absolute;
      top: 0px;
      width: 100%;
      transform: translateY(30px);
      opacity: 0;
      transition: 0.5s transform ease;

      .el-radio-group {
        display: block;
      }

      .el-radio {
        color: #fff !important;
      }

      .el-radio__input {
        opacity: 0 !important;
        padding-right: 10px;
      }

      .is-checked {
        .el-radio__label {
          color: #fff;
        }

        background: url(../PrivatePage/images/checked.png) no-repeat left center;
        background-size: 16px;
      }

      .list {
        dd {
          width: 100%;
        }
      }

      &.on {
        opacity: 1;
        transform: translateY(-100px);
      }

      .top {
        font-size: 14px;

        .orange {
          color: #fe9f0a;
          cursor: pointer;
        }
      }

      .list {
        height: 200px;
        overflow: overlay;
      }
    }

    :deep(.box) {
      background: #232E48;
      // @include key_value("background", "card_bg_1_time4");

      border-radius: 10px;
      padding: 10px;
      position: absolute;
      top: 0px;
      width: 100%;
      transform: translateY(30px);
      opacity: 0;
      transition: 0.5s transform ease;

      .el-radio-group {
        display: block;
      }

      .el-radio {
        color: #fff !important;
      }

      .el-radio__input {
        opacity: 0 !important;
        padding-right: 10px;
      }

      .is-checked {
        .el-radio__label {
          color: #fff;
        }

        background: url(../PrivatePage/images/checked.png) no-repeat left center;
        background-size: 16px;
      }

      .list {
        dd {
          width: 100%;
        }
      }

      &.on {
        opacity: 1;
        transform: translateY(-100px);
      }

      .top {
        font-size: 14px;

        .orange {
          color: #fe9f0a;
          cursor: pointer;
        }
      }

      .list {
        height: 200px;
        overflow: overlay;
      }
    }
  }

  .bell {
    display: block;
    font-size: 80px;
    animation: vibrate-1 0.3s linear infinite both;
  }

  @keyframes vibrate-1 {
    0% {
      -webkit-transform: translate(0);
      transform: translate(0);
    }

    20% {
      -webkit-transform: translate(-1px, 1px);
      transform: translate(-1px, 1px);
    }

    40% {
      -webkit-transform: translate(-1px, -1px);
      transform: translate(-1px, -1px);
    }

    60% {
      -webkit-transform: translate(1px, 1px);
      transform: translate(1px, 1px);
    }

    80% {
      -webkit-transform: translate(1px, -1px);
      transform: translate(1px, -1px);
    }

    100% {
      -webkit-transform: translate(0);
      transform: translate(0);
    }
  }
}
</style>
