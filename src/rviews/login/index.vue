<template>
  <div class="app-page">
    <!-- <indexbg /> -->
    <div class="index_bg">
      <img :src="bg" style="width:100%; height: 100%; object-fit: cover;" />
    </div>
    <!-- <div style="height: 80px;">
      <lang-select class="set-language" />
    </div> -->
    <div class="container-fluid">
      <div class="row text-container ">
        <div class="tm-content section">
          <div class="content-box">
            <div class="logo"><img :src="defaultLogo" onerror="this.style.display='none'"></div>
            <div class="subscribe-form">
              <div class="row form-section">
                <div class="col">
                  <input
                    ref="username"
                    v-model="username"
                    type="text"
                    class="form-control"
                    :placeholder="$t('用户名')"
                    @keyup.enter="handleLogin"
                  >
                  <input
                    ref="password"
                    v-model="password"
                    type="password"
                    class="form-control"
                    :placeholder="$t('密码')"
                    @keyup.enter="handleLogin"
                  >
                  <div>
                    <img :src="logo" style="height: 50px;" onerror="this.style.display='none'" />
                    <button class="tm-btn-subscribe" style="float: right;" @click="handleLogin">
                      {{ $t('登录') }}
                    </button>
                  </div>
                  <!-- <button class="tm-btn-subscribe">注册</button> -->
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="footer-link">
        <!-- <p>Copyright © 2020 {{ $t('量云科技') }}</p> -->
        <!-- <p>
          tell :
          <a
            href=""
            target="_blank"
            title=""
          >
            0000-88888888
          </a>
        </p> -->
      </div>
    </div>
  </div>
</template>

<script>

// import Indexbg from '@/components/Indexbg'
// import LangSelect from '@/components/LangSelect'
import * as rapi from '@/api/res'
import i18n from '@/lang'

export default {
  name: 'Login',
  // components: { Indexbg, LangSelect },
  data() {
    return {
      username: '',
      password: '',
      loading: false,
      redirect: undefined,
      otherQuery: {},
      bg: rapi.getStaticUrl('login_bg.jpg'),
      defaultLogo: rapi.getStaticUrl('login_title.jpg'),
      logo: rapi.getStaticUrl('login_logo.jpg')
    }
  },
  watch: {
    $route: {
      handler: function(route) {
        const query = route.query
        if (query) {
          this.redirect = query.redirect
          this.otherQuery = this.getOtherQuery(query)
        }
      },
      immediate: true
    }
  },
  mounted() {
    this.username = ''
    this.password = ''
    if (this.username === '') {
      this.$refs.username.focus()
    } else if (this.password === '') {
      this.$refs.password.focus()
    }
  },
  methods: {
    handleLogin() {
      const loginData = {
        username: this.username,
        password: this.password
      }
      this.loading = true
      this.$store.dispatch('user/login', loginData).then(() => {
        this.$router.push({ path: this.redirect || '/', query: this.otherQuery })
      }).then(() => {
        return this.$store.dispatch('user/getInfo')
      }).then(({ cname }) => {
        this.$msg(`${i18n.t('欢迎您')}, ${cname}`, `${i18n.t('登录成功')}`)
      }).catch(err => {
        this.$msg.error(err, `${i18n.t('登录失败')}`)
      }).finally(() => {
        this.loading = false
      })
    },
    getOtherQuery(query) {
      return Object.keys(query).reduce((acc, cur) => {
        if (cur !== 'redirect') {
          acc[cur] = query[cur]
        }
        return acc
      }, {})
    }
  }
}
</script>

<style scoped src="@/assets/iconfont/iconfont.css" />
<style lang="scss" scoped src="@/styles/login.scss" />
<style scoped src="../../../node_modules/bootstrap/dist/css/bootstrap.min.css" />

<style rel="stylesheet/scss" lang="scss" scoped>
.footer-link {
  position: relative;
  font-size: 18px;
  bottom: 0;
  left: 0;
  color: white;
  text-align: center;
  width: 100%;
  z-index: 1001;
  p {
    a {
      color: #e6e6fa;
      cursor: pointer;
    }
  }
}
.app-page {
  width: 100%;
  height: 100%;
  overflow: hidden;
  .index_bg {
    width: 100%;
    height: 100%;
    overflow: hidden;
    position: absolute;
    left: 0; top: 0;
    filter: blur(1px);
  }
  .dropdown {
    position: fixed;
    z-index: 9999888;
    top: 20px;
    right: 20px;
    color: #fff;
    span {
      padding-right: 15px;
      font-size: 2rem;
      &:after {
        padding-left: 10px;
        content: "▽";
      }
    }
    ul {
      padding: 5px 0;
      margin: 5px 0;
      border: 1px solid #ebeef5;
      border-radius: 4px;
      box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
      li {
        font-size: 1.5rem;
        text-align: center;
        &:hover {
          background: rgba(175, 238, 238, 0.2);
          cursor: pointer;
        }
      }
    }
  }
  .text-container {
    height: 90vh;
    display: flex;
    align-items: center;
    .tm-content {
      z-index: 1001;
      margin: 0 auto;
      &.ml-auto {
        margin-left: auto !important;
        padding-bottom: 20px;
      }
      .content-box {
        padding: 15px;
        border-radius: 10px;
        background: rgba(0, 0, 0, .6);
        .subscribe-form {
          .form-section {
            display: flex;
            flex-direction: row-reverse;
            color: #ffffff;
            background-color: transparent;
          }
        }
        .logo {
          width: 500px;
          margin-bottom: 10px;
          img {
            width: 100%;
          }
        }

        .mb-5 {
          margin-bottom: 3rem !important;
          color: #ffffff;
          font-size: large;
          h1 {
            color: #ffffff;
            font-size: 4rem;
          }
        }
        .subscribe-form {
          .form-section {
            color: #ffffff;
            background-color: transparent;
            .form-control {
              height: 50px;
              color: #ffffff;
              border-radius: 0.5rem;
              background-color: transparent;
              border: 1px solid #eeeeee;
              font-size: 18px;
              font-weight: 300;
              padding: 0.75rem 1.2rem;
              margin: 0.4rem 0;
              overflow: hidden;
              white-space: nowrap;
              text-overflow: ellipsis;
              &::-webkit-input-placeholder {
                color: #dddddd;
                font-size: 16px;
                background-color: transparent;
              }
              &:-webkit-autofill,
              &:-webkit-autofill:hover,
              &:-webkit-autofill:focus,
              &:-webkit-autofill:active {
                  transition-delay: 99999s;
                  transition: color 99999s ease-out, background-color 99999s ease-out;
              }
            }
            .tm-btn-subscribe {
              height: 50px;
              background-color: #006699;
              border-radius: 0.5rem;
              border-color: white;
              padding: 0.75rem 1.6rem;
              font-weight: 300;
              font-size: 18px;
              cursor: pointer;
              color: white;
              @media screen and (max-width: 768px) {
                margin-top: 20px;
              }
            }
            .help-box {
              padding: 10px 0 20px 10px;
              color: #843534;
              font-size: 1.5rem;
              strong {
                position: absolute;
                background: #fff;
                border-radius: 5px;
                padding: 0 8px 0 8px;
                font-size: 1.5rem;
                line-height: 3rem;

                &:before {
                  z-index: 999;
                  content: "";
                  display: block;
                  position: relative;
                  width: 0;
                  height: 0;
                  border-left: 10px solid transparent;
                  border-right: 10px solid transparent;
                  border-bottom: 10px solid #fff;
                  margin: -9px 0 0 20px;
                }
                a {
                  color: #bd2c00;
                }
              }
              p {
                color: #fff;
                button {
                  background: none;
                  color: #e6e6fa;
                  cursor: pointer;
                  border-bottom: 1px solid #e6e6fa;
                }
              }
            }
          }
        }
      }
    }
  }
}
.set-language {
  color: #fff;
  position: absolute;
  top: 20px;
  font-size: 18px;
  right: 20px;
  cursor: pointer;
  z-index: 9999;
}
</style>
