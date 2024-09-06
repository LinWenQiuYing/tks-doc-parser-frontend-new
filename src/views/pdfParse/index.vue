<template>
  <div class="doc-config" v-if="isDocConfigShow">
    <Header :data="headerData" @componentShowChange="componentShowChange" />
    <ParserConfig
      :modalTitle="modalTitle"
      :editTaskId="editTaskId"
      :params="params"
      :checkType="checkType"
      @changeIsDocConfigShow="changeIsDocConfigShow"
      @changeFiles="changeFiles"
      @addFiles="addFiles"
      @increaseParam="increaseParam"
    ></ParserConfig>
  </div>
  <div class="parse" v-if="!isDocConfigShow && !isDetailShow">
    <ParserHome
      :modalTitle="modalTitle"
      :checkType="checkType"
      @changeModalTitle="changeModalTitle"
      @changeHeaderData="changeHeaderData"
      @changeEditTaskId="changeEditTaskId"
      @changeIsDocConfigShow="changeIsDocConfigShow"
      @changeIsDetailShow="changeIsDetailShow"
      @changeDetail="changeDetail"
      @changeCheckType="changeCheckType"
      @changeParams="changeParams"
    ></ParserHome>
  </div>
  <div class="doc-detail" v-if="isDetailShow">
    <Header :data="headerData" @componentShowChange="componentShowChange" />
    <!-- <parser-detail :checkItem="list[checkIndex]" :list="list" /> -->
    <parser-detail :checkItem="detail" />
  </div>
</template>

<script>
import { reactive, ref, toRefs } from "vue";

import Header from "./components/header";
import ParserConfig from "./components/parserConfig";
import ParserDetail from "./components/parserDetail";
import ParserHome from "./components/parserHome";

export default {
  name: "PdfParse",
  components: {
    Header,
    ParserDetail,
    ParserHome,
    ParserConfig,
  },
  setup() {
    const detailData = reactive({
      detail: {},
      params: {
        files: [],
        paramList: [
          {
            name: undefined, //名称
            tag: undefined, //标签
            type: undefined, //类型
            rules: [],
            ifDrag: true, //具体解析内容是否展开
          },
        ],
      },
      headerData: {},
    });

    //Header标题修改
    const changeHeaderData = (value) => {
      detailData.headerData = value;
    };

    //查看任务时，选中任务的相关信息
    const changeDetail = (value) => {
      detailData.detail = value;
    };

    //新增任务的相关参数
    const changeParams = (value) => {
      detailData.params = value;
    };

    //修改params中的files
    const changeFiles = (value) => {
      // console.log("传递的files变了", value);
      detailData.params.files = value;
    };
    //上传时新增params中的files
    const addFiles = (value) => {
      detailData.params.files.push(value);
      console.log("111111", detailData.params.files);
    };

    //修改params中的paramList
    const increaseParam = (value) => {
      console.log("触发修改！！！！！");
      detailData.params.paramList = value;
    };

    //解析记录页面显示
    const isDetailShow = ref(false);
    const changeIsDetailShow = (value) => {
      isDetailShow.value = value;
    };

    // 解析配置页面显示
    let isDocConfigShow = ref(false);
    const changeIsDocConfigShow = (value) => {
      isDocConfigShow.value = value;
    };

    // 新增任务、编辑任务弹窗title
    const modalTitle = ref("");
    const changeModalTitle = (value) => {
      modalTitle.value = value;
    };

    //判断是新增任务还是编辑任务
    const checkType = ref("");
    const changeCheckType = (value) => {
      checkType.value = value;
    };

    //编辑任务时的ID
    //编辑任务的id
    const editTaskId = ref(undefined);
    const changeEditTaskId = (value) => {
      editTaskId.value = value;
    };

    // 组件显隐改变
    const componentShowChange = (configShow, detailShow) => {
      isDocConfigShow.value = configShow;
      isDetailShow.value = detailShow;
    };

    return {
      isDetailShow,
      isDocConfigShow,
      modalTitle,
      changeModalTitle,
      editTaskId,
      checkType,
      ...toRefs(detailData),

      componentShowChange,
      changeHeaderData,
      changeIsDocConfigShow,
      changeIsDetailShow,
      changeEditTaskId,
      changeDetail,
      changeParams,
      changeFiles,
      addFiles,
      changeCheckType,
      increaseParam,

      XPathResult,
    };
  },
};
</script>
<style lang="less">
.doc-config {
  width: 100%;
  height: 100%;
}
.parse {
  width: 100%;
  height: 100%;
}

.doc-detail {
  width: 100%;
  height: 100%;
}
</style>
