<template>
  <div class="app-container" style="padding: 6px;">
    <el-main>
      <el-tabs type="border-card" size="mini" @tab-click="tabClick">
        <el-tab-pane label="基本">
          <div style="height: calc(100vh - 165px);overflow-y: auto;">
            <el-container>
              <el-main>
                <el-form ref="form" :model="alg" inline label-width="80px" size="mini" width="600px">
                  <el-form-item label="名称">
                    <el-input v-model="alg.name" :readonly="true" style="width: 200px;" />
                  </el-form-item>
                  <el-form-item label="描述">
                    <el-input v-model="alg.desc" style="width: 200px;" />
                  </el-form-item>
                  <!-- <el-form-item label="算法库">
                    <el-cascader
                      placeholder="选择算法库"
                      :value="alg.lib"
                      size="mini"
                      :options="libs"
                      change-on-select
                      style="width: 200px;"
                      @change="handleLibChange"
                    >
                    </el-cascader>
                  </el-form-item> -->
                  <el-form-item label="函数名">
                    <el-input v-model="alg.func" style="width: 200px;" @change="source = ''" />
                  </el-form-item>
                  <el-form-item label="图片">
                    <el-input v-model="alg.image" :readonly="true" style="width: 200px;">
                      <i
                        slot="suffix"
                        class="el-icon-more"
                        style="font-size:18px; margin-top:5px; cursor: pointer;"
                        @click="selectIcon"
                      />
                    </el-input>
                  </el-form-item>
                  <el-form-item label="宽度">
                    <el-input v-model.number="alg.width" style="width: 200px;">
                      <em
                        slot="suffix"
                        class="el-icon-refresh"
                        style="font-size:18px; margin-top:5px;"
                        @click="resizeToImage"
                      />
                    </el-input>
                  </el-form-item>
                  <el-form-item label="高度">
                    <el-input v-model.number="alg.height" style="width: 200px;" />
                  </el-form-item>
                  <el-form-item label="分类">
                    <el-cascader
                      placeholder="选择算法分类"
                      :value="getAlgSortArray(alg.sort)"
                      :options="cascaderOptions"
                      style="width: 200px;"
                      change-on-select
                      @change="handleSortChange"
                    />
                  </el-form-item>
                  <el-form-item label="组合变量">
                    <el-checkbox v-model="alg.useBulk" style="width: 200px;" @change="onUseBulkChange" />
                  </el-form-item>
                  <el-form-item label="修改输入">
                    <el-checkbox v-model="alg.canChangeInput" style="width: 200px;" />
                  </el-form-item>
                  <el-form-item label="流网设置">
                    <el-select v-model.number="alg.fnState" style="width: 200px;">
                      <el-option key="FN_0" :value="0" label="非流网算法" />
                      <el-option key="FN_1" :value="1" label="流网节点" />
                      <el-option key="FN_2" :value="2" label="流网支路" />
                    </el-select>
                  </el-form-item>
                  <!-- 保存算法按钮 -->
                  <el-form-item label="保存" style="width: 280px;">
                    <el-popconfirm
                      title="确定保存？"
                      @onConfirm="saveAlg()"
                    >
                      <el-button slot="reference" type="danger" size="mini">保存算法修改</el-button>
                    </el-popconfirm>
                  </el-form-item>
                </el-form>
              </el-main>
              <!-- 图元预览窗口 -->
              <el-aside :width="Math.max(170, alg.width + 20) + 'px'">
                <div id="algCanvas" :style="getCanvasStyle()" />
              </el-aside>
            </el-container>
            <el-row :gutter="24" style="margin-left: 0; margin-right: 0; ">
              <el-col :span="8" style="padding: 0px; background: #eee">
                <div style="margin: 1px;">
                  <div style="text-align: right;">
                    <el-button type="warning" size="mini" icon="el-icon-edit" style="margin: 8px;" @click="editing=!editing" />
                    <el-popconfirm
                      title="确定增加一个输入项？"
                      @onConfirm="addPort(alg.in, 3)"
                    >
                      <el-button slot="reference" type="primary" size="mini" icon="el-icon-plus" style="margin: 8px;"></el-button>
                    </el-popconfirm>
                  </div>
                  <el-table
                    :data="alg.in"
                    :cell-style="getCellStyle"
                    :header-cell-style="getCellStyle"
                    border
                    fit
                    highlight-current-row
                    style="overflow: auto;"
                    @current-change="handleCurrentChangeIn"
                  >
                    <el-table-column type="expand" width="20">
                      <template slot-scope="scope">
                        <el-form label-width="60px" inline size="mini">
                          <el-form-item label="名称">
                            <el-input v-model="scope.row.name" style="width: 200px;" />
                          </el-form-item>
                          <el-form-item label="描述">
                            <el-input v-model="scope.row.desc" style="width: 200px;" />
                          </el-form-item>
                          <el-form-item label="类型">
                            <el-select v-model="scope.row.type" placeholder="请选择" style="width: 200px;">
                              <el-option
                                v-for="item in localBulks"
                                :key="item.value"
                                :label="item.label"
                                :value="item.value"
                              />
                            </el-select>
                          </el-form-item>
                          <el-form-item label="缺省">
                            <el-input-number v-model="scope.row.value" class="edit-input" :controls="false" style="width: 200px;" />
                          </el-form-item>
                          <el-form-item label="连接">
                            <el-checkbox v-model="scope.row.connable" style="width: 200px;"></el-checkbox>
                          </el-form-item>
                          <el-form-item label="多连">
                            <el-checkbox v-model="scope.row.connmany" style="width: 200px;"></el-checkbox>
                          </el-form-item>
                          <el-form-item label="方向">
                            <el-select v-model.number="scope.row.dir" class="edit-input" style="width: 200px;">
                              <el-option key="0" :value="0" label="┷" />
                              <el-option key="1" :value="1" label="┠" />
                              <el-option key="2" :value="2" label="┯" />
                              <el-option key="3" :value="3" label="┨" />
                              <el-option key="4" :value="4" label="┼" />
                            </el-select>
                          </el-form-item>
                          <el-form-item label="引脚">
                            <el-input v-model.number="scope.row.x" class="edit-input" style="width: 80px;" />
                            <el-input v-model.number="scope.row.y" class="edit-input" style="width: 80px;" />
                          </el-form-item>
                        </el-form>
                      </template>
                    </el-table-column>
                    <el-table-column align="center" label="ID" width="40">
                      <template slot-scope="scope">
                        <span>{{ scope.row.id + 1 }}</span>
                      </template>
                    </el-table-column>

                    <el-table-column label="名称" width="60">
                      <template slot-scope="scope">
                        <template v-if="editing">
                          <el-input v-model="scope.row.name" class="edit-input" size="small" />
                        </template>
                        <span v-else>{{ scope.row.name }}</span>
                      </template>
                    </el-table-column>

                    <el-table-column label="值" width="40">
                      <template slot-scope="scope">
                        <template v-if="editing">
                          <el-input v-model="scope.row.value" class="edit-input" size="small" />
                        </template>
                        <span v-else>{{ scope.row.value || 0 }}</span>
                      </template>
                    </el-table-column>

                    <el-table-column align="center" label="连" width="40">
                      <template slot-scope="scope">
                        <el-checkbox
                          v-model="scope.row.connable"
                          :disabled="!editing"
                          class="edit-input"
                          size="mini"
                          @change="value => value ? ( scope.row.dir = 3 ) : 0"
                        />
                      </template>
                    </el-table-column>

                    <el-table-column align="center" label="X" width="50">
                      <template slot-scope="scope">
                        <template v-if="scope.row.connable">
                          <el-input v-if="editing" v-model.number="scope.row.x" class="edit-input" size="mini" />
                          <span v-else>{{ scope.row.x }}</span>
                        </template>
                      </template>
                    </el-table-column>

                    <el-table-column align="center" label="Y" width="50">
                      <template slot-scope="scope">
                        <template v-if="scope.row.connable">
                          <el-input v-if="editing" v-model.number="scope.row.y" class="edit-input" size="mini" />
                          <span v-else>{{ scope.row.y }}</span>
                        </template>
                      </template>
                    </el-table-column>

                    <el-table-column align="center" label="B" width="40">
                      <template slot-scope="scope">
                        <el-checkbox v-model="scope.row.build" :disabled="!editing" class="edit-input" size="mini" />
                      </template>
                    </el-table-column>

                    <el-table-column min-width="100px" label="描述">
                      <template slot-scope="scope">
                        <template v-if="editing">
                          <el-input v-model="scope.row.desc" class="edit-input" size="small" />
                        </template>
                        <span v-else>{{ scope.row.desc }}</span>
                      </template>
                    </el-table-column>
                    <el-table-column v-if="!isEdit" width="18">
                      <template slot-scope="scope">
                        <a><em class="el-icon-delete" @click="deletePort(alg.in, scope.row.id)" /></a>
                      </template>
                    </el-table-column>
                  </el-table>
                </div>
              </el-col>
              <el-col :span="8" style="padding: 0 8px; background: #eee">
                <div style="margin: 1px;">
                  <div style="text-align: right;">
                    <!-- <el-button type="primary" size="mini" icon="el-icon-edit" style="margin: 8px;" @click="editing=!editing" /> -->
                    <el-popconfirm
                      title="确定增加一个系数项？"
                      @onConfirm="addPort(alg.coef)"
                    >
                      <el-button slot="reference" type="primary" size="mini" icon="el-icon-plus" style="margin: 8px;"></el-button>
                    </el-popconfirm>
                  </div>
                  <el-table
                    :data="alg.coef"
                    :cell-style="getCellStyle"
                    :header-cell-style="getCellStyle"
                    border
                    fit
                    highlight-current-row
                    style="overflow: auto;"
                  >
                    <el-table-column align="center" label="ID" width="40">
                      <template slot-scope="scope">
                        <span>{{ scope.row.id + 1 }}</span>
                      </template>
                    </el-table-column>

                    <el-table-column width="60" label="名称">
                      <template slot-scope="scope">
                        <template v-if="editing">
                          <el-input v-model="scope.row.name" class="edit-input" size="small" />
                        </template>
                        <span v-else>{{ scope.row.name }}</span>
                      </template>
                    </el-table-column>

                    <el-table-column align="center" label="值" width="60">
                      <template slot-scope="scope">
                        <el-input v-if="editing" v-model="scope.row.value" class="edit-input" size="small" :controls="false" style="width:100%" />
                        <span v-else>{{ scope.row.value }}</span>
                      </template>
                    </el-table-column>

                    <el-table-column min-width="100px" label="描述">
                      <template slot-scope="scope">
                        <template v-if="editing">
                          <el-input v-model="scope.row.desc" class="edit-input" size="small" />
                        </template>
                        <span v-else>{{ scope.row.desc }}</span>
                      </template>
                    </el-table-column>
                    <el-table-column v-if="!isEdit" width="18">
                      <template slot-scope="scope">
                        <a><em class="el-icon-delete" @click="deletePort(alg.coef, scope.row.id)" /></a>
                      </template>
                    </el-table-column>
                  </el-table>
                </div>
              </el-col>
              <el-col :span="8" style="padding: 0px; background: #eee">
                <div style="margin: 1px;">
                  <div style="text-align: right;">
                    <!-- <el-button type="primary" size="mini" icon="el-icon-edit" style="margin: 8px;" @click="editing=!editing" /> -->
                    <el-popconfirm
                      title="确定增加一个输出项？"
                      @onConfirm="addPort(alg.out, 1)"
                    >
                      <el-button slot="reference" type="primary" size="mini" icon="el-icon-plus" style="margin: 8px;" />
                    </el-popconfirm>
                  </div>
                  <el-table
                    :data="alg.out"
                    :cell-style="getCellStyle"
                    :header-cell-style="getCellStyle"
                    border
                    fit
                    highlight-current-row
                    style="overflow: auto;"
                    @current-change="handleCurrentChangeOut"
                  >
                    <el-table-column type="expand" width="20">
                      <template slot-scope="scope">
                        <el-form label-width="60px" inline size="mini">
                          <el-form-item label="名称">
                            <el-input v-model="scope.row.name" class="edit-input" style="width: 200px;" />
                          </el-form-item>
                          <el-form-item label="描述">
                            <el-input v-model="scope.row.desc" class="edit-input" style="width: 200px;" />
                          </el-form-item>
                          <el-form-item label="类型">
                            <el-select v-model="scope.row.type" placeholder="请选择" style="width: 200px;">
                              <el-option
                                v-for="item in localBulks"
                                :key="item.value"
                                :label="item.label"
                                :value="item.value"
                              />
                            </el-select>
                          </el-form-item>
                          <el-form-item label="缺省">
                            <el-input-number v-model="scope.row.value" class="edit-input" style="width: 200px;" :controls="false" />
                          </el-form-item>
                          <el-form-item label="连接">
                            <el-checkbox v-model="scope.row.connable" style="width: 200px;"></el-checkbox>
                          </el-form-item>
                          <el-form-item label="单连">
                            <el-checkbox v-model="scope.row.connmany" style="width: 200px;"></el-checkbox>
                          </el-form-item>
                          <el-form-item label="方向">
                            <el-select v-model.number="scope.row.dir" class="edit-input" style="width: 200px;">
                              <el-option key="0" :value="0" label="┷" />
                              <el-option key="1" :value="1" label="┠" />
                              <el-option key="2" :value="2" label="┯" />
                              <el-option key="3" :value="3" label="┨" />
                              <el-option key="4" :value="4" label="┼" />
                            </el-select>
                          </el-form-item>
                          <el-form-item label="引脚">
                            <el-input v-model.number="scope.row.x" class="edit-input" style="width: 80px;" />
                            <el-input v-model.number="scope.row.y" class="edit-input" style="width: 80px;" />
                          </el-form-item>
                        </el-form>
                      </template>
                    </el-table-column>
                    <el-table-column align="center" label="ID" width="40">
                      <template slot-scope="scope">
                        <span>{{ scope.row.id + 1 }}</span>
                      </template>
                    </el-table-column>

                    <el-table-column label="名称" width="60">
                      <template slot-scope="scope">
                        <template v-if="editing">
                          <el-input v-model="scope.row.name" class="edit-input" size="small" />
                        </template>
                        <span v-else>{{ scope.row.name }}</span>
                      </template>
                    </el-table-column>

                    <el-table-column label="值" width="40">
                      <template slot-scope="scope">
                        <template v-if="editing">
                          <el-input v-model="scope.row.value" class="edit-input" size="small" />
                        </template>
                        <span v-else>{{ scope.row.value || 0 }}</span>
                      </template>
                    </el-table-column>

                    <el-table-column align="center" label="连" width="40">
                      <template slot-scope="scope">
                        <el-checkbox
                          v-model="scope.row.connable"
                          :disabled="!editing"
                          size="mini"
                          @change="value => value ? ( scope.row.dir = 1 ) : 0"
                        />
                      </template>
                    </el-table-column>

                    <el-table-column align="center" label="X" width="50">
                      <template slot-scope="scope">
                        <template v-if="scope.row.connable">
                          <el-input v-if="editing" v-model.number="scope.row.x" class="edit-input" size="mini" />
                          <span v-else>{{ scope.row.x }}</span>
                        </template>
                      </template>
                    </el-table-column>

                    <el-table-column align="center" label="Y" width="50">
                      <template slot-scope="scope">
                        <template v-if="scope.row.connable">
                          <el-input v-if="editing" v-model.number="scope.row.y" class="edit-input" size="mini" />
                          <span v-else>{{ scope.row.y }}</span>
                        </template>
                      </template>
                    </el-table-column>

                    <el-table-column min-width="100px" label="描述">
                      <template slot-scope="scope">
                        <template v-if="editing">
                          <el-input v-model="scope.row.desc" class="edit-input" size="small" />
                        </template>
                        <span v-else>{{ scope.row.desc }}</span>
                      </template>
                    </el-table-column>
                    <el-table-column v-if="!isEdit" width="18">
                      <template slot-scope="scope">
                        <a><em class="el-icon-delete" @click="deletePort(alg.out, scope.row.id)" /></a>
                      </template>
                    </el-table-column>
                  </el-table>
                </div>
              </el-col>
            </el-row>
          </div>
        </el-tab-pane>
        <el-tab-pane label="文档">
          <mavon-editor
            v-model="alg.doc"
            :toolbars-flag="true"
            :toolbars="editorToolbars"
          />
        </el-tab-pane>
        <el-tab-pane label="代码">
          <div style="height: calc(100vh - 165px);display: flex;">
            <div style="height: 100%;flex: 1;display: flex;flex-direction: column;">
              <el-form :inline="true" size="mini" style="flex-shrink: 1;">
                <el-form-item label="">
                  <el-button type="primary" :disabled="!sourceChanged" @click="saveAlgSource()">保存代码</el-button>
                </el-form-item>
                <el-form-item label="">
                  <el-button type="primary" :disabled="buildDisabled" @click="buildAlg()">编译代码</el-button>
                </el-form-item>
                <el-form-item label="">
                  <div style="display: flex;">
                    <el-input v-model="searchVal" placeholder="请输入内容" clearable></el-input>
                    <el-button type="primary" @click="editorSearch()">查询</el-button>
                    <el-button type="primary" @click="editorSearch(true)">清空</el-button>
                  </div>
                </el-form-item>
              </el-form>
              <code-editor
                ref="codeEditor"
                v-model="source"
                mode="text/x-c++src"
                style="max-height: calc(100% - 47px); overflow: auto"
                @change="onSourceChange"
              />
              <div
                v-show="beShowLog"
                id="xterm"
                style="padding: 12px 0; width: 100%; height: 120px;"
              >
              </div>
            </div>
            <div style="flex: 1;">
              <el-row :gutter="24" style="margin-left: 0; margin-right: 0; ">
                <el-col :span="8" style="padding: 0px; background: #eee">
                  <div style="margin: 1px;">
                    <div style="text-align: right;">
                      <el-popconfirm
                        title="确定保存？"
                        @onConfirm="saveAlg()"
                      >
                        <el-button slot="reference" type="danger" size="mini">保存算法修改</el-button>
                      </el-popconfirm>
                      <el-button type="warning" size="mini" icon="el-icon-edit" style="margin: 8px;" @click="editing=!editing" />
                      <el-popconfirm
                        title="确定增加一个输入项？"
                        @onConfirm="addPort(alg.in, 3)"
                      >
                        <el-button slot="reference" type="primary" size="mini" icon="el-icon-plus" style="margin: 8px;"></el-button>
                      </el-popconfirm>
                    </div>
                    <el-table
                      :data="alg.in"
                      :cell-style="getCellStyle"
                      :header-cell-style="getCellStyle"
                      border
                      fit
                      highlight-current-row
                      style="overflow: auto;height: calc(100vh - 200px);"
                      @current-change="handleCurrentChangeIn"
                    >
                      <el-table-column type="expand" width="20">
                        <template slot-scope="scope">
                          <el-form label-width="60px" inline size="mini">
                            <el-form-item label="名称">
                              <el-input v-model="scope.row.name" style="width: 200px;" />
                            </el-form-item>
                            <el-form-item label="描述">
                              <el-input v-model="scope.row.desc" style="width: 200px;" />
                            </el-form-item>
                            <el-form-item label="类型">
                              <el-select v-model="scope.row.type" placeholder="请选择" style="width: 200px;">
                                <el-option
                                  v-for="item in localBulks"
                                  :key="item.value"
                                  :label="item.label"
                                  :value="item.value"
                                />
                              </el-select>
                            </el-form-item>
                            <el-form-item label="缺省">
                              <el-input-number v-model="scope.row.value" class="edit-input" :controls="false" style="width: 200px;" />
                            </el-form-item>
                            <el-form-item label="连接">
                              <el-checkbox v-model="scope.row.connable" style="width: 200px;"></el-checkbox>
                            </el-form-item>
                            <el-form-item label="多连">
                              <el-checkbox v-model="scope.row.connmany" style="width: 200px;"></el-checkbox>
                            </el-form-item>
                            <el-form-item label="方向">
                              <el-select v-model.number="scope.row.dir" class="edit-input" style="width: 200px;">
                                <el-option key="0" :value="0" label="┷" />
                                <el-option key="1" :value="1" label="┠" />
                                <el-option key="2" :value="2" label="┯" />
                                <el-option key="3" :value="3" label="┨" />
                                <el-option key="4" :value="4" label="┼" />
                              </el-select>
                            </el-form-item>
                            <el-form-item label="引脚">
                              <el-input v-model.number="scope.row.x" class="edit-input" style="width: 80px;" />
                              <el-input v-model.number="scope.row.y" class="edit-input" style="width: 80px;" />
                            </el-form-item>
                          </el-form>
                        </template>
                      </el-table-column>
                      <el-table-column align="center" label="ID" width="40">
                        <template slot-scope="scope">
                          <span>{{ scope.row.id + 1 }}</span>
                        </template>
                      </el-table-column>

                      <!-- <el-table-column label="名称" width="60">
                        <template slot-scope="scope">
                          <template v-if="editing">
                            <el-input v-model="scope.row.name" class="edit-input" size="small" />
                          </template>
                          <span v-else>{{ scope.row.name }}</span>
                        </template>
                      </el-table-column>

                      <el-table-column label="值" width="40">
                        <template slot-scope="scope">
                          <template v-if="editing">
                            <el-input v-model="scope.row.value" class="edit-input" size="small" />
                          </template>
                          <span v-else>{{ scope.row.value || 0 }}</span>
                        </template>
                      </el-table-column>

                      <el-table-column align="center" label="连" width="40">
                        <template slot-scope="scope">
                          <el-checkbox
                            v-model="scope.row.connable"
                            :disabled="!editing"
                            class="edit-input"
                            size="mini"
                            @change="value => value ? ( scope.row.dir = 3 ) : 0"
                          />
                        </template>
                      </el-table-column>

                      <el-table-column align="center" label="X" width="50">
                        <template slot-scope="scope">
                          <template v-if="scope.row.connable">
                            <el-input v-if="editing" v-model.number="scope.row.x" class="edit-input" size="mini" />
                            <span v-else>{{ scope.row.x }}</span>
                          </template>
                        </template>
                      </el-table-column>

                      <el-table-column align="center" label="Y" width="50">
                        <template slot-scope="scope">
                          <template v-if="scope.row.connable">
                            <el-input v-if="editing" v-model.number="scope.row.y" class="edit-input" size="mini" />
                            <span v-else>{{ scope.row.y }}</span>
                          </template>
                        </template>
                      </el-table-column>

                      <el-table-column align="center" label="B" width="40">
                        <template slot-scope="scope">
                          <el-checkbox v-model="scope.row.build" :disabled="!editing" class="edit-input" size="mini" />
                        </template>
                      </el-table-column> -->

                      <el-table-column min-width="100px" label="描述">
                        <template slot-scope="scope">
                          <template v-if="editing">
                            <el-input v-model="scope.row.desc" class="edit-input" size="small" />
                          </template>
                          <span v-else>{{ scope.row.desc }}</span>
                        </template>
                      </el-table-column>
                      <el-table-column v-if="!isEdit" width="18">
                        <template slot-scope="scope">
                          <a><em class="el-icon-delete" @click="deletePort(alg.in, scope.row.id)" /></a>
                        </template>
                      </el-table-column>
                    </el-table>
                  </div>
                </el-col>
                <el-col :span="8" style="padding: 0 8px; background: #eee">
                  <div style="margin: 1px;">
                    <div style="text-align: right;">
                      <!-- <el-button type="primary" size="mini" icon="el-icon-edit" style="margin: 8px;" @click="editing=!editing" /> -->
                      <el-popconfirm
                        title="确定增加一个系数项？"
                        @onConfirm="addPort(alg.coef)"
                      >
                        <el-button slot="reference" type="primary" size="mini" icon="el-icon-plus" style="margin: 8px;"></el-button>
                      </el-popconfirm>
                    </div>
                    <el-table
                      :data="alg.coef"
                      :cell-style="getCellStyle"
                      :header-cell-style="getCellStyle"
                      border
                      fit
                      highlight-current-row
                      style="overflow: auto;height: calc(100vh - 200px);"
                    >
                      <el-table-column align="center" label="ID" width="40">
                        <template slot-scope="scope">
                          <span>{{ scope.row.id + 1 }}</span>
                        </template>
                      </el-table-column>

                      <!-- <el-table-column width="60" label="名称">
                        <template slot-scope="scope">
                          <template v-if="editing">
                            <el-input v-model="scope.row.name" class="edit-input" size="small" />
                          </template>
                          <span v-else>{{ scope.row.name }}</span>
                        </template>
                      </el-table-column> -->

                      <el-table-column align="center" label="值" width="60">
                        <template slot-scope="scope">
                          <el-input v-if="editing" v-model="scope.row.value" class="edit-input" size="small" :controls="false" style="width:100%" />
                          <span v-else>{{ scope.row.value }}</span>
                        </template>
                      </el-table-column>

                      <el-table-column min-width="100px" label="描述">
                        <template slot-scope="scope">
                          <template v-if="editing">
                            <el-input v-model="scope.row.desc" class="edit-input" size="small" />
                          </template>
                          <span v-else>{{ scope.row.desc }}</span>
                        </template>
                      </el-table-column>
                      <el-table-column v-if="!isEdit" width="18">
                        <template slot-scope="scope">
                          <a><em class="el-icon-delete" @click="deletePort(alg.coef, scope.row.id)" /></a>
                        </template>
                      </el-table-column>
                    </el-table>
                  </div>
                </el-col>
                <el-col :span="8" style="padding: 0px; background: #eee">
                  <div style="margin: 1px;">
                    <div style="text-align: right;">
                      <!-- <el-button type="primary" size="mini" icon="el-icon-edit" style="margin: 8px;" @click="editing=!editing" /> -->
                      <el-popconfirm
                        title="确定增加一个输出项？"
                        @onConfirm="addPort(alg.out, 1)"
                      >
                        <el-button slot="reference" type="primary" size="mini" icon="el-icon-plus" style="margin: 8px;" />
                      </el-popconfirm>
                    </div>
                    <el-table
                      :data="alg.out"
                      :cell-style="getCellStyle"
                      :header-cell-style="getCellStyle"
                      border
                      fit
                      highlight-current-row
                      style="overflow: auto;height: calc(100vh - 200px);"
                      @current-change="handleCurrentChangeOut"
                    >
                      <el-table-column type="expand" width="20">
                        <template slot-scope="scope">
                          <el-form label-width="60px" inline size="mini">
                            <el-form-item label="名称">
                              <el-input v-model="scope.row.name" class="edit-input" style="width: 200px;" />
                            </el-form-item>
                            <el-form-item label="描述">
                              <el-input v-model="scope.row.desc" class="edit-input" style="width: 200px;" />
                            </el-form-item>
                            <el-form-item label="类型">
                              <el-select v-model="scope.row.type" placeholder="请选择" style="width: 200px;">
                                <el-option
                                  v-for="item in localBulks"
                                  :key="item.value"
                                  :label="item.label"
                                  :value="item.value"
                                />
                              </el-select>
                            </el-form-item>
                            <el-form-item label="缺省">
                              <el-input-number v-model="scope.row.value" class="edit-input" style="width: 200px;" :controls="false" />
                            </el-form-item>
                            <el-form-item label="连接">
                              <el-checkbox v-model="scope.row.connable" style="width: 200px;"></el-checkbox>
                            </el-form-item>
                            <el-form-item label="方向">
                              <el-select v-model.number="scope.row.dir" class="edit-input" style="width: 200px;">
                                <el-option key="0" :value="0" label="┷" />
                                <el-option key="1" :value="1" label="┠" />
                                <el-option key="2" :value="2" label="┯" />
                                <el-option key="3" :value="3" label="┨" />
                                <el-option key="4" :value="4" label="┼" />
                              </el-select>
                            </el-form-item>
                            <el-form-item label="引脚">
                              <el-input v-model.number="scope.row.x" class="edit-input" style="width: 80px;" />
                              <el-input v-model.number="scope.row.y" class="edit-input" style="width: 80px;" />
                            </el-form-item>
                          </el-form>
                        </template>
                      </el-table-column>
                      <el-table-column align="center" label="ID" width="40">
                        <template slot-scope="scope">
                          <span>{{ scope.row.id + 1 }}</span>
                        </template>
                      </el-table-column>

                      <!-- <el-table-column label="名称" width="60">
                        <template slot-scope="scope">
                          <template v-if="editing">
                            <el-input v-model="scope.row.name" class="edit-input" size="small" />
                          </template>
                          <span v-else>{{ scope.row.name }}</span>
                        </template>
                      </el-table-column>

                      <el-table-column label="值" width="40">
                        <template slot-scope="scope">
                          <template v-if="editing">
                            <el-input v-model="scope.row.value" class="edit-input" size="small" />
                          </template>
                          <span v-else>{{ scope.row.value || 0 }}</span>
                        </template>
                      </el-table-column>

                      <el-table-column align="center" label="连" width="40">
                        <template slot-scope="scope">
                          <el-checkbox
                            v-model="scope.row.connable"
                            :disabled="!editing"
                            size="mini"
                            @change="value => value ? ( scope.row.dir = 1 ) : 0"
                          />
                        </template>
                      </el-table-column>

                      <el-table-column align="center" label="X" width="50">
                        <template slot-scope="scope">
                          <template v-if="scope.row.connable">
                            <el-input v-if="editing" v-model.number="scope.row.x" class="edit-input" size="mini" />
                            <span v-else>{{ scope.row.x }}</span>
                          </template>
                        </template>
                      </el-table-column>

                      <el-table-column align="center" label="Y" width="50">
                        <template slot-scope="scope">
                          <template v-if="scope.row.connable">
                            <el-input v-if="editing" v-model.number="scope.row.y" class="edit-input" size="mini" />
                            <span v-else>{{ scope.row.y }}</span>
                          </template>
                        </template>
                      </el-table-column> -->

                      <el-table-column min-width="100px" label="描述">
                        <template slot-scope="scope">
                          <template v-if="editing">
                            <el-input v-model="scope.row.desc" class="edit-input" size="small" />
                          </template>
                          <span v-else>{{ scope.row.desc }}</span>
                        </template>
                      </el-table-column>
                      <el-table-column v-if="!isEdit" width="18">
                        <template slot-scope="scope">
                          <a><em class="el-icon-delete" @click="deletePort(alg.out, scope.row.id)" /></a>
                        </template>
                      </el-table-column>
                    </el-table>
                  </div>
                </el-col>
              </el-row>
            </div>
          </div>
        </el-tab-pane>
      </el-tabs>
    </el-main>
  </div>
</template>

<script>
import _ from 'lodash'
import * as algApi from '@/api/alg'
import * as dapi from '@/api/driver'
import { mapGetters } from 'vuex'
import rowsToTreeData from '@/utils/rowsToTreeData'
import { mavonEditor } from 'mavon-editor'
import 'mavon-editor/dist/css/index.css'
import CodeEditor from '@/components/CodeEditor'
import * as api from '@/api/res'
import * as mapi from '@/api/model'
import dedent from 'dedent'
import '@/utils/checkoutAlg'
import { Terminal } from 'xterm'
import { FitAddon } from 'xterm-addon-fit'
import 'xterm/css/xterm.css'
import ImageSelect from '@/components/ImageSelect'

import go from 'gojs'
var $ = go.GraphObject.make

var defaultAlg = {
  name: 'unnamed',
  desc: 'no desc',
  func: 'alg_func',
  width: 100,
  height: 100,
  image: 'default.png',
  canChangeInput: false,
  fnState: 0,
  in: [],
  coef: [],
  out: [],
  doc: '**数学公式示例**\n$$x = {-b \\pm \\sqrt{b^2-4ac} \\over 2a}.$$\n[数学公式说明文档](https://katex.org/docs/supported.html)\n'
}

export default {
  name: 'Detail',
  components: { mavonEditor, CodeEditor },
  props: {
    isEdit: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      xterm: null,
      beShowLog: false,
      imgRandomFlag: Math.random(),
      source: '',
      sourceChanged: false,
      buildDisabled: false,
      libs: [],
      alg: defaultAlg,
      cascaderOptions: [],
      tree: [],
      selPort: '',
      extractData: {},
      editing: false,
      modified: false,
      editorToolbars: {
        bold: true, // 粗体
        italic: true, // 斜体
        header: true, // 标题
        underline: true, // 下划线
        strikethrough: true, // 中划线
        mark: true, // 标记
        superscript: true, // 上角标
        subscript: true, // 下角标
        quote: true, // 引用
        ol: true, // 有序列表
        ul: true, // 无序列表
        link: true, // 链接
        imagelink: false, // 图片链接
        code: true, // code
        table: true, // 表格
        fullscreen: true, // 全屏编辑
        readmodel: false, // 沉浸式阅读
        htmlcode: false, // 展示html源码
        help: false, // 帮助
        /* 1.3.5 */
        undo: true, // 上一步
        redo: true, // 下一步
        trash: true, // 清空
        save: false, // 保存（触发events中的save事件）
        /* 1.4.2 */
        navigation: false, // 导航目录
        /* 2.1.8 */
        alignleft: true, // 左对齐
        aligncenter: true, // 居中
        alignright: true, // 右对齐
        /* 2.2.1 */
        subfield: true, // 单双栏模式
        preview: false // 预览
      },
      searchVal: '',
      tableHeight: 800
    }
  },
  computed: {
    ...mapGetters([
      'algTree', 'bulks', 'project'
    ]),
    localBulks() {
      let ret = [{
        value: 0,
        label: '模拟量/数字量'
      }]
      for (let id in this.bulks) {
        let b = this.bulks[id]
        b.id = parseInt(id)
        ret.push({
          value: b.id,
          label: b.name
        })
      }
      return ret
    }
  },
  watch: {
    alg: {
      deep: true,
      handler: function(newValue) {
        this.renderIcon()
        this.modified = true
      }
    },
    algTree: {
      deep: true,
      handler: function() {
        this.buildCascaderOptions()
      }
    }
  },
  created() {
    this.buildCascaderOptions()
    if (this.isEdit) {
      const name = this.$route.params && this.$route.params.name
      this.fetchData(name)
    } else {
      const name = this.$route.params && this.$route.params.name
      this.alg.name = name
    }

    this.tempRoute = Object.assign({}, this.$route)
  },
  mounted() {
    this.initCanvas()
    this.getLibs()

    this.term = new Terminal()
    this.fitAddon = new FitAddon()
    this.term.loadAddon(this.fitAddon)
    this.term.open(document.getElementById('xterm'))
    this.fitAddon.fit()

    this.$on('global:alg.build.log', msg => {
      msg = msg || {}
      if (msg.data.log) {
        this.log(msg.data.log)
      }
    })
  },
  beforeDestroy() {
    if (this.modified) {
      this.$confirm('算法 ' + this.alg.name + ' 有改动，是否保存?', '提示', {
        confirmButtonText: '保存',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.saveAlg()
      }).catch(() => {})
    }
    this.term && this.term.dispose()
  },
  // 自定义函数
  methods: {
    log(line) {
      this.beShowLog = true
      if (this.term) {
        this.fitAddon && this.fitAddon.fit()
        this.term.writeln('  ' + line)
      }
    },
    clearLog() {
      this.term && this.term.clear()
    },
    getLibs() {
      api.open('../alg/libs.json').then(response => {
        this.libDefine = response || {}
        this.libs = [{
          value: '',
          label: '不指定算法库'
        }]
        for (let libName of response.libs) {
          this.libs.push({
            value: libName,
            label: libName
          })
        }
      }).catch((err) => {
        this.$msg.error(err)
      })
    },
    getAlgSource() {
      let defautlSource = dedent`
      #include "rubik.h"

      // ${this.alg.func} ${this.alg.desc}
      ${this.alg.useBulk ? 'RUBIK_ALGB' : 'RUBIK_ALG'}(${this.alg.func}) {
          // example
          // out[0] = in[0] * coef[0];
      }\n
      `
      api.open(`../algorithm/src/${this.alg.func}.cpp`).then(response => {
        this.source = response || defautlSource
      }).catch((err) => {
        this.$msg.error(err, '打开源文件错误')
        this.source = defautlSource
      }).finally(() => {
        this.sourceChanged = false
      })
    },
    buildPortDesc() {
      let desc = `描述: ${this.alg.desc}`
      for (let i = 0; i < this.alg.in.length; i++) {
        desc += `
          in[${i}], ${this.alg.in[i].name || ''}, ${this.alg.in[i].desc || ''}`
      }
      for (let i = 0; i < this.alg.coef.length; i++) {
        desc += `
          coef[${i}], ${this.alg.coef[i].name || ''}, ${this.alg.coef[i].desc || ''}`
      }
      for (let i = 0; i < this.alg.out.length; i++) {
        desc += `
          out[${i}], ${this.alg.out[i].name || ''}, ${this.alg.out[i].desc || ''}`
      }
      return desc
    },
    saveAlgSource() {
      if (this.source) {
        this.$confirm('确定保存算法源码吗?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          return api.mkdir('../algorithm/src')
        }).then(() => {
          var fd = new FormData()
          var file = new File([this.source], this.alg.func + '.cpp', {
            type: 'text/plain'
          })
          fd.append('file', file)
          return api.write(`../algorithm/src/${this.alg.func}.cpp`, fd)
        }).then(res => {
          this.$msg.success('保存算法源码成功, 请使用"编译代码"按钮生成动态链接库', '保存算法源码')
          this.sourceChanged = false
        }).catch(err => {
          this.$msg.error(`保存失败 ${err}`, '保存算法源码')
          console.log(err)
        })
      }
    },
    onSourceChange(source) {
      this.sourceChanged = true
      this.source = source
    },
    buildAlg() {
      // 记录当前的运行状态
      let running = this.project.running
      this.buildDisabled = true
      this.clearLog()
      this.term && this.term.writeln(' \x1b[33mxrubik $\x1b[0m g++ *.cpp -shared -o rubik.alg')
      new Promise((resolve, reject) => {
        if (this.sourceChanged) {
          this.log('save ...')
          api.mkdir('../algorithm/src').then(() => {
            var fd = new FormData()
            var file = new File([this.source], this.alg.func + '.cpp', {
              type: 'text/plain'
            })
            fd.append('file', file)
            return api.write(`../algorithm/src/${this.alg.func}.cpp`, fd)
          }).then(() => {
            this.sourceChanged = false
            resolve()
          }).catch(err => {
            reject(err)
          })
        } else {
          resolve()
        }
      }).then(() => {
        return api.open('../model/setting.json')
      }).then(response => {
        return (response || {}).win64driver
      }).then((win64driver) => {
        this.log('build ...')
        return algApi.build(this.project.project, win64driver)
      }).then((res) => {
        res = res || {}
        if (res.code === 1) {
          this.log(res.output)
          return Promise.reject()
        } else {
          this.log('编译成功, 正在重启驱动...')
          this.$msg.success('编译成功, 正在重启驱动')
          return Promise.resolve()
        }
      }).then(() => {
        let json = this.libDefine
        json.libs = json.libs || []
        json.libs = ['rubik.alg.dll', ...json.libs]
        json.libs = _.uniq(json.libs)
        var fd = new FormData()
        var file = new File([JSON.stringify(json)], 'libs.json', {
          type: 'text/plain'
        })
        fd.append('file', file)
        return api.write('../alg/libs.json', fd)
      }).then(() => {
        return mapi.modelStart(false)
      }).then(() => {
        return dapi.restart()
      }).then(() => {
        if (running) {
          setTimeout(() => {
            mapi.modelStart(true)
          }, 2000)
        }
        return Promise.resolve()
      }).then(() => {
        this.log('重启驱动成功')
        this.$msg.success('重启驱动成功')
      }).catch(err => {
        this.$msg.error(err, '编译失败')
        this.log('编译失败: ' + err)
      }).finally(() => {
        this.buildDisabled = false
        this.term && this.term.writeln(' \x1b[33mxrubik $\x1b[0m ')
      })
    },
    fetchData(name) {
      algApi.getOne(name).then((res) => {
        let alg = res || {}
        this.initExtraData(alg, name)
        this.alg = alg
        this.setTagsViewTitle()
        setTimeout(() => {
          this.modified = false
        }, 1000)
        defaultAlg = this.alg
      })
    },
    imageUrl() {
      return api.getUrl(`icon/${this.alg.image}`) + `&flag=${this.imageRandomFlag}`
    },
    buildCascaderOptions() {
      var options = []
      for (var id in this.algTree) {
        options.push({
          id: 1 * id,
          value: 1 * id,
          label: this.algTree[id].name,
          parent: 1 * this.algTree[id].parent
        })
      }
      options = rowsToTreeData(options)
      this.cascaderOptions = options
    },
    saveAlg() {
      // 先判断函数名是否合法
      if (!this.isValidFuncName(this.alg.func)) {
        this.$msg.error('使用了不合法的函数名,请修改')
        return
      }
      // 处理多联
      for (var i = 0; i < this.alg.in.length; i++) {
        if (this.alg.in[i].connable) {
          if (this.alg.in[i].connmany) {
            this.alg.in[i].dir = this.alg.in[i].dir | 0x08
          } else {
            this.alg.in[i].dir = this.alg.in[i].dir & 0xF7
          }
        }
      }
      // 处理单联
      for (i = 0; i < this.alg.out.length; i++) {
        if (this.alg.out[i].connable) {
          if (this.alg.out[i].connmany) {
            this.alg.out[i].dir = this.alg.out[i].dir | 0x08
          } else {
            this.alg.out[i].dir = this.alg.out[i].dir & 0xF7
          }
        }
      }
      let mapFunc = function(p) {
        delete p.id
        delete p.connmany
        return p
      }
      let alg = _.cloneDeep(this.alg)
      alg.in = alg.in || []
      alg.in = alg.in.map(mapFunc)
      alg.out = alg.out || []
      alg.out = alg.out.map(mapFunc)
      alg.coef = alg.coef || []
      alg.coef = alg.coef.map(mapFunc)

      algApi.save(this.alg.name, alg).then(res => {
        this.$msg.success('算法保存成功, 如果需要存盘, 请使用上方工具栏的保存模型按钮')
        this.modified = false
        this.$store.dispatch('AlgGetOne', alg.name)
        return dapi.restart()
      }).then(() => {
        this.$msg.success('成功重启驱动')
      }).catch((err) => {
        this.$msg.error(err, '失败')
      })
    },
    setTagsViewTitle() {
      const route = Object.assign({}, this.tempRoute, { title: `算法 - ${this.alg.name}` })
      this.$store.dispatch('tagsView/updateVisitedView', route)
    },
    initCanvas() {
      this.diagram =
        $(go.Diagram, 'algCanvas', {
          initialContentAlignment: go.Spot.Center,
          'animationManager.isEnabled': false,
          'undoManager.isEnabled': false,
          'grid.visible': false
        })
    },
    renderIcon() {
      if (!this.alg.name) {
        return
      }
      if (!this.diagram) {
        return
      }
      const ports = []
      var alg = this.alg
      if (alg.in) {
        for (var i = 0; i < alg.in.length; i++) {
          if (alg.in[i].connable) {
            ports.push(
              $(go.Shape,
                'Circle',
                this.portStyle(true, i, alg.in[i].dir),
                { portId: 'in' + (i + 1), alignment: new go.Spot(alg.in[i].x / (alg.width || 100), alg.in[i].y / (alg.height || 100)) })
            )
          }
        }
      }
      if (alg.out) {
        for (i = 0; i < alg.out.length; i++) {
          if (alg.out[i].connable) {
            ports.push(
              $(go.Shape,
                'Circle',
                this.portStyle(false, i, alg.out[i].dir),
                { portId: 'out' + (i + 1), alignment: new go.Spot(alg.out[i].x / (alg.width || 100), alg.out[i].y / (alg.height || 100)) })
            )
          }
        }
      }
      var tmp =
        $(go.Node, 'Spot',
          $(go.Picture,
            {
              width: alg.width,
              height: alg.height,
              source: this.imageUrl()
            }
          ),
          ... ports
        )
      this.diagram.nodeTemplateMap.add('alg', tmp)
      this.diagram.model = go.Model.fromJson(JSON.stringify({
        'class': 'go.GraphLinksModel',
        'linkFromPortIdProperty': 'fromPort',
        'linkToPortIdProperty': 'toPort',
        'nodeDataArray': [{ category: 'alg' }]
      }))
    },
    portStyle(input, index, direction) {
      var spot = go.Spot.Right
      switch (direction) {
        case 0:
          spot = go.Spot.Top
          break
        case 1:
          spot = go.Spot.Right
          break
        case 2:
          spot = go.Spot.Bottom
          break
        case 3:
          spot = go.Spot.Left
          break
        case 4:
          spot = go.Spot.Default
          break
      }
      const portName = (input ? 'in' : 'out') + index
      return {
        desiredSize: new go.Size(4, 4),
        fill: (portName === this.selPort) ? 'red' : 'green',
        stroke: (portName === this.selPort) ? 'red' : 'green',
        fromSpot: spot,
        fromLinkable: !input,
        toSpot: spot,
        toLinkable: input,
        toMaxLinks: 1,
        cursor: 'pointer'
      }
    },
    handleCurrentChangeIn(currentRow, oldCurrentRow) {
      this.selPort = 'in' + (currentRow && currentRow.id)
      this.renderIcon()
    },
    handleCurrentChangeOut(currentRow, oldCurrentRow) {
      this.selPort = 'out' + (currentRow && currentRow.id)
      this.renderIcon()
    },
    deletePort(array, idx) {
      this.$confirm('确定删除该端口?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        array.splice(idx, 1)
        for (var i = 0; i < array.length; i++) {
          array[i].id = i
        }
        this.$msg.success('删除成功')
      }).catch(() => {
      })
    },
    addPort(array, dir) {
      dir = dir || 0
      array.push({ id: 0, dir: dir, x: 0, y: 0 })
      for (var i = 0; i < array.length; i++) {
        array[i].id = i
      }
    },
    initExtraData(alg, name) {
      alg.name = name
      alg.fnState = alg.fnState || 0
      alg.in = alg.in || []
      alg.coef = alg.coef || []
      alg.out = alg.out || []
      for (var i = 0; i < alg.in.length; i++) {
        alg.in[i].id = i
        alg.in[i].value = alg.in[i].value || 0
        if (alg.in[i].connable) {
          alg.in[i].dir = alg.in[i].dir || 0
          if (alg.in[i].dir & 0x08) {
            alg.in[i].connmany = true
          } else {
            alg.in[i].connmany = false
          }
          alg.in[i].dir = alg.in[i].dir & 0x7
          alg.in[i].x = alg.in[i].x || 0
          alg.in[i].y = alg.in[i].y || 0
          alg.in[i].type = alg.in[i].type || 0
        }
      }

      for (i = 0; i < alg.out.length; i++) {
        alg.out[i].id = i
        alg.out[i].value = alg.out[i].value || 0
        if (alg.out[i].connable) {
          alg.out[i].dir = alg.out[i].dir || 0
          if (alg.out[i].dir & 0x08) {
            alg.out[i].connmany = true
          } else {
            alg.out[i].connmany = false
          }
          alg.out[i].x = alg.out[i].x || 0
          alg.out[i].y = alg.out[i].y || 0
          alg.out[i].type = alg.out[i].type || 0
        }
      }

      for (i = 0; i < alg.coef.length; i++) {
        alg.coef[i].id = i
        alg.coef[i].value = alg.coef[i].value || 0
      }
    },
    selectIcon() {
      var _this = this
      this.$rdialog(ImageSelect, {
        root: 'icon',
        oimg: _this.alg.image,
        callback: (imageName) => {
          if (_this.alg.image === imageName) {
            return
          }
          _this.alg.image = imageName
          _this.imageRandomFlag = Math.random() * 1000
          // 刷新图元
          _this.renderIcon()
          var image = new Image()
          image.src = this.imageUrl()
          image.onload = function() {
            if (this.width !== _this.alg.width || this.height !== _this.alg.height) {
              _this.$confirm('图片尺寸为 ' + this.width + '*' + this.height + ', 是否同步修改算法图元的宽度和高度?')
                .then(() => {
                  _this.alg.width = this.width
                  _this.alg.height = this.height
                }).catch(() => {})
            }
          }
        }
      })
    },
    resizeToImage() {
      var image = new Image()
      image.src = this.imageUrl()
      var _this = this
      image.onload = function() {
        _this.alg.width = this.width
        _this.alg.height = this.height
      }
    },
    getAlgSortArray(sort) {
      var id = sort
      var ret = [sort]
      while (this.algTree && this.algTree[id] && this.algTree[this.algTree[id].parent]) {
        id = 1 * this.algTree[id].parent
        ret = [id, ...ret]
      }
      return ret
    },
    handleSortChange(value) {
      if (value) {
        this.alg.sort = value[value.length - 1]
      }
    },
    handleLibChange(value) {
      if (value) {
        this.alg.lib = value[value.length - 1]
      }
    },
    getCellStyle({ row, column, rowIndex, columnIndex }) {
      return 'padding: 0px;'
    },
    getCanvasStyle() {
      return {
        width: Math.max(160, this.alg.width + 10) + 'px',
        height: Math.max(60, this.alg.height + 10) + 'px'
      }
    },
    tabClick(tab) {
      if (tab.label === '代码') {
        if (!this.source) {
          this.getAlgSource()
        }
      }
    },
    isValidFuncName(func) {
      let r = /^[a-zA-Z\_][0-9a-zA-Z\_]*$/
      return r.test(func)
    },
    onUseBulkChange(value) {
      var msg = `算法的函数类型修改为 "${value ? '可使用组合变量' : '不能用组合变量'}", 请确认`
      this.$confirm(msg)
        .then(() => {
          this.alg.useBulk = !!value
        }).catch(() => {
          this.alg.useBulk = !value
        })
    },
    editorSearch(state) {
      if (state) {
        this.searchVal = ''
        this.$refs.codeEditor.clear()
        return
      }
      this.$refs.codeEditor.serch(this.searchVal)
    }
  }
}
</script>

<style rel="stylesheet/scss" lang="scss" scoped>
.app-container {
  height: 100%;
  overflow: hidden;
}
.el-header, .el-aside, .el-main, .el-container {
  padding: 5px;
}
.alg {
  min-height: calc(100vh - 130px);
}

.mini {
  width: 80PX;
}

.edit-input >>> input {
  padding: 0;
  height: 20px;
  line-height: 20px;
}
.app-container >>> .cell {
  padding-left: 0px;
  padding-right: 0px;
}

.demo-table-expand {
  font-size: 0;
}
.demo-table-expand label {
  width: 90px;
  color: #99a9bf;
}
.demo-table-expand .el-form-item {
  margin-right: 0;
  margin-bottom: 0;
  width: 45%;
}
::v-deep .el-table__expanded-cell {
  padding: 3px;
}

</style>
