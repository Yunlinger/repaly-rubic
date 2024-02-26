<template>
  <table class="table">
    <!-- <thead>
      <tr>
        <th class="col-md-2">{{ "" }}</th>
        <th class="col-md-2">{{ "" }}</th>
        <th class="col-md-4">{{ "" }}</th>
        <th class="col-md-4">{{ "" }}</th>
      </tr>
    </thead> -->
    <tbody>
      <tr v-for="(item, index) in condition" :key="index">
        <td class="index">{{ item.id }}</td>
        <td class="name">{{ item.name }}</td>
        <td class="op" @click="switchCond(item)">{{ "切换" }}</td>
      </tr>
    </tbody>
  </table>
</template>

<script>
import * as capi from '@/api/condition'
import { mapGetters } from 'vuex'

export default {
  name: 'TeacherCondition',
  data() {
    return {
      lproject: '',
      lid: '',
      condition: []
    }
  },
  computed: {
    ...mapGetters(['project'])
  },
  watch: {
    project: {
      deep: true,
      handler: function(val, oldVal) {
        if (val.project !== this.lproject || val.id !== this.lid) {
          this.getList()
          this.lproject = val.project
          this.lid = val.id
        }
      }
    }
  },
  mounted() {
    this.getList()
  },
  methods: {
    getList() {
      capi.list().then(response => {
        this.condition = response.items
      }).catch(() => {
      })
    },
    switchCond(item) {
      this.$confirm('切换条件 ' + item.name + ' ?', '提示', {
        confirmButtonText: '切换',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        return capi.load(item.id)
      }).then(() => {
        this.$msg.success('载入条件: ' + item.name)
      }).catch(() => {})
    }
  }
}
</script>

<style lang="scss" scoped>
  .table {
    width: 100%;
    table-layout: fixed;
    border-spacing: 0;

    .index {width: 32px;}
    .op {
      width: 48px;
      &:hover {
        cursor: pointer;
        font-weight: bolder;
      }
    }
    tr {
      border: none;
      th {
        font-size: 1.0rem;
        text-align: center;
        background-color: transparent;
        color: #fffdef;
        border: 1px solid#0086B3;
      }
      td {
        font-size: 0.7rem;
        text-align: center;
        border: 1px solid#0086B3;
        color: #19d4ae;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        padding: 4px;
      }
      &:nth-child(odd) {
        td {
          color: #5ab1ef;
        }
      }
    }
  }
</style>
