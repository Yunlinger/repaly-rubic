<template>
  <div class="alg-container">
    <div style="width: 100%; height: 36px; display: flex; flex-direction: row; justify-content: space-evenly; align-items: center">
      <el-input
        v-model="searchKey"
        placeholder="搜索,可用正则表达式"
        autofocus
        @keyup.enter.native="doSearch"
      >
        <el-button slot="append" icon="el-icon-search" @click="doSearch" />
      </el-input>
    </div>
    <div class="view">
      <explorer
        :items="(searchKey == '') ? items : seachAlgItems"
        @item-dbclick="itemDbClick"
        @item-click="itemClick"
        @newfile="callNewFile"
        @newdir="callNewDir"
        @refresh="refresh"
        @manageLib="manageLib"
        @rename="rename"
        @copy="copy"
        @paste="paste"
        @del="del"
      />
    </div>
  </div>
</template>

<script>
import Explorer from './components/Explorer'
import * as aapi from '@/api/alg'
import * as rapi from '@/api/res'
import { mapGetters } from 'vuex'
export default {
  name: 'AlgExplorer',
  components: { Explorer },
  data() {
    return {
      items: [],
      seachAlgItems: [],
      searchKey: ''
    }
  },
  computed: {
    ...mapGetters([
      'algs',
      'algTree',
      'algShowPath'
    ])
  },
  watch: {
    algs: {
      deep: true,
      handler: function() {
        this.updateItems()
      }
    },
    algShowPath: {
      deep: true,
      handler: function() {
        this.updateItems()
      }
    },
    searchKey: {
      handler: function() {
        this.doSearch()
      }
    }
  },
  mounted() {
    this.updateItems()
  },
  methods: {
    updateItems() {
      var items = []
      if (this.algShowPath !== 0) {
        items.push({ name: '..', isdir: true })
      }
      for (var id in this.algTree) {
        if (1 * (this.algTree[id].parent || 0) === 1 * this.algShowPath) {
          items.push({ id: id, isdir: true, ...this.algTree[id] })
        }
      }

      for (var name in this.algs) {
        if (1 * (this.algs[name].sort || 0) === 1 * this.algShowPath) {
          items.push({ name: name, isdir: false, ...this.algs[name] })
        }
      }

      items = items.sort((i1, i2) => {
        if (i1.isdir === i2.isdir) {
          return i2.name - i1.name
        } else {
          return i2.isdir - i1.isdir
        }
      })
      this.items = items
    },
    itemClick(item, event) {
      if (!item.isdir) {
        return
      }
      if (item.name === '..') {
        const p = (this.algTree[this.algShowPath] && this.algTree[this.algShowPath].parent) || 0
        this.$store.dispatch('SetShowPath', p)
      } else {
        this.$store.dispatch('SetShowPath', item.id)
      }
    },
    itemDbClick(item, event) {
      if (!item.isdir) {
        this.$router.push({ path: '/engineer/alg/edit/' + item.name })
      }
    },
    rename(item, event) {
      if (!item.isdir) {
        return
      }
      if (item.name === '..') {
        return
      }
      this.$prompt('请输入分类名称', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消'
      }).then(({ value }) => {
        return aapi.setSortName(item.id, value)
      }).then(res => {
        this.$store.dispatch('AlgGetAll')
      }).catch((err) => {
        console.error(err)
      })
    },
    copy(items) {
      let c = {
        project: this.$store.getters.project.project,
        algs: items
      }
      this.$store.dispatch('copyAlgs', c)
    },
    async paste() {
      let clipbloard = this.$store.getters.algClipboard
      let projectName = this.$store.getters.project.project
      let copyCount = 0
      for (let name in clipbloard.algs) {
        let a = clipbloard.algs[name]
        a.sort = parseInt(this.algShowPath)
        delete a.isdir
        try {
          if (clipbloard.project === projectName) {
            let newName = await this.$prompt('请输新图元名称', '提示', {
              confirmButtonText: '确定',
              cancelButtonText: '取消',
              inputValue: a.name
            }).catch(() => {})
            if (newName && newName.value) {
              await aapi.save(newName.value, a)
              copyCount++
            }
          } else {
            await aapi.save(a.name, a)
            copyCount++

            await rapi.cp(`project/${clipbloard.project}/res/icon/${a.image}`,
              `project/${projectName}/res/icon/${a.image}`)
            await rapi.cp(`project/${clipbloard.project}/algorithm/src/${a.func}.cpp`,
              `project/${projectName}/algorithm/src/${a.func}.cpp`)
          }
        } catch (err) {
          console.log('save alg error:', err)
        }
      }
      if (copyCount > 0) {
        this.$msg(`成功导入 ${copyCount} 个算法`, '成功')
        this.refresh()
      }
    },
    async del(items) {
      await this.$confirm('确定删除图元', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消'
      })
      for (let name in items) {
        try {
          if (!items[name].isdir) {
            await aapi.del(name)
          } else {
            await aapi.deleteSort(items[name].id)
          }
        } catch (err) {
          this.$msg.error(err)
        }
      }
      this.refresh()
    },
    callNewFile() {
      this.$prompt('请输入算法名称', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消'
      }).then(({ value }) => {
        if (this.algs[value]) {
          this.$msg.warning(`${value} 已经存在！`)
        } else {
          this.$router.push({ path: `/engineer/alg/create/${value}` })
        }
      }).catch((err) => {
        console.error(err)
      })
    },
    manageLib() {
      this.$router.push({ path: `/engineer/alg/lib` })
    },
    callNewDir() {
      this.$prompt('请输入分类名称', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消'
      }).then(({ value }) => {
        return aapi.createSort(value, this.algShowPath)
      }).then(res => {
        this.$store.dispatch('AlgGetAll')
      }).catch((err) => {
        console.error(err)
      })
    },
    refresh() {
      this.$store.dispatch('AlgGetAll')
    },
    doSearch() {
      this.seachAlgItems = []
      if (!this.searchKey) {
        return
      }
      let reg = null
      try {
        reg = new RegExp(this.searchKey, 'i')
      } catch (err) {
        this.$msg.error('正则表达式错误: ' + err)
        return
      }

      for (const name in this.algs) {
        if (reg.test(name) || reg.test(this.algs[name].desc)) {
          this.seachAlgItems.push({ name: name, isdir: false, ...(this.algs[name]) })
        }
      }
    }
  }
}
</script>

<style lang="scss" scoped>
  .alg-container {
    height: 100%;
  }
	.view {
		height: calc(100% - 36px);
		width: 100%;
    overflow: auto;
	}
  .unselectable {
    -webkit-user-select: none;  /* Chrome all / Safari all */
    -moz-user-select: none;     /* Firefox all */
    -ms-user-select: none;      /* IE 10+ */
    user-select: none;          /* Likely future */
  }
</style>
