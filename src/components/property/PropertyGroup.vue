
<template>
  <div :class="['PropertyGroup', !show && 'hidden']" :style="cusStyle">
    <div
      class="head"
      :expanded="lexpanded ? 'true' : 'false'"
      @click="handleExpand"
    >
      <div class="icon">
        <i :class="lexpanded ? 'icon-expand' : 'icon-collapse'" />
      </div>
      <div class="title">{{ title }}</div>
    </div>
    <div :class="['content', !lexpanded && 'collapsed']">
      <slot />
    </div>
  </div>
</template>

<script>
export default {
  name: 'PropertyGroup',
  props: {
    className: {
      type: String,
      default: ''
    },
    cusStyle: {
      type: Object,
      default: null
    },
    title: {
      type: String,
      default: ''
    },
    show: {
      type: Boolean,
      default: true
    },
    expanded: {
      type: Boolean,
      default: true
    }
  },
  data() {
    return {
      lexpanded: true
    }
  },
  mounted() {
    this.lexpanded = this.expanded
  },
  methods: {
    handleExpand() {
      this.lexpanded = !this.lexpanded
    }
  }
}
</script>

<style lang="css">
.PropertyGroup {
    background: #ecf0f1;
    font: 12px 'Microsoft YaHei';
    --bg-expand: url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAoAAAAICAMAAAD3JJ6EAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAyJpVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADw/eHBhY2tldCBiZWdpbj0i77u/IiBpZD0iVzVNME1wQ2VoaUh6cmVTek5UY3prYzlkIj8+IDx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IkFkb2JlIFhNUCBDb3JlIDUuMy1jMDExIDY2LjE0NTY2MSwgMjAxMi8wMi8wNi0xNDo1NjoyNyAgICAgICAgIj4gPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4gPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIgeG1sbnM6eG1wPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvIiB4bWxuczp4bXBNTT0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL21tLyIgeG1sbnM6c3RSZWY9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9zVHlwZS9SZXNvdXJjZVJlZiMiIHhtcDpDcmVhdG9yVG9vbD0iQWRvYmUgUGhvdG9zaG9wIENTNiAoV2luZG93cykiIHhtcE1NOkluc3RhbmNlSUQ9InhtcC5paWQ6QzBCN0FCRUU3NzExMTFFOTlFQjFFMDA4RkM3NzE5OTIiIHhtcE1NOkRvY3VtZW50SUQ9InhtcC5kaWQ6QzBCN0FCRUY3NzExMTFFOTlFQjFFMDA4RkM3NzE5OTIiPiA8eG1wTU06RGVyaXZlZEZyb20gc3RSZWY6aW5zdGFuY2VJRD0ieG1wLmlpZDpDMEI3QUJFQzc3MTExMUU5OUVCMUUwMDhGQzc3MTk5MiIgc3RSZWY6ZG9jdW1lbnRJRD0ieG1wLmRpZDpDMEI3QUJFRDc3MTExMUU5OUVCMUUwMDhGQzc3MTk5MiIvPiA8L3JkZjpEZXNjcmlwdGlvbj4gPC9yZGY6UkRGPiA8L3g6eG1wbWV0YT4gPD94cGFja2V0IGVuZD0iciI/PrAM5dcAAABFUExURb/BwfT3977BwamqqsnMzZOUlNPX19/j5ImKioeHh/f5+d7h4snLzNTY2Pr7/IiIiJOTk6mrq56foJ6fn7S1toaGhv///4ulXXIAAAAXdFJOU/////////////////////////////8A5kDmXgAAAD1JREFUeNokxkkSgCAAA8GguADukvz/qVRgDlONmUx0L8rdwX1DxuAkSL/1BfM0V5mqZL0GtTx+Zzz8JsAA9ZAFxigsqFUAAAAASUVORK5CYII=) no-repeat center;
    --bg-collapse: url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAgAAAAKCAMAAAC+Ge+yAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAyJpVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADw/eHBhY2tldCBiZWdpbj0i77u/IiBpZD0iVzVNME1wQ2VoaUh6cmVTek5UY3prYzlkIj8+IDx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IkFkb2JlIFhNUCBDb3JlIDUuMy1jMDExIDY2LjE0NTY2MSwgMjAxMi8wMi8wNi0xNDo1NjoyNyAgICAgICAgIj4gPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4gPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIgeG1sbnM6eG1wPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvIiB4bWxuczp4bXBNTT0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL21tLyIgeG1sbnM6c3RSZWY9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9zVHlwZS9SZXNvdXJjZVJlZiMiIHhtcDpDcmVhdG9yVG9vbD0iQWRvYmUgUGhvdG9zaG9wIENTNiAoV2luZG93cykiIHhtcE1NOkluc3RhbmNlSUQ9InhtcC5paWQ6MTlEMEIzNDQ3NzEyMTFFOUE2RDFDMzI1OUNGODkzQjEiIHhtcE1NOkRvY3VtZW50SUQ9InhtcC5kaWQ6MTlEMEIzNDU3NzEyMTFFOUE2RDFDMzI1OUNGODkzQjEiPiA8eG1wTU06RGVyaXZlZEZyb20gc3RSZWY6aW5zdGFuY2VJRD0ieG1wLmlpZDoxOUQwQjM0Mjc3MTIxMUU5QTZEMUMzMjU5Q0Y4OTNCMSIgc3RSZWY6ZG9jdW1lbnRJRD0ieG1wLmRpZDoxOUQwQjM0Mzc3MTIxMUU5QTZEMUMzMjU5Q0Y4OTNCMSIvPiA8L3JkZjpEZXNjcmlwdGlvbj4gPC9yZGY6UkRGPiA8L3g6eG1wbWV0YT4gPD94cGFja2V0IGVuZD0iciI/Ps1N6eUAAAA/UExURYiJiZ6en6mrq8nMzamqqtTY2NPX14eHh77AwPr7+4iIiN/j5N/i45+foL/CwsnLzPj6+rS1tpOTk4aGhv///0pgFIkAAAAVdFJOU///////////////////////////ACvZfeoAAAA3SURBVHjaYmDiFgEDBmEGPgFOMENYmJENyhAWFoQxhIX4YQxmFCleVpBidi4OiDksPBADAQIMAOvOBU7M/UDuAAAAAElFTkSuQmCC) no-repeat center;
}

.PropertyGroup.hidden {
    display: none;
}

.PropertyGroup>.head {
    height: 21px;
    display: flex;
    flex-direction: row;
    align-items: center;
    box-sizing: border-box;
    cursor: pointer;
}

.PropertyGroup>.head>.icon {
    width: 20px;
    height: 20px;
    pointer-events: none;
}

.PropertyGroup>.head>.icon>.icon-expand {
    width: 20px;
    height: 20px;
    background: var(--bg-expand);
    display: inline-block;
}

.PropertyGroup>.head>.icon>.icon-collapse {
    width: 20px;
    height: 20px;
    background: var(--bg-collapse);
    display: inline-block;
}

.PropertyGroup>.head>.title {
    flex: 1;
    height: 21px;
    line-height: 20px;
    padding-left: 4px;
    display: inline-block;
    border-bottom: 1px solid #d9d9d9;
    box-sizing: border-box;
    pointer-events: none;
    user-select: none;
}

.PropertyGroup>.content {
    position: relative;
    background: #fff;
    margin-left: 20px;
    transition: all 0.2s;
    overflow-y: hidden;
}

.PropertyGroup>.content.collapsed {
    height: 0 !important;
}

.PropertyGroup>.content>.property {
    line-height: 20px;
    border-bottom: 1px solid #d9d9d9;
    box-sizing: border-box;
    vertical-align: middle;
    display: flex;
    flex-direction: row;
}

.PropertyGroup>.content>.property>.label {
    padding: 0 4px;
    min-width: 66px;
    display: inline-flex;
    align-items: center;
    justify-content: flex-start;
    box-sizing: border-box;
    user-select: none;
}

.PropertyGroup>.content>.property>.field {
    max-width: calc(100% - 66px);
    position: relative;
    flex: 1;
    padding: 0;
    display: inline-block;
    border-left: 1px solid #d9d9d9;
    box-sizing: border-box;
}
</style>
