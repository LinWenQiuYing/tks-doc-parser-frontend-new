<template>
  <div class="parser-detail">
    <div class="parser-detail-left">
      <div class="left-title">解析记录</div>
      <div class="left-content">
        <div
          class="left-content-item"
          v-for="(item, index) in taskList"
          :key="index"
        >
          <div class="item-time">{{ item.time }}</div>
          <div
            :class="[
              'item-task',
              index === checkIndex[0] && num === checkIndex[1] ? 'active' : '',
            ]"
            v-for="(child, num) in item.list"
            :key="num"
            @click.stop="handleSelectItem(index, num)"
          >
            <div class="task-left">
              <img :src="child.src" alt="" class="task-left-status" />
            </div>
            <div class="task-middle">
              <div class="task-middle-top">
                <img
                  src="@/assets/images/img/icon-audit.png"
                  alt=""
                  class="task-middle-icon"
                />
                <span class="task-middle-title" :title="child.name">{{
                  child.name
                }}</span>
                <span class="task-middle-label">文档 {{ child.num }}</span>
              </div>
              <div
                :class="[
                  'task-middle-bottom',
                  child.status === 'success'
                    ? 'success'
                    : child.status === 'fail'
                    ? 'fail'
                    : child.status === 'ing'
                    ? 'ing'
                    : '',
                ]"
              >
                {{
                  child.status === "success"
                    ? "解析成功"
                    : child.status === "fail"
                    ? "解析失败"
                    : child.status === "ing"
                    ? "正在解析"
                    : "未解析"
                }}
                <a-tooltip placement="right" v-if="child.status === 'fail'">
                  <template #title>
                    <span>{{ child.error }}</span>
                  </template>
                  <question-circle-outlined />
                </a-tooltip>
              </div>
            </div>
            <div class="task-right">
              <div class="task-right-time">
                <play-circle-outlined />
                {{ child.startTime }}
              </div>
              <div
                class="task-right-time ing"
                v-if="child.status === 'ing'"
                @click.stop="handleCancelParse(index, num)"
              >
                <minus-circle-outlined />
                取消解析
              </div>
              <div class="task-right-time" v-else-if="child.endTime">
                <minus-circle-outlined />
                {{ child.endTime }}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div class="parser-detail-right">
      <a-button
        class="right-btn"
        type="primary"
        @click="handleExport"
        :disabled="!selectedTask.id"
        >导出</a-button
      >
      <a-button
        class="right-btn save"
        type="primary"
        @click="handleSave"
        :disabled="!selectedDoc.results"
        >保存</a-button
      >
      <a-tabs
        class="right-content-tabs"
        v-model:activeKey="activeKey"
        animated
        @change="handleChangeTab"
      >
        <a-tab-pane key="1" tab="解析统计">
          <a-spin
            size="large"
            v-if="searchLoading"
            tip="正在查询"
            class="right-content-spin"
          />
          <div v-else class="right-content-detail">
            <div class="right-progress">
              <div class="right-progress-item">
                <a-progress
                  type="circle"
                  :percent="successPercent"
                  :width="100"
                />
                <div class="item-text">
                  <span class="item-text-num success">{{ successNum }}</span>
                  <span class="item-text-status">执行成功</span>
                </div>
              </div>
              <div class="right-progress-item">
                <a-progress
                  type="circle"
                  :percent="errorPercent"
                  :width="100"
                />
                <div class="item-text">
                  <span class="item-text-num error">{{ errorNum }}</span>
                  <span class="item-text-status">执行异常</span>
                </div>
              </div>
              <div class="right-progress-item">
                <a-progress type="circle" :percent="failPercent" :width="100" />
                <div class="item-text">
                  <span class="item-text-num fail">{{ failNum }}</span>
                  <span class="item-text-status">执行失败</span>
                </div>
              </div>
            </div>
            <div class="right-graph-line" ref="lineGraph"></div>
            <div class="right-graph-bar" ref="barGraph1"></div>
            <div class="right-graph-bar" ref="barGraph2"></div>
          </div>
        </a-tab-pane>
        <a-tab-pane key="2" tab="解析细项">
          <div class="document-header">
            <!-- <span class="document-header-title">文档</span> -->
            <span class="document-header-title">{{
              selectedDoc.fileName
            }}</span>
            <span class="document-header-page">
              <span class="page-current">{{ current }}</span
              >/{{ selectedTask.num }}
            </span>
          </div>
          <div class="document-box" ref="docDom">
            <div
              :class="[
                'document-box-btn',
                'left',
                current <= 1 ? 'disabled' : '',
              ]"
              @click="handleChangePage('left')"
            >
              <img src="@/assets/images/img/btn-left.svg" alt="" />
            </div>
            <div :class="['document-box-content', animation]">
              <a-spin
                v-if="selectedDoc.isLoading"
                tip="正在加载文档"
                class="document-spin"
              />
              <div
                v-else-if="selectedDoc.src"
                v-html="selectedDoc.src"
                class="content-box"
              ></div>
              <span v-else class="no-content-tip">获取文档内容失败</span>
            </div>
            <div
              :class="[
                'document-box-btn',
                'right',
                current >= selectedTask.num ? 'disabled' : '',
              ]"
              @click="handleChangePage('right')"
            >
              <img src="@/assets/images/img/btn-right.svg" alt="" />
            </div>
          </div>
          <!-- && selectedDoc.src -->
          <div class="drag-line" @mousedown="onmousedown"></div>
          <a-tabs
            class="document-tabs"
            animated
            ref="resultsTab"
            v-if="!selectedDoc.isLoading && selectedDoc.results"
            v-model:activeKey="resultActiveKey"
          >
            <a-tab-pane
              v-for="(tab, index) in selectedDoc.results"
              :key="tab.id"
              :tab="tab.title"
            >
              <div
                class="document-item"
                v-for="(item, num) in tab.resList"
                :key="num"
              >
                <div class="document-tabs-text" v-if="!item.isEdit">
                  {{ tab.ruleName }}：{{ item.value }}
                </div>
                <div class="document-tabs-text" v-else>
                  <a-textArea
                    placeholder="请输入"
                    allow-clear
                    class="text-area"
                    v-model:value="item.value"
                  />
                </div>
                <div class="document-tabs-btns">
                  <icon-svg
                    className="action-btn"
                    icon-class="icon_editor"
                    @click="handleEdit(index, num)"
                    v-if="!item.isEdit && tab.resType !== 3"
                  />
                  <save-outlined
                    class="action-btn"
                    @click="handleEdit(index, num)"
                    v-else-if="item.isEdit && tab.resType !== 3"
                  />
                  <icon-svg
                    className="action-btn"
                    icon-class="icon_delete"
                    color="#fff"
                    @click="handleDelete(index)"
                  />
                </div>
              </div>
            </a-tab-pane>
          </a-tabs>
        </a-tab-pane>
      </a-tabs>
    </div>
  </div>
</template>
<script>
import {
  cancelParse,
  deleteResult,
  editResult,
  exportExcel,
  getFile,
  getFileParserRes,
  getParserFileList,
  getTaskDetail,
} from "@/shared/api/task.js";
import { downloadFile, modalConfirm } from "@/utils/common.js";
import {
  Button,
  Input,
  Progress,
  Spin,
  Tabs,
  Tooltip,
  message,
} from "ant-design-vue";
import * as echarts from "echarts";
import { find } from "lodash";
import {
  computed,
  nextTick,
  onBeforeUnmount,
  onMounted,
  ref,
  watchEffect,
} from "vue";

const { TabPane } = Tabs;
const { TextArea } = Input;

export default {
  name: "ParserDetail",
  components: {
    AButton: Button,
    AProgress: Progress,
    ASpin: Spin,
    ATabs: Tabs,
    ATabPane: TabPane,
    ATextArea: TextArea,
    ATooltip: Tooltip,
  },
  props: {
    checkItem: {
      require: true,
      type: Object,
    },
  },
  setup(props) {
    // console.log("detail", props.checkItem);
    // watch(props.checkItem, (newValue) => {
    //   console.log(newValue);
    // });
    const taskList = ref([]);
    const checkIndex = ref([0, 0]);
    const successNum = ref(0);
    const successPercent = ref(0);
    const errorNum = ref(0);
    const errorPercent = ref(0);
    const failNum = ref(0);
    const failPercent = ref(0);
    const current = ref(1); // 当前所在的页码 页码从1开始，数组下标从0开始

    const selectedTask = computed(() => {
      // 当前选中的解析任务详情
      if (taskList.value.length) {
        return (
          taskList.value[checkIndex.value[0]].list[checkIndex.value[1]] || {}
        );
      } else {
        return {};
      }
    });

    const selectedDoc = computed(() => {
      // 当前选中的解析任务详情的当前文档
      if (
        selectedTask.value.documentList &&
        selectedTask.value.documentList.length
      ) {
        return selectedTask.value.documentList[current.value - 1] || {};
      } else {
        return {};
      }
    });

    const lineGraph = ref(null);
    const barGraph1 = ref(null);
    const barGraph2 = ref(null);
    const myChart1 = ref(null);
    const myChart2 = ref(null);
    const myChart3 = ref(null);
    const activeKey = ref("1");
    const resultActiveKey = ref(null);
    const searchLoading = ref(false); // 左侧任务列表是否在加载

    // 获取任务列表
    const getTaskList = async (id) => {
      searchLoading.value = true;
      const res = await getTaskDetail(id);
      searchLoading.value = false;
      taskList.value = [];
      setTimeout(() => {
        initGraph();
      }, 0);
      if (res.message === "成功") {
        for (let key in res.data) {
          const value = res.data[key];
          taskList.value.push({
            time: key,
            list: value.map((item) => ({
              id: item.id,
              status:
                item.status == 0
                  ? "default"
                  : item.status == 1
                  ? "ing"
                  : item.status == 2
                  ? "fail"
                  : "success",
              name: item.taskId,
              num: item.fileCount || 0,
              src: require("@/assets/images/img/status-success.png"),
              startTime: item.startTime.split(" ")[1],
              endTime: item.endTime.split(" ")[1],
              successNum: item.sucCount || 0,
              errorNum: item.errCount || 0,
              failNum: item.abnCount || 0,
              error: item.errMsg,
              documentList: [],
            })),
          });
        }
      } else {
        message.error(res.message);
      }
      if (taskList.value.length) {
        handleSelectItem(0, 0);
      } else {
        message.info("暂无解析任务信息");
      }
    };

    // 选中解析任务
    const handleSelectItem = (index, num) => {
      checkIndex.value = [index, num];
      handleCompute();
      handleGetDocumentDetail();
    };

    // 点击切换解析详情
    const handleChangeTab = (key) => {
      activeKey.value = key;
      if (
        key === "2" &&
        !selectedDoc.value.src &&
        selectedDoc.value.results &&
        !selectedDoc.value.results.length
      ) {
        // src合results一个有数据，就说明已经调用过下面的方法了
        handleGetDocDetail();
      }
    };

    // 点击取消解析
    const handleCancelParse = async (index, num) => {
      checkIndex.value = [index, num];
      const loading = message.loading("正在操作", 0);
      const res = await cancelParse(selectedTask.value.id);
      loading();
      if (res.message === "成功") {
        message.success("操作成功！");
        getTaskList(props.checkItem.id);
      } else {
        message.error(res.message);
      }
    };

    // 点击导出
    const handleExport = async () => {
      const loading = message.loading("正在导出", 0);
      const res = await exportExcel(selectedTask.value.id);
      loading();
      if (Object.prototype.toString.call(res) === "[object Object]") {
        message.error("文档导出失败！");
      } else {
        downloadFile(res, selectedTask.value.name, {
          type: "application/vnd.ms-excel",
        });
      }
    };

    // 获取三种状态的文件数量与计算各自占比
    const handleCompute = () => {
      successNum.value = selectedTask.value.successNum;
      errorNum.value = selectedTask.value.errorNum;
      failNum.value = selectedTask.value.failNum;

      const total = successNum.value + errorNum.value + failNum.value;
      successPercent.value = successNum.value
        ? parseFloat(((successNum.value / total) * 100).toFixed(2))
        : 0;
      errorPercent.value = errorNum.value
        ? parseFloat(((errorNum.value / total) * 100).toFixed(2))
        : 0;
      failPercent.value = failNum.value
        ? parseFloat(((failNum.value / total) * 100).toFixed(2))
        : 0;
    };

    // 获取当前解析任务对应的解析细项
    const handleGetDocumentDetail = async () => {
      const parseId = selectedTask.value.id;
      const documentList = selectedTask.value.documentList || [];
      if (documentList.length) return; // 如果存在文档列表数据，则已经调过下面的接口，不再需要调用接口
      if (!parseId) return;
      const res = await getParserFileList(parseId);
      const list = [];
      if (res.message === "成功" && res.data && res.data.length) {
        res.data.map((item) => {
          list.push({
            fileName: item.fileName,
            filePath: item.filePath,
            outputId: item.outputId,
            parserId: item.parserId,
            src: null,
            results: [],
            isLoading: true,
          });
        });
        current.value = 1;
      } else if (res.message !== "成功") {
        message.error(res.message);
      } else {
        message.error("暂无文档信息");
      }
      selectedTask.value.documentList = list;
      if (list.length && activeKey.value === "2") {
        handleGetDocDetail();
      }
    };

    const animation = ref(""); // 左右切换的类名
    // 切换页码
    const handleChangePage = (type) => {
      animation.value = "";
      if (type === "left" && current.value > 1) {
        current.value -= 1;
        nextTick(() => {
          animation.value = "flip-in-ver-right";
        });
      } else if (type === "right" && current.value < selectedTask.value.num) {
        current.value += 1;
        nextTick(() => {
          animation.value = "flip-in-ver-left";
        });
      }
      resultActiveKey.value =
        (selectedDoc.value.results &&
          selectedDoc.value.results.length &&
          selectedDoc.value.results[0].id) ||
        undefined;
      if (
        !selectedDoc.value.src &&
        selectedDoc.value.results &&
        !selectedDoc.value.results.length
      ) {
        handleGetDocDetail();
      }
    };

    // 获取当前文档文件
    const handleGetDocument = async () => {
      if (selectedDoc.value.filePath) {
        const res = await getFile(selectedDoc.value.filePath);
        selectedDoc.value.isLoading = false;
        if (Object.prototype.toString.call(res) === "[object Object]") {
          message.error("获取文档失败！");
        } else {
          selectedDoc.value.src = res;
        }
      } else {
        selectedDoc.value.isLoading = false;
        message.info("暂无文档信息");
        console.log("bingo", selectedDoc.value, selectedDoc.value.isLoading);
      }
    };

    // 获取文档解析结果
    const getParserRes = async () => {
      if (selectedDoc.value.parserId && selectedDoc.value.outputId) {
        const res = await getFileParserRes(
          selectedDoc.value.parserId,
          selectedDoc.value.outputId
        );
        if (res.message === "成功" && res.data && res.data.length) {
          res.data.map((item) => {
            const obj = {
              id: item.id,
              title: item.fieldName,
              ruleName: item.ruleName,
              resList: [],
              resType: item.result.resultType,
            };

            if (obj.resType === 3) {
              // 表格
              obj.resList = item.result.resultBody.thead.map((cell, index) => ({
                value: {
                  head: cell,
                  body: item.result.resultBody.tbody[index],
                },
                isEdit: false,
              }));
            } else {
              // 文本、图片
              obj.resList = item.result.resultBody.data.map((cell) => ({
                value: cell,
                isEdit: false,
              }));
            }
            selectedDoc.value.results.push(obj);
          });
          console.log("biubiubiu", selectedDoc.value.result);
          resultActiveKey.value =
            (res.data && res.data.length && res.data[0].id) || undefined;
        } else if (res.message !== "成功") {
          message.error(res.message);
        } else {
          message.info("暂无当前文章的解析结果");
        }
      } else {
        message.info("暂无解析结果信息");
      }
    };

    // 组合获取文档与其解析结果方法
    const handleGetDocDetail = () => {
      getParserRes();
      handleGetDocument();
    };

    const initGraph = () => {
      myChart1.value = echarts.init(lineGraph.value);
      const option1 = {
        title: {
          text: "新增数据量",
        },
        tooltip: {
          trigger: "axis",
        },
        legend: {
          top: 30,
          data: ["Email", "Union Ads", "Video Ads", "Direct", "Search Engine"],
        },
        grid: {
          top: "60",
          left: "10",
          right: "10",
          bottom: "10",
          containLabel: true,
        },
        xAxis: {
          type: "category",
          data: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
        },
        yAxis: {
          type: "value",
        },
        series: [
          {
            name: "Email",
            type: "line",
            stack: "Total",
            data: [120, 132, 101, 134, 90, 230, 210],
          },
          {
            name: "Union Ads",
            type: "line",
            stack: "Total",
            data: [220, 182, 191, 234, 290, 330, 310],
          },
          {
            name: "Video Ads",
            type: "line",
            stack: "Total",
            data: [150, 232, 201, 154, 190, 330, 410],
          },
          {
            name: "Direct",
            type: "line",
            stack: "Total",
            data: [320, 332, 301, 334, 390, 330, 320],
          },
          {
            name: "Search Engine",
            type: "line",
            stack: "Total",
            data: [820, 932, 901, 934, 1290, 1330, 1320],
          },
        ],
      };
      myChart1.value.setOption(option1);

      myChart2.value = echarts.init(barGraph1.value);
      myChart3.value = echarts.init(barGraph2.value);
      const option2 = {
        title: {
          text: "新增数据量",
        },
        legend: {
          top: 30,
          data: ["2015", "2016", "2017"],
        },
        grid: {
          top: "60",
          left: "10",
          right: "10",
          bottom: "10",
          containLabel: true,
        },
        tooltip: {},
        dataset: {
          source: [
            ["product", "2015", "2016", "2017"],
            ["Matcha Latte", 43.3, 85.8, 93.7],
            ["Milk Tea", 83.1, 73.4, 55.1],
            ["Cheese Cocoa", 86.4, 65.2, 82.5],
            ["Walnut Brownie", 72.4, 53.9, 39.1],
          ],
        },
        xAxis: { type: "category" },
        yAxis: {},
        series: [{ type: "bar" }, { type: "bar" }, { type: "bar" }],
      };
      myChart2.value.setOption(option2);
      myChart3.value.setOption(option2);
    };

    // 进入编辑模式、退出编辑模式
    const handleEdit = (index, num) => {
      selectedDoc.value.results[index].resList[num].isEdit =
        !selectedDoc.value.results[index].resList[num].isEdit;
    };

    // 保存解析结果
    const handleSave = async () => {
      const target = find(
        selectedDoc.value.results,
        (v) => v.id === resultActiveKey.value
      );
      if (!target) return;
      const json = {
        id: resultActiveKey.value,
        ruleValue: target.resList.map((v) => v.value),
      };
      const loading = message.loading("正在修改", 0);
      const res = await editResult(json);
      loading();
      if (res.message === "成功") {
        message.success("编辑解析结果成功！");
      } else {
        message.error(res.message);
      }
    };
    const handleDelete = async (index) => {
      const title = "解析结果删除提示！";
      const content = "此操作将永久删除该解析结果，请确认是否继续？";
      const onOk = async () => {
        const res = await deleteResult(selectedDoc.value.results[index].id);
        if (res.message === "成功") {
          selectedDoc.value.results.splice(index, 1);
          resultActiveKey.value =
            (selectedDoc.value.results &&
              selectedDoc.value.results.length &&
              selectedDoc.value.results[0].id) ||
            undefined;
          message.success("解析结果删除成功！");
        } else {
          message.error(res.message);
        }
      };
      modalConfirm(title, content, onOk);
    };

    // 拖拽
    let ismousedown = false; // 是否正在拖拽
    let mouseDownY = null;
    const docDom = ref(null);
    const resultsTab = ref(null);
    let docHeight = null;
    let tabHeight = null;
    const onmousedown = (e) => {
      ismousedown = true;
      mouseDownY = e.pageY;
      // 记录此时文档区域和tabs区域的高度
      docHeight = docDom.value.offsetHeight;
      tabHeight = resultsTab.value.$el.offsetHeight;
      document.body.onselectstart = () => false; // 防止页面元素出现被选中的蓝色状态，学到了
      window.addEventListener("mousemove", handleMove, false);
      window.addEventListener("mouseup", moveUp, false);
    };

    const handleMove = (e) => {
      if (!ismousedown) return;
      const deltaY = mouseDownY - e.pageY;
      docHeight -= deltaY;
      tabHeight += deltaY;
      mouseDownY = e.pageY;
      if (tabHeight <= 155 || docHeight <= 155) return;
      docDom.value.style.height = docHeight + "px";
    };
    const moveUp = (e) => {
      document.body.onselectstart = () => true;
      ismousedown = false;
      window.removeEventListener("mousemove", handleMove, false);
    };
    watchEffect(() => {
      if (props.checkItem.id) {
        getTaskList(props.checkItem.id);
      }
    });

    onMounted(() => {
      const f = () => {
        myChart1.value.resize();
        myChart2.value.resize();
        myChart3.value.resize();
      };
      window.addEventListener("resize", f);
    });

    onBeforeUnmount(() => {
      window.removeEventListener("mouseup", moveUp, true);
      window.removeEventListener("mousemove", handleMove, true);
      myChart1.value.clear();
      myChart2.value.clear();
      myChart3.value.clear();
      const f = () => {
        myChart1.value.resize();
        myChart2.value.resize();
        myChart3.value.resize();
      };
      window.removeEventListener("resize", f);
    });

    return {
      lineGraph,
      barGraph1,
      barGraph2,
      activeKey,
      docDom,
      resultsTab,
      resultActiveKey,
      searchLoading,
      handleExport,
      handleChangeTab,
      onmousedown,

      taskList,
      successNum,
      successPercent,
      errorNum,
      errorPercent,
      failNum,
      failPercent,
      checkIndex,
      current,
      selectedTask,
      selectedDoc,
      animation,
      handleSelectItem,
      handleChangePage,
      handleCancelParse,

      handleEdit,
      handleSave,
      handleDelete,
    };
  },
};
</script>
<style lang="less">
.parser-detail {
  width: 100%;
  display: flex;
  padding: 20px;
  height: calc(100% - 68px);

  &-left {
    width: 400px;
    margin-right: 20px;

    .left-title {
      height: 32px;
      color: #333;
      font-size: 20px;
      font-weight: 600;
      line-height: 32px;
      margin-bottom: 20px;
    }

    .left-content {
      width: 100%;
      padding: 20px;
      overflow-y: auto;
      border-radius: 4px;
      height: calc(100% - 52px);
      border: 1px solid #e2e6e9;

      &-item {
        margin-bottom: 20px;

        &:last-child {
          margin-bottom: 0;
        }

        .item-time {
          padding: 0 8px;
          color: #3e8eff;
          margin-bottom: 20px;
          border-radius: 11px;
          display: inline-block;
          border: 1px solid #3e8eff;
          background: rgba(62, 142, 255, 0.1);
        }

        .item-task {
          padding: 8px;
          height: 67px;
          display: flex;
          cursor: pointer;
          border-radius: 4px;
          margin-bottom: 20px;
          border: 1px solid #fff;

          &:last-child {
            margin-bottom: 0;
          }

          &.active {
            border-color: #1677ff;
            box-shadow: 0px 8px 12px 0px rgba(62, 142, 255, 0.2);
          }

          &:hover {
            border-color: #1677ff;
          }

          .task-left {
            width: 14px;
            padding-top: 2px;
            margin-right: 10px;
            position: relative;

            &::before {
              left: 50%;
              top: 18px;
              width: 3px;
              content: "";
              height: 30px;
              border-radius: 8px;
              position: absolute;
              background: #e5eaee;
              display: inline-block;
              transform: translateX(-50%);
            }

            &-status {
              width: 14px;
              height: 14px;
              margin-bottom: 3px;
            }
          }

          .task-middle {
            display: flex;
            margin-right: 10px;
            flex-direction: column;
            width: calc(100% - 98px);
            justify-content: space-between;

            &-top {
              display: flex;
              align-items: center;
            }

            &-icon {
              width: 14px;
              height: 14px;
              margin-right: 4px;
            }

            &-title {
              font-size: 14px;
              color: #464e5f;
              font-weight: 600;
              overflow: hidden;
              margin-right: 10px;
              white-space: nowrap;
              text-overflow: ellipsis;
              max-width: calc(100% - 100px);
            }

            &-label {
              height: 24px;
              padding: 0 6px;
              font-size: 12px;
              font-weight: 600;
              color: #1677ff;
              line-height: 24px;
              border-radius: 4px;
              display: inline-block;
              background: rgba(22, 119, 255, 0.1);
            }

            &-bottom {
              font-size: 12px;

              &.success {
                color: #95de64;
              }

              &.ing {
                color: #3e8eff;
              }

              &.fail {
                color: #e06161;
              }
            }
          }

          .task-right {
            width: 64px;
            display: flex;
            color: #8a92a0;
            align-items: center;
            flex-direction: column;
            justify-content: space-between;

            &-time {
              display: flex;
              font-size: 12px;

              &.ing {
                color: #3e8eff;
              }

              .anticon {
                margin-top: 3px;
                margin-right: 2px;
              }
            }
          }
        }
      }
    }
  }

  &-right {
    position: relative;
    width: calc(100% - 420px);

    .right-btn {
      right: 75px;
      top: -3px;
      z-index: 2;
      box-shadow: none;
      position: absolute;

      &.save {
        right: 0;
      }
    }

    .right-content-tabs {
      height: 100%;

      .ant-tabs-nav {
        margin-bottom: 20px;

        &-wrap {
          .ant-tabs-nav-list {
            .ant-tabs-tab {
              padding: 0;
              height: 26px;
              font-size: 20px;
              font-weight: 600;
              margin-bottom: 6px;
            }
          }
        }
      }

      .ant-tabs-content-holder {
        padding: 20px;
        overflow-y: auto;
        border-radius: 4px;
        border: 1px solid #e2e6e9;

        .ant-tabs-content {
          height: 100%;
          position: relative;

          .ant-tabs-tabpane {
            display: flex;
            flex-direction: column;
          }

          .right-content-detail {
            height: 100%;
          }

          .right-content-spin {
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
          }

          .right-progress {
            display: flex;
            align-items: center;
            margin-bottom: 20px;
            justify-content: space-between;

            &-item {
              display: flex;
              align-items: center;

              .item-text {
                display: flex;
                margin-left: 20px;
                align-items: flex-end;
                flex-direction: column;

                &-num {
                  font-size: 24px;

                  &.success {
                    color: #22a765;
                  }

                  &.error {
                    color: #ef8b16;
                  }
                  &.fail {
                    color: #dd4b4b;
                  }
                }

                &-status {
                  color: #666;
                  font-size: 14px;
                }
              }
            }
          }

          .right-graph-line {
            width: 100%;
            min-height: 252px;
            margin-bottom: 20px;
            height: calc((100% - 140px) / 2);
          }

          .right-graph-bar {
            display: inline-block;
            width: calc((100% - 20px) / 2);
            min-height: 206px;
            height: calc((100% - 140px) / 2);
          }

          .document-header {
            height: 32px;
            display: flex;
            align-items: center;
            justify-content: space-between;

            &-title {
              color: #333;
              font-size: 18px;
              font-weight: 600;
            }

            &-page {
              color: #333;
              font-size: 14px;

              .page-current {
                font-size: 16px;
                color: #1677ff;
              }
            }
          }

          .document-box {
            display: flex;
            height: calc(100% - 192px);

            &-btn {
              width: 20px;
              display: flex;
              cursor: pointer;
              align-items: center;

              &.disabled {
                cursor: not-allowed;
              }
            }

            &-content {
              position: relative;
              width: calc(100% - 40px);

              &.flip-in-ver-left {
                -webkit-animation: flip-in-ver-left 0.5s
                  cubic-bezier(0.25, 0.46, 0.45, 0.94) both;
                animation: flip-in-ver-left 0.5s
                  cubic-bezier(0.25, 0.46, 0.45, 0.94) both;
              }

              &.flip-in-ver-right {
                -webkit-animation: flip-in-ver-right 0.5s
                  cubic-bezier(0.25, 0.46, 0.45, 0.94) both;
                animation: flip-in-ver-right 0.5s
                  cubic-bezier(0.25, 0.46, 0.45, 0.94) both;
              }

              .document-spin,
              .no-content-tip {
                position: absolute;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
              }

              .no-content-tip {
                font-size: 20px;
                color: #dd4b4b;
              }

              .content-box {
                width: 100%;
                height: 100%;
                overflow: auto;
                position: relative;
              }
            }
          }

          .document-tabs {
            flex: 1;

            .ant-tabs-nav {
              height: 35px;
              border-top: none;
              margin-bottom: 10px;
              background: #f6f8fb;

              .ant-tabs-tab {
                font-size: 16px;
                margin-top: 2px;

                & + .ant-tabs-tab {
                  margin-left: 20px;
                }
              }
            }

            .ant-tabs-content-holder {
              padding: 0;
              border: none;
              color: #666;
              height: calc(100% - 45px);

              .ant-tabs-content {
                .ant-tabs-tabpane {
                  display: flex;

                  .document-item {
                    width: 100%;
                    display: flex;
                    padding: 10px;
                    margin-bottom: 10px;
                    background: #f5f9fe;
                  }

                  .document-tabs-text {
                    width: calc(100% - 60px);

                    .text-area {
                      height: 100%;
                      background: #f5f9fe;
                    }
                  }

                  .document-tabs-btns {
                    width: 60px;
                    display: flex;
                    align-items: center;

                    .action-btn {
                      width: 14px;
                      height: 14px;
                      cursor: pointer;
                      color: #1677ff;

                      &:first-child {
                        margin: 0 8px 0 14px;
                      }
                    }
                  }
                }
              }
            }
          }

          .drag-line {
            z-index: 9;
            width: 100%;
            height: 5px;
            cursor: row-resize;
            border-top: 5px solid #eee;
          }
        }
      }
    }
  }
}
</style>
