/** When your routing table is too long, you can split it into small modules**/

import Layout from '@/layout'

const router = {
  path: '/student',
  name: 'Student',
  component: Layout,
  hidden: true,
  redirect: '/dashboard',
  meta: {
    title: '学员',
    icon: 'component',
    roles: ['student']
  },
  children: [
    {
      path: 'study',
      component: () => import('@/rviews/student/study'),
      name: 'StudentStudy',
      meta: { title: '培训练习模式', icon: 'el-icon-right', noCache: false, roles: ['student'] }
    },
    {
      path: 'case',
      component: () => import('@/rviews/student/case'),
      name: 'Case',
      meta: { title: '考试鉴定模式', icon: 'el-icon-right', noCache: false, roles: ['student'] }
    }
  ]
}

export default router
