module.exports = {
  /**
   * @type {string}
   * @description title
   */
  title: 'Rubik',

  /**
   * @type {string}
   * @description logo src
   */
  logo: 'https://www.xrubik.com/assets/img/%E9%87%8F%E4%BA%91%E7%A7%91%E6%8A%80.png',

  /**
   * @type {boolean} true | false
   * @description Whether show the settings right-panel
   */
  showSettings: false,

  /**
   * @type {boolean} true | false
   * @description Whether need tagsView
   */
  tagsView: true,

  /**
   * @type {boolean} true | false
   * @description Whether fix the header
   */
  fixedHeader: false,

  /**
   * @type {boolean} true | false
   * @description Whether show the logo in sidebar
   */
  sidebarLogo: true,

  /**
   * @type {string | array} 'production' | ['production', 'development']
   * @description Need show err logs component.
   * The default is only used in the production env
   * If you want to also use it in dev, you can pass ['production', 'development']
   */
  errorLog: []
}
