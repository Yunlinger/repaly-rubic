/** When your routing table is too long, you can split it into small modules**/

const router = [
  {
    path: '/framefull/default',
    component: () => import('@/rviews/mmi/runFullscreen'),
    name: 'DefaultRunFrame',
    hidden: true,
    meta: { title: 'RunFrame', icon: 'dashboard', noCache: false }
  },
  {
    path: '/framefull/foxboro',
    component: () => import('@/rviews/frame/foxboro/view/run'),
    name: 'FoxboroFrame',
    hidden: true,
    meta: { title: 'FoxboroFrame', icon: 'dashboard', noCache: false }
  }
]

export default router
