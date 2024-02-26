<template>
  <div class="homeBox">
    <el-container style="height: 100%;" direction="vertical">
      <el-header>
        <span style="color:white">
          {{ $t('现地运行操作') }}
        </span>
      </el-header>
      <el-container>
        <el-aside width="300px">
          <div :style="buildSelectImageStyle()" />
          <div>
            <span v-text="selectOprDesc" />
          </div>
          <el-button v-if="selectOprDesc != ''" type="primary" @click="excute()">{{ $t('执行操作') }}</el-button>
        </el-aside>
        <el-main>
          <el-tabs v-model="activeOperateType">
            <el-tab-pane
              v-for="(local_opr_type, local_opr_type_idx) in configJson.local_opr_types"
              :key="local_opr_type_idx"
              :label="local_opr_type.desc"
              :name="local_opr_type.type"
            >
              <div class="operate-image-container">
                <template v-for="(operate, idx) in local_opr_type.operates">
                  <div :key="idx" class="operate">
                    <div class="image" :style="buildImageStyle(operate, local_opr_type, idx)" @click="select(operate, local_opr_type, idx)" />
                    <div class="desc">{{ `${idx+1} ${operate}` }}</div>
                  </div>
                </template>
              </div>
            </el-tab-pane>
          </el-tabs>
        </el-main>
      </el-container>
      <el-footer>
      </el-footer>
    </el-container>
  </div>
</template>

<script>
import { setValue } from '@/api/rtd'
import { getUrl } from '@/api/res'

export default {
  name: 'Localopr',
  data() {
    return {
      activeOperateType: '1',
      selectImagePath: '',
      selectOprType: '',
      selectOprIdx: -1,
      selectOprDesc: '',
      configJson: {
        'local_opr_types':
            [
              {
                'type': '1',
                'desc': '个人防护类',
                'operates':
                  [
                    '戴安全帽',
                    '戴绝缘手套',
                    '戴防护手套',
                    '戴防静电手套',
                    '戴护目镜',
                    '戴耳塞',
                    '戴防毒面具',
                    '穿防护服',
                    '穿绝缘靴',
                    '穿雨衣',
                    '穿雨靴',
                    '带正压呼吸器'
                  ]

              },
              {
                'type': '4',
                'desc': '安全措施类',
                'operates':
                  [
                    '在检修设备与相邻带电设备之间装设遮拦',
                    '在邻近检修设备的屏前屏后装设“运行设备”红布帘',
                    '取下检修设备上“在此工作”标示牌',
                    '拆除检修设备与相邻带电设备之间设遮拦',
                    '拆除邻近检修设备的屏前屏后挂“运行设备”红布帘',
                    '屏蔽ONCALL相关信息',
                    '解除ONCALL屏蔽信息',
                    '收回相关工作票',
                    '监控视频确认现场无人身伤亡风险',
                    '电话确认对侧线路侧刀闸在分闸位置',
                    '检查闸门已平压',
                    '备用1',
                    '备用2',
                    '得令',
                    '检查以上操作无误',
                    '汇报操作完毕',
                    '按照检修人员要求做安措',
                    '按维护人员要求做安措',
                    '拆除相关安全措施',
                    '禁止无关人员入内'
                  ]
              },
              {
                'type': '5',
                'desc': '通知类',
                'operates':
                  [
                    '通知机械ON-CALL人员处理',
                    '通知自动化人员处理',
                    '联系厂内中控室',
                    '汇报运行维护处',
                    '汇报生产技术部',
                    '汇报安全监管部',
                    '汇报公司领导',
                    '汇报总值班调度员',
                    '汇报值班主任',
                    '汇报发电部',
                    '通知维护人员',
                    '通知综合部',
                    '通知检修公司',
                    '通知库坝中心',
                    '接总值班调度员令',
                    '通知专职消防队',
                    '通知建设分公司',
                    '接指挥台令',
                    '汇报指挥台',
                    '得维护值通知故障已处理',
                    '得检修公司通知具备操作条件',
                    '得库坝中心通知具备操作条件',
                    '发送ON-CALL信息',
                    '得维护值通知测试结果',
                    '汇报ON-CALL负责人',
                    '通知检修人员处理',
                    '汇报有关领导',
                    '接中控楼通知',
                    '通知安技部',
                    '汇报值长',
                    '接调度令',
                    '汇报调度',
                    '南网总调',
                    '通知电气人员处理',
                    '汇报运行中心',
                    '通知机械人员处理',
                    '汇报应急指挥办公室主任'
                  ]
              },
              {
                'type': '6',
                'desc': '机组相关操作',
                'operates':
                  [
                    '复归#1机组报警信号',
                    '检查#1机组调速器压力油罐排油泄压完毕',
                    '检查球阀阀体已排空',
                    '携带防汛物资',
                    '携带急救物资',
                    '启动相关通风设备',
                    '停止相关通风设备',
                    '安装临时排水泵',
                    '启动临时排水泵',
                    '停止临时排水泵',
                    '进行灭火',
                    '进行堵漏',
                    '已开展危险点预控分析，交待安全注意事项',
                    '通知机械人员对主轴密封进行处理',
                    '通知机械班组进行处理',
                    '通知机械班落#3机尾水门',
                    '通知机械班落#4机尾水门',
                    '询问机械班确认#1机尾水门已落',
                    '询问机械班确认#2机尾水门已落',
                    '询问机械班确认#3机尾水门已落',
                    '询问机械班确认#4机尾水门已落',
                    '相关工作票已收回，现场具备运行条件',
                    '通知机械班提#1机尾水闸门',
                    '通知机械班提#2机尾水闸门',
                    '通知机械班提#3机尾水闸门',
                    '通知机械班提#4机尾水闸门',
                    '询问机械班确认#1机尾水闸门已开',
                    '询问机械班确认#2机尾水闸门已开',
                    '询问机械班确认#3机尾水闸门已开',
                    '询问机械班确认#4机尾水闸门已开',
                    '通知机械班投#1机检修锁锭',
                    '通知机械班投#2机检修锁锭',
                    '通知机械班投#3机检修锁锭',
                    '通知机械班投#4机检修锁锭',
                    '通知机械班退#1机检修锁锭',
                    '通知机械班退#2机检修锁锭',
                    '通知机械班退#3机检修锁锭',
                    '通知机械班退#4机检修锁锭',
                    '询问电气人员已解除#1机励磁调节器出口开关合信号',
                    '询问电气人员已解除#2机励磁调节器出口开关合信号',
                    '询问电气人员已解除#3机励磁调节器出口开关合信号',
                    '询问电气人员已解除#4机励磁调节器出口开关合信号',
                    '通知电气人员恢复#1机励磁调节器出口开关合信号',
                    '通知电气人员恢复#2机励磁调节器出口开关合信号',
                    '通知电气人员恢复#3机励磁调节器出口开关合信号',
                    '通知电气人员恢复#4机励磁调节器出口开关合信号',
                    '得中控值班人员报告',
                    '做好相关记录'
                  ]
              }
            ]
      }
    }
  },

  mounted() {
  },

  methods: {
    excute() {
      if (this.selectImagePath !== '') {
        this.$confirm(`${this.selectOprDesc}`, this.$t('是否执行现地操作？')).then(() => {
          let varName = 'LOCALOPR_' + this.selectOprType + '_' + (this.selectOprIdx + 1)
          setValue(varName, 1, 'loc')
          this.$notify.success({
            title: this.$t('现地操作成功'),
            message: this.selectOprDesc
          }).catch(() => {})
        })
      }
    },

    select(operate, local_opr_type, idx) {
      let imgPath = operate
      if (local_opr_type.type !== '1') {
        imgPath = 'default'
      }
      imgPath = getUrl(`image/local_opr/${imgPath}.jpg`)
      this.selectImagePath = imgPath
      this.selectOprType = local_opr_type.type
      this.selectOprIdx = idx
      this.selectOprDesc = operate
    },

    buildSelectImageStyle() {
      return {
        display: 'inline-block',
        width: '240px',
        height: '320px',
        'background-image': 'url("' + this.selectImagePath + '")',
        'background-size': 'contain',
        'background-repeat': 'no-repeat',
        'background-position': 'center'
      }
    },

    buildImageStyle(operate, local_opr_type, idx) {
      let imgPath = operate
      if (local_opr_type.type !== '1') {
        imgPath = 'default'
      }
      imgPath = getUrl(`image/local_opr/${imgPath}.jpg`)
      let style = {
        display: 'inline-block',
        width: '80px',
        height: '80px',
        'background-image': 'url("' + imgPath + '")',
        'background-size': 'contain',
        'background-repeat': 'no-repeat',
        'background-position': 'center'
      }

      if (operate === this.selectOprDesc && idx === this.selectOprIdx) {
        style = {
          ... style,
          'border-style': 'solid',
          'border-width': '1px',
          'border-color': 'hotpink'
        }
      }
      return style
    }
  }
}
</script>

<style lang="scss" scoped>
  .el-header {
    display: flex;
    flex-direction: column;
    justify-content: center;
    text-align: center;
    background: #2525af;
  }
  .el-footer {
    background: #2525af;
  }
  .el-aside {
    text-align: center;
    background: white;
  }
  .operate-image-container {
    display: flex;
    flex-wrap: wrap;

    .operate {
      padding: 8px;
      :hover {
        cursor: pointer;
      }
      .desc {
        width: 100px;
        overflow: auto;
        font-size: 16px;
      }
    }
  }
</style>
