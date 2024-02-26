const getters = {
  config: state => state.app.config,
  sidebar: state => state.app.sidebar,
  size: state => state.app.size,
  device: state => state.app.device,
  visitedViews: state => state.tagsView.visitedViews,
  cachedViews: state => state.tagsView.cachedViews,
  token: state => state.user.token,
  avatar: state => state.user.avatar,
  name: state => state.user.name,
  cname: state => state.user.cname,
  introduction: state => state.user.introduction,
  roles: state => state.user.roles,
  permission_routes: state => state.permission.routes,
  errorLogs: state => state.errorLog.logs,

  user: state => state.user,
  connects: state => state.user.connects,
  algs: state => state.alg.algs,
  algTree: state => state.alg.tree,
  bulks: state => state.alg.bulks,
  algShowPath: state => state.alg.showPath,
  nodeTemplate: state => state.alg.nodeTemplate,
  algClipboard: state => state.alg.clipboard,
  project: state => state.project,
  instances: state => state.project.instances,
  selectedInst: state => state.project.selectedInst
}
export default getters
