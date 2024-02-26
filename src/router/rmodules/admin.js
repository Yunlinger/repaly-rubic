/** When your routing table is too long, you can split it into small modules**/

import Layout from '@/layout'

const router = {
  path: '/admin',
  component: Layout,
  name: 'Admin',
  alwaysShow: true,
  meta: {
    title: '管理员',
    icon: 'component',
    roles: ['admin']
  },
  children: [
    {
      path: 'user',
      component: () => import('@/rviews/admin/user'),
      name: 'UserManage',
      meta: { title: '用户管理', icon: 'el-icon-right', noCache: false }
    },
    {
      path: 'group',
      component: () => import('@/rviews/admin/group'),
      name: 'GroupManage',
      meta: { title: '团队管理', icon: 'el-icon-right', noCache: false }
    },
    {
      path: 'project',
      component: () => import('@/rviews/admin/project'),
      name: 'ProjectManage',
      meta: { title: '工程管理', icon: 'el-icon-right', noCache: false }
    },
    {
      path: 'group/:id/users',
      component: () => import('@/rviews/admin/groupUsers'),
      name: 'GroupUsers',
      hidden: true,
      meta: { title: '团队成员管理', icon: 'el-icon-right', noCache: false }
    },
    {
      path: 'user/:id/groups',
      component: () => import('@/rviews/admin/userGroups'),
      name: 'UserGroups',
      hidden: true,
      meta: { title: '团队分配管理', icon: 'el-icon-right', noCache: false }
    },
    {
      path: 'group/:id/projects',
      component: () => import('@/rviews/admin/groupProjects'),
      name: 'GroupProjects',
      hidden: true,
      meta: { title: '团队工程分配', icon: 'el-icon-right', noCache: false }
    },
    {
      path: 'syslog',
      component: () => import('@/rviews/admin/syslog'),
      name: 'Syslog',
      meta: { title: '系统日志', icon: 'el-icon-right', noCache: false }
    }
  ]
}

export default router
