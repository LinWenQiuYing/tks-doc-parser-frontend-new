<template>
  <div class="doc-parse">
    <div class="doc-parse-header">
      <div class="header-left">文档解析</div>
      <div class="header-right">
        <span class="header-right-title">任务名称：</span>
        <a-input
          type="text"
          class="header-right-input"
          v-model:value.trim="taskName"
          placeholder="请输入任务名称"
          allow-clear
        />
        <a-button type="primary" size="small" class="btn" @click="getList()"
          >查询</a-button
        >
        <a-button class="btn" size="small" @click="onSet()">重置</a-button>
      </div>
    </div>
    <div class="doc-parse-content">
      <a-spin
        v-if="searchLoading"
        tip="正在查询"
        size="large"
        class="content-spin"
      />
      <div class="content-item" v-else>
        <div class="content-item-list-fix" @click="handleAdd">
          <img class="list-pic" src="@/assets/images/img/plus.svg" />
          <span class="list-title">文本解析</span>
        </div>
        <div
          class="content-item-list"
          v-for="(item, index) in list"
          :key="index"
          @click="handleCheckDetail(index)"
        >
          <div class="label">
            <p class="label-text">{{ item.name }}</p>
            <div class="label-title">文档解析</div>
          </div>
          <div class="des">
            <div class="des-text">
              <img
                class="des-pic"
                src="@/assets/images/img/doc-base.svg"
                style="margin-right: 2px"
              />
              <span class="des-title">{{ item.docBase }}</span>
            </div>
            <div class="des-text">
              <img
                class="des-pic"
                src="@/assets/images/img/doc-type.svg"
                style="margin-right: 2px"
              />
              <span class="des-title">{{ item.type }}</span>
            </div>
          </div>
          <div class="text-ana">
            <div class="text-ana-title">{{ item.anaTimeValue }}</div>
            <div class="text-ana-edit">
              <div>
                <a-switch
                  v-model:checked="item.autoChecked"
                  size="small"
                  @change="handleExecute(item.id, item.autoChecked)"
                />
                <span class="text-ana-des">自动解析</span>
              </div>
              <div class="text-ana-edit-img">
                <a-tooltip>
                  <template #title>
                    <span>立即执行</span>
                  </template>
                  <img
                    class="pic"
                    src="@/assets/images/img/action-execute.png"
                    style="margin-right: 4px"
                    @click="executeTask(item.id)"
                  />
                </a-tooltip>
                <a-tooltip>
                  <template #title>
                    <span>编辑任务</span>
                  </template>
                  <img
                    class="pic"
                    src="@/assets/images/img/action-edit.svg"
                    style="margin-right: 4px"
                    @click="editTask(item.id)"
                  />
                </a-tooltip>
                <a-tooltip>
                  <template #title>
                    <span>删除任务</span>
                  </template>
                  <icon-svg
                    className="pic"
                    icon-class="icon_delete"
                    color="#fff"
                    @click="delTask(item.id)"
                  />
                </a-tooltip>
              </div>
            </div>
          </div>
          <div class="status">
            <img
              src="@/assets/images/img/ready-status.svg"
              alt="ready"
              v-show="item.status == '0'"
            />
            <img
              src="@/assets/images/img/success-status.png"
              alt="success"
              v-show="item.status == '1'"
            />
            <img
              src="@/assets/images/img/fail-status.png"
              alt="fail"
              v-show="item.status == '2'"
            />
            <img
              src="@/assets/images/img/ing-status.png"
              alt="ing"
              v-show="item.status == '3'"
            />
          </div>
        </div>
        <a-pagination
          v-model:current="current"
          v-model:page-size="pageSize"
          :total="total"
          class="content-item-list-pagination"
          @change="onChange(current, pageSize)"
          :show-total="(total, current) => `共${total}条记录`"
          show-size-changer
          show-quick-jumper
        />
      </div>
    </div>
  </div>
  <a-modal
    v-model:visible="isAddModalShow"
    :title="modalTitle"
    centered
    width="600px"
    class="component-add-modal"
  >
    <div class="modal-content">
      <div class="modal-content-item">
        <div class="modal-content-item-inner">
          <i class="required">*</i>
          <span class="title">任务名称：</span>
        </div>
        <a-input
          type="text"
          class="name-input"
          v-model:value.trim="addName"
          placeholder="名称"
          allow-clear
        />
      </div>
      <div class="modal-content-item">
        <div class="modal-content-item-inner">
          <i class="required">*</i>
          <span class="title">解析类型：</span>
        </div>
        <a-radio-group v-model:value="analysisValue" class="analysis-radio">
          <a-radio-button value="1" class="radio-item">自定义</a-radio-button>
          <a-radio-button value="2" class="radio-item"
            >定制化模型</a-radio-button
          >
        </a-radio-group>
        <!-- 绑定一个值添加解析类型 -->
      </div>
      <div class="modal-content-item">
        <div class="modal-content-item-inner">
          <i class="required">*</i>
          <span class="title">文件库：</span>
        </div>
        <div class="modal-content-item-selector">
          <a-select
            v-model:value="addDoc"
            placeholder="请选择"
            class="doc-select"
            :options="docOptions"
            @select="getBaseOptions(addDoc)"
          />
          <a-select
            v-model:value="addDocBase"
            placeholder="请选择"
            class="doc-select"
            :options="docBaseOptions"
          />
        </div>
      </div>
      <!-- <div class="modal-content-item">
        <div class="modal-content-item-inner">
          <i class="required">*</i>
          <span class="title">人工审核：</span>
        </div>
        <a-switch
          v-model:checked="auditChecked"
        />
      </div> -->
      <div class="modal-content-item">
        <div class="modal-content-item-inner">
          <i class="required">*</i>
          <span class="title">自动入库：</span>
        </div>
        <a-switch v-model:checked="autoChecked" />
      </div>
      <div class="modal-content-item">
        <div class="modal-content-item-inner">
          <i class="required">*</i>
          <span class="title">解析时间：</span>
        </div>
        <a-radio-group v-model:value="anaTimeValue" class="anaTime-radio">
          <a-radio value="1" class="radio-item">10min</a-radio>
          <a-radio value="2" class="radio-item">1h</a-radio>
          <a-radio value="3" class="radio-item">12h</a-radio>
          <a-radio value="4" class="radio-item">24h</a-radio>
          <!-- <a-radio-button value="1" class="radio-item">定时任务</a-radio-button>
                <a-radio-button value="2" class="radio-item" disabled>事件触发</a-radio-button> -->
        </a-radio-group>
      </div>
      <div class="modal-content-item">
        <div class="modal-content-item-inner">
          <span class="title">备注：</span>
        </div>
        <a-textArea
          class="note-input"
          v-model:value.trim="notes"
          placeholder="请输入"
          allow-clear
        />
      </div>
    </div>
    <template #footer>
      <a-button @click="handleCancel">取消</a-button>
      <a-button @click="handleNext" type="primary">下一步</a-button>
      <!-- <a-button type="primary" @click="handleConfirm">确认</a-button> -->
    </template>
  </a-modal>
</template>

<script>
import { getBaseList, getBucketsList } from "@/shared/api/document";
import {
  autoUpdate,
  closeUpdate,
  delTaskById,
  executeTaskById,
  findTaskById,
  getTaskList,
} from "@/shared/api/task";
import { modalConfirm, resetData } from "@/utils/common";
import {
  Button,
  Input,
  Modal,
  Pagination,
  Radio,
  Select,
  Spin,
  Switch,
  Tooltip,
  // Upload,
  message,
} from "ant-design-vue";
import { onMounted, reactive, ref, toRefs } from "vue";
const { Group } = Radio;
const { TextArea } = Input;
const RadioButton = Radio.Button;
export default {
  name: "ParserHome",
  components: {
    AButton: Button,
    AInput: Input,
    AModal: Modal,
    ASelect: Select,
    ASpin: Spin,
    ASwitch: Switch,
    ARadio: Radio,
    ARadioGroup: Group,
    ATextArea: TextArea,
    ARadioButton: RadioButton,
    ATooltip: Tooltip,
    APagination: Pagination,
  },
  props: ["modalTitle", "checkType"],
  emits: [
    "changeHeaderData",
    "changeIsDocConfigShow",
    "changeIsDetailShow",
    "changeModalTitle",
    "changeEditTaskId",
    "changeDetail",
    "changeParams",
    "changeCheckType",
  ],
  setup(props, { emit }) {
    //分页
    const pagination = reactive({
      total: 0,
      current: 1,
      pageSize: 10,
      pageSizeOptions: ["10", "20", "15", "20"],
      onChange: (current, pageSize) => {
        pagination.current = current;
        pagination.pageSize = pageSize;
        getList();
      },
    });

    const isEdit = ref(false); // 是否正在编辑状态，阻断点击编辑按钮查看任务详情的bug
    // 获取任务列表
    const list = ref([]);
    const searchLoading = ref(false); // 任务列表加载状态
    //任务名称
    let taskName = ref(undefined);
    // 查询接口列表方法+根据任务名称查询任务
    const getList = async () => {
      searchLoading.value = true;
      const json = {
        taskName: taskName.value,
        pageNo: pagination.current,
        pageSize: pagination.pageSize,
      };
      const res = await getTaskList(json);
      searchLoading.value = false;
      if (res.message === "成功" && res.data.dateList) {
        list.value = res.data.dateList.map((item, index) => {
          return {
            ...item,
            id: item.id,
            name: item.taskName,
            docBase: item.fileBucket,
            type: "NLP模型",
            anaTimeValue:
              item.parseTime == "1"
                ? "10min"
                : item.parseTime == "2"
                ? "1h"
                : item.parseTime == "3"
                ? "12h"
                : "24h",
            autoChecked:
              item.autoStatus == "0"
                ? false
                : item.autoStatus == "1"
                ? true
                : false,
            status: item.status,
          };
        });
        pagination.total = res.data.totalCount;
      } else {
        message.error(res.message);
      }
    };

    //任务列表页面重置
    const onSet = () => {
      taskName.value = null;
      getList();
    };

    let isAddModalShow = ref(false); // 新建任务弹窗是否展示
    //点击“+”新增任务
    const handleAdd = () => {
      //重置内容
      resetAddParams();
      isAddModalShow.value = true;
      emit("changeModalTitle", "新建任务");
      emit("changeCheckType", "add");
      emit("changeEditTaskId", undefined);
    };

    //弹窗新增任务 取消
    const handleCancel = () => {
      isAddModalShow.value = false;
      resetAddParams();
    };

    // 重置addParams
    const resetAddParams = () => {
      resetData(addParams);
      addParams.analysisValue = "1";
      addParams.anaTimeValue = "1";
      addParams.autoChecked = false;
      //addParams.isIncremental = 0;
      addParams.paramList = [
        {
          name: undefined, //名称
          tag: undefined, //标签
          type: undefined, //类型
          rules: [],
          ifDrag: true, //具体解析内容是否展开
        },
      ];
    };

    let addParams = reactive({
      addName: undefined, //任务名称
      analysisValue: "1", // 解析类型:自定义、定制化模型
      addDoc: undefined, //文件桶
      addDocBase: undefined, //文件库
      auditChecked: undefined, //人工审核
      autoChecked: false, //自动入库 自动解析 两个是一个东西
      anaTimeValue: "1", //解析时间
      //isIncremental: 0, 这里本来写死，定义自动入库的，现改为autoChecked
      notes: undefined, //备注
      files: ref([]), //上传的文件
      //解析项配置
      paramList: [
        {
          name: undefined, //名称
          tag: undefined, //标签
          type: undefined, //类型
          rules: [],
          ifDrag: true, //具体解析内容是否展开
        },
      ],
    });

    // 下一步
    const handleNext = async () => {
      if (!addParams.addName) {
        return message.warning("请填写任务名称！");
      }
      if (!addParams.analysisValue) {
        return message.warning("请选择解析类型！");
      }
      if (!addParams.addDoc) {
        return message.warning("请选择文件桶！");
      }
      if (!addParams.addDocBase) {
        return message.warning("请选择文件库！");
      }
      if (!addParams.anaTimeValue) {
        return message.warning("请选择解析时间！");
      }
      if (props.checkType === "add") {
        const addObj = reactive({});
        addObj.addName = addParams.addName;
        addObj.analysisValue = addParams.analysisValue;
        addObj.addDoc = addParams.addDoc;
        addObj.addDocBase = addParams.addDocBase;
        addObj.auditChecked = addParams.auditChecked;
        addObj.autoChecked = addParams.autoChecked;
        addObj.anaTimeValue = addParams.anaTimeValue;
        addObj.isIncremental = addParams.autoChecked;
        addObj.notes = addParams.notes;
        addObj.files = addParams.files;
        addObj.paramList = addParams.paramList;
        console.log("888888888888888", addParams.autoChecked, addObj);
        emit("changeParams", addObj);
      }
      const obj = reactive({});
      obj.title = addParams.addName;
      obj.docBase = addParams.addDocBase;
      obj.anaTimeValue =
        addParams.anaTimeValue == "1"
          ? "10min"
          : addParams.anaTimeValue == "2"
          ? "1h"
          : addParams.anaTimeValue == "3"
          ? "12h"
          : "24h";
      obj.autoAna = addParams.autoChecked;
      emit("changeHeaderData", obj);
      isAddModalShow.value = false;
      emit("changeIsDocConfigShow", true);
    };

    //文件桶、文件库下拉选项
    let docOptions = ref([]);
    let docBaseOptions = ref([]);
    //获取文件桶、文件库下拉选项
    const getBucketsOptions = async () => {
      const res = await getBucketsList();
      if (res.message === "成功") {
        docOptions.value = res.data.map((item) => {
          return {
            label: item.name,
            value: item.name,
          };
        });
      } else {
        message.error(res.message);
      }
    };

    const getBaseOptions = async (type) => {
      const res = await getBaseList(type);
      if (res.message === "成功") {
        docBaseOptions.value = res.data.map((item) => {
          return {
            label: item.name,
            value: item.name,
          };
        });
      } else {
        message.error(res.message);
      }
    };

    //自动解析switch
    const handleExecute = async (id, autoStatus) => {
      isEdit.value = true;
      console.log(id, autoStatus);
      if (autoStatus === true) {
        console.log(111111);
        const res = await autoUpdate(id);
        if (res.message === "成功") {
          message.success("已开启任务自动更新！");
        } else {
          message.error("任务自动更新开启失败！");
        }
        isEdit.value = false;
      }
      if (autoStatus === false) {
        const res = await closeUpdate(id);
        if (res.message === "成功") {
          message.success("已关闭任务自动更新！");
        } else {
          message.error("任务自动更新关闭失败！");
        }
        isEdit.value = false;
      }
    };

    //立即执行任务
    const executeTask = async (id) => {
      isEdit.value = true;
      const loading = message.loading("正在执行任务");
      const res = await executeTaskById(id);
      loading();
      if (res.message === "成功") {
        message.success("任务执行成功！");
      } else {
        message.error("任务执行失败");
      }
      isEdit.value = false;
    };

    //删除任务
    const delTask = async (id) => {
      isEdit.value = true;
      const title = "任务删除提示！";
      const content = "是否确认删除该任务？";
      let res = null;
      const onOk = async () => {
        res = await delTaskById(id);
        isEdit.value = false;
        if (res.message === "成功") {
          message.success("任务删除成功！");
          getList();
        } else {
          message.error(res.message);
        }
      };
      modalConfirm(title, content, onOk);
    };

    // let taskFileId = ref(undefined); //编辑任务时 文档展示
    //任务编辑
    const editTask = async (id) => {
      emit("changeEditTaskId", id);
      //先查看任务
      isEdit.value = true;
      emit("changeCheckType", "edit");
      emit("changeModalTitle", "编辑任务");
      isAddModalShow.value = true;
      const res = await findTaskById(id);
      isEdit.value = false;
      if (res.message === "成功" && res.data) {
        const {
          taskName,
          parseType,
          fileBucket,
          fileGroup,
          isIncremental,
          autoStatus,
          parseTime,
          notes,
          files,
          taskConfigs,
        } = res.data;
        const obj = {};
        obj["addName"] = taskName;
        obj["analysisValue"] = !parseType ? parseType : parseType.toString();
        //obj["analysisValue"] = parseType;
        obj["addDoc"] = fileBucket;
        obj["addDocBase"] = fileGroup;
        obj["autoChecked"] = autoStatus == "1" ? true : false;
        obj["anaTimeValue"] = !parseTime ? parseType : parseTime.toString();
        obj["notes"] = notes;
        obj["isIncremental"] = isIncremental;
        obj["files"] = files;
        obj["paramList"] = [];
        for (let i = 0; i < taskConfigs.length; i++) {
          const obj2 = {};
          obj2["name"] = taskConfigs[i].fieldName;
          obj2["tag"] = taskConfigs[i].label;
          obj2["type"] = taskConfigs[i].resultType.toString();
          obj2["rules"] = [];
          obj2["ifDrag"] = true;

          for (let j = 0; j < taskConfigs[i].rules.length; j++) {
            const obj3 = {};
            obj3["selectFlag"] = false;
            obj3["configType"] =
              taskConfigs[i].rules[j].analyticType.toString();
            obj3["configCpn"] = taskConfigs[i].rules[j].sourceType;
            obj3["configName"] = taskConfigs[i].rules[j].ruleName;
            if (obj3["configType"] == "1") {
              obj3["configExample"] = taskConfigs[i].rules[j].analyticBody;
            }
            if (obj3["configType"] == "2") {
              obj3["configData"] = taskConfigs[i].rules[j].analyticBody;
              obj3["configExample"] = taskConfigs[i].rules[j].analyticBody;
            }
            obj3["configNotes"] = taskConfigs[i].rules[j].notes;
            obj3["configXpathTagcontent"] =
              taskConfigs[i].rules[j].configXpathTagcontent;
            obj3["configXpathTag"] =
              taskConfigs[i].rules[j].configXpathTag === 1 ? true : false;
            obj2.rules.push(obj3);
          }
          obj.paramList.push(obj2);
        }
        Object.assign(addParams, obj);
        emit("changeParams", addParams);
        // taskFileId.value = addParams.files[0].id;
      }
    };

    // 查看任务详情
    const handleCheckDetail = async (index) => {
      if (isEdit.value) return;
      const target = list.value[index];
      emit("changeDetail", target);
      const obj = {};
      obj.title = target.name;
      obj.docBase = target.docBase;
      obj.anaTimeValue = target.anaTimeValue;
      obj.autoAna = target.autoAna;
      emit("changeHeaderData", obj);
      emit("changeIsDetailShow", true);
    };

    onMounted(async () => {
      //获取任务列表
      getList();
      await getBucketsOptions();
    });

    return {
      ...toRefs(pagination),
      isEdit,
      list,
      searchLoading,
      taskName,
      isAddModalShow,
      ...toRefs(addParams),
      docOptions,
      docBaseOptions,

      getList,
      onSet,
      handleExecute,
      executeTask,
      delTask,
      getBucketsOptions,
      getBaseOptions,
      handleCheckDetail,
      handleNext,
      handleAdd,
      handleCancel,
      editTask,
      resetAddParams,
    };
  },
};
</script>
<style lang="less">
.doc-parse {
  width: 100%;
  height: 100%;
  padding: 20px;

  &-header {
    width: 100%;
    height: 32px;
    display: flex;
    margin-bottom: 20px;
    justify-content: space-between;

    .header-left {
      height: 32px;
      font-size: 20px;
      font-weight: 600;
      color: #333333;
      line-height: 32px;
    }

    .header-right {
      display: flex;
      align-items: center;

      &-title {
        width: 70px;
        height: 22px;
        font-size: 14px;
        font-weight: 500;
        color: #333333;
        line-height: 22px;
      }

      &-input {
        width: 230px;
        height: 28px;
      }

      .btn {
        width: 48px;
        height: 28px;
        margin-left: 10px !important;
      }
    }
  }

  &-content {
    width: 100%;
    overflow: auto;
    position: relative;
    height: calc(100% - 52px);

    .content-spin {
      top: 50%;
      left: 50%;
      position: absolute;
      transform: translate(-50%, -50%);
    }

    .content-item {
      gap: 20px;
      width: 100%;
      display: flex;
      display: grid;
      flex-wrap: wrap;
      position: relative;
      padding-bottom: 72px;
      grid-template-columns: repeat(auto-fill, 200px);

      &-list-fix {
        width: 200px;
        height: 260px;
        display: flex;
        align-items: center;
        flex-direction: column;
        justify-content: center;
        border: 1px solid #e2e6e9;
        border-radius: 12px 12px 12px 12px;

        &:hover {
          cursor: pointer;
          border: 1px solid #1677ff;
          box-shadow: 0px 8px 12px 0px rgba(62, 142, 255, 0.2);
        }

        .list-pic {
          height: 40px;
          width: 40px;
        }

        .list-title {
          font-size: 14px;
          font-weight: 500;
          color: #333333;
        }
      }

      &-list {
        width: 200px;
        height: 260px;
        display: flex;
        flex-direction: column;
        border: 1px solid #e2e6e9;
        padding: 20px 10px 20px 10px;
        justify-content: space-between;
        border-radius: 12px 12px 12px 12px;
        position: relative;

        &:hover {
          cursor: pointer;
          border-color: #1677ff;
          box-shadow: 0px 8px 12px 0px rgba(62, 142, 255, 0.2);
        }

        .label-text {
          height: 22px;
          font-size: 16px;
          font-weight: 600;
          color: #333333;
          margin-bottom: 6px;
        }

        .label-title {
          width: 60px;
          height: 17px;
          font-size: 12px;
          font-weight: 500;
          color: #629de1;
          line-height: 17px;
          line-height: 17px;
          text-align: center;
          background: #dfeeff;
          border-radius: 4px 4px 4px 4px;
        }

        .des {
          .des-text {
            display: flex;
          }
        }

        .text-ana {
          &-title {
            height: 18px;
            padding: 0 6px;
            font-size: 14px;
            font-weight: 500;
            color: #3e8eff;
            line-height: 18px;
            text-align: center;
            display: inline-block;
            border-radius: 36px 36px 36px 36px;
            background: rgba(62, 142, 255, 0.1);
          }
          &-edit {
            display: flex;
            justify-content: space-between;
            align-items: center;
            &-img {
              display: flex;
              height: 14px;

              .pic {
                width: 14px;
                height: 14px;
                align-items: center;
              }
            }
          }

          &-des {
            font-size: 12px;
            font-weight: 500;
            color: #4f5866;
            margin-left: 2px;
          }
        }

        .status {
          position: absolute;
          top: 20px;
          right: -3px;
        }
      }
      &-list-pagination {
        position: absolute;
        bottom: 20px;
        right: 0px;
      }
    }
  }
}
.component-add-modal {
  .modal-content {
    &-item {
      margin-bottom: 20px;
      font-size: 14px;
      color: #333333;
      display: flex;

      &-inner {
        width: 80px;
        display: flex;
        align-items: center;
        justify-content: end;
      }
      .analysis-radio {
        .radio-item {
          margin-right: 12px;
          border-radius: 4px 4px 4px 4px;
          border: 1px solid #e2e6e9;
          .ant-radio-button-checked {
            border: 1px solid #1890ff;
          }
        }

        .ant-radio-button-wrapper:not(:first-child)::before {
          width: 0px;
        }
      }

      .note-input {
        width: 474px;
        height: 84px;
      }

      .name-input {
        width: calc(100% - 80px);
      }

      &-selector {
        display: flex;
        width: calc(100% - 80px);
        justify-content: space-between;

        .doc-select {
          width: 230px;
        }
      }
    }
  }
}
</style>
