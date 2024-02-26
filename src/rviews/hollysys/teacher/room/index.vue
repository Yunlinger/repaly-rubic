<template>
  <div class="contains">
    <div style="width: 100%;height: 100%;">
      <div v-if="classRoomNull">
        <div class="top">
          <div>培训模式</div>
          <div class="top_low">培训时长 :00:00:00 | 在线人数: 0/21</div>
        </div>
        <div class="box_md">
          <div>
            <img :src="work" class="cr_pt" />
          </div>
          <span>您当前还未进行教室布局</span>
          <span>请点击下方“新建”按钮进行新建</span>
          <div>
            <button
              style="background-color: rgb(93, 135, 247);cursor: pointer;width: 8%;height: 4vh;border-radius: 5px;"
              @click="creatBand()"
            >
              新 建
            </button>
          </div>
        </div>
      </div>
      <div v-else style="width: 100%;height:100%;position: relative">
        <!-- {{ group }} -->
        <div class="topTool" style="border-bottom:1px solid #8f8f8f;display: flex;justify-content: space-between;" :style="{'width':roomWidth<1180?'1027px':'100%'}">
          <div style="width: 760px;height: 100%;display: flex;justify-content: center;;font-size: 12px;line-height: 20px; position: relative;;left: 30px;">
            <div style="width: 760px;height: 100%; ">
              <div style="width: 500px;height: 60px;float: left;background-color: #d7d7d7;position: relative;top:5px;border-radius:10px ;box-shadow: 0px 0px 8px gray;z-index: 10;">
                <div style="float: left;">
                  <div style="width: 50px;height: 60px;float: left;">
                    <div style=" height: 40px;text-align: center;cursor: pointer;border-right: 1px solid black;position: relative;top: 8px;" @click="checkAllStudent() ">
                      <img :src="isCheckedAll?checkedAllImg:checkedImg" style="height: 25px;width: 25px;position: relative;left: 1px;">
                      <div style="line-height: 12px;">全选</div>
                    </div>
                  </div>
                  <div style="width: 160px;height: 60px;float: right;" :style="{cursor: JSON.stringify(studentChecked) === '{}'?'not-allowed':'pointer'}">
                    <div style="width: 80px;height: 60px;float: left;" @click="JSON.stringify(studentChecked) === '{}' ?checkedNull():startProjects()">
                      <div style="text-align: center;clear: both;">
                        <div style="height: 40px;width: 40px; position: relative;left:  20px;top: 2px;">
                          <img :src="startImg" style="height: 40px;width: 40px;" :style="{'filter':JSON.stringify(studentChecked) === '{}'?'grayscale(100%)':''}"></div>
                        <div>运行</div>
                      </div>
                    </div>
                    <div style="width: 80px;height: 60px;float: right;" @click="JSON.stringify(studentChecked) === '{}' ?checkedNull():stopProjects()">
                      <div style="text-align: center;clear: both;">
                        <div style="height: 40px;width: 40px; position: relative;left:  20px;top: 2px;">
                          <img :src="stopImg" style="height: 40px;width: 40px;" :style="{'filter':JSON.stringify(studentChecked) === '{}'?'grayscale(100%)':''}">
                        </div>
                        <div>冻结</div>
                      </div>
                    </div>
                  </div>
                </div>
                <div style="float: right;">
                  <div style="width: 80px;height: 60px;float: left;">
                    <el-popover
                      v-model="visibles"
                      width="530"
                      placement="bottom"
                      trigger="click"
                      popper-class="teacher_popover"
                    >
                      <el-tabs v-model="activeNamee" type="border-card" style="width: 100%;">
                        <el-tab-pane label="公有工况" name="first">
                          <div ref="pubCondition" style="width: 100%;height:calc(100vh - 200px);overflow: auto;">
                            <el-table
                              :show-header="false"
                              :border="true"
                              :data="conditionList"
                              highlight-current-row
                              class="custom-table"
                            >
                              <el-table-column
                                prop="id"
                                aligen="center"
                                width="60"
                              >
                              </el-table-column>
                              <el-table-column
                                prop="name"
                                label="工况名称"
                              >
                              </el-table-column>
                              <el-table-column
                                width="80"
                                align="center"
                                label="操作"
                              >
                                <template slot-scope="scope">
                                  <!-- <el-button type="text" size="small" @click="switchCondition(scope.row)">加载</el-button> -->
                                  <el-button slot="reference" type="success" @click="switchCondition(scope.row)"><svg t="1705471998747" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="4269" width="12" height="12"><path d="M558.545455 544.256V1024h-93.09091V544.256l-127.185454 90.856727-54.109091-75.752727L512 396.613818l227.84 162.746182-54.109091 75.752727L558.545455 544.256zM1024 558.545455c0 128.535273-104.192 232.727273-232.727273 232.727272h-139.636363v-93.090909h139.636363a139.636364 139.636364 0 0 0 16.756364-278.272l-44.450909-5.306182 3.584-44.660363c0.558545-6.888727 0.837818-13.847273 0.837818-20.852364 0-141.381818-114.618182-256-256-256a256.093091 256.093091 0 0 0-250.786909 204.334546l-5.678546 27.694545-27.22909 7.749818A186.274909 186.274909 0 0 0 93.090909 512a186.181818 186.181818 0 0 0 186.181818 186.181818h93.090909v93.090909h-93.090909C125.044364 791.272727 0 666.228364 0 512c0-116.177455 71.563636-218.298182 176.523636-259.770182A349.253818 349.253818 0 0 1 512 0c188.555636 0 342.178909 149.480727 348.858182 336.407273A232.866909 232.866909 0 0 1 1024 558.545455z" fill="#ffffff" p-id="4270"></path></svg></el-button>

                                  <!-- <el-button v-if="scope.row.id>20" type="text" @click="saveCondition(scope.row)">保存</el-button> -->

                                </template>
                              </el-table-column>
                            </el-table>
                          </div>

                        </el-tab-pane>
                        <el-tab-pane label="私有工况" name="second">
                          <div ref="perCondition" style="width: 100%;height:calc(100vh - 200px);overflow: auto;">
                            <el-table
                              :show-header="false"
                              :border="true"
                              highlight-current-row
                              :data="persConditionList"
                            >

                              <el-table-column
                                prop="id"
                                width="40"
                              >
                              </el-table-column>
                              <el-table-column
                                prop="name"
                              >
                              </el-table-column>
                              <el-table-column
                                width="40"
                              >
                                <template slot-scope="scope">
                                  <el-button slot="reference" type="success" @click="switchCondition(scope.row)"><svg t="1705471998747" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="4269" width="12" height="12"><path d="M558.545455 544.256V1024h-93.09091V544.256l-127.185454 90.856727-54.109091-75.752727L512 396.613818l227.84 162.746182-54.109091 75.752727L558.545455 544.256zM1024 558.545455c0 128.535273-104.192 232.727273-232.727273 232.727272h-139.636363v-93.090909h139.636363a139.636364 139.636364 0 0 0 16.756364-278.272l-44.450909-5.306182 3.584-44.660363c0.558545-6.888727 0.837818-13.847273 0.837818-20.852364 0-141.381818-114.618182-256-256-256a256.093091 256.093091 0 0 0-250.786909 204.334546l-5.678546 27.694545-27.22909 7.749818A186.274909 186.274909 0 0 0 93.090909 512a186.181818 186.181818 0 0 0 186.181818 186.181818h93.090909v93.090909h-93.090909C125.044364 791.272727 0 666.228364 0 512c0-116.177455 71.563636-218.298182 176.523636-259.770182A349.253818 349.253818 0 0 1 512 0c188.555636 0 342.178909 149.480727 348.858182 336.407273A232.866909 232.866909 0 0 1 1024 558.545455z" fill="#ffffff" p-id="4270"></path></svg></el-button>

                                  <!-- <el-button type="text" @click="perSaveCondition(scope.row)">保存</el-button> -->
                                </template>
                              </el-table-column>
                            </el-table>
                          </div>
                        </el-tab-pane>

                      </el-tabs>

                      <div slot="reference" style="text-align: center;cursor: pointer;" :class="JSON.stringify(studentChecked) === '{}'? 'noneClick':''">
                        <div style="height: 40px;width: 40px; position: relative;left:  20px;top: 2px;">
                          <img :src="conditonIcon" style="height: 30px;width: 30px;position: relative;top:5px" :style="{'filter':JSON.stringify(studentChecked) === '{}'?'grayscale(100%)':''}">
                        </div>
                        <div>工况</div>
                      </div>
                    </el-popover>
                  </div>
                  <div style="width: 160px;height: 60px;float: right;">
                    <div style="width: 80px;height: 60px;float: left;">
                      <el-popover
                        v-model="visible"
                        width="530"
                        placement="bottom"
                        trigger="click"
                        popper-class="teacher_popover"
                      >
                        <input
                          v-model="fifterTxt"
                          placeholder="输入关键字进行过滤"
                          style="width: 75%;height: 30px;border: none;background-color: #bacaf161;font-size: 14px;padding-left: 10px;margin-bottom: 4px;border-radius: 4px;"
                          @input="changeTxt(fifterTxt)"
                        />
                        <button style="border: none;outline:none;border-radius:0;background: #67c23a;cursor: pointer;padding: 6px 12px;border-radius: 4px;color: white;margin-left: 10px;" @click="updateTree()"><i class="el-icon-refresh icon-button" /></button>
                        <div>
                          <el-tabs v-if="!fifterTxt" v-model="activeNameee" type="border-card">
                            <el-tab-pane v-for="item,index in faultList" :key="index" :label="item.name" :name="item.id">
                              <div ref="fault" style="width: 100%;height:calc(100vh - 245px);overflow: auto;">
                                <el-table
                                  :show-header="false"
                                  highlight-current-row
                                  :data="item.array"
                                >
                                  <el-table-column width="50" prop="index" align="center">
                                  </el-table-column>
                                  <el-table-column prop="name">
                                  </el-table-column>
                                  <el-table-column width="80" align="center">
                                    <template slot-scope="scope">
                                      <el-select v-if="scope.row.dataType!='ON'" v-model="scope.row.dataType" :width="50" placeholder="程度" @change="changeFaultRange">
                                        <el-option
                                          v-for="items in faultRange"
                                          :key="items.value"
                                          :label="items.text"
                                          :value="items.value"
                                        >
                                        </el-option>
                                      </el-select>
                                    </template>
                                  </el-table-column>
                                  <el-table-column width="80" align="center" label="操作">
                                    <template slot-scope="scope">
                                      <div>
                                        <span>
                                          <el-popconfirm
                                            title="确定投入故障？"
                                            @onConfirm="loadFault(scope.row)"
                                          >
                                            <el-button slot="reference" type="success"><svg t="1705471998747" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="4269" width="12" height="12"><path d="M558.545455 544.256V1024h-93.09091V544.256l-127.185454 90.856727-54.109091-75.752727L512 396.613818l227.84 162.746182-54.109091 75.752727L558.545455 544.256zM1024 558.545455c0 128.535273-104.192 232.727273-232.727273 232.727272h-139.636363v-93.090909h139.636363a139.636364 139.636364 0 0 0 16.756364-278.272l-44.450909-5.306182 3.584-44.660363c0.558545-6.888727 0.837818-13.847273 0.837818-20.852364 0-141.381818-114.618182-256-256-256a256.093091 256.093091 0 0 0-250.786909 204.334546l-5.678546 27.694545-27.22909 7.749818A186.274909 186.274909 0 0 0 93.090909 512a186.181818 186.181818 0 0 0 186.181818 186.181818h93.090909v93.090909h-93.090909C125.044364 791.272727 0 666.228364 0 512c0-116.177455 71.563636-218.298182 176.523636-259.770182A349.253818 349.253818 0 0 1 512 0c188.555636 0 342.178909 149.480727 348.858182 336.407273A232.866909 232.866909 0 0 1 1024 558.545455z" fill="#ffffff" p-id="4270"></path></svg></el-button>

                                          </el-popconfirm>
                                        </span>
                                      </div>
                                    <!-- <el-button type="text" @click="loadFault(scope.row)">投入</el-button> -->
                                    </template>
                                  </el-table-column>
                                </el-table>
                              </div>
                            </el-tab-pane>
                          </el-tabs>
                          <div v-else>
                            <div ref="faults" style="width: 100%;height:calc(100vh - 190px);overflow: auto;">
                              <el-table
                                :show-header="false"
                                highlight-current-row
                                :data="newFaultList"
                              >
                                <el-table-column width="50" prop="index" align="center">
                                </el-table-column>
                                <el-table-column prop="name">
                                </el-table-column>
                                <el-table-column width="80">
                                  <template slot-scope="scope">
                                    <el-select v-if="scope.row.dataType!='ON'" v-model="scope.row.dataType" :width="60" placeholder="程度" @change="changeFaultRange">
                                      <el-option
                                        v-for="items in faultRange"
                                        :key="items.value"
                                        :label="items.text"
                                        :value="items.value"
                                      >
                                      </el-option>
                                    </el-select>
                                  </template>
                                </el-table-column>
                                <el-table-column width="80" align="center" label="操作">
                                  <template slot-scope="scope">
                                    <div>
                                      <span>
                                        <el-popconfirm
                                          title="确定投入故障？"
                                          @onConfirm="loadFault(scope.row)"
                                        >
                                          <el-button slot="reference" type="success"><svg t="1705471998747" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="4269" width="12" height="12"><path d="M558.545455 544.256V1024h-93.09091V544.256l-127.185454 90.856727-54.109091-75.752727L512 396.613818l227.84 162.746182-54.109091 75.752727L558.545455 544.256zM1024 558.545455c0 128.535273-104.192 232.727273-232.727273 232.727272h-139.636363v-93.090909h139.636363a139.636364 139.636364 0 0 0 16.756364-278.272l-44.450909-5.306182 3.584-44.660363c0.558545-6.888727 0.837818-13.847273 0.837818-20.852364 0-141.381818-114.618182-256-256-256a256.093091 256.093091 0 0 0-250.786909 204.334546l-5.678546 27.694545-27.22909 7.749818A186.274909 186.274909 0 0 0 93.090909 512a186.181818 186.181818 0 0 0 186.181818 186.181818h93.090909v93.090909h-93.090909C125.044364 791.272727 0 666.228364 0 512c0-116.177455 71.563636-218.298182 176.523636-259.770182A349.253818 349.253818 0 0 1 512 0c188.555636 0 342.178909 149.480727 348.858182 336.407273A232.866909 232.866909 0 0 1 1024 558.545455z" fill="#ffffff" p-id="4270"></path></svg></el-button>

                                        </el-popconfirm>
                                      </span>
                                    </div>
                                  <!-- <el-button type="text" @click="loadFault(scope.row)">投入</el-button> -->
                                  </template>
                                </el-table-column>
                              </el-table>
                            </div>

                          </div>
                        </div>

                        <div slot="reference" style="text-align: center;clear: both;cursor: pointer;" :class="JSON.stringify(studentChecked) === '{}'? 'noneClick':''">
                          <div style="height: 40px;width: 40px; position: relative;left:  20px;top: 2px;">
                            <img :src="faultIcon" style="height: 40px;width: 40px;" :style="{'filter':JSON.stringify(studentChecked) === '{}'?'grayscale(100%)':''}">
                          </div>
                          <div>故障</div>
                        </div>
                      </el-popover>
                    </div>
                    <div style="width: 80px;height: 60px;float: right;">
                      <el-popover
                        v-model="visibless"
                        width="560"
                        placement="bottom"
                        trigger="click"
                        popper-class="teacher_popovers"
                      >
                        <div>
                          <button style="border: none;outline:none;border-radius:0;background: #67c23a;cursor: pointer;padding: 6px 12px;border-radius: 4px;color: white;margin-left: 4px;margin-right: 4px;"><i class="el-icon-refresh icon-button" @click="reSnap()" /></button>
                          <el-select v-model="config.ticker" style="width: 200px !important;" @change="tickerChange">
                            <el-option key="1" label="1分钟" :value="1" />
                            <el-option key="2" label="2分钟" :value="2" />
                            <el-option key="5" label="5分钟" :value="5" />
                            <el-option key="10" label="10分钟" :value="10" />
                          </el-select>
                          <button style="border: none;outline:none;border-radius:0;background: #5d88f8;cursor: pointer;padding: 6px 12px;border-radius: 4px;font-size: 14px;color: white;" @click="snapSave()">保存快照</button>
                          <div ref="snaShot" style="width: 100%;height:calc(100vh - 190px);overflow: auto;">
                            <el-table
                              :data="snapshotList"
                              :show-header="false"
                              highlight-current-row
                              :border="true"
                            >
                              <el-table-column
                                prop="id"
                                label="快照名称"
                                align="center"
                                width="90"
                              >
                              </el-table-column>

                              <el-table-column
                                align="center"
                                label="保存时间"
                              >
                                <template slot-scope="scope">
                                  <span :style="{color: scope.row.name === 'auto save' ? 'black' : 'green'}">{{ operatingTime(scope.row.created) }}</span>
                                </template>
                              </el-table-column>
                              <el-table-column width="80" align="center">
                                <template slot-scope="{ row }">
                                  <el-button type="text" size="small" @click="backSnap(row)">恢复</el-button>
                                </template>
                              </el-table-column>
                            </el-table>
                          </div>
                        </div>
                        <div slot="reference" :class="JSON.stringify(studentChecked) === '{}' || !disOrhidd ? 'noneClick':''" style="text-align: center;clear: both;cursor: pointer;" @click="readSnap()">
                          <div style="height: 40px;width: 40px; position: relative;left:  20px;top: 2px;">
                            <img :src="kuaizhao" style="height: 40px;width: 40px;" :style="{'filter':JSON.stringify(studentChecked) === '{}'|| !disOrhidd ?'grayscale(100%)':''}">
                          </div>
                          <div>快照</div>
                        </div>
                      </el-popover>
                    </div>
                  </div>
                </div>
              </div>
              <div style="width: 250px;height: 60px;float: right;cursor: pointer;">
                <div style="float: left;width: 160px;height: 60px;background-color: #d7d7d7;position: relative;top:5px;border-radius:10px;box-shadow: 0px 0px 8px gray;">
                  <div style="float: left;width: 80px;height:60px;">
                    <div style="text-align: center;border-top-left-radius: 10px;border-bottom-left-radius: 10px;" :style="{'background-color':isSimulationRoom?'#80b336':''}" @click="isSimulationRoom = true">
                      <div style="height: 40px;width: 40px; position: relative;left:  20px;top: 2px;">
                        <img :src="roomImg" style="height: 40px;width: 40px;">
                      </div>
                      <div>仿真状态</div>
                    </div>
                  </div>
                  <div style="float: right;width: 80px;height: 60px;border-top-right-radius: 10px;border-bottom-right-radius: 10px;" :style="{'background-color':!isSimulationRoom?'#80b336':''}" @click="isSimulationRoom = false">
                    <div style="text-align: center;">
                      <div style="height: 40px;width: 40px; position: relative;left:  20px;top: 2px;">
                        <img :src="sreenImg" style="height: 40px;width: 40px;">
                      </div>
                      <div>实时屏幕</div>
                    </div>
                  </div>
                </div>
                <div style="float: right;width: 80px;height: 60px;background-color: #d7d7d7;position: relative;top:5px;border-radius:10px ;box-shadow: 0px 0px 8px gray;">
                  <div style="text-align: center;cursor:not-allowed">
                    <div style="height: 40px;width: 40px; position: relative;left:  20px;top: 2px;">
                      <img :src="demonstrationImg" style="height: 40px;width: 40px;">
                    </div>
                    <div>广播演示</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div style="width: 260px;height: 100%; position: relative;right: 50px;">
            <div class="loginBox" style="position: relative;color: black;">
              <div style="display: flex; align-items: center; justify-content: center; width: 34px; height: 70px;margin-left: 32%;margin-right: 20px;">
                <img style="background-color: white;border-radius: 20px;" :src="loginIcon">
              </div>
              <div style="font-size: 15px;line-height: 42px;">
                <!-- <p>欢迎您,{{ getType(user.roles[0]) }}:</p> -->
                <p>{{ user.cname }}</p>
              </div>
              <div style="position: relative;right: 0;top: 10px;left: 30px;color: black;" class="exit" @click="logout">
                <p>注销登录</p>
              </div>
            </div>
          </div>
        </div>
        <div style="height: calc(100% - 145px); background-color: #ffffff;">
          <div class="checked">
            <div style="float: left;position: relative;left: 1%;">
            </div>
            <img :src="layoutImg" style="float:right;height: 15px;width: 15px;right: 2%;position: relative;cursor: pointer;" @click="dialogVisible = true">
          </div>
          <div :class="rightBarIsShow?'cmboxMin':'cmboxMax'" :style="{width:'100%'}" style="position: relative;">
            <div :class="(clLayout.row < 5 )?'computer-rows-less':'computer-rows'">
              <div v-for="(rows, rowindex) in StudentForm" :key="rowindex" :class="parseInt(clLayout.column)>4?'computer-lines':'computer-lines-less'">
                <div v-for="(columns, columnindex) in rows" :key="columnindex" style="display: inline-block; margin: 5px;">
                  <card ref="card" :isSimulationRoom="isSimulationRoom" :info="columns" :studentChecked="studentChecked" :maxWidth="cardWidth" :class="parseInt(clLayout.row)>1?'card-more':''"></card>
                </div>
              </div>
            </div>
            <div class="bottomInst">
              <div style="width: 20%;height: 100%;float: left;background-color:#de858e;border-radius: 10px;">
                <el-tooltip placement="top" :value="projectSelectIsShow" :manual="true" popper-class="card_tooltip">
                  <div slot="content">
                    <div style="height: 200px;width: 400px;color: black;" @mouseleave="projectSelectIsShow = false">
                      <div style="height: 170px;width: 100%;padding:10px;overflow: auto;" class="projectList">
                        <div v-for="(item,index) in projectDesc" :key="index" style="height: 25px;width: 100%;line-height: 25px;font-size: 15px;cursor: pointer;" @click="changeProject(index)">
                          <div style="float: left;">{{ item }}</div>
                          <div style="float: right;">{{ index }}</div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div style="width: 80%;height: 100%;float: left;display: flex;  align-content: center;justify-content: center; flex-wrap: wrap;" :style="{'font-size':roomWidth*0.01+'px'}">
                    {{ projectDesc[project] }}
                  </div>
                </el-tooltip>
                <div
                  style="width: 20%;height: 100%;float: right;align-content: center;flex-wrap: wrap;justify-content: space-around;display: flex;"
                >
                  <img :src="uparrowIcon" style="position: relative;cursor: pointer;" :style="{'height':roomWidth*0.02+'px','width':roomWidth*0.02+'px',}" @click="projectSelectIsShow=!projectSelectIsShow">
                </div>
              </div>
              <div style="width: 80%;height: 100%;float:right;">
                <div style="height: 100%;width: 100%;float: left;display: flex;align-items: center;">
                  <div
                    v-for="(item,index) in list"
                    :key="index"
                    style="display: flex;flex-direction: column-reverse;justify-content: space-around;"
                  >
                    <div
                      style="height: 80%;display: flex;flex-direction: column;justify-content: center;align-items: center; "
                      :style="{'width':roomWidth*0.03+'px'}"
                    >
                      <el-popover
                        placement="top"
                        width="60"
                        trigger="hover"
                      >
                        <div>
                          <div class="bth" style="cursor: pointer;background-color: #67c23a;color: #FFF;" @click="startInst(index+1)">启动模型</div>
                          <div class="bth" style="cursor: pointer;background-color: red;color: #FFF;" @click="stopInst(index+1)">停止模型</div>
                        </div>
                        <div slot="reference" class="ball" :class="getClass(index + 1)"></div>
                      </el-popover>
                      <!-- <div v-if="item.status === 0" class="ball noinst"></div>
                      <div v-if="item.status === 1" class="ball hasinst"></div>
                      <div v-if="item.status === 2" class="ball blink"></div> -->
                      <div style="text-align: center;position: relative;height: 30%;top:3px" :style="{'font-size':roomWidth*0.01>20?'20px':roomWidth*0.01+'px'}">
                        {{ `#${item.key + 1}` }}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- <img :src="hideImg" style="position: absolute;right: 0px;bottom: 50%;" @click="rightBarHiden()"> -->
          </div>
          <!-- <div
            :class="rightBarIsShow?'rightBar':'rightBarNotShow'"
          >
            <rightBar ref="rightBar" :info="studentChecked"></rightBar>
          </div> -->
        </div>
      </div>
    </div>
    <el-dialog :visible.sync="dialogVisible" width="60%">
      <div class="createtitle">新建教室</div>
      <div style="height: 280px; width: 100%;">
        <div class="leftbox" style="width: 40%;height: 280px;float: left;">
          <el-form class="create_left" size="mini">
            <div class="createTop">行列设置</div>
            <div class="clLayoutTempInput">
              <el-form-item label="教室行数">
                <el-input v-model="clLayoutTemp.row" style="width: 120px;"></el-input>
              </el-form-item>
            </div>
            <div class="clLayoutTempInput">
              <el-form-item label="教室列数">
                <el-input v-model="clLayoutTemp.column" style="width: 120px;"></el-input>
              </el-form-item>
            </div>
            <div class="createTop">显示设置</div>
            <div class="clLayoutTempInput">
              <el-form-item label="起始IP号">
                <el-input v-model="clLayoutTemp.startIp" style="width: 120px;"></el-input>
              </el-form-item>
            </div>
            <div class="clLayoutTempInput">
              <el-form-item label="名称前缀">
                <el-input v-model="clLayoutTemp.namePrefix" style="width: 120px;"></el-input>
              </el-form-item>
            </div>
            <div class="clLayoutTempInput">
              <el-form-item label="名称后缀">
                <el-input v-model="clLayoutTemp.nameSuffix" style="width: 120px;"></el-input>
              </el-form-item>
            </div>
          </el-form>
        </div>
        <div class="create_right">
          <div class="createRight_top">
            <div class="createRight_top_left">布局预览</div>

          </div>
          <div>

            <div class="crLayout">
              <div style="display: flex;justify-content: space-around;">
                <div class="platformbox">
                  <div class="platformtext">教室讲台</div>
                </div>
              </div>
              <div v-for="(rows, rowindex) in tpLayoutTemp" :key="rowindex" class="box-row">
                <div
                  v-for="(columns, columnindex) in rows"
                  :key="columnindex"
                  class="box"
                  style="width: 100%;height: 100%;margin: 10px;"
                >
                  <div class="computer"></div>
                  <div class="computerName">{{ columns.name }}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div style="margin-top: 70px; margin-right: 1px;">
        <div class="cancelButton" @click="dialogVisible = false">取消</div>
        <div class="createButton" @click="confircli()">创建</div>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { mapState } from 'vuex'
import moment from 'moment'
import * as papi from '@/api/project'
import * as capi from '@/api/condition'
import * as fapi from '@/api/fault'
import * as uapi from '@/api/user.js'
import * as gapi from '@/api/group'
import * as rapi from '@/api/res'
import card from './card'
import { read } from '@/api/user'
import * as mapi from '@/api/model.js'
// import rightSidebarBase from './rightSidebarBase'
// import rightSidebarProject from './rightSidebarProject'
// import rightSidebarOther from './rightSidebarOther'
// import rightBar from './rightBar'
export default {

  components: {
    card
    // rightSidebarBase,
    // rightSidebarProject,
    // rightSidebarOther,
    // rightBar
  },

  data() {
    return {
      tableRowIndex: 0,
      newFaultList: [],
      faultList: [],
      EditFaultdialogVisible: false,
      tempFaultName: '',
      fifterTxt: '',
      activeName: 'first',
      snapshotList: [],
      visibless: false,
      visibles: false,
      visible: false,
      activeNamee: 'first',
      loadFaultList: [],
      activeNameee: '1',
      conditionList: [],
      s: '',
      faultIds: [],
      config: {
        max: 64,
        ticker: 2
      },
      delayRangeValue: '',
      saving: false,
      changeRight: true,
      faultRangeValue: '',
      persConditionList: [],
      maxListCount: 128,
      personal: false,
      uniqueData: {},
      faultRange: [{
        value: 10,
        text: '10%'
      }, {
        value: 20,
        text: '20%'
      },
      {
        value: 30,
        text: '30%'
      },
      {
        value: 50,
        text: '50%'
      },
      {
        value: 80,
        text: '80%'
      },
      {
        value: 100,
        text: '100%'
      }
      ],
      delayRange: [{
        value: 1,
        text: '1分钟'
      },
      {
        value: 2,
        text: '2分钟'
      },
      {
        value: 3,
        text: '3分钟'
      },
      {
        value: 5,
        text: '5分钟'
      }
      ],

      isSimulationRoom: true,
      rightBarIsShow: false,
      projectSelectIsShow: false,
      checkedImg: require('@/assets/hollysys/checked.png'),
      checkedAllImg: require('@/assets/hollysys/checkedAll.png'),
      layoutImg: require('@/assets/hollysys/layout.png'),
      work: require('@/assets/hollysys/work.png'),
      hideImg: require('@/assets/hollysys/hide.png'),
      guzhang: require('@/assets/hollysys/guzhang.png'),
      startImg: require('@/assets/hollysys/start.png'),
      kuaizhao: require('@/assets/hollysys/saveSnapshot.png'),
      stopImg: require('@/assets/hollysys/stop.png'),
      roomImg: require('@/assets/hollysys/room.png'),
      sreenImg: require('@/assets/hollysys/sreen.png'),
      demonstrationImg: require('@/assets/hollysys/demonstration.png'),
      loginIcon: require('@/assets/hollysys/loginIcon.svg'),
      uparrowIcon: require('@/assets/hollysys/uparrow.png'),
      startedIcon: require('@/assets/hollysys/started.png'),
      startedNotIcon: require('@/assets/hollysys/startedNot.png'),
      conditonIcon: require('@/assets/hollysys/conditon.png'),
      faultIcon: require('@/assets/hollysys/fault.png'),
      fins: [
        {
          createTime: '2023-11-29T20:58:16+08:00',
          id: 'dev',
          key: '/rubik_state/CQDCFZ/model/dev/',
          loaded: true,
          model: 'model',
          name: '👤管理员\n💪🏻开发中...',
          owner: 'xrubik',
          project: 'CQDCFZ',
          running: false,
          speed: 1,
          time: 658232500
        }
      ],
      fin: [],
      windousWidth: '',
      windousHeight: '',
      isCheckedAll: false,
      userList: [],
      checkedCount: 0,
      studentsFrom: [],
      stuChecked: [],
      studentChecked: {},
      projectList: '',
      newarry: [],
      indexs: 0,
      childs: [],
      boxWidth: 10,
      boxHeight: 10,
      classRoomNull: true,
      dialogVisible: false,
      listQuery: {
        page: 1,
        pageSize: '999',
        name: '',
        cname: '',
        mobile: '',
        email: '',
        status: 1,
        sort: 'id ASC',
        role: ''
      },
      stuNameList: {},
      clLayoutTemp: {
        row: '0',
        column: '0',
        startIp: '',
        namePrefix: '',
        nameSuffix: ''
      },
      clLayout: {},
      cardMaxwidth: 170
      // roomWidth: 1200
    }
  },
  computed: {
    // store/room 教室配置文件全局保存
    ...mapState({
      project: state => state.room.project,
      setting: state => state.room.setting,
      condition: state => state.project.instances
    }),
    user: function() {
      return this.$store.getters.user
    },
    connects: function() {
      return this.$store.getters.connects
    },
    instances: function() {
      return this.$store.getters.instances
    },

    group: function() {
      let temp = {}
      for (let i in this.instances) {
        if (this.instances[i].project === this.project) {
          temp[this.instances[i].id] = this.instances[i]
        }
      }
      return temp
    },

    disOrhidd: function() {
      let temp = {}
      for (let i in this.studentChecked) {
        temp[this.studentChecked[i].i] = {}
      }
      console.log(temp)
      if (Object.keys(temp).length === 1) {
        return true
      } else {
        return false
      }
    },

    connectsArry: function() { // 获取连接信息
      this.instances
      let temp = {}
      for (let i in this.connects) {
        if (this.connects[i].p === this.project && this.group[this.connects[i].i] != null) {
        // eslint-disable-next-line no-constant-condition
        // if (true) {
          temp[this.connects[i].uid] = this.connects[i]
        }
      }
      return temp
    },

    stuForIp: function() {
      let temp = {}
      for (let i in this.connects) {
        if (this.connects[i].p === this.project && this.connects[i].ip != null) {
          temp[this.connects[i].ip] = this.connects[i]
        }
      }
      return temp
    },

    projectDesc: function() {
      let temp = {}
      for (let i in this.projectList) {
        temp[this.projectList[i].name] = this.projectList[i].desc
      }
      return temp
    },

    StudentForm: function() {
      let studentForm = []
      let connectsArry = Object.values(this.connectsArry)
      // let connectsArry = Object.values(this.connects)
      let n = 0
      for (let i = 0; i < this.clLayout.row; i++) {
        studentForm[i] = []
        for (let p = 0; p < this.clLayout.column; p++) {
          if (connectsArry[n] != null) {
            let item = {
              cname: connectsArry[n].cname,
              hostName: this.tpLayout[i][p].name,
              userInfo: this.stuNameList[connectsArry[n].uid],
              name: connectsArry[n].uname,
              id: connectsArry[n].uid,
              // uid: connectsArry[n].uid,
              projectName: connectsArry[n].p,
              project: this.projectDesc[connectsArry[n].p],
              // condition: '-',
              condition: this.group[connectsArry[n].i],
              group: connectsArry[n].i,
              ip: this.tpLayout[i][p].ip,
              running: ''
            }
            studentForm[i][p] = item
          } else {
            studentForm[i][p] = {
              hostName: this.tpLayout[i][p].name,
              ip: this.tpLayout[i][p].ip
            }
          }
          n++
        }
      }
      return studentForm
    },
    getClass: function() {
      return (val) => {
        let inst = Object.values(this.instances)
        let hasinst = inst.findIndex(item => item.id === String(val) && item.project === this.project && !item.name.includes('加载'))
        if (hasinst !== -1) {
          return 'hasinst'
        }
        let blink = inst.findIndex(item => item.id === String(val) && item.project === this.project && (item.name && item.name.includes('加载')))
        if (blink !== -1) {
          return 'blink'
        }
        return 'noinst'
      }
    },

    // StudentForm: function() {
    //   let studentForm = []

    //   for (let i = 0; i < this.clLayout.row; i++) {
    //     studentForm[i] = []
    //     for (let p = 0; p < this.clLayout.column; p++) {
    //       if (this.stuForIp[this.tpLayout[i][p].ip] != null) {
    //         studentForm[i][p] = {
    //           cname: this.stuForIp[this.tpLayout[i][p].ip].cname,
    //           hostName: this.tpLayout[i][p].name,
    //           userInfo: this.stuNameList[this.stuForIp[this.tpLayout[i][p].ip].uid],
    //           name: this.stuForIp[this.tpLayout[i][p].ip].uname,
    //           id: this.stuForIp[this.tpLayout[i][p].ip].uid,
    //           // uid: connectsArry[n].uid,
    //           // project: connectsArry[n].p,
    // projectName: connectsArry[n].p,
    //           project: this.projectDesc[this.stuForIp[this.tpLayout[i][p].ip].p],
    //           condition: this.group[this.stuForIp[this.tpLayout[i][p].ip].i],
    //           group: this.stuForIp[this.tpLayout[i][p].ip].i,
    //           ip: this.tpLayout[i][p].ip,
    //           running: ''
    //         }
    //       } else {
    //         studentForm[i][p] = {
    //           hostName: this.tpLayout[i][p].name,
    //           ip: this.tpLayout[i][p].ip
    //         }
    //       }
    //     }
    //   }

    //   return studentForm
    // },
    // 生成几行几列盒子计算

    tpLayout() {
      let layout = []
      let count = 1
      var ipParts = this.clLayout.startIp.split('.')
      let ipTmp = parseInt(ipParts[3])
      for (let i = 1; i <= this.clLayout.row; i++) {
        let rows = []
        for (let p = 1; p <= this.clLayout.column; p++) {
          let stu = {
            name: `${this.clLayout.namePrefix}${count}${this.clLayout.nameSuffix}`,
            ip: ipParts[0] + '.' + ipParts[1] + '.' + ipParts[2] + '.' + ipTmp
          }
          count++
          ipTmp++
          rows.push(stu)
        }
        layout.push(rows)
      }

      return layout
    },

    tpLayoutTemp() {
      let layout = []
      let count = 1
      for (let i = 1; i <= this.clLayoutTemp.row; i++) {
        let rows = []
        for (let p = 1; p <= this.clLayoutTemp.column; p++) {
          let stu = {
            name: `${this.clLayoutTemp.namePrefix}${count}${this.clLayoutTemp.nameSuffix}`,
            ip: ''
          }
          count++
          rows.push(stu)
        }
        layout.push(rows)
      }

      return layout
    },

    roomWidth() { // card所在的最大区域宽度
      const width = this.windousWidth
      if (!this.rightBarIsShow) {
        return width
      } else {
        return width - width * 0.3
      }
    },
    roomHeight() { // card所在的最大区域高度
      const height = this.windousHeight
      return height - 200
    },

    cardWidth() { // 计算card的宽度
      let width = this.roomWidth

      if (this.clLayout.row < 5) { // 当行数不超过5，考虑card高度是否可以满足需求
        let widthTemp
        if (this.roomWidth < 1180) {
          widthTemp = ((1180) - (this.clLayout.column + 1) * 8) / this.clLayout.column
        } else {
          widthTemp = ((width) - (this.clLayout.column + 1) * 8) / this.clLayout.column
        }
        if (this.clLayout.column < 4) {
          widthTemp *= 0.8
        }
        while ((widthTemp * 0.8 + 5) * this.clLayout.row > this.roomHeight) { // 判断高度是否刚好可以填满屏幕
          widthTemp *= 0.95
          if (widthTemp * 0.8 * this.clLayout.row < this.roomHeight) {
            break
          }
        }
        return parseInt(widthTemp)
      } else { // 当行数超过5，不再考虑card高度是否可以满足需求
        let widthTemp = ((width) - (this.clLayout.column + 1) * 8) / this.clLayout.column
        if (this.clLayout.column < 4) {
          widthTemp *= 0.4
        }
        return parseInt(widthTemp)
      }
    }

  },

  mounted() {
    this.list = []
    for (let i = 0; i < 10; i++) {
      let obj = { key: i, status: 0 }
      this.list.push(obj)
    }
    this.getProject()
    this.getConfiguration()
    this.getUserList()
    this.getList()
    this.getFault()
    this.getPersonList()
    this.$on('global:connect.stop', (msg) => {
      delete this.studentChecked[msg.data.uid]
      // this.$refs.rightSidebarBase.updataPage()
      // this.$refs.rightBar.updataPage()
      // this.$refs.rightSidebarProject.updataPage()
      this.checkedCount = Object.keys(this.studentChecked).length
    })
    this.windousWidth = document.documentElement.offsetWidth
    this.windousHeight = document.documentElement.offsetHeight
    window.onresize = () => {
      this.windousWidth = document.documentElement.offsetWidth
      this.windousHeight = document.documentElement.offsetHeight
      this.rightBarIsShow = !this.rightBarIsShow
      this.rightBarIsShow = !this.rightBarIsShow
    }
  },

  methods: {
    // papi.stopInstance
    startInst(val) {
      this.$message({
        type: 'info',
        message: '实例开始创建'
      })
      let instance = '#' + val
      papi.startInstance(this.project, 'model', instance, val.toString()).then(() => {
        this.$message({
          type: 'success',
          message: `${instance}创建成功`
        })
      }).catch(() => {
        this.$message({
          type: 'error',
          message: `${instance}创建失败`
        })
      })
    },
    stopInst(val) {
      papi.stopInstance(this.project, 'model', val.toString())
    },
    readSnap() {
      this.readSnapShot()
    },

    changeRightbar() {
      this.changeRight = !this.changeRight
      this.$parent.rightBarHiden()
    },
    // 刷新工况
    reCondition() {
      this.persConditionList = []
      this.conditionList = []
      this.getList()
      this.getPersonList()
    },
    // 刷新快照
    reSnap() {
      this.snapshotList = []
      this.readSnapShot()
    },
    // 刷新故障
    updateTree() {
      this.faultList = []
      this.getFault()
    },

    changeFaultRange(val) {
      this.faultRangeValue = val
    },
    getName(val) {
      console.log(val)
      if (val.dataType === 'ON') {
        return '开关'
      } else {
        return '程度'
      }
    },
    handleClick(tab, event) {
      if (tab.label === '快照') {
        this.readSnapShot()
      }
    },

    // 时间戳的转换
    operatingTime(time) {
      return moment(time * 1000).format('MM-DD HH:mm:ss')
    },
    // 快照列表
    readSnapShot() {
      const uniqueData = {}

      for (const key in this.studentChecked) {
        const item = this.studentChecked[key]
        const iPropertyValue = item.i
        if (!uniqueData[iPropertyValue]) {
          uniqueData[iPropertyValue] = item
        }
      }

      const resultArray = Object.values(uniqueData)
      if (Object.values(resultArray).length === 1) {
        let keys = Object.keys(this.studentChecked)
        let firstKey = keys[0]
        let iValue = this.studentChecked[firstKey].i
        this.$store.dispatch('show_instances', { project: this.project, model: 'model', id: iValue })
        capi.listSnapshot({}).then(res => {
          let snapshotList = []
          for (let i in res.items) {
            snapshotList.push(res.items[i])
            snapshotList.sort((a, b) => {
              return b.id - a.id
            })
          }
          this.snapshotList = snapshotList
        })
      } else {
        this.$notify.error({
          title: '错误',
          message: '请正确选取学员'
        })
      }
    },
    // 保存快照
    snapSave() {
      if (this.saving === true) {
        return
      }
      this.saving = true
      capi.saveSnapshot({}).then(res => {
        this.$msg.success('保存快照成功')
        this.readSnapShot()
      }).catch(err => {
        this.$msg.error(err, '保存快照失败')
      }).finally(() => {
        this.saving = false
      })
    },
    tickerChange(v) {
      this.snapshotList = []
      this.readSnapShot()
      this.config.ticker = v
      if (this.config.max < 64) {
        this.config.max = 64
      }
      capi.setSnapshotConfig(this.config)
    },
    // 回退快照
    backSnap(row) {
      this.$confirm('确定恢复快照: ' + row.id + ' ?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        return capi.restoreSnapshot(row.id).then(() => {
          this.$msg.success('恢复快照成功')
        })
      })
    },
    // 下放故障
    async loadFault(val) {
      console.log(val)
      for (let key in this.studentChecked) {
        let params = {
          'rubik.project': this.project,
          'rubik.model': 'model',
          'rubik.id': this.studentChecked[key].i
        }

        let obj = {
          id: val.id,
          name: val.name,
          sort: val.sort,
          ops: [{ var: val.var, start: 0, target: Number(val.dataType * 100) }]
        }
        await fapi.starts(obj, params).then(() => {
          this.$msg.success(`投入故障${val.name}成功`)
          this.faultDialogVisible = false
        }).catch((err) => {
          this.$msg.error(err)
          this.faultDialogVisible = false
        })

        // for (let i in this.loadFaultList) {
        //   let obj = {
        //     id: this.loadFaultList[i].id,
        //     name: this.loadFaultList[i].name,
        //     sort: this.loadFaultList[i].sort,
        //     ops: [{ var: this.loadFaultList[i].var, start: this.loadFaultList[i].delay * 1000, target: Number(this.loadFaultList[i].level * 100) }]
        //   }
        //   await fapi.starts(obj, params).then(() => {
        //     this.$msg.success(`投入故障${this.loadFaultList[i].name}成功`)
        //     this.faultDialogVisible = false
        //   }).catch((err) => {
        //     this.$msg.error(err)
        //     this.faultDialogVisible = false
        //   })
        // }
      }
      // this.loadFaultList = []
    },
    // 确认修改故障数据
    editFaultConfirm() {
      for (let i in this.faultList) {
        if (this.faultList[i].id === this.faultIds[0]) {
          for (let j in this.faultList[i].array) {
            if (this.faultIds[1] === this.faultList[i].array[j].id) {
              console.log(this.delayRangeValue)
              this.faultList[i].array[j].dataType = this.faultRangeValue
              this.faultList[i].array[j].delay = this.delayRangeValue
            }
          }
        }
      }
      this.EditFaultdialogVisible = false
    },
    // 点击编辑故障
    editFault(val) {
      this.EditFaultdialogVisible = true
      this.tempFaultName = val.name
      this.faultRangeValue = val.dataType
      this.delayRangeValue = val.delay
      this.faultIds = [
        val.pid,
        val.id
      ]
    },
    // 搜索方法
    changeTxt(fifterTxt) {
      if (fifterTxt !== '') {
        let count = 1
        this.newFaultList = []
        for (let a in this.faultList) {
          for (let i in this.faultList[a].array) {
            let isAdd = this.faultList[a].array[i].name.indexOf(this.fifterTxt)
            if (isAdd !== -1) {
              this.newFaultList.push({
                index: count,
                name: this.faultList[a].array[i].name,
                pid: this.faultList[a].id,
                id: this.faultList[a].array[i].id,
                var: this.faultList[a].array[i].var,
                sort: this.faultList[a].array[i].sort,
                dataType: `${this.faultList[a].array[i].dataType !== 'ON' ? `${this.faultList[a].array[i].dataType}` : 'ON'}`,
                delay: 0
              })
              count += 1
            }
          }
        }
      }
    },
    // 获取故障列表
    getFault() {
      papi.getFault(this.project).then(async res => {
        let list = res.list.items || {}
        for (let i in res.tree) {
          this.faultList.push({
            id: i,
            name: res.tree[i].name,
            seq: res.tree[i].seq,
            array: []
          })
        }
        for (let a of this.faultList) {
          for (let i in list) {
            if (list[i].sort === a.seq) {
              let index = a.array.length + 1
              a.array.push({
                index: index,
                name: list[i].name,
                pid: a.id,
                id: list[i].id,
                var: list[i].ops[0].var,
                sort: list[i].sort,
                dataType: `${list[i].ops[0].dataType == null ? `${list[i].ops[0].target}` : 'ON'}`,
                delay: 0
              })
            }
          }
        }
        this.newFaultList = this.faultList
      }).catch(err => {
        console.log(err)
      })
    },
    // 点击切换工况弹窗确认按钮-切换工况
    switchCondition(val) {
      this.conditionEdit = ''
      this.switchDialogVisible = false
      let uniqueData = {}
      for (const key in this.studentChecked) {
        const item = this.studentChecked[key]
        uniqueData[item.i] = item
      }
      let info = uniqueData
      let all = Object.values(info).map(async(i) => {
        let params = {
          'rubik.project': this.project,
          'rubik.model': 'model',
          'rubik.id': i.i
        }
        this.loading = this.$loading({
          lock: true,
          text: `正在载入工况`,
          spinner: 'el-icon-loading',
          background: 'rgba(0, 0, 0, 0.8)'
        })
        return await capi.loadCond(val.id, false, params)
      })

      Promise.all(all).then(() => {
        this.loading.close()
        this.$notify({
          title: '工况载入成功',
          type: 'success'
        })
      })
    },
    // 公有工况列表
    getList() {
      let items = []
      papi.getCondition(this.project).then(res => {
        let list = res.items
        for (let i in list) {
          items.push(list[i])
        }
        let newarr = []
        for (let i = 1; i <= this.maxListCount; i++) {
          let ishave = false
          let hnum = 0
          for (let j = 0; j < items.length; j++) {
            if (items[j].id === i) {
              ishave = true
              hnum = j
            }
          }
          if (ishave) {
            ishave = false
            newarr.push(items[hnum])
          } else {
            let obj = { id: i, name: '' }
            newarr.push(obj)
          }
        }
        this.conditionList = newarr
      })
    },
    // 私有工况列表
    getPersonList() {
      let ite = []
      // this.$store.dispatch('show_instances', { project: this.project, model: 'model', id: Object.values(this.studentChecked)[0].i })
      let personal = true
      capi.listCond(personal).then(res => {
        let list = res.items
        for (let i in list) {
          ite.push(list[i])
        }
        let newarr = []
        for (let i = 1; i <= this.maxListCount; i++) {
          let ishave = false
          let hnum = 0
          for (let j = 0; j < ite.length; j++) {
            if (ite[j].id === i) {
              ishave = true
              hnum = j
            }
          }
          if (ishave) {
            ishave = false
            newarr.push(ite[hnum])
          } else {
            let obj = { id: i, name: '' }
            newarr.push(obj)
          }
        }
        this.persConditionList = newarr
        console.log(this.persConditionList, '------8--------')
      })
    },
    // 保存工况
    saveCondition(row) {
      this.$confirm(`确定保存工况: ${row.name || row.id} ?`).then(() => {
        this.loading = this.$loading({
          lock: true,
          text: `正在保存工况: ${row.name}`,
          spinner: 'el-icon-loading',
          background: 'rgba(0, 0, 0, 0.8)'
        })
        return capi.saveCond(row.id, false)
      }).then(() => {
        this.getList()
        this.$msg.success(row.id, '保存工况成功')
      }).catch((err) => {
        this.$msg.error(err, '保存工况失败')
      }).finally(() => {
        this.loading && this.loading.close()
      })
    },
    perSaveCondition(row) {
      this.$confirm(`确定保存工况: ${row.name || row.id} ?`).then(() => {
        this.loading = this.$loading({
          lock: true,
          text: `正在保存工况: ${row.name}`,
          spinner: 'el-icon-loading',
          background: 'rgba(0, 0, 0, 0.8)'
        })
        return capi.saveCond(row.id, true)
      }).then(() => {
        this.getPersonList()
        this.$msg.success(row.id, '保存工况成功')
      }).catch((err) => {
        this.$msg.error(err, '保存工况失败')
      }).finally(() => {
        this.loading && this.loading.close()
      })
    },
    getType(val) {
      if (val === 'engineer') {
        return '工程师'
      } else if (val === 'teacher') {
        return '教师'
      } else if (val === 'student') {
        return '学生'
      }
    },
    async logout() {
      // window.localStorage.clear()
      // window.sessionStorage.clear()
      // await this.$store.dispatch('user/clearAll')
      await this.$store.commit('SET_FORBID', true)
      await this.$store.dispatch('clear_cache')
      this.$store.dispatch('settings/changeView', 'isDev')
      await this.$store.commit('Set_Cache', [])
      await this.$store.commit('Set_Index', 0)
      await this.$store.dispatch('user/logout')
      this.$router.push(`/login?redirect=/`)
      this.$msg.success('成功退出')
    },

    switchRoom() {
      this.isSimulationRoom = !this.isSimulationRoom
    },

    rightBarHiden() {
      this.rightBarIsShow = !this.rightBarIsShow
      // this.updataPage()
    },

    changeProject(project) {
      if (this.project === project) return
      this.$store.dispatch('room/setProject', project)
      this.list.map(item => { item.status = 0 })
      // this.$store.state.room.project = project
      this.conditionList = []
      this.persConditionList = []
      this.faultList = []
      this.newFaultList = []
      this.snapshotList = []
      papi.getServerList('Model').then(res => {
        this.group = {}
        for (let i in res.items) {
          if (res.items[i].project === project) {
            this.group[res.items[i].id] = res.items[i]
          }
        }
      }).finally(() => {
        this.$store.state.room.project = project
        this.studentChecked = {}
        this.getProject()
        this.getList()
        this.getFault()
        this.getPersonList()
        this.isCheckedAll = false
      })
    },

    // 获取学员列表
    getUserList() {
      read(this.listQuery).then(res => {
        for (let i in res.items) {
          this.stuNameList[res.items[i].id] = res.items[i]
        }
      })
    },
    updataPage() {
      if (this.$refs.card) {
        for (let i in this.$refs.card) {
          // this.$refs.card[i].getCondition()
          this.$refs.card[i].updataPage()
        }
      }
    },

    checkAllStudent() {
      console.log(this.isCheckedAll)
      if (!this.isCheckedAll) {
        if (Object.keys(this.connectsArry).length !== 0) {
          this.studentChecked = JSON.parse(JSON.stringify(this.connectsArry))
          this.checkedCount = Object.keys(this.studentChecked).length
          this.isCheckedAll = !this.isCheckedAll
        } else {
          this.$msg.error('无可选学员')
        }
      } else {
        this.studentChecked = {}
        this.isCheckedAll = !this.isCheckedAll
        this.checkedCount = Object.keys(this.studentChecked).length
      }
    },

    studentCheckedAdd(info) {
      this.studentChecked = {}
      this.studentChecked[info.id] = this.connectsArry[info.id]
      this.checkedCount = Object.keys(this.studentChecked).length
      if (Object.keys(this.studentChecked).length === Object.keys(this.connectsArry).length) {
        this.isCheckedAll = true
      }
      // console.log(this.$refs.rightSidebarBase)
      // this.$refs.rightSidebarBase.updataPage()
      // this.$refs.rightBar.updataPage()
      // this.$refs.rightSidebarProject.updataPage()
    },
    studentCheckedDel(info) {
      delete this.studentChecked[info.id]
      this.studentChecked = JSON.parse(JSON.stringify(this.studentChecked))
      this.isCheckedAll = false
      this.checkedCount = Object.keys(this.studentChecked).length
      // this.$refs.rightSidebarBase.updataPage()
      // this.$refs.rightBar.updataPage()
      // this.$refs.rightSidebarProject.updataPage()
    },

    getConfiguration() {
      // rapi.getCache('classRoom').then((res) => {
      //   if (res.setting == null || Object.keys(res.setting).length === 0 || res.setting === '') {
      //     // eslint-disable-next-line no-return-assign
      //     return this.classRoomNull = true
      //   } else {
      //     this.clLayoutTemp = res.setting
      //     // eslint-disable-next-line no-return-assign
      //     return this.classRoomNull = false
      //   }
      // })
      if (this.setting == null || Object.keys(this.setting).length === 0 || this.setting === '') {
        this.classRoomNull = true
      } else {
        // console.log(this.clLayoutTemp)
        // console.log(this.setting)
        this.clLayout = this.setting
        this.clLayoutTemp = JSON.parse(JSON.stringify(this.clLayout))
        // this.getStudentForm()
        this.classRoomNull = false
      }
    },
    writeConfiguration() {
      // 新建教室可用此方法
      // 修改配置文件， 首位参数 配置文件名称 次位 文件全部配置
      let json = { project: this.project, setting: this.clLayoutTemp }
      rapi.setCache('classRoom', json)
    },
    // 点击新建按钮
    creatBand() {
      this.dialogVisible = true
      // 获取box的宽度以计算盒子之间的间距
      let boxWidth = this.$refs.box.offsetWidth
      this.disWidth = boxWidth
    },

    // 点击新建弹窗确认
    confircli() {
      this.dialogVisible = !this.dialogVisible
      this.classRoomNull = false
      this.clLayout = JSON.parse(JSON.stringify(this.clLayoutTemp))
      this.writeConfiguration()
      this.getStudentForm()
    },
    // 将学员信息按教室格式保存
    getStudentForm() {
      // eslint-disable-next-line no-empty
      this.studentsFrom = []
      let n = 0
      for (let i = 0; i < this.clLayoutTemp.row; i++) {
        this.studentsFrom[i] = []
        for (let p = 0; p < this.clLayoutTemp.column; p++) {
          if (this.Students[n] != null) {
            this.studentsFrom[i][p] = this.Students[n]
          } else {
            this.studentsFrom[i][p] = {
              loginStatus: '未登陆',
              id: '-',
              project: '-',
              condition: '-',
              group: '-',
              ip: ''
            }
          }
          n++
        }
      }
    },

    startProjects() {
      // this.$store.dispatch('show_instances', { project: this.project, model: 'model' })
      for (let i in this.studentChecked) {
        console.log(i)
        let params = {
          'rubik.project': this.studentChecked[i].p,
          'rubik.model': 'model',
          'rubik.id': this.studentChecked[i].i
        }
        mapi.modelStart(true, params).then(res => {
          this.$msg.success(`模型编号${i}开始运算`)
        })
      }
    },

    stopProjects() {
      // this.$store.dispatch('show_instances', { project: this.project, model: 'model' })
      for (let i in this.studentChecked) {
        console.log(i)
        let params = {
          'rubik.project': this.studentChecked[i].p,
          'rubik.model': 'model',
          'rubik.id': this.studentChecked[i].i
        }
        mapi.modelStart(false, params).then(res => {
          this.$msg.success(`模型编号${i}停止运算`)
        })
      }
    },

    checkedNull() {
      this.$msg.error('未选中学员')
    },

    // 获取工程项目
    getProject() {
      this.fin = []
      this.projectList = []
      this.newarry = []
      let uid = this.$store.getters.user.id

      if (!uid) return
      let list = []
      gapi.getGroupsOfUser(uid).then(res => {
        list = res.items
        list.sort((a, b) => {
          return a.id - b.id
        })
        let gets = list.map(item => {
          return papi.getProjectsOfGroup(item.id).then(t => {
            let children = []

            for (let name in t.items) {
              children.push(t.items[name])
            }
            item.children = children
          })
        })
        return Promise.all(gets)
      }).then(() => {
        let cache = []
        for (let i of list) {
          cache.push(...i.children)
        }
        for (let i of cache) {
          i.children = []
        }
        this.projectList = cache

        let child = []
        for (let name in this.instances) {
          this.instances[name].userInfo = []
          child.push(this.instances[name])
        }
        for (let s of this.projectList) {
          for (let d of child) {
            if (s.name === d.project) {
              s.children.push(d)
            }
          }
        }
        this.projectList.map(item => {
          item.children.map(it => {
            this.newarry.push(it)
          })
        })
        uapi.clients().then(res => {
          for (let i in res.data) {
            for (let j of this.newarry) {
              if (res.data[i].p === j.project && res.data[i].i === j.id) {
                j.userInfo.push(res.data[i])
              }
            }
          }
        })

        for (var a = 0; a < this.newarry.length; a++) {
          if (this.newarry[a].project === this.newarry[this.indexs].project) {
            this.fin.push(this.newarry[a])
          }
        }
      })
    }
  }
}
</script>

<style scoped>
.box {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.top {
  /* position: absolute; */
  margin: 15px;
  /* width: 400px; */
}

≠≠.topTool{
  width: calc(100%);
  overflow: hidden;
  /* margin: 10px; */
  height: 70px;
  background-color: white;
  box-shadow: 0 4px 8px rgba(0.1, 0.1, 0.1, 0.1);
}

.top_top_left {
  float: left;
}

.top_top_right {
  cursor: pointer;
  float: right;
  background-color: #697c9e;
  color: white;
  height: 34px;
  width: 90px;
  text-align: center;
  line-height: 34px;
  border-radius: 5px;
}

/* .top_top {} */

.top_low {
  margin-top: 5px;
  font-size: small;
  color: gray;
  clear: both;
}

.opbox span {
  font-size: 13px;
}

.connection-status {
  margin-top: 5px;
  font-size: smaller;
}

.connected {
  color: green;

}
.noneClick{
  pointer-events: none;
}

.disconnected {
  color: gray;
}

.contains {
  background-color: #ffffff;
  /* background-color: #f5f6fa; */
  width: 100%;
  height: 100%;
}

.box_md {
  margin-top: 150px;
  text-align: center;
}

.box_md span {
  color: #8c8b8b;
  display: block;
  margin-bottom: 5px;
}

.cr_pt {
  width: 300px;
}

.create_left {
  width: 190px;
  float: left;
}

.create_right {
  position: absolute;
  right: 0;
  width: 60%;
  height: 280px;
}

.opbox {
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: lightgray;
  text-align: center;
}

.createTop {
  font-size: smaller;
  color: gray;
  margin-bottom: 10px;
}

.createtitle {
  font-size: larger;
  font-weight: bolder;
  margin-bottom: 10px;
}

.createRight_top {
  font-size: smaller;
}

.createRight_top_left {
  float: left;
}

.createRight_top_right {
  float: right;
  color: #99ccff;
}

.crLayout {
  text-align: center;
  width: 90%;
  height: 310px;
  border-radius: 3px;
  border: 1px solid rgb(241, 241, 241);
  margin-top: 20px;
  overflow: auto;
}

.clLayoutTempInput {
  /* position: fixed; */
  margin-bottom: 33px;
}

.el-form-item__content {
  margin-top: 10px;
}

.box-row {
  display: flex;
}

.computer-rows{
  white-space: nowrap;
  overflow:auto;
  height:calc(100% - 15px);
  /* transition:  all 1s; */
}

.computer-rows-less{
  display: flex;
  white-space: nowrap;
  overflow: auto;
  height: calc(100% - 15px);
  /* transition:  all 1s; */
  /* flex-direction: column; */
  flex-wrap: wrap;
  align-content: stretch;
  justify-content: space-evenly;
}

.el-table__body tr.current-row > td {
  background-color: #8ca2fffa;
}
.el-table tbody tr:hover>td {
  background-color:#8ca2fffa !important;
}
.row-box {
  box-shadow: 1px 1px 1px 1px rgba(0, 0, 0, 0.1);
  border-radius: 5px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.computer {
  width: 30px;
  height: 30px;
  border-radius: 2px;
  background-color: rgb(211, 233, 253);
  margin-bottom: 5px;
}

.el-popper{
  background: white !important;
}
.discomputer {
  width: 70%;
  height: 30vh;
  border-radius: 5px;
  background-color: white;
}

.computer-line {
  display: inline-block;
  height: 170px;
  width: 150px;
  margin: 20px;
  background-color: white;
  box-shadow: 1px 1px 1px 1px rgba(0, 0, 0, 0.1);
  border-radius: 3px;
  padding: 20px;
}

.computer-lines {
  /* display: inline-block; */
/*
  text-align: center; */
  display: flex;
  justify-content: space-around;
}

.computer-lines-less{
  display: flex;
  /* text-align: center; */
  justify-content: space-around;
}

.loginBox{
  height: 70px;
}
.loginBox div{
  float: left;
}

.loginBox div img {
  width: 40px;
  height: 40px;
}

.platformbox {
  text-align: center;
  margin-top: 15px;
  line-height: 25px;
  background-color: darkgray;
  height: 25px;
  width: 135px;
  border-radius: 13px;
  background-color: rgb(242, 243, 245);
}

.platformtext {
  clear: both;
  color: rgb(164, 164, 164);
  /* position: absolute; */
  /* margin-top: 4px;
  margin-left: 37px; */
}

.computerName {
  font-size: 10px;
}

.cancelButton {
  cursor: pointer;
  line-height: 25px;
  text-align: center;
  /* margin: 5px; */
  margin-bottom: 15px;
  background-color: rgb(227, 227, 227);
  height: 25px;
  width: 100px;
  border-radius: 3px;
}

.cancelButton:hover {
  box-shadow: 0 4px 8px rgba(0.1, 0.1, 0.1, 0.1);
}

.createButton {
  cursor: pointer;
  line-height: 25px;
  text-align: center;
  /* margin: 5px; */
  background-color: rgb(93, 136, 247);
  height: 25px;
  width: 100px;
  border-radius: 3px;
}

.createButton:hover {
  box-shadow: 0 4px 8px rgba(0.1, 0.1, 0.1, 0.1);
}

.cmTop {
  /* background-color: #8c8b8b; */
  height: 40px;
  /* width: 100px; */
}

.cmTop_left {
  height: 40px;
  width: 40px;
  /* display: inline-block; */
  float: left;
  /* background-color: rgb(220, 220, 245); */
}

.logimg {
  width: 40px;
}

.cmTop_right {
  height: 40px;
  width: 60px;
  /* display: inline-block; */
  float: right;
  /* left: 80px; */
  /* background-color: rgb(220, 220, 245); */
}

.cmTop_right_top {
  font-weight: bolder;
  text-align: left;
  font-size: small;
  line-height: 20px;
  color: white;
}

.cmTop_right_bottom {
  font-size: small;
  text-align: left;
  font-size: small;
  color: #cdcdcd;
  line-height: 20px;
}

.cmMid {
  /* background-color: #99ccff; */
  height: 60px;
  text-align: left;
  /* font-size: 13px; */
  margin-top: 5px;
}

.cmInfo {
  font-size: 12px;
  line-height: 15px;
  color: #cdcdcd;
}

.cmbottom {
  /* background-color: aqua; */
  height: 20px;
  /* width: 100px; */
}

.cmbottom_left {
  height: 20px;
  width: 55px;
  float: left;
  font-size: 10px;
  line-height: 20px;
  color: #cdcdcd;
  /* background-color: aquamarine; */
}

.cmbottom_right {
  height: 20px;
  width: 55px;
  float: right;
  font-size: 10px;
  line-height: 20px;
  color: #cdcdcd;
  /* background-color: rgb(127, 255, 153); */
}

.checked{
  /* background-color: #ffffff; */
  position: relative;
  top:15px;
  /* left:2%; */
  height: 15px;
  /* width: 90%; */
  /* margin-left: 15px; */
  margin-bottom: 15px;
}

.checked_left{
  /* background-color: #99ccff; */
  float: left;
  height: 15px;
  width: 60px;
}

.checked_left_left{
  /* background-color: #99ccff; */
  float: left;
  height: 15px;
  width: 15px;
  cursor: pointer;
}

.checked_left_right{
  /* background-color: #99ccff; */
  float: right;
  height: 15px;
  font-size: small;
  margin-right: 10px;
}

.checked_right{
  /* background-color: #99ccff; */
  float: right;
  height: 15px;
  width: 100px;
  font-size: small;
}

.rightBar{
  width: 30%;
  height: 100%;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  position: absolute;
  right: 0px;
  transition: all 1s;
}

.rightBarNotShow{
  width: 20px;
  height: 100%;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  position: absolute;
  right: 0px;
  transition: all 1s;
}

.cmboxMax{
  float: left;
  height: 100%;
  /* background-color: #ffffff; */
  transition: all 1s;
}

.cmboxMin{
  float: left;
  height: 100%;
  /* background-color:#ffffff; */
  transition: all 1s;
}

.exit{
  cursor: pointer;
  color: white;
}

.exit :hover{
  cursor: pointer;
   color: red;
}

.bottomInst{
      width: 100%;
      height: 60px;
      background-color: #d7d7d7;
  }

.projectList :hover{
  background-color: #8bb24b;
}
.ball {
  width: 20px; height: 20px;border-radius: 50%;cursor: pointer;background-color: #8f8f8f;
}
.hasinst {
  background-color: #67C23A;
}
.not {
  background-color: #8f8f8f;
}
.blink {
  background-color: red;
  animation: blink 1s ease-in-out infinite;
}

@keyframes blink {
  0% {
    opacity: 1;
  }
  50% {
    opacity: 0;
  }
  100% {
    opacity: 1;
  }
}
.bth {
  border-radius: 5px;
  margin-top: 5px;
  text-align: center;
  user-select: none;
}
</style>

<style>
.teacher_popover {
  padding: 0 !important;
}
.teacher_popover .el-tabs--border-card > .el-tabs__content {
  padding: 0;
}
.teacher_popover .el-select .el-input {
  width: 70px !important;
}
.teacher_popovers {
  padding: 0 !important;
}
.teacher_popovers .el-tabs--border-card > .el-tabs__content {
  padding: 0;
}
.teacher_popovers .el-select .el-input {
  width: 100px !important;
}
</style>

