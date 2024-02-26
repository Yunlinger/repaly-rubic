/** When your routing table is too long, you can split it into small modules**/

import Layout from '@/layout'

const router = {
  path: '/teacher',
  component: Layout,
  name: 'Teacher',
  redirect: '/dispatch',
  hidden: true,
  meta: {
    title: '实操考试',
    icon: 'component',
    roles: ['admin', 'teacher']
  },
  children: [
    {
      path: 'task',
      component: () => import('@/rviews/teacher/task'),
      name: 'Task',
      hidden: true,
      meta: { title: '培训任务管理', icon: 'el-icon-right', roles: ['teacher'] }
    },
    {
      path: 'case/run/:id',
      component: () => import('@/rviews/case/run'),
      name: 'CaseRun',
      hidden: true,
      meta: { title: '案例运行', icon: 'el-icon-right', noCache: false }
    },
    {
      path: 'history',
      component: () => import('@/rviews/teacher/history'),
      name: 'History',
      hidden: true,
      meta: { title: '历史记录管理', icon: 'el-icon-right', roles: ['teacher'] }
    },
    {
      path: 'knowledge',
      component: () => import('@/rviews/teacher/knowledge'),
      name: 'Knowledge',
      hidden: true,
      meta: { title: '专业知识考核', icon: 'el-icon-right', roles: ['teacher'] }
    },
    {
      path: 'competition',
      component: () => import('@/rviews/teacher/competition'),
      name: 'Competition',
      hidden: true,
      meta: { title: '竞赛管理', icon: 'el-icon-right', roles: ['teacher'] }
    },
    {
      path: 'ticket',
      component: () => import('@/rviews/teacher/ticket'),
      name: 'Ticket',
      hidden: true,
      meta: { title: '操作票管理', icon: 'el-icon-right', roles: ['teacher'] }
    },
    {
      path: 'setting',
      component: () => import('@/rviews/teacher/setting'),
      name: 'Setting',
      hidden: true,
      meta: { title: '设置', icon: 'el-icon-right', roles: ['teacher'] }
    },
    // {
    //   path: 'dispatch',
    //   component: () => import('@/rviews/teacher/dispatch'),
    //   name: 'TeacherDispatch',
    //   meta: { title: '下发任务', icon: 'el-icon-right', roles: ['teacher'] }
    // },
    {
      path: 'dispatchs',
      component: () => import('@/rviews/teacher/dispatchs'),
      name: 'TeacherDispatchs',
      meta: { title: '下发任务', icon: 'el-icon-right', roles: ['teacher'], noCache: false }
    },
    // {
    //   path: 'status',
    //   component: () => import('@/rviews/teacher/status'),
    //   name: 'Status',
    //   meta: { title: '分组列表', icon: 'el-icon-right', roles: ['teacher'] }
    // },
    {
      path: 'oplog',
      component: () => import('@/rviews/teacher/oplog'),
      name: 'Oplog',
      meta: { title: '操作记录', icon: 'el-icon-right', roles: ['teacher'] }
    },
    {
      path: 'trainlog',
      component: () => import('@/rviews/teacher/trainlog'),
      name: 'Trainlog',
      meta: { title: '培训记录', icon: 'el-icon-right', roles: ['teacher'] }
    },
    {
      path: 'score',
      component: () => import('@/rviews/teacher/score'),
      name: 'Score',
      meta: { title: '查询实操成绩', icon: 'el-icon-right', roles: ['teacher'] }
    }
  ]
}

export default router
