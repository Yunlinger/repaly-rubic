<template>
  <div class="tpl">
    <div class="header">
      <h1 class="header-title">rubik 教练员台</h1>
    </div>
    <div class="wrapper">
      <div class="content">
        <div class="col col-l">
          <div class="xpanel-wrapper xpanel-wrapper-60">
            <box>
              <div class="xpanel no-bg">
                <div class="title">故障</div>
                <div class="withtitle">
                  <fault />
                </div>
              </div>
            </box>
          </div>
          <div class="xpanel-wrapper xpanel-wrapper-40">
            <box>
              <div class="xpanel no-bg">
                <div class="title">工况</div>
                <div class="withtitle">
                  <condition />
                </div>
              </div>
            </box>
          </div>
        </div>
        <div class="col col-c">
          <div class="xpanel-wrapper xpanel-wrapper-25">
            <div class="xpanel no-bg">
              <div class="withouttitle">
                <mainparam />
              </div>
            </div>
          </div>
          <div class="xpanel-wrapper xpanel-wrapper-75">
            <box>
              <div class="xpanel no-bg">
                <div class="withouttitle">
                  <chart />
                </div>
              </div>
            </box>
          </div>
        </div>
        <div class="col col-r">
          <div class="xpanel-wrapper xpanel-wrapper-40">
            <box>
              <div class="xpanel no-bg">
                <div class="title">状态</div>
                <div class="withtitle">
                  <modelstate />
                </div>
              </div>
            </box>
          </div>
          <div class="xpanel-wrapper xpanel-wrapper-60">
            <box>
              <div class="xpanel no-bg">
                <div class="title">分组</div>
                <div class="withtitle">
                  <manage />
                </div>
              </div>
            </box>
          </div>
          <!-- <div class="xpanel-wrapper xpanel-wrapper-30">
            <box>
              <div class="xpanel no-bg">
                <div class="title">滚动消息</div>
              </div>
            </box>
          </div> -->
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import box from './component/box'
import condition from './condition'
import fault from './fault'
import chart from './chart'
import manage from './manage'
import mainparam from './mainparam'
import modelstate from './modelstate'

export default {
  name: 'Teacher',
  components: {
    box,
    condition,
    fault,
    chart,
    manage,
    mainparam,
    modelstate
  }
}
</script>
<style src="./index.css" scoped></style>
<style lang="scss" scoped>
  .xpanel {
    .withtitle {
      position: relative;
      width: 100%;
      height: calc(100% - 50px);
      z-index: 1;
      overflow: auto;
      padding: 12px;
    }
    .withouttitle {
      position: relative;
      width: 100%;
      height: calc(100%);
      z-index: 1;
      overflow: auto;
      padding: 12px;
    }
  }
</style>

