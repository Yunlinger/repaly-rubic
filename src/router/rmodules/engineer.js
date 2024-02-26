/** When your routing table is too long, you can split it into small modules**/

import Layout from '@/layout'

const router = {
  path: '/engineer',
  component: Layout,
  redirect: '/engineer/model/setting',
  name: 'Engineer',
  hidden: true,
  meta: {
    title: '开发',
    icon: 'component',
    roles: ['admin', 'engineer', 'teacher', 'student']
  },
  children: [
    {
      path: 'alg/create/:name',
      component: () => import('@/rviews/alg/create'),
      name: 'AlgCreate',
      hidden: true,
      meta: { title: '新建算法', icon: 'el-icon-right', noCache: false }
    },
    {
      path: 'alg/lib',
      component: () => import('@/rviews/alg/lib'),
      name: 'Lib',
      meta: { title: '算法库管理', icon: 'el-icon-right', noCache: true }
    },
    {
      path: 'alg/source',
      component: () => import('@/rviews/alg/sourceEditor'),
      name: 'SourceEditor',
      meta: { title: '源码编辑', icon: 'el-icon-right', noCache: false }
    },
    {
      path: 'alg/bulk',
      component: () => import('@/rviews/alg/bulk'),
      name: 'Lib',
      meta: { title: '组合变量定义', icon: 'el-icon-right', noCache: true }
    },
    {
      path: 'alg/edit/:name',
      component: () => import('@/rviews/alg/edit'),
      name: 'AlgEdit',
      hidden: true,
      meta: { title: '编辑算法', icon: 'el-icon-right', noCache: false }
    },
    {
      path: 'model/explorer',
      component: () => import('@/rviews/model/explorer'),
      name: 'ModelExplorer',
      meta: { title: '模型开发', icon: 'el-icon-right' }
    },
    {
      path: 'model/setting',
      component: () => import('@/rviews/model/setting'),
      name: 'ModelSetting',
      meta: { title: '设置', icon: 'el-icon-right', noCache: true }
    },
    {
      path: 'model/trace',
      component: () => import('@/rviews/model/trace'),
      name: 'Trace',
      meta: { title: '变量跟踪', icon: 'el-icon-right' }
    },
    {
      path: 'model/import',
      component: () => import('@/rviews/model/import'),
      name: 'Import',
      meta: { title: '模型导入', icon: 'el-icon-right' }
    },
    {
      path: 'model/edit/:name',
      component: () => import('@/rviews/model/flowchart'),
      name: 'FlowChart',
      hidden: true,
      meta: { title: '模型开发', icon: 'el-icon-right' }
    },
    {
      path: 'case/edit/:id',
      component: () => import('@/rviews/case/edit'),
      name: 'CaseEdit',
      hidden: true,
      meta: { title: '案例编辑', icon: 'el-icon-right', noCache: false }
    },
    {
      path: 'fault/edit/:id',
      component: () => import('@/rviews/fault/edit'),
      name: 'FaultEdit',
      hidden: true,
      meta: { title: '故障编辑', icon: 'el-icon-right', noCache: false }
    },
    {
      path: 'mmi/explorer',
      component: () => import('@/rviews/mmi/explorer'),
      name: 'MmiExplorer',
      meta: { title: '人机界面组态', icon: 'el-icon-right' }
    },
    {
      path: 'mmi/edit/:path*',
      component: () => import('@/rviews/mmi/editor'),
      name: 'MmiEditor',
      hidden: true,
      meta: { title: '画面编辑', icon: 'el-icon-right' }
    },
    {
      path: 'mmi/run/:main*',
      component: () => import('@/rviews/mmi/run'),
      name: 'MmiRun',
      hidden: true,
      meta: { title: '监控画面', icon: 'el-icon-right' }
    },
    {
      path: 'pointdb/index',
      component: () => import('@/rviews/pointdb/index'),
      name: 'PointDB',
      hidden: true,
      meta: { title: '变量库', icon: 'el-icon-right' }
    },
    {
      path: 'fault/index',
      component: () => import('@/rviews/fault/index'),
      name: 'PointDB',
      hidden: true,
      meta: { title: '故障列表', icon: 'el-icon-right' }
    },
    {
      path: 'model/iolist',
      component: () => import('@/rviews/model/iolist'),
      name: 'IOList',
      hidden: true,
      meta: { title: 'IO模块库', icon: 'el-icon-right', noCache: false }
    }
  ]
}
export default router
