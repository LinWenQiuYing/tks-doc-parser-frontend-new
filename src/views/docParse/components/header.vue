<template>
  <div class="header">
    <div class="header-top">
      <div class="left">
        <img
          class="left-pic"
          src="@/assets/images/img/turnback.svg"
          @click="handleReturn"
        />
        <span class="left-title">{{ title }}</span> |
        <img class="left-base-pic" src="@/assets/images/img/doc-base.svg" />
        <span class="left-base">{{ docBase }}</span>
      </div>
      <div class="right">
        <div class="right-time">
          每<span class="right-time-set">{{ anaTimeValue }}</span
          >触发增量更新
        </div>
        <!-- v-model:checked="update" -->
        <a-switch
          checked-children="启用"
          un-checked-children="禁用"
          class="switch"
          :checked="autoAna"
        />
        <a-button type="primary" size="small" class="btn">编辑信息</a-button>
        <div class="right-action">
          <span>更多操作</span>
          <img class="right-pic" src="@/assets/images/img/more.svg" />
        </div>
      </div>
    </div>
  </div>
</template>
<script>
import { toRefs } from "vue";
import { Button, Switch } from "ant-design-vue";

export default {
  name: "Header",
  props: {
    data: {
      type: Object,
      require: true,
    },
  },
  emits: ["componentShowChange"],
  components: {
    AButton: Button,
    ASwitch: Switch,
  },
  setup(props, { emit }) {
    const handleReturn = () => {
      emit("componentShowChange", false, false);
    };

    return {
      ...toRefs(props.data),
      handleReturn,
    };
  },
};
</script>
<style lang="less" scoped>
.header {
  width: 100%;
  height: 68px;
  background-color: #eaedf0;

  &-top {
    height: 48px;
    display: flex;
    margin-bottom: 20px;
    align-items: center;
    background-color: #ffffff;
    padding: 10px 20px 10px 20px;
    justify-content: space-between;

    .left {
      display: flex;
      align-items: center;
      justify-content: center;

      &-title {
        font-size: 16px;
        font-weight: 600;
        color: #333333;
        margin-right: 12px;
      }

      &-pic {
        cursor: pointer;
        margin-right: 10px;
      }

      &-base-pic {
        margin-left: 12px;
        margin-right: 3px;
      }

      &-base {
        font-size: 14px;
        color: #666666;
      }
    }

    .right {
      display: flex;
      align-items: center;
      justify-content: center;

      &-time {
        height: 18px;
        display: flex;
        font-size: 14px;
        color: #a7b0be;
        margin-right: 10px;
        align-items: center;
        justify-content: center;

        &-set {
          height: 18px;
          margin: 0 2px;
          padding: 0 6px;
          line-height: 18px;
          text-align: center;
          border-radius: 36px 36px 36px 36px;
          background: rgba(62, 142, 255, 0.1);
        }
      }

      &-pic {
        width: 10px;
        height: 10px;
        margin-left: 4px;
      }

      .btn {
        width: 76px;
        height: 28px;
        margin-left: 20px;
        background: #1677ff;
        border: 1px solid #1677ff;
        border-radius: 4px 4px 4px 4px;
      }

      &-action {
        width: 96px;
        height: 28px;
        display: flex;
        color: #0c6aee;
        margin-left: 10px;
        align-items: center;
        background: #ffffff;
        justify-content: center;
        border: 1px solid #1677ff;
        border-radius: 4px 4px 4px 4px;
      }
    }
  }
}
</style>
