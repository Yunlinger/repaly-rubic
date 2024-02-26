<template>
  <div>
    <div style="display: flex;justify-content: space-evenly;font-size: 10px;text-align: center;position: relative;top: 3px;">
      <div :style="JSON.stringify(info) === '{}' ?'cursor: not-allowed;':'cursor: pointer'" @click="JSON.stringify(info) === '{}' ?checkedNull():stopProjects()">
        <img :src="stopImg" :style="JSON.stringify(info) === '{}' ?'filter: grayscale(100%);height:30px;width:30px':'height:30px;width:30px'">
        <br>
        <span>冻结</span>
      </div>
      <div :style="JSON.stringify(info) === '{}' ?'cursor: not-allowed;':'cursor: pointer'" @click="JSON.stringify(info) === '{}' ?checkedNull():startProjects()">
        <img :src="startImg" :style="JSON.stringify(info) === '{}' ?'filter: grayscale(100%);height:30px;width:30px':'height:30px;width:30px'">
        <br>
        <span>运行</span>
      </div>
    </div>

    <el-dialog
      :visible.sync="dialogStartTraining"
      width="50%"
    >
      <span class="dialogTitle">开始培训</span>
      <div>
        <div class="startTrainTop">
          <div class="startTrainTop_left">启动模式</div>
          <div class="startTrainTop_right">
            <div class="startTrainTop_right_left">
              <img :src="startMod?singlenotcheckImg:singlecheckImg" class="startTrainTop_right_left_left" @click="startModChange(false)">
              <div class="startTrainTop_right_left_right">单人启动</div>
            </div>
            <div class="startTrainTop_right_right">
              <img :src="startMod?singlecheckImg:singlenotcheckImg" class="startTrainTop_right_right_left" @click="startModChange(true)">
              <div class="startTrainTop_right_right_right">当前组启动</div>
            </div>
          </div>
        </div>
        <div class="startTrainMid">
          <div class="startTrainMid_left">{{ startMod?"已选组":"已选学员" }}</div>
          <div class="startTrainMid_right">选择试卷/工程工况</div>
        </div>
        <div class="startTrainBot">
          <div class="startTrainBot_left">
            <div v-for="(item,index) in info" :key="index">
              <div class="stuName">{{ item.uname }}</div>
            </div>
          </div>
          <div class="startTrainBot_right">
            <div class="startTrainBot_right_top">
              <el-select v-model="TrainOption" placeholder="请选择">
                <el-option
                  v-for="item in options"
                  :key="item.value"
                  :label="item.label"
                  :value="item.value"
                >
                </el-option>
              </el-select>
            </div>
            <div class="startTrainBot_right_bot">
              <!-- <div v-for="(item,index) in questions" :key="index">
                <div :class="getQuestionsStyle(item.id)" @click="checkedQuestions(item)">
                  <div :class="Object.keys(questionChecked).includes(item.id.toString())?'paperName':''">
                    {{ item.name+'('+item.count+'题)' }}
                  </div>
                  <img v-if="Object.keys(questionChecked).includes(item.id.toString())" :src="paperCheckedImg" class="papaerCheckedImg">
                </div>
              </div> -->
              <div v-for="(item,index) in paper" :key="index">
                <div :class="getPaperStyle(item.ID)" @click="checkedPaper(item)">
                  <div :class="paperCheckedID === item.ID?'paperName':'paperNameGrey'">
                    {{ item.name }}
                  </div>
                  <img v-if="paperCheckedID === item.ID" :src="paperCheckedImg" class="papaerCheckedImg">
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <span slot="footer" class="dialog-footer">
        <el-button @click="dialogStartTraining = false">取 消</el-button>
        <el-button type="primary" @click="startCase()">开始培训</el-button>
      </span>
    </el-dialog>

    <el-dialog
      title="提示"
      :visible.sync="dialogStop"
      width="30%"
    >
      <span>这是一段信息</span>
      <span slot="footer" class="dialog-footer">
        <el-button @click="dialogStop = false">取 消</el-button>
        <el-button type="primary" @click="stopCase()">停止</el-button>
      </span>
    </el-dialog>

    <el-dialog
      title="提示"
      :visible.sync="dialogFreeze"
      width="30%"
    >
      <span>冻结</span>
      <span slot="footer" class="dialog-footer">
        <el-button @click="dialogFreeze = false">取 消</el-button>
        <el-button type="primary" @click="stopProjects()">确 定</el-button>
      </span>
    </el-dialog>

    <el-dialog
      title="提示"
      :visible.sync="dialogAddAndDec"
      width="30%"
    >
      <span>这是一段信息</span>
      <span slot="footer" class="dialog-footer">
        <el-button @click="dialogAddAndDec = false">取 消</el-button>
        <el-button type="primary" @click="dialogAddAndDec = false">确 定</el-button>
      </span>
    </el-dialog>

    <el-dialog
      title="提示"
      :visible.sync="dialogUnfreeze"
      width="30%"
    >
      <span>这是一段信息</span>
      <span slot="footer" class="dialog-footer">
        <el-button @click="dialogUnfreeze = false">取 消</el-button>
        <el-button type="primary" @click=" startProjects()">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import { mapState } from 'vuex'
import * as eapi from '@/api/exam.js'
import * as papi from '@/api/project.js'
import * as capi from '@/api/case.js'
import * as mapi from '@/api/model.js'
export default {
  name: 'RightSidebarBase',
  props: {
    info: {
      type: Object,
      default: () => { }
    }
  },

  data() {
    return {
      studentChecked: [],
      startImg: require('@/assets/hollysys/start.png'),
      stopImg: require('@/assets/hollysys/stop-f.png'),
      freezeImg: require('@/assets/hollysys/lock-color.png'),
      unfreezeImg: require('@/assets/hollysys/jiesuo.png'),
      addImg: require('@/assets/hollysys/add.png'),
      singlecheckImg: require('@/assets/hollysys/singlecheck.png'),
      singlenotcheckImg: require('@/assets/hollysys/singlenotcheck.png'),
      paperCheckedImg: require('@/assets/hollysys/paperChecked.png'),
      dialogStartTraining: false,
      dialogStop: false,
      dialogFreeze: false,
      dialogAddAndDec: false,
      dialogUnfreeze: false,
      startMod: false,
      options: [
        {
          value: '1',
          label: '从试卷选择'
        },
        {
          value: '2',
          label: '从工程工况选择'
        }
      ],
      TrainOption: '1',
      paper: [

      ],
      paperCheckedID: '',
      questions: [],
      questionChecked: {},
      menuOption: [

      ]
    }
  },

  computed: {

    // store/room 教室配置文件全局保存
    ...mapState({
      project: state => state.room.project,
      setting: state => state.room.setting
    })
  },

  created() {
    this.getPaper()
    this.getQuesions()
  },

  methods: {

    updataPage() {
      this.$forceUpdate()
    },

    startModChange(startMod) {
      this.startMod = startMod
    },
    getQuestionsStyle(id) {
      if (Object.keys(this.questionChecked).includes(id.toString())) {
        return 'paperChecked'
      } else {
        return 'paperNotChecked'
      }
    },
    checkedQuestions(item) {
      if (Object.keys(this.questionChecked).includes(item.id.toString())) {
        delete this.questionChecked[item.id]
        console.log(this.questionChecked)
      } else {
        this.questionChecked[item.id] = item
        console.log(this.questionChecked)
      }
      this.$forceUpdate()
    },

    getPaperStyle(id) {
      if (this.paperCheckedID === id) {
        return 'paperChecked'
      } else {
        return 'paperNotChecked'
      }
    },
    checkedPaper(item) {
      this.paperCheckedID = item.ID
    },

    getPaper() {
      eapi.readPaper().then((res) => {
        res.items.map(it => {
          this.paper.push(it)
        })
      })
      console.log(this.paper)
      console.log(453)
    },

    getQuesions() {
      // eapi.readPaper({})
      eapi.readMenu(0).then(resA => {
        this.menuOption = resA.items
        for (let i in resA.items) {
          eapi.readQuestion({ menuID: resA.items[i].ID }).then((resB) => {
            this.questions.push({
              name: resA.items[i].name,
              count: resB.total,
              id: resA.items[i].ID
            })
          })
        }
      })
    },
    stopProjects() {
      // this.$store.dispatch('show_instances', { project: this.project, model: 'model' })
      for (let i in this.info) {
        console.log(i)
        let params = {
          'rubik.project': this.info[i].p,
          'rubik.model': 'model',
          'rubik.id': this.info[i].i
        }
        mapi.modelStart(false, params).then(res => {
          this.$msg.success(`模型编号${i}停止运算`)
        })
      }
    },
    startProjects() {
      // this.$store.dispatch('show_instances', { project: this.project, model: 'model' })
      for (let i in this.info) {
        console.log(i)
        let params = {
          'rubik.project': this.info[i].p,
          'rubik.model': 'model',
          'rubik.id': this.info[i].i
        }
        mapi.modelStart(true, params).then(res => {
          this.$msg.success(`模型编号${i}开始运算`)
        })
      }
    },
    startCase() {
      if (Object.keys(this.info).length > 1) {
        return
      }
      this.$confirm(' 确定开始培训 ' + this.paperCheckedID + ' ?', '提示', {
        confirmButtonText: '启动',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        console.log(Object.values(this.info)[0].uid)
        return papi.startInstance(this.project, 'model', '测试', Object.values(this.info)[0].uid.toString())
      }).then((res) => {
        this.$store.dispatch('show_instances', { project: this.project, model: 'model', id: Object.keys(this.info)[0].uid })
        return capi.dispatch(res.id)
      }).then(() => {
        return capi.start()
      }).then(() => {
        this.$msg.success(this.paperCheckedID, '启动案例成功')
      }).catch(err => {
        this.$msg.error(err, '启动案例失败')
      })
      // }
    },
    checkedNull() {
      this.$msg.error('未选中学员')
    }
  }
}
</script>

<style scoped>

/* .optionBox {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  grid-gap: 10px;
  justify-items: center;
  align-content: start;
}

.optionBox div {
  width: 90%;
  height: 8vh;
  border-radius: 6px;
  background: #f0f8fb;
  background-color: #697c9e;
  box-shadow: 0px 10px 0px 0px #50607d;
  transition: all .5s;
} */

/* .opbox {
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: lightgray;
  text-align: center;
  cursor: pointer;
} */

/* .opbox img{
   height: 30px;
   width: 30px;
   margin-top: 20%;
} */

/* .opbox span{
  font-size:10px;
  color: white;
} */

.dialogTitle{
  font-weight: bold;
}

.startTrainTop{
    height: 20px;
    width: 345px;
    margin-top: 30px;
    /* background-color: antiquewhite; */
}

.startTrainTop_left{
    line-height: 20px;
    font-size: small;
    height: 20px;
    width: 80px;
    /* background-color: aqua; */
    float: left;
}

.startTrainTop_right{
     height: 20px;
     width: 240px;
     /* background-color: azure; */
     float: right;
}

.startTrainTop_right_left{
     line-height: 20px;
     height: 20px;
     width: 100px;
     float: left;
     /* background-color: rgb(0, 255, 195); */
}

.startTrainTop_right_right{
     line-height: 20px;
     height: 20px;
     width: 100px;
     float: right;
     /* background-color: rgb(0, 255, 195); */
}

.startTrainTop_right_left_left{
    height: 20px;
    width: 20px;
    /* background-color: antiquewhite; */
    float: left;
    cursor: pointer
}

.startTrainTop_right_left_right{
   height: 20px;
   width: 70px;
   /* background-color: antiquewhite; */
   float: right;
}

.startTrainTop_right_right_left{
    height: 20px;
    width: 20px;
    /* background-color: antiquewhite; */
    float: left;
    cursor: pointer
}

.startTrainTop_right_right_right{
   height: 20px;
   width: 70px;
   /* background-color: antiquewhite; */
   float: right;
}

.startTrainMid{
    height: 20px;
    /* width: 265px; */
    /* background-color: antiquewhite; */
    margin-top: 20px;
}

.startTrainMid_left{
    line-height: 20px;
    height: 20px;
    width: 20%;
    /* background-color: aqua; */
    float: left;
}

.startTrainMid_right{
    line-height: 20px;
    height: 20px;
    width: 78%;
    /* background-color: aqua; */
    float: right;
}

.startTrainBot{
    margin-top: 5px;
    height: 300px;
    /* background-color: antiquewhite; */
}

.startTrainBot_left{
    border: 1px solid #f1f1f1;
    height: 300px;
    width: 20%;
    /* background-color: aqua; */
    float: left;
}

.startTrainBot_right{
    height: 300px;
    width: 78%;
    /* background-color: aqua; */
    float: right;
}

.startTrainBot_right_top{
  height: 25px;
  margin-bottom: 10px;
}

.startTrainBot_right_bot{
  border: 1px solid #f1f1f1;
 /* background-color: antiquewhite; */
 height: 265px;
 overflow-y: auto;
}

.stuName{
  height: 20px;
  background-color: #f2f8fe;
  font-size: 11px;
  font-weight: bold;
  line-height: 20px;
  margin-top: 3px;
  padding-left: 4px;
  color: #5d88f7;
}

.paperChecked{
  width: 100%;
  margin-top: 5px;
  height: 20px;
  background-color: #f2f8fe;
  color: #6c94f8;
  line-height: 20px;
  font-size: 12px;
  padding-left: 13px;
  cursor: pointer;
}

.paperName{
  float: left;
}

.paperNotChecked{
  width: 100%;
  margin-top: 5px;
  height: 20px;
  line-height: 20px;
  font-size: 12px;
  padding-left: 13px;
  cursor: pointer;
}

.paperNotChecked :hover{
  color: #6c94f8;
}

.papaerCheckedImg{
  margin-top: 3px;
  float: right;
  height: 15px;
  width: 15px;
  line-height: 15px;
  margin-right: 10px;
  /* background-color: #5d88f7; */
}

.img{
  width: 30px;
  height: 30px;
}
</style>
