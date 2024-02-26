<!-- 信息卡片组件化 -->
<template>
  <div>
    <!-- {{ Object.keys(studentChecked).includes(String(info.id)) && info.name != null }} -->
    <!-- <div :class="getCardStyle()" @click="cardChecked()"> -->
    <el-tooltip placement="right-start" effect="light" :offset="40" :enterable="false" popper-class="card_tooltip">
      <div slot="content" style="padding: 10px;">
        <div v-if="info.name!=null">
          <div class="tipName">{{ info.cname }}</div>
          <div class="tip_info">
            <hr>
            <div>学员机名称:{{ info.hostName }}</div>
            <div>ip地址:{{ info.ip }}</div>
            <div>学员机连接状态:已连接</div>
            <div v-if="conditionStatus.running===false">学员机模型状态:己冻结</div>
            <div v-if="conditionStatus.running===true">学员机模型状态:已启动</div>
            <div v-if="conditionStatus.running===null">学员机模型状态:未连接</div>
            <div>模型速率:{{ conditionStatus.speed }}倍速</div>
            <br>
            <div>分组组名:{{ info.group }}</div>
            <!-- <div>当前试卷：xxxxxxxx开车考试</div> -->
            <div>当前工程:{{ info.project }}</div>
            <div>当前工况:{{ conditionStatus.conditionName }}</div>
            <div v-if="conditionStatus.faultName!=null">
              <div v-for="(item,index) in conditionStatus.faultName" :key="index">
                当前故障{{ index +1 +':'+item }}
              </div>
            </div>
            <div v-else>当前故障：无</div>
          </div>
        </div>
        <div v-else>
          <div class="tipName">学员未登陆</div>
          <div class="tip_info">
            <hr>
            <div>学员机名称:{{ info.hostName }}</div>
            <div>ip地址:{{ info.ip }}</div>
            <div>学员机连接状态：未连接</div>
          </div>
        </div>
      </div>
      <div class="card" :style="{width:maxWidth+'px',height:maxWidth * 80/100+'px'}" @click="cardChecked()">
        <div style="height: 1px; position: relative;transition: all 1s;">
          <img v-if="Object.keys(studentChecked).includes(String(info.id))" :src=" cheackedImg" style="position:relative;z-index: 99;transition: all 1s;" :style="{width:maxWidth/5+'px',height:maxWidth/5+'px',top:-maxWidth/15+'px',right:maxWidth/15+'px',}">
        </div>
        <div v-if="info.name != null" class="computerStartBg" :style="{width:maxWidth-4+'px',height:maxWidth * 80/100+'px'}">
          <div v-if="isSimulationRoom" style="width: 96%;height: 68%;position: relative;top: 10%;left: 2%; float: left;;">
            <div style="position: relative;width: 98%;left: 1%;height: 28%;top:2%;">
              <div style="position: relative;background-color: #ffffff;width: 70%;height: 100%;overflow: hidden;float:left;">
                <div style="position: relative;height: 42%;width: 100%;color: #68b882;" :style="{'font-size':(maxWidth * 80/100/15)+'px','line-height':(maxWidth * 80/100/12)+'px'}">
                  <div style="position: relative;left: 1%;font-weight: bolder; transition: all 1s;">
                    机组:{{ info.project }}
                  </div>
                </div>
                <div style="position: relative;height: 42%;width: 100%;color: #68b882;" :style="{'font-size':(maxWidth * 80/100/15)+'px','line-height':(maxWidth * 80/100/12)+'px'}">
                  <div style="position: relative;left: 1%;font-weight: bolder; transition: all 1s;">
                    工况:{{ conditionStatus.conditionName }}
                  </div></div>
                <div style="position: relative;height: 16%;width: 100%;background-color: #68b882; transition: all 1s;"></div>
              </div>
              <div style="float: right;width: 29%;height: 60%;position: relative;top: 13%;left: 1%;background-color: #aaaaaa;border-radius: 10px;">
                <img :class="conditionStatus.running===true?'breathing-light':''" :src="conditionStatus.running===true?cardStartImg:cardStopImg" style="height: 100%;float: left;position: relative">
                <div style="float: right;height: 100%;width: 65%;float: right;font-weight: bolder; transition: all 1s;" :style="{'font-size':(maxWidth * 80/100/20)+'px','line-height':(maxWidth * 80/100/9)+'px','color':conditionStatus.running==true?'#9cdc6d':'red'}">
                  {{ conditionStatus.time }}
                </div>
              </div>
            </div>
            <div v-if="conditionStatus.faultName != null && conditionStatus.faultName[0]!=null" style="height: 68%;top: 4%;position: relative;width: 98%;left: 1%;">
              <div v-for="(item,index) in conditionStatus.faultName" v-show="index<3" :key="index" style="height: 28%;width: 100%;background-color: rgb(125, 156, 184,0.7);margin-bottom: 3%;border-radius: 15px;">
                <div style="position: relative; transition: all 1s; width: 86%;left: 3%;float: left;overflow: hidden;color: red;font-weight: bolder;" :style="{'font-size':(maxWidth * 80/100/15)+'px','line-height':(maxWidth * 80/100/7)+'px'}">
                  {{ item }}
                </div>
                <img :src="delImg" style="position: relative;float: right; transition: all 1s;height: 50%;top:25%;right: 3%;" @click.stop="delFault(conditionStatus.fault[index])">
              </div>
            </div>
          </div>
          <div v-else style="width: 96%;height: 68%;position: relative;top: 10%;left: 2%; float: left;">
            <img :src="deskImg" style="height: 100%;width: 100%;">
          </div>
          <div v-if="info.name != null" style="position: relative;width: 100%;height: 20%;top:12%">
            <div style="height: 100%; transition: all 1s;width: 40%;position: relative;float: left;left: 31%;top:53%;text-align: center;border-radius: 99px;">
              <div :style="{'font-size':(maxWidth * 80/100/10)+'px','line-height':(maxWidth * 80/100/5)+'px','text-align':'center'}" style="transition: all 1s;">第{{ info.group }}组</div>
            </div>
            <div style="height: 100%;position: relative;float: right;width: 25%left: 1%;bottom: 30%;; transition: all 1s;">
              <img style="height: 100%;position: relative;left:20%; transition: all 1s;" :src="userImg">
              <div style="width: 100%;transition: all 1s;" :style="{'font-size':(maxWidth * 80/100/10)+'px','line-height':(maxWidth * 80/100/9)+'px','text-align':'center'}">{{ info.cname }}</div>
            </div>
          </div>
        </div>
        <div v-else class="computerStopBg" :style="{width:maxWidth-4+'px',height:maxWidth * 80/100+'px'}"></div>
        <div></div>
      </div>
    </el-tooltip>

  </div>
</template>

<script>

import * as utils from '../../../../utils/index'
import * as fapi from '@/api/fault'
import { mapState } from 'vuex'
export default {
  name: 'Card',
  props: {
    info: {
      type: Object,
      default: () => ({
        loginStatus: '未登陆',
        id: '-',
        project: '-',
        condition: '-',
        group: '-',
        ip: ''
      })
    },
    studentChecked: {
      type: Object,
      default: () => ({ })
    },
    maxWidth: {
      type: Number,
      default: 170
    },

    maxHeight: {
      type: Number,
      default: 170
    },

    isSimulationRoom: {
      type: Boolean,
      default: true
    }

  },

  data() {
    return {
      running: null,
      condition: '-',
      visible: false,
      checked: '',
      conditionStatus: {
        conditionName: '-'
      },
      fault: '-',
      logoutImg: require('@/assets/hollysys/logout.png'),
      loginImg: require('@/assets/hollysys/login.png'),
      startedImg: require('@/assets/hollysys/started.png'),
      stopedImg: require('@/assets/hollysys/stoped.png'),
      freezedImg: require('@/assets/hollysys/freezed.png'),
      cardImg: require('@/assets/hollysys/cardBg.png'),
      connectImg: require('@/assets/hollysys/connectIcon.png'),
      userImg: require('@/assets/hollysys/userLogin.jpg'),
      cardStartImg: require('@/assets/hollysys/card-start.png'),
      cardStopImg: require('@/assets/hollysys/card-stop.png'),
      delImg: require('@/assets/hollysys/del.png'),
      cheackedImg: require('@/assets/hollysys/cardChecked.png'),
      deskImg: require('@/assets/hollysys/deskdemo.png')
    }
  },

  computed: {
    // store/room 教室配置文件全局保存
    ...mapState({
      project: state => state.room.project,
      setting: state => state.room.setting
    })
  },
  mounted() {
    this.$on('global:store.updateInst', (inst) => {
      if (inst.project === this.project && inst.id === this.info.group) {
        this.conditionStatus = JSON.parse(JSON.stringify(inst))
        this.conditionStatus.time = utils.formatModelTimeString(this.conditionStatus.time)
        if (inst.faultName != null) {
          this.fault = ''
          for (let i in this.conditionStatus.faultName) {
            if (this.fault === '') {
              this.fault = this.conditionStatus.faultName[i]
            } else {
              this.fault = this.fault + ',' + this.conditionStatus.faultName[i]
            }
          }
        } else {
          this.fault = '-'
        }
      }
    })
  },

  beforeUpdate() {
    if (this.info.condition != null) {
      this.conditionStatus = JSON.parse(JSON.stringify(this.info.condition))
      this.conditionStatus.time = utils.formatModelTimeString(this.conditionStatus.time)
      this.info.condition = null
      this.updataPage()
    }
  },

  methods: {

    updataPage() {
      this.$forceUpdate()
    },

    delFault(id) {
      let params = {
        'rubik.project': this.info.projectName,
        'rubik.model': 'model',
        'rubik.id': this.info.group
      }

      let item = {
        id: id
      }

      fapi.stops(item, params).then(() => {
        this.updataPage()
      })
    },
    cardChecked() {
      if (this.info.name != null) {
        // this.checked = !this.checked
        // console.log(this.checked)
        if (Object.keys(this.studentChecked).includes(String(this.info.id)) === false) {
          this.$parent.studentCheckedAdd(this.info)
        } else {
          this.$parent.studentCheckedDel(this.info)
        }
      }
      this.updataPage()
    },

    isCheckedAll(isCheacked) {
      if (isCheacked && this.info.name != null) {
        this.checked = isCheacked
      }
      if (!isCheacked && this.info.name != null) {
        this.checked = isCheacked
      }
    },

    getCardStyle() {
      if (this.checked && this.info.name != null) {
        return 'card_checked'
      } else {
        return 'card'
      }
    }
  },
  formatModelTimeString(ms) {
    if (typeof ms !== 'number') {
      return ''
    }
    let second = Math.floor((ms || 0) / 1000)
    let hour = Math.floor(second / 3600)
    let min = Math.floor((second - 3600 * hour) / 60)
    second = second % 60
    if (second < 10) {
      second = '0' + second
    }
    if (min < 10) {
      min = '0' + min
    }
    if (hour < 10) {
      hour = '0' + hour
    }
    return hour + ':' + min + ':' + second
  }
}
</script>

<style scoped>
.card{
   /* border: 2px solid black; */
   cursor: pointer;
   transition: all 1s;
}

.computerStopBg{
   /* width: 170px;
   height: 160px; */
   /* position: relative; */
   /* top: 10px; */
   /* margin: 0 auto; */
   background-image: url(../../../../assets/hollysys/computer-stop.jpg);
   background-repeat: no-repeat;
   background-position: center;
   background-size: contain;
   transition: all 1s;
}

.computerStartBg{
   /* width: 170px;
   height: 160px; */
   /* position: relative; */
   /* top: 10px; */
   /* margin: 0 auto; */
   background-image: url(../../../../assets/hollysys/computer-start.jpg);
   background-repeat: no-repeat;
   background-position: center;
  background-size: contain;
  transition: all 1s;
}

.cmbottom_right_stoped_right{
  color: #d9d9d9;
  transition: all 1s;
}

.tipName{
   font-weight: bold;
   transition: all 1s;
}

.tip_info{
  line-height: 15px;
  font-size: 10px;
  transition: all 1s;
}

@keyframes breathe {
  0% {
    opacity: 0.2;
    transform: scale(1);
  }
  50% {
    opacity: 1;
    transform: scale(1.2);
  }
  100% {
    opacity: 0.2;
    transform: scale(1);
  }
}
.breathing-light {
  animation: breathe 1.5s infinite;
  transition: all 1s;
}

</style>

<style>
.card_tooltip{
   background: #ffffff !important;
   box-shadow: 0px 0px  10px rgba(0.1, 0.1, 0.1, 0.1);
   border: 0px !important;
   padding: 0px;
}
.card_tooltip[x-placement^="right"] .popper__arrow {
  border-right-color: #ffffff !important;
  /* background: #f7ebdf !important; */
  box-shadow: 0 8px 16px rgba(0.1, 0.1, 0.1, 0.1);
}

.card_tooltip[x-placement^=right] .popper__arrow:after {
    border-right-color: #ffffe3 !important;
  }

  .card_tooltip[x-placement^="top"] .popper__arrow {
  border-top-color: #ffffff !important;
  /* background: #f7ebdf !important; */
  box-shadow: 0 8px 16px rgba(0.1, 0.1, 0.1, 0.1);
}

.card_tooltip[x-placement^=top] .popper__arrow:after {
    border-top-color: #ffffe3 !important;
  }
</style>

