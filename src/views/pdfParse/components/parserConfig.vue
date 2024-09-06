<template>
  <div class="content">
    <div class="content-left">
      <div class="content-left-header">
        <div class="header-left">文档模板</div>
        <div class="header-btns">
          <a-upload
            :show-upload-list="false"
            :multiple="true"
            accept=".pdf, .docx, .doc"
            class="upload"
            :beforeUpload="(file) => beforeUpload(file)"
          >
            <a-button class="btns" size="small" type="primary">上传</a-button>
          </a-upload>
          <a-button class="btns" size="small" @click="resetFile">重置</a-button>
        </div>
      </div>
      <div class="content-left-content">
        <div class="content-box">
          <a-tabs
            :activeKey="activeKey"
            hide-add
            type="editable-card"
            @edit="onEdit"
            @change="onChangeTab"
            v-if="docData"
          >
            <a-tab-pane
              v-for="pane in files"
              :key="pane.id"
              :tab="pane.fileName"
              :closable="true"
            >
              <a-spin v-if="isDocLoading" tip="正在加载" />
              <div
                v-else
                :ref="(el) => setPaneRef(pane.id, el)"
                v-html="docData"
              ></div>
            </a-tab-pane>
          </a-tabs>
          <a-upload-dragger
            v-else
            :show-upload-list="false"
            :multiple="true"
            accept=".pdf, .docx"
            class="graph-search-upload"
            :beforeUpload="(file) => beforeUpload(file)"
          >
            <img
              class="upload-icon"
              src="@/assets/images/img/cloud_upload.svg"
              alt=""
            />
            <a-button type="primary" class="upload-btn">开始上传</a-button>
          </a-upload-dragger>
        </div>
      </div>
    </div>

    <div class="content-right">
      <div class="content-right-header">
        <div class="header-left">解析策略</div>
      </div>
      <div class="content-right-content">
        <div class="header">
          <div class="header-left">解析项</div>
          <div class="header-right">
            <div class="header-right-add" @click="handleAddParam">
              <img class="pic-config" src="@/assets/images/img/plus.svg" />
              <span class="config">解析项</span>
            </div>
            <div class="header-right-del" @click="delAllProject">
              <icon-svg
                className="pic-del"
                icon-class="icon_delete"
                color="#fff"
              />
              <span class="delete">清空</span>
            </div>
          </div>
        </div>
        <!-- v-show="paramList.length" -->
        <div class="content">
          <div class="content-inner">
            <div
              class="content-item"
              v-for="(item, index) in paramList"
              :key="index"
            >
              <div class="item-box">
                <div class="item-box-inner-one">
                  <div class="item-box-inner-img" @click="handleOpen(index)">
                    <img
                      src="@/assets/images/img/right-arrow.svg"
                      alt=""
                      v-show="item.ifDrag === false"
                    />
                    <img
                      src="@/assets/images/img/down-arrow.svg"
                      alt=""
                      v-show="item.ifDrag === true"
                    />
                  </div>

                  <i class="required">*</i>
                  <span>名称：</span>
                  <a-input
                    type="text"
                    v-model:value="item.name"
                    placeholder="请输入"
                    class="item-box-input"
                  />
                </div>
                <div class="item-box-inner">
                  <i class="required">*</i>
                  <span>标签：</span>
                  <a-input
                    type="text"
                    v-model:value="item.tag"
                    placeholder="请输入"
                    class="item-box-input"
                  />
                </div>
                <div class="item-box-inner">
                  <i class="required">*</i>
                  <span>类型：</span>
                  <a-radio-group
                    v-model:value="item.type"
                    class="anaTime-radio"
                  >
                    <a-radio value="1" class="radio-item">文本</a-radio>
                    <a-radio value="2" class="radio-item">图片</a-radio>
                    <a-radio value="3" class="radio-item">表格</a-radio>
                  </a-radio-group>
                </div>
                <div class="item-box-inner" @click="delProject(index)">
                  <icon-svg
                    className="pic-del"
                    icon-class="icon_delete"
                    color="#fff"
                  />
                </div>
              </div>
              <div class="item-box-para" v-show="item.ifDrag === true">
                <div class="header">
                  <div class="header-left">
                    系统将按照设置的优先级进行处理，按住鼠标左键拖动可调整优先级
                  </div>
                  <div class="header-right">
                    <div
                      class="header-right-add"
                      @click="handleAddConfig(index)"
                    >
                      <img
                        class="pic-config"
                        src="@/assets/images/img/plus.svg"
                      />
                      <span class="config">解析策略</span>
                    </div>
                    <div class="header-right-del" @click="delStrategy(index)">
                      <icon-svg
                        className="pic-del"
                        icon-class="icon_delete"
                        color="#fff"
                      />
                      <span class="delete">清空</span>
                    </div>
                  </div>
                </div>
                <div class="bottom">
                  <div
                    class="bottom-item"
                    v-for="(child, num) in item.rules"
                    :key="num"
                    @drop="(e) => handleDrop(e, index, num)"
                    @dragover="(e) => handleDragOver(e)"
                    @dragenter="(e) => e.preventDefault()"
                  >
                    <div class="item-box">
                      <div class="left">
                        <div
                          draggable="true"
                          class="left-number"
                          @dragover="(e) => handleDragOver(e)"
                          @dragstart="(e) => handleDragStart(e, index, num)"
                        >
                          <span>{{ num + 1 }}</span>
                        </div>
                        <div class="left-type">
                          <span class="left-type-name">{{
                            child.configType == "1" ? "正则" : "xpath"
                          }}</span>
                        </div>
                        <a-input
                          type="text"
                          class="left-input"
                          v-model:value.trim="child.configExample"
                          placeholder=""
                          allow-clear
                          v-show="child.configType == '1'"
                        />
                        <a-input
                          type="text"
                          class="left-input"
                          v-model:value.trim="child.configData"
                          placeholder="请手动输入或点击抓取按钮在文档中自动获取"
                          allow-clear
                          v-show="child.configType == '2'"
                        />
                      </div>

                      <div
                        class="middle"
                        v-show="child.configType == '1' && child.configXpathTag"
                      >
                        <a-tooltip>
                          <template #title>
                            <span>{{ child.configXpathTagcontent }}</span>
                          </template>
                          <span class="middle-name">XPath</span>
                        </a-tooltip>
                      </div>

                      <div class="right" v-if="child.configType == '1'">
                        <a-tooltip>
                          <template #title>
                            <span>编辑正则</span>
                          </template>
                          <img
                            class="action-icon"
                            src="@/assets/images/img/action-edit.svg"
                            @click="editRegular(index, num)"
                          />
                        </a-tooltip>
                        <a-tooltip>
                          <template #title>
                            <span>测试正则</span>
                          </template>
                          <icon-svg
                            class="action-icon"
                            icon-class="action-test"
                            @click="testRegular(index, num)"
                            color="#1776FF"
                          />
                        </a-tooltip>
                        <a-tooltip>
                          <template #title>
                            <span>抓取</span>
                          </template>
                          <icon-svg
                            class="action-icon"
                            icon-class="action-grab"
                            @click="handleSelectXPath(index, num)"
                            :color="child.selectFlag ? '#1776FF' : '#97A3B7'"
                          />
                        </a-tooltip>
                        <a-tooltip>
                          <template #title>
                            <span>删除正则</span>
                          </template>
                          <icon-svg
                            class="action-icon"
                            icon-class="icon_delete"
                            color="#fff"
                            @click="delRegular(index, num)"
                          />
                        </a-tooltip>
                      </div>
                      <div class="right" v-else>
                        <a-tooltip>
                          <template #title>
                            <span>测试Xpath</span>
                          </template>
                          <icon-svg
                            class="action-icon"
                            icon-class="action-test"
                            @click="testXpath(index, num)"
                            color="#1776FF"
                          />
                        </a-tooltip>
                        <a-tooltip>
                          <template #title>
                            <span>抓取</span>
                          </template>
                          <icon-svg
                            class="action-icon"
                            icon-class="action-grab"
                            @click="handleSelectXPath(index, num)"
                            :color="child.selectFlag ? '#1776FF' : '#97A3B7'"
                          />
                        </a-tooltip>
                        <a-tooltip>
                          <template #title>
                            <span>删除Xpath</span>
                          </template>
                          <icon-svg
                            class="action-icon"
                            icon-class="icon_delete"
                            color="#fff"
                            @click="delXPath(index, num)"
                          />
                        </a-tooltip>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <a-button class="bottom-btn" type="primary" @click="addConfirm()">
          确定</a-button
        >
      </div>
    </div>
  </div>
  <!-- 策略配置弹窗 -->
  <a-modal
    v-model:visible="isConfigShow"
    :title="configModalTitle"
    @cancel="configCancel"
    @ok="configConfirm"
    ok-text="确定"
    cancel-text="取消"
    centered
    width="600px"
    class="config-modal"
    :maskClosable="false"
  >
    <div class="config-modal-content">
      <div class="content-top">
        <div class="content-top-item">
          <span class="content-top-item-label">
            <i class="required">*</i>
            策略类型：
          </span>
          <a-radio-group
            v-model:value="configType"
            class="content-top-item-radio-buttom"
            allow-clear
          >
            <a-radio-button value="1" class="radio-item">正则</a-radio-button>
            <a-radio-button value="2" class="radio-item">XPath</a-radio-button>
            <a-radio-button value="3" class="radio-item" disabled
              >OCR</a-radio-button
            >
          </a-radio-group>
        </div>
        <div class="content-top-item" v-show="configType === '1'">
          <span class="content-top-item-label">
            <i class="required">*</i>
            策略组件：
          </span>
          <a-radio-group
            v-model:value="configCpn"
            class="content-top-item-radio"
            allow-clear
          >
            <a-radio value="1" class="radio-item">自定义</a-radio>
            <a-radio value="2" class="radio-item" disabled>公共</a-radio>
          </a-radio-group>
        </div>
        <div
          class="content-top-item"
          v-show="configCpn === '1' && configType === '1'"
        >
          <span class="content-top-item-label">
            <i class="required">*</i>
            策略名称：
          </span>
          <a-input
            type="text"
            class="content-top-item-input"
            v-model:value.trim="configName"
            placeholder="请输入"
            allow-clear
          />
        </div>
        <div
          class="content-top-item"
          v-show="configCpn === '1' && configType === '1'"
        >
          <span class="content-top-item-label">
            <i class="required">*</i>
            参考示例：
          </span>
          <span class="content-top-item-text">
            <!-- "template":"(?<={$fighter}).*({$task})" -->
            "template":"(?&lt;={$fighter}).*({$task})"
          </span>
        </div>
        <div
          class="content-top-item-flex"
          v-show="configCpn === '1' && configType === '1'"
        >
          <span class="content-top-item-flex-label">
            <i class="required">*</i>
            正则模板：
          </span>
          <div class="content-top-item-flex-notes">
            <a-textArea
              v-model:value.trim="configExample"
              placeholder="请输入正则表达式"
              allow-clear
              :auto-size="{ minRows: 4, maxRows: 4 }"
            />
          </div>
        </div>
        <div
          class="content-top-item-flex"
          v-show="configCpn === '1' && configType === '1'"
        >
          <span class="content-top-item-flex-label"> XPath路径： </span>
          <div class="content-top-item-flex-notes">
            <a-textArea
              v-model:value.trim="configXpathTagcontent"
              placeholder="请输入"
              allow-clear
              :auto-size="{ minRows: 4, maxRows: 4 }"
            />
          </div>
        </div>
        <!-- <div
          class="content-top-item-flex"
          v-show="configCpn === '1' && configType === '1'"
        >
          <span class="content-top-item-flex-label"> 备注： </span>
          <div class="content-top-item-flex-notes">
            <a-textArea
              v-model:value.trim="configNotes"
              placeholder="请输入"
              allow-clear
              :auto-size="{ minRows: 4, maxRows: 4 }"
            />
          </div>
        </div> -->
        <div
          class="content-top-item-flex"
          v-show="configCpn === '1' && configType === '1'"
        >
          <span
            class="content-top-item-flex-label-test"
            @click="testAddRegular"
          >
            > 测试：</span
          >
          <div class="content-top-item-flex-notes">
            <a-textArea
              v-model:value.trim="testRegularContent"
              placeholder=""
              allow-clear
              :auto-size="{ minRows: 4, maxRows: 4 }"
            />
          </div>
        </div>
        <div
          class="content-top-item"
          v-show="configCpn === '2' && configType === '1'"
        >
          <span class="content-top-item-label">
            <i class="required">*</i>
            策略：
          </span>
          <a-select
            v-model:value="configSelect"
            placeholder="请选择"
            class="content-top-item-select"
            :options="configOptions"
          />
        </div>
        <div class="content-top-item" v-show="configType === '2'">
          <span class="content-top-item-label">
            <i class="required">*</i>
            策略名称：
          </span>
          <a-input
            type="text"
            class="content-top-item-input"
            v-model:value.trim="configName"
            placeholder="请输入策略名称"
            allow-clear
          />
        </div>
        <div class="content-top-item" v-show="configType === '2'">
          <div class="content-top-item-des">
            <img
              src="@/assets/images/img/warning.svg"
              alt="warning"
              class="img"
            />
            <span
              >您需要进行以下操作来自动获取XPath（自定义可在文本框直接输入）</span
            >
          </div>
          <div class="content-top-item-fix">
            1.选择XPath拾取工具，在文档选取HTML元素后点击
            <div class="fix-img">
              <img
                src="@/assets/images/img/example1.png"
                alt="XPath-action"
                class="img"
              />
            </div>
          </div>
          <div class="content-top-item-fix">
            2.勾选dom属性，自动获取当前元素的XPath
            <div class="fix-img">
              <img
                src="@/assets/images/img/example2.png"
                alt="XPath-action"
                class="img"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  </a-modal>

  <!-- XPath策略弹窗 -->
  <a-modal
    v-model:visible="isXPathShow"
    :title="XPathModalTitle"
    @ok="XPathConfirm"
    @cancel="XPathCancel"
    ok-text="确定"
    cancel-text="取消"
    centered
    width="1000px"
    class="XPath-modal"
    :maskClosable="false"
  >
    <div class="XPath-modal-content">
      <div class="modal-top">
        <div class="left">
          <div class="left-title">
            <span class="name">Dom信息：</span>
            <a-tooltip>
              <template #title>
                <span>{{ domData.rootPath }}</span>
              </template>
              <div class="path">
                {{ domData.rootPath }}
              </div>
            </a-tooltip>
          </div>
          <div class="left-content">
            <p class="left-content-item">
              标签名称：
              <span class="tag-name">&lt;{{ domData.tagName }}&gt;</span>
            </p>
            <p class="left-content-title">标签属性：</p>
            <div class="left-content-item">
              <div
                class="tag-item"
                v-for="(item, index) in domData.propertyList"
                :key="index"
              >
                <span class="tag-item-label">{{ item.propName }}：</span>
                <a-checkbox-group
                  v-if="XPathModalTitle === 'XPath策略'"
                  v-model:value="item.propertys"
                  :name="item.propName"
                  :options="item.options"
                  class="tag-item-content"
                  @change="handleChangeCheck"
                />
                <div class="tag-item-content" v-else>
                  {{
                    item.propName === "style"
                      ? `${item.propertys.join("; ")};`
                      : item.propertys.join(" ")
                  }}
                </div>
              </div>
            </div>
            <p class="left-content-title">子节点信息：</p>
            <div class="left-content-item" v-show="domData.children.length">
              <span class="tag-item">标签名称：</span>
              <span
                class="tag-name"
                v-for="(tag, index) in domData.children"
                :key="index"
                >&lt;{{ tag.name }}&gt;</span
              >
            </div>
          </div>
        </div>
        <div class="right" v-if="XPathModalTitle === 'XPath策略'">
          <p class="right-title">XPath模板</p>
          <div class="right-content">
            <div class="right-content-item">
              <span class="item-label">相对路径：</span>
              <div class="item-content">//div</div>
            </div>
            <div class="right-content-item">
              <span class="item-label">绝对路径：</span>
              <div class="item-content">/div</div>
            </div>
            <div class="right-content-item">
              <span class="item-label">定位：</span>
              <div class="item-content">
                <p class="item-content-line">第二位：[2]</p>
                <p class="item-content-line">倒数第二位：[last()-1]</p>
              </div>
            </div>
            <div class="right-content-item">
              <span class="item-label">属性查找：</span>
              <div class="item-content">
                <p class="item-content-line">完全匹配：[@id="test1 test2"]</p>
                <p class="item-content-line">
                  模糊匹配：[contains(@id, "test1")]
                </p>
              </div>
            </div>
            <div class="right-content-item">
              <span class="item-label">文本：</span>
              <div class="item-content">
                <p class="item-content-line">提取文本：/div/text()</p>
                <p class="item-content-line">
                  模糊匹配文本：[contains(text(), "示例")]
                </p>
              </div>
            </div>
            <div class="right-content-item">
              <span class="item-label">详情查看：</span>
              <a
                class="item-content"
                target="_blank"
                href="https://developer.mozilla.org/zh-CN/docs/Web/XPath"
                >https://developer.mozilla.org/zh-CN/docs/Web/XPath</a
              >
            </div>
          </div>
        </div>
        <div class="right" v-else>
          <p class="right-title">正则模板</p>
          <div class="right-content">
            <div class="right-content-item">
              <span class="item-label">[ABC]：</span>
              <div class="item-content">匹配 [...] 中的所有字符</div>
            </div>
            <div class="right-content-item">
              <span class="item-label">[^ABC]：</span>
              <div class="item-content">匹配除了 [...] 中字符的所有字符</div>
            </div>
            <div class="right-content-item">
              <span class="item-label">[A-Z]：</span>
              <div class="item-content">
                <p class="item-content-line">
                  [A-Z] 表示一个区间，匹配所有大写字母
                </p>
                <p class="item-content-line">[a-z] 表示所有小写字母</p>
              </div>
            </div>
            <div class="right-content-item">
              <span class="item-label">\w：</span>
              <div class="item-content">
                <p class="item-content-line">匹配字母、数字、下划线</p>
                <p class="item-content-line">等价于 [A-Za-z0-9_]</p>
              </div>
            </div>
            <div class="right-content-item">
              <span class="item-label">[\s\S]：</span>
              <div class="item-content">
                <p class="item-content-line">\s 是匹配所有空白符，包括换行;</p>
                <p class="item-content-line">\S 非空白符，不包括换行。</p>
              </div>
            </div>
            <div class="right-content-item">
              <span class="item-label">详情查看：</span>
              <a
                class="item-content"
                target="_blank"
                href="https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Guide/Regular_Expressions"
                >https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Guide/Regular_Expressions</a
              >
            </div>
          </div>
        </div>
      </div>
      <div class="modal-bottom">
        <div v-if="targetParam.type === '3'" class="modal-bottom-title">
          舍弃：表头（上）前
          <a-input-number v-model:value="topNumber" :min="0" :max="10" />
          行&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;表头（左）前
          <a-input-number v-model:value="leftNumber" :min="0" :max="10" />
          列
        </div>
        <p
          class="modal-bottom-title"
          v-else-if="XPathModalTitle === 'XPath策略'"
        >
          XPath
          <a-radio-group
            v-model:value="isText"
            @change="handleChangeCheck"
            class="result-radio"
          >
            <a-radio value="1">选择元素</a-radio>
            <a-radio value="2">选择文本</a-radio>
          </a-radio-group>
        </p>
        <p class="modal-bottom-title" v-else>正则</p>
        <a-input
          type="text"
          v-model:value="XPathResult"
          placeholder="根据模板自动获取"
          class="modal-bottom-input"
        />
      </div>
      <div class="test">
        <p class="test-title" @click="testAddXapth">> 测试：</p>
        <div
          class="test-content"
          v-if="XPathModalTitle === 'XPath策略' && targetParam.type === '3'"
        >
          <div
            v-for="(table, i) in testXpathContent"
            :key="i"
            class="test-content-table"
          >
            <tr v-for="(x, j) in table.content" :key="j">
              <td v-for="(y, k) in x.split('\t')" :key="k" class="table-td">
                {{ y }}
              </td>
            </tr>
          </div>
        </div>
        <div class="test-content" v-else>
          <a-textArea
            v-model:value.trim="testXpathContent"
            placeholder=""
            allow-clear
            :auto-size="{ minRows: 4, maxRows: 4 }"
          />
        </div>
      </div>
    </div>
  </a-modal>

  <!-- 正则策略测试结果 -->
  <a-modal
    v-model:visible="isRegularTestShow"
    title="正则测试结果"
    centered
    width="600px"
    class="regular-test"
    :maskClosable="false"
  >
    <div class="regular-test-content">
      <!-- <span>这里是该正则的测试结果！</span> -->
      <div v-for="(item, index) in modalRegular" :key="index">
        {{ item }}
      </div>
    </div>
    <template #footer>
      <a-button type="primary" @click="okRegular">确定</a-button>
    </template>
  </a-modal>

  <!-- XPath策略测试结果 -->
  <a-modal
    v-model:visible="isXpathTestShow"
    title="Xpath测试结果"
    centered
    width="600px"
    class="regular-test"
    :maskClosable="false"
  >
    <div class="regular-test-content" v-if="targetParam.type === '3'">
      <div v-for="(table, i) in modalXpath" :key="i" class="test-content-table">
        <tr v-for="(x, j) in table.content" :key="j">
          <td v-for="(y, k) in x.split('\t')" :key="k" class="table-td">
            {{ y }}
          </td>
        </tr>
      </div>
    </div>
    <div class="regular-test-content" v-else>
      <div v-for="(item, index) in modalXpath" :key="index">{{ item }}</div>
    </div>
    <template #footer>
      <a-button type="primary" @click="okXpath">确定</a-button>
    </template>
  </a-modal>
</template>

<script>
import { getHtmlByFileId, uploadDocument } from "@/shared/api/document";
import {
  addTask,
  combineTest,
  editTaskBy,
  policyTest,
} from "@/shared/api/task";
import { modalConfirm, resetData } from "@/utils/common";
import {
  Button,
  Checkbox,
  Input,
  InputNumber,
  Modal,
  // Switch,
  Radio,
  Select,
  Spin,
  Tabs,
  Tooltip,
  Upload,
  message,
} from "ant-design-vue";
import { computed, nextTick, onMounted, reactive, ref, toRefs } from "vue";

const RadioGroup = Radio.Group;
const { TextArea } = Input;
const RadioButton = Radio.Button;
const { Dragger } = Upload;
const { TabPane } = Tabs;
const { Group } = Checkbox;

export default {
  name: "parserConfig",
  components: {
    AButton: Button,
    ACheckboxGroup: Group,
    AInput: Input,
    AInputNumber: InputNumber,
    AModal: Modal,
    ASelect: Select,
    ASpin: Spin,
    ARadio: Radio,
    ARadioGroup: RadioGroup,
    ATextArea: TextArea,
    AUpload: Upload,
    AUploadDragger: Dragger,
    ARadioButton: RadioButton,
    ATooltip: Tooltip,
    ATabs: Tabs,
    ATabPane: TabPane,
  },
  props: ["modalTitle", "editTaskId", "params", "checkType"],
  emits: ["changeIsDocConfigShow", "changeFiles", "increaseParam", "addFiles"],
  setup(props, { emit }) {
    //策略弹窗配置
    let isConfigShow = ref(false);
    const configModalTitle = ref("");
    let isXPathShow = ref(false); //XPath策略弹窗
    const XPathModalTitle = ref(""); // XPath策略弹窗title
    const isText = ref("1"); // 选择xpath元素还是当前xpath对应的文本

    // 上传文档之前
    let fileID = ref(undefined); //上传文件的Id
    //config页面文档是否在加载
    const isDocLoading = ref(false);
    //v-html展示内容
    const docData = ref(undefined);

    //根据文档id获取v-html的展示内容
    const getFileById = async (id) => {
      isDocLoading.value = true;
      let result = await getHtmlByFileId(id);
      isDocLoading.value = false;
      if (Object.prototype.toString.call(result) === "[object Object]") {
        message.error("获取文档失败！");
      } else {
        docData.value = result;
        const tables = document.getElementsByTagName("table");
        nextTick(() => {
          Array.from(tables).map((table) => {
            table.cellSpacing = 0;
            table.classList.remove("table-padding");
            table.classList.add("table-padding");
          });
        });
      }
    };

    // const activeKey = ref(props.params.files[0].id);
    const activeKey = ref(undefined); // 当前活跃的tab

    const paneRefs = {}; //动态ref
    //设置动态ref
    const setPaneRef = (id, el) => {
      paneRefs[id] = el;
    };
    //获取动态ref
    const getPaneRef = (value) => {
      return paneRefs[value];
    };

    // 删除tabfiles
    const onEdit = (targetKey) => {
      remove(targetKey);
    };

    // 切换tab
    const onChangeTab = (key) => {
      if (targetRule.value.selectFlag) {
        endSelectXPath();
      }
      const timer = setInterval(async () => {
        console.log("isClearListener", isClearListener.value);
        if (isClearListener.value) {
          // 监听是否已经把上一个dom节点上的监听事件全部清除了，只有全部清除了才能进行下面的操作
          clearInterval(timer);
          activeKey.value = key;
          await getFileById(key);
          if (targetRule.value.selectFlag) {
            startSelectXPath();
          }
        }
      }, 500);
    };

    // 删除nav的tab
    const remove = (targetKey) => {
      let lastIndex = 0;
      props.params.files.forEach((pane, i) => {
        if (pane.id === targetKey) {
          lastIndex = i - 1;
        }
      });
      let newFiles = props.params.files;
      let obj = newFiles.filter((pane) => pane.id !== targetKey);
      emit("changeFiles", obj);
      if (props.params.files.length === 0) {
        docData.value = null;
      }
      if (props.params.files.length && activeKey.value === targetKey) {
        if (lastIndex >= 0) {
          activeKey.value = props.params.files[lastIndex].id;
        } else {
          activeKey.value = props.params.files[0].id;
        }
      }
    };

    const beforeUpload = async (file) => {
      const fileName = file.name.split(".")[0];
      const fileType = file.name.split(".")[1];
      if (fileType !== "doc" && fileType !== "docx" && fileType !== "pdf") {
        message.info("当前只支持上传doc、docx、pdf类型的文件！", 3);
        return false;
      }
      const formData = new FormData();
      formData.append("file", file);
      const loading = message.loading("正在上传", 0);
      const res = await uploadDocument(formData);
      loading();
      if (res.message === "成功") {
        message.success("上传成功");
        fileID.value = res.data;
        const obj = {
          id: fileID.value,
          fileName: fileName,
          fileType: fileType,
        };
        activeKey.value = fileID.value;
        emit("addFiles", obj);
        getFileById(fileID.value);
      } else {
        message.error(res.message);
      }
      return false; // 阻止默认访问当前ip下的某个路径的行为
    };

    //上传文档重置
    const resetFile = () => {
      docData.value = null;
      emit("changeFiles", []);
    };

    const paramList = computed({
      get() {
        return props.params.paramList;
      },
      set(newValue) {
        emit("increaseParam", newValue);
      },
    });

    // 添加字段方法
    const handleAddParam = () => {
      paramList.value.push({
        name: undefined, //名称
        tag: undefined, //标签
        type: undefined, //类型
        rules: [],
        ifDrag: true, //具体解析内容是否展开
      });
    };

    //策略框下拉选项
    const configOptions = ref([]);
    //解析策略参数
    const configParams = reactive({
      configId: undefined,
      configType: "1", //xpath 正则
      configCpn: "1", //策略组件
      configName: undefined, //策略名称
      configExample: undefined, //正则模板
      configNotes: undefined, //备注
      configSelect: undefined, //公共策略库选项

      configTemplate: undefined, //xpath模板解析语法选择 xpath id,class
      configData: undefined, //解析后的XPath

      configXpathTag: false, //正则策略是否添加Xpath
      configXpathTagcontent: undefined, //正则策略添加Xpath的内容
    });

    // 重置configParams
    const resetConfigParams = () => {
      resetData(configParams);
      configParams.configType = "1";
      configParams.configCpn = "1";
    };

    //添加具体解析内容是否展开
    const handleOpen = (index) => {
      paramList.value[index].ifDrag = !paramList.value[index].ifDrag;
    };

    let paramsIndex = ref(null);
    //编辑正则时候定位 fatherIndex 和 sonIndex
    let fatherIndex = ref(null);
    let sonIndex = ref(null);
    //添加具体解析内容
    const configConfirm = () => {
      if (!configParams.configType) {
        return message.warning("请选择策略类型！");
      }
      if (configParams.configType === "1") {
        if (!configParams.configCpn) {
          return message.warning("请选择策略组件");
        }
      }
      if (configParams.configType === "1" && configParams.configCpn === "1") {
        if (!configParams.configName) {
          return message.warning("请输入策略名称！");
        }
        if (!configParams.configExample) {
          return message.warning("请输入策略模板！");
        }
      }
      if (configParams.configType === "1" && configParams.configCpn === "2") {
        if (!configParams.configSelect) {
          return message.warning("请选择策略！");
        }
      }
      if (configParams.configType === "2") {
        if (!configParams.configName) {
          return message.warning("请输入策略名称！");
        }
      }
      if (configParams.configXpathTagcontent) {
        configParams.configXpathTag = true;
      }
      //后续编辑正则进行修改的时候
      if (fatherIndex.value !== null && sonIndex.value !== null) {
        paramList.value[fatherIndex.value].rules[sonIndex.value] = {
          selectFlag: false,
          configId: configParams.configId,
          configType: configParams.configType,
          configCpn: configParams.configCpn,
          configName: configParams.configName,
          configExample: configParams.configExample,
          configData: configParams.configData,
          configNotes: configParams.configNotes,
          configSelect: configParams.configSelect,
          configXpathTag: configParams.configXpathTag ? 1 : 0, //正则策略是否添加Xpath
          configXpathTagcontent: configParams.configXpathTagcontent, //正则策略添加Xpath的内容
        };
        const replace =
          paramList.value[fatherIndex.value].rules[sonIndex.value];
        paramList.value[fatherIndex.value].rules.splice(
          sonIndex.value,
          1,
          replace
        );
      }
      //普通添加策略的时候
      if (
        paramsIndex.value !== null &&
        fatherIndex.value == null &&
        sonIndex.value == null
      ) {
        paramList.value[paramsIndex.value].rules.push({
          selectFlag: false,
          configId: configParams.configId,
          configType: configParams.configType,
          configCpn: configParams.configCpn,
          configName: configParams.configName,
          configExample: configParams.configExample,
          configData: configParams.configData,
          configNotes: configParams.configNotes,
          configSelect: configParams.configSelect,
          configXpathTag: configParams.configXpathTag ? 1 : 0, //正则策略是否添加Xpath
          configXpathTagcontent: configParams.configXpathTagcontent, //正则策略添加Xpath的内容
        });
      }
      fatherIndex.value = null;
      sonIndex.value = null;
      paramsIndex.value = null;
      configCancel();
    };

    //初始化策略弹窗
    const configCancel = () => {
      isConfigShow.value = false;
      resetConfigParams();
    };

    //校验参数方法
    const checkAddData = (data) => {
      let msg = "";
      let flag = true;
      for (let i = 0; i < data.length; i++) {
        const element = data[i];
        for (let j = 0; j < element.rules.length; j++) {
          const item = element.rules[j];
          if (item.configType === "2") {
            if (!item.configData) {
              msg = "请填写Xpath路径！";
              flag = false;
            }
            break;
          }
        }
      }
      return { msg, flag };
    };

    //确认添加解析项校验
    //新建任务、编辑任务
    const addConfirm = async () => {
      if (!props.params.files.length) {
        message.warning("请先上传文档！");
      }
      const { flag, msg } = checkAddData(paramList.value);
      if (!flag) {
        return message.warning(msg);
      }
      const json = {
        id: props.editTaskId,
        taskName: props.params.addName,
        autoStatus: props.params.autoChecked == false ? "0" : "1",
        parserType: parseInt(props.params.analysisValue),
        fileBucket: props.params.addDoc,
        fileGroup: props.params.addDocBase,
        parseTime: parseInt(props.params.anaTimeValue),
        isIncremental: props.params.autoChecked == false ? 0 : 1,
        notes: props.params.notes,
        files: props.params.files,
        taskConfigs: paramList.value.map((item) => {
          return {
            ...item,
            rules: item.rules.map((child) => {
              return {
                ...child,
                configXpathTag: child.configXpathTag ? 1 : 0,
                configXpathTagcontent: child.configXpathTagcontent,
                configExample: !child.configData
                  ? child.configExample
                  : child.configData,
                tableIgnoreRow: item.type === "3" ? child.topNumber : undefined,
                tableIgnoreLine:
                  item.type === "3" ? child.leftNumber : undefined,
              };
            }),
          };
        }),
      };
      const res =
        props.modalTitle == "新建任务"
          ? await addTask(json)
          : await editTaskBy(json);
      if (res.message === "成功") {
        const text = props.modalTitle === "新建任务" ? "新建" : "编辑";
        message.success(`${text}成功！`);
        emit("changeIsDocConfigShow", false); // 回到并刷新列表页
        //getList(); //这行不用写，因为回到列表页时，parserHome 的onMounted里执行了getList()
      } else {
        message.error(res.message);
      }
    };

    //删除全部解析项目
    const delAllProject = () => {
      const title = "删除提示！";
      const content = "是否确认删除全部解析项目？";
      const onOk = () => {
        paramList.value = [];
      };
      modalConfirm(title, content, onOk);
    };

    //删除某一解析项
    const delProject = (index) => {
      const title = "删除提示！";
      const content = "是否确认删除该解析项？";
      const onOk = () => {
        paramList.value.splice(index, 1);
      };
      modalConfirm(title, content, onOk);
    };

    //删除解析策略
    const delStrategy = (index) => {
      const title = "删除提示！";
      const content = "是否确认删除该解析策略？";
      const onOk = () => {
        paramList.value[index].rules = [];
      };
      modalConfirm(title, content, onOk);
    };

    //删除解析策略XPath
    const delXPath = (parentIndex, index) => {
      const title = "删除提示！";
      const content = "是否确认删除该解析策略？";
      const onOk = () => {
        paramList.value[parentIndex].rules.splice(index, 1);
      };
      modalConfirm(title, content, onOk);
    };

    //删除解析策略-正则
    const delRegular = (parentIndex, index) => {
      const title = "删除提示！";
      const content = "是否确认删除该解析策略？";
      const onOk = () => {
        paramList.value[parentIndex].rules.splice(index, 1);
      };
      modalConfirm(title, content, onOk);
    };

    //编辑解析项策略-正则
    const editRegular = (parentIndex, index) => {
      ruleIndex.value = [parentIndex, index];
      isConfigShow.value = true;
      configModalTitle.value = "编辑策略";
      configParams.configName = targetRule.value.configName;
      configParams.configExample = targetRule.value.configExample;
      configParams.configNotes = targetRule.value.configNotes;
      configParams.configXpathTagcontent =
        targetRule.value.configXpathTagcontent;
      configParams.configXpathTag = targetRule.value.configXpathTag;
      fatherIndex.value = parentIndex;
      sonIndex.value = index;
    };

    // XPath策略弹窗-确定
    const XPathConfirm = () => {
      if (targetParam.value.type === "3") {
        // 提取的是表格类型
        targetRule.value.topNumber = topNumber.value;
        targetRule.value.leftNumber = leftNumber.value;
      }
      if (targetRule.value.configType == "2") {
        // xpath
        console.log("确认时", XPathResult.value);
        targetRule.value.configData = XPathResult.value;
        targetRule.value.configExample = XPathResult.value;
      } else {
        // 正则
        targetRule.value.configXpathTagcontent = domData.rootPath;
        targetRule.value.configXpathTag = true;
        targetRule.value.configExample = XPathResult.value;
      }
      XPathCancel();
    };

    // XPath策略弹窗-取消
    const XPathCancel = () => {
      isXPathShow.value = false;
      XPathResult.value = null;
      testXpathContent.value = null;
      XPathModalTitle.value = "";
      leftNumber.value = 0;
      topNumber.value = 0;
    };

    const XPathResult = ref(""); // 根据选择的模板得到的最终的xpath || 正则+xpath弹窗里的正则
    const ruleIndex = ref([]); // 当前选中的策略的位置
    const targetParam = computed(() => {
      console.log(
        "targetParam",
        paramsIndex.value,
        ruleIndex.value,
        paramList.value[paramsIndex.value],
        paramsIndex.value !== null
          ? paramList.value[paramsIndex.value]
          : ruleIndex.value.length
          ? paramList.value[ruleIndex.value[0]]
          : {}
      );
      return paramsIndex.value !== null
        ? paramList.value[paramsIndex.value]
        : ruleIndex.value.length
        ? paramList.value[ruleIndex.value[0]]
        : {};
    });
    const targetRule = computed(() => {
      return ruleIndex.value.length
        ? paramList.value[ruleIndex.value[0]].rules[ruleIndex.value[1]]
        : {};
    });
    // 需要舍弃的行列数
    const topNumber = ref(0);
    const leftNumber = ref(0);

    // 当前xpath dom元素的信息
    const domData = reactive({
      dom: null,
      tagName: null,
      propertyList: [],
      children: [],
      rootPath: "", // 绝对路径
    });

    //策略弹窗显示
    const handleAddConfig = (index) => {
      paramsIndex.value = index;
      console.log("handleAddConfig", targetParam.value);
      if (!targetParam.value.name) {
        message.info("请填写解析项名称！");
        return false;
      }
      if (!targetParam.value.tag) {
        message.info("请填写解析项标签！");
        return false;
      }
      if (!targetParam.value.type) {
        message.info("请选择解析项类型！");
        return false;
      }
      isConfigShow.value = true;
      configModalTitle.value = "添加策略";
      testRegularContent.value = null;
      testXpathContent.value = null;
    };

    const isClearListener = ref(true); // 是否已经将dom上的监听事件清除
    // 开启选择xpath功能
    const handleSelectXPath = (index, num) => {
      testXpathContent.value = null;
      if (!props.params.files.length) {
        message.info("请先上传文档！");
      } else {
        ruleIndex.value = [index, num];
        console.log("handleSelectXPath", targetRule.value);
        // 将其他selectFlag置为false
        paramList.value = paramList.value.map((item) => ({
          ...item,
          rules: item.rules.map((cell) => ({
            ...cell,
            selectFlag: false,
          })),
        }));
        targetRule.value.selectFlag = !targetRule.value.selectFlag;
        if (targetRule.value.selectFlag) {
          startSelectXPath();
        } else {
          endSelectXPath();
        }
      }
    };

    // 启用监听选择xpath功能
    const startSelectXPath = () => {
      const docDom = getPaneRef(activeKey.value);
      const allDoms = docDom.children;
      Array.from(allDoms).map((dom) => {
        dom.addEventListener("mouseover", mouseoverCallback, true);
        dom.addEventListener("mouseout", mouseoutCallback, true);
        dom.addEventListener("click", callback, true);
      });
      isClearListener.value = false;
    };

    // 停用监听选择xpath功能
    const endSelectXPath = () => {
      const docDom = getPaneRef(activeKey.value);
      const allDoms = docDom.children;
      Array.from(allDoms).map((dom) => {
        dom.removeEventListener("mouseover", mouseoverCallback, true);
        dom.removeEventListener("mouseout", mouseoutCallback, true);
        dom.removeEventListener("click", callback, true);
      });
      isClearListener.value = true;
      console.log("endSelectXPath", isClearListener.value);
    };

    // 开启选择xpath模式后的点击事件
    const callback = (ele) => {
      let flag = false; // 是否含有table-padding类名
      ele.target.classList.remove("hover");
      domData.dom = ele.target;
      domData.tagName = ele.target.tagName.toLowerCase();
      if (targetParam.value.type === "3" && domData.tagName !== "table") {
        message.info("当前解析项类型为表格，请选择表格标签！");
        targetRule.value.selectFlag = false;
        return false;
      }
      if (ele.target.classList.contains("table-padding")) {
        flag = true;
        ele.target.cellSpacing = "";
        ele.target.classList.remove("table-padding");
      }

      if (ele.target.children) {
        const children = [];
        Array.from(ele.target.children).map((child) => {
          children.push({
            name: child.localName,
          });
        });
        domData.children = children;
      }

      domData.propertyList = getDomProperty(ele.target);
      //正则+Xpath策略弹框
      if (targetRule.value.configType === "1") {
        XPathResult.value = targetRule.value.configExample;
        XPathModalTitle.value = "正则策略";
      } else {
        XPathResult.value = readRelativeXPath(ele.target);
        XPathModalTitle.value = "XPath策略";
      }
      domData.rootPath = readAbsoluteXPath(ele.target);
      isXPathShow.value = true;
      targetRule.value.selectFlag = false;
      endSelectXPath();
      if (flag) {
        ele.target.classList.add("table-padding");
        ele.target.cellSpacing = 0;
        flag = false;
      }
    };

    // 改变checkbox的选择
    const handleChangeCheck = () => {
      XPathResult.value = readRelativeXPath(domData.dom);
    };

    const isEnter = ref(false); // 是否正在悬浮状态
    const mouseoverCallback = (targetDom) => {
      targetDom.stopPropagation();
      if (
        targetDom.target.tagName.toUpperCase() == "HTML" ||
        targetDom.target.tagName.toUpperCase() == "BODY"
      )
        return;
      if (isEnter.value) return;
      isEnter.value = true;
      targetDom.target.classList.add("hover");
    };

    const mouseoutCallback = (targetDom) => {
      targetDom.stopPropagation();
      if (
        targetDom.target.tagName.toUpperCase() == "HTML" ||
        targetDom.target.tagName.toUpperCase() == "BODY"
      )
        return;
      isEnter.value = false;
      targetDom.target.classList.remove("hover");
    };

    // 自定义获取属性
    const getDomProperty = (elm) => {
      const results = [];
      const propertyList = elm.attributes;
      Array.from(propertyList).map((property) => {
        if (!property.nodeValue) return; // 如果当前属性没有value，则舍弃
        property.nodeValue = property.nodeValue.replace(/[\r\n]/g, ""); // 去掉换行符
        let targetOptions =
          property.nodeName === "style"
            ? [...property.nodeValue.split(";")]
            : [...property.nodeValue.split(" ")];
        console.log("bingo-targetOptions", targetOptions);
        if (!targetOptions.slice(-1)[0]) {
          console.log("bingo", !targetOptions.slice(-1)[0]);
          targetOptions = targetOptions.slice(0, -1);
        }
        targetOptions = targetOptions.map((item) => item.trim()); // 去掉两端空格
        results.push({
          propertys: targetOptions, // 存放checkbox结果
          propName: property.nodeName,
          options: targetOptions.map((item) => ({
            label: item,
            value: item,
          })),
        });
      });
      return results;
    };

    // 获取绝对XPath路径
    const readAbsoluteXPath = (element) => {
      // if (element.id) {
      //   //判断id属性，如果这个元素有id，则显 示//*[@id="xPath"]  形式内容
      //   return '//*[@id="' + element.id + '"]';
      // }

      // if (!element.id && element.getAttribute("class")) {
      //   //判断class属性，如果这个元素有class，则显 示//*[@class="xPath"]  形式内容
      //   return '//*[@class="' + element.getAttribute("class") + '"]';
      // }
      //因为XPath属性不止id和class，所以还可以更具class形式添加属性
      const docDom = getPaneRef(activeKey.value);
      //这里需要需要主要字符串转译问题
      //element === docDom.value ||
      if (
        element === docDom ||
        element.tagName.toUpperCase() == "HTML" ||
        element.tagName.toUpperCase() == "BODY"
      ) {
        // 防止点击到#document元素
        // 防止点击到html元素
        // 递归到body处，结束递归
        return "/html/" + "body";
      }

      let ix = 0, //在nodelist中的位置，且每次点击初始化
        siblings = element.parentNode.children; //同级的子元素
      let samTagNum = 0;
      for (let i = 0; i < siblings.length; i++) {
        const item = siblings[i];
        if (samTagNum > 1) {
          // 大于1之后就没有继续遍历下去的必要了
          break;
        }
        if (item.tagName == element.tagName) {
          samTagNum += 1;
        }
      }
      for (let i = 0, l = siblings.length; i < l; i++) {
        let sibling = siblings[i];
        if (sibling == element) {
          //如果这个元素是siblings数组中的元素，则执行递归操作
          return (
            readAbsoluteXPath(element.parentNode) +
            "/" +
            element.tagName.toLowerCase() +
            (samTagNum === 1 ? "" : "[" + (ix + 1) + "]")
          ); //ix+1是因为xpath是从1开始计数的，element.tagName+((ix+1)==1?'':'['+(ix+1)+']')三元运算符，如果是第一个则不显示，从2开始显示
        } else if (
          sibling.nodeType == 1 &&
          sibling.tagName == element.tagName
        ) {
          // sibling.nodeType：
          // 如果节点是元素节点，则 nodeType 属性将返回 1。
          // 如果节点是属性节点，则 nodeType 属性将返回 2。
          // 如果节点是文本节点，则 nodeType 属性将返回 3。
          // 如果节点是注释节点，则 nodeType 属性将返回 8。
          //如果不符合，判断是否是element元素，并且是否是相同元素，如果是相同的就开始累加
          ix++;
        }
      }
    };

    // 获取相对XPath路径
    const readRelativeXPath = (element) => {
      console.log("readRelativeXPath", element, domData.propertyList);
      let XPathStr = "//" + element.tagName.toLowerCase();
      let propertyStr = "";
      const propertyList = domData.propertyList.filter(
        (v) => v.propertys.length
      );
      propertyList.map((item, index, currentArr) => {
        const symbol = item.propName === "style" ? ";" : " ";
        if (item.options.length === item.propertys.length) {
          // 两者长度相等，则直接使用精准匹配
          propertyStr += `@${item.propName}="${item.propertys.join(symbol)}${
            item.propName === "style" ? ";" : ""
          }"`;
        } else {
          // 两者长度不一致，使用XPath的contains函数
          item.propertys.map((property, num) => {
            propertyStr += `contains(@${item.propName},"${property}${
              item.propName === "style" ? ";" : ""
            }")`;
            if (num < item.propertys.length - 1) {
              propertyStr += " and ";
            }
          });
        }
        if (
          index < propertyList.length - 1 &&
          item.propertys.length &&
          currentArr[index + 1].propertys.length
        ) {
          // 如果不止一个属性，且当前属性和下一个属性均有值被勾选，则使用and语法
          propertyStr += " and ";
        }
      });
      if (propertyStr) {
        XPathStr += `[${propertyStr}]`;
      }
      if (isText.value === "2") {
        XPathStr += "/text()";
      }
      return XPathStr;
    };

    // 拖拽所用到的变量
    let draggingNode = null; // 正在被拖拽的dom节点
    let draggingIndex = null; // 正在被拖拽的节点对应的index
    let draggingParentIndex = null; // 正在被拖拽的节点的父节点对应的index

    // 拖拽开始方法
    const handleDragStart = (e, parentIndex, index) => {
      draggingNode = e.target;
      draggingIndex = index;
      e.dataTransfer.effectAllowed = "move";
      draggingParentIndex = parentIndex;
    };

    // 正在拖拽方法
    const handleDragOver = (e) => {
      e.preventDefault();
      e.dataTransfer.dropEffect = "move";
    };

    // 拖拽停止方法
    const handleDrop = (e, parentIndex, index) => {
      if (
        draggingNode !== null &&
        draggingIndex !== index &&
        draggingParentIndex === parentIndex
      ) {
        const srcTarget = paramList.value[parentIndex].rules[draggingIndex];
        const dstTarget = paramList.value[parentIndex].rules[index];
        paramList.value[parentIndex].rules.splice(index, 1, srcTarget);
        paramList.value[parentIndex].rules.splice(draggingIndex, 1, dstTarget);
        // 重置相关变量
        draggingNode = null;
        draggingIndex = null;
        draggingParentIndex = null;
      }
    };

    //测试正则-弹框
    let isRegularTestShow = ref(false);
    //modal展示的结果
    let modalRegular = ref(undefined);
    //测试解析项策略-正则
    const testRegular = async (parentIndex, index) => {
      ruleIndex.value = [parentIndex, index];
      modalRegular.value = null;
      if (!props.params.files.length) {
        message.warning("请先上传文档！");
        return;
      }
      //const nowFileId = props.params.files[0].id;
      const nowFileId = activeKey.value;

      if (targetRule.value.configXpathTag) {
        // 正则 && xpath
        const json = {
          id: nowFileId,
          analyticType: parseInt(targetRule.value.configType),
          analyticBody: targetRule.value.configExample,
          xPathBody: targetRule.value.configXpathTagcontent,
          tableIgnoreRow: targetRule.value.topNumber,
          tableIgnoreLine: targetRule.value.leftNumber,
          resultType: targetParam.value.type,
        };
        const res = await combineTest(json);
        console.log("res", res);
        if (res.message === "成功") {
          if (res.data.length) {
            modalRegular.value = res.data;
            isRegularTestShow.value = true;
          } else {
            message.info("该正则在所选xpath文档片段中无测试结果！");
          }
        } else {
          message.error(res.message);
        }
      } else {
        // 单个正则 不含xpath
        const json = {
          id: nowFileId,
          analyticType: parseInt(targetRule.value.configType),
          analyticBody: targetRule.value.configExample,
          resultType: targetParam.value.type,
        };
        const res = await policyTest(json);
        if (res.message === "成功") {
          if (res.data.resultBody.data.length) {
            modalRegular.value = res.data.resultBody.data;
            isRegularTestShow.value = true;
          } else {
            message.info("该正则无测试结果！");
          }
        } else {
          message.error(res.message);
        }
      }
    };
    const okRegular = () => {
      isRegularTestShow.value = false;
    };

    //测试解析项策略-正则
    //添加策略-测试文本框中的内容
    let testRegularContent = ref(undefined);
    const testAddRegular = async () => {
      if (!props.params.files.length) {
        message.warning("请先上传文档！");
        return;
      }
      testRegularContent.value = null;
      //const nowFileId = props.params.files[0].id;
      const nowFileId = activeKey.value;
      const json = {
        id: nowFileId,
        analyticType: parseInt(configParams.configType),
        analyticBody: configParams.configExample,
        resultType: paramList.value[paramsIndex.value].type,
      };
      if (configParams.configXpathTagcontent) {
        // 正则 包含xpath
        json.xPathBody = configParams.configXpathTagcontent;
        const res = await combineTest(json);
        console.log("res", res);
        if (res.message === "成功") {
          if (res.data.length) {
            testRegularContent.value = res.data.join("\n");
          } else {
            message.info("该正则在所选xpath文档片段中无测试结果！");
          }
        } else {
          message.error(res.message);
        }
      } else {
        // 单个正则 不含xpath
        const res = await policyTest(json);
        if (res.message === "成功") {
          if (res.data.resultBody.data.length) {
            testRegularContent.value = res.data.resultBody.data.join("\n");
          } else {
            message.info("该正则无测试结果！");
          }
        } else {
          message.error(res.message);
        }
      }
    };

    //测试解析项策略-XPath
    //添加策略-测试文本框中的内容
    let testXpathContent = ref(undefined);
    const testAddXapth = async () => {
      if (!props.params.files.length) {
        message.warning("请先上传文档！");
        return;
      }
      testXpathContent.value = null;
      const nowFileId = activeKey.value;
      const json = {
        id: nowFileId,
        resultType: targetParam.value.type,
        analyticType: parseInt(targetRule.value.configType),
      };
      let res = null;
      if (targetRule.value.configType === "1") {
        // 正则 && xpath
        json.xPathBody = domData.rootPath;
        json.analyticBody = targetRule.value.configExample;
        json.tableIgnoreRow = topNumber.value;
        json.tableIgnoreLine = leftNumber.value;
        res = await combineTest(json);
      } else {
        // 只有XPath 但可能包含表格
        json.analyticBody = XPathResult.value;
        json.tableIgnoreRow = topNumber.value;
        json.tableIgnoreLine = leftNumber.value;
        res = await policyTest(json);
      }
      if (res.message === "成功") {
        if (targetRule.value.configType === "1") {
          // 正则 && xpath
          if (res.data.length) {
            testXpathContent.value = res.data.join("\n");
          } else {
            message.info("该正则在所选xpath文档片段中无测试结果！");
          }
        } else if (targetParam.value.type === "3") {
          // xpath && 表格
          if (res.data.resultBody.tbody.length) {
            testXpathContent.value = res.data.resultBody.tbody.map((item) => {
              return {
                content: item.split("\n").slice(0, -1),
              };
            });
            console.log("testXpathContent.value", testXpathContent.value);
          } else {
            message.info("该正则在所选xpath文档片段中无测试结果！");
          }
        } else {
          // 单个xpath 不含表格
          if (res.data.resultBody.data.length) {
            testXpathContent.value = res.data.resultBody.data.join("\n");
          } else {
            message.info("该XPath无测试结果！");
          }
        }
      } else {
        message.error(res.message);
      }
    };

    //测试解析项策略-XPath
    //测试Xpath弹框
    let isXpathTestShow = ref(false);
    //modal展示的结果
    let modalXpath = ref(undefined);
    const testXpath = async (parentIndex, index) => {
      ruleIndex.value = [parentIndex, index];
      modalXpath.value = null;
      if (!props.params.files.length) {
        message.warning("请先上传文档！");
        return;
      }
      //const nowFileId = props.params.files[0].id;
      const nowFileId = activeKey.value;
      const json = {
        id: nowFileId,
        analyticType: parseInt(targetRule.value.configType),
        analyticBody: targetRule.value.configData,
        tableIgnoreRow: targetRule.value.topNumber,
        tableIgnoreLine: targetRule.value.leftNumber,
        resultType: targetParam.value.type,
      };
      // 只有XPath 但可能包含表格
      const res = await policyTest(json);
      if (res.message === "成功") {
        if (targetParam.value.type === "3") {
          // 包含表格
          if (res.data.resultBody.tbody.length) {
            modalXpath.value = res.data.resultBody.tbody.map((item) => {
              return {
                content: item.split("\n").slice(0, -1),
              };
            });
            isXpathTestShow.value = true;
            console.log("modalXpath.value", modalXpath.value);
          } else {
            message.info("该正则在所选xpath文档片段中无测试结果！");
          }
        } else {
          // 不包含表格
          if (res.data.resultBody.data.length) {
            modalXpath.value = res.data.resultBody.data;
            isXpathTestShow.value = true;
          } else {
            message.info("该Xpath无测试结果！");
          }
        }
      } else {
        message.error(res.message);
      }
    };
    const okXpath = () => {
      isXpathTestShow.value = false;
      modalXpath.value = undefined;
    };

    onMounted(() => {
      docData.value = null;
      if (props.checkType === "edit") {
        activeKey.value = props.params.files[0].id;
        getFileById(props.params.files[0].id);
      }
    });

    return {
      isRegularTestShow,
      testXpathContent,
      modalRegular,
      testRegularContent,
      testAddXapth,
      isXpathTestShow,
      modalXpath,
      fileID,
      isDocLoading,
      ...toRefs(props.params),
      paramList,
      ...toRefs(configParams),
      domData,
      isConfigShow,
      configModalTitle,
      isXPathShow,
      XPathModalTitle,
      isText,
      configOptions,
      XPathResult,
      docData,
      activeKey,
      handleChangeCheck,
      readRelativeXPath,
      targetParam,
      topNumber,
      leftNumber,

      onEdit,
      onChangeTab,
      setPaneRef,
      getPaneRef,
      beforeUpload,
      resetFile,
      testRegular,
      okRegular,
      testAddRegular,
      testXpath,
      okXpath,
      handleDragStart,
      handleDragOver,
      handleDrop,
      addConfirm,
      handleAddParam,
      handleOpen,
      configConfirm,
      delAllProject,
      delProject,
      delStrategy,
      delXPath,
      delRegular,
      editRegular,
      XPathConfirm,
      XPathCancel,
      handleAddConfig,
      handleSelectXPath,
      configCancel,
      getFileById,
    };
  },
};
</script>
<style lang="less">
.content {
  width: 100%;
  padding: 20px;
  display: flex;
  height: calc(100% - 68px);

  &-left {
    height: 100%;
    margin-right: 20px;
    width: calc(100% - 690px);

    &-header {
      width: 100%;
      height: 32px;
      display: flex;
      margin-bottom: 20px;
      align-items: center;
      justify-content: space-between;

      .header-left {
        height: 32px;
        font-size: 20px;
        font-weight: 600;
        color: #333333;
        line-height: 32px;
      }

      .header-btns {
        height: 28px;
        display: flex;
        align-items: center;
        border-radius: 0px 0px 0px 0px;
        justify-content: space-between;

        .btns {
          height: 28px;
          margin-left: 10px;
        }
      }
    }

    &-content {
      width: 100%;
      position: relative;
      height: calc(100% - 52px);
      //border: 1px solid #e2e6e9;
      //border-radius: 4px 4px 4px 4px;

      .content-box {
        width: 100%;
        height: 100%;
        //overflow: auto;

        .hover {
          z-index: 0;
          position: relative;

          span {
            background-color: #a0c5e8 !important;
          }
        }

        .hover::after {
          position: absolute;
          top: 0;
          left: 0;
          z-index: -1;
          content: "";
          width: 100%;
          height: 100%;
          background-color: #a0c5e8;
        }

        .table-padding {
          padding: 5px;
          border-collapse: inherit;
        }

        .ant-tabs {
          width: 100%;
          height: 100%;

          &-nav {
            margin: 0px;

            .ant-tabs-tab {
              border: 1px solid #e2e6e9;
              border-bottom: 0px;
              border-radius: 8px 8px 0px 0px !important;
            }
          }

          &-content-holder {
            height: 100%;
            overflow: auto;
            border: 1px solid #e2e6e9;
            border-top: 0px;
            border-radius: 0px 0px 4px 4px;
          }
        }
      }

      .upload-icon {
        margin: auto;
        width: 76px;
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
      }

      .upload-btn {
        margin: auto;
        position: absolute;
        top: 60%;
        left: 50%;
        transform: translate(-50%, -50%);
      }

      .tip-text,
      .ant-spin {
        top: 50%;
        left: 50%;
        font-size: 16px;
        position: absolute;
        transform: translate(-50%, -50%);
      }
    }
  }
  &-right {
    height: 100%;
    width: 670px;

    &-header {
      width: 100%;
      height: 32px;
      margin-bottom: 20px;

      .header-left {
        height: 32px;
        font-size: 20px;
        font-weight: 600;
        color: #333333;
        line-height: 32px;
      }
    }

    &-content {
      width: 100%;
      padding: 20px;
      position: relative;
      height: calc(100% - 52px);
      border: 1px solid #e2e6e9;
      border-radius: 4px 4px 4px 4px;

      .header {
        width: 100%;
        height: 24px;
        display: flex;
        margin-bottom: 12px;
        align-items: center;
        background-color: #ffffff;
        justify-content: space-between;

        &-left {
          height: 24px;
          font-size: 18px;
          font-weight: 600;
          color: #333333;
          line-height: 24px;
        }
        &-right {
          height: 22px;
          display: flex;
          font-size: 14px;
          font-weight: 500;
          color: #8a92a0;
          line-height: 22px;
          align-items: center;

          &-add {
            display: flex;
            cursor: pointer;
            align-items: center;
            justify-content: center;

            .config {
              margin-left: 4px;
              color: #1677ff;
            }

            .pc-config {
              width: 14px;
              height: 14px;
            }
          }

          &-del {
            display: flex;
            cursor: pointer;
            align-items: center;
            justify-content: center;

            .pic-del {
              width: 14px;
              height: 14px;
              margin-left: 10px;
            }

            .delete {
              margin-left: 5px;
            }
          }
        }
      }

      .content {
        width: 630px;
        padding: 0px;
        overflow-y: auto;
        overflow-x: hidden;

        .content-inner {
          width: 630px;

          .content-item {
            width: 630px;
            display: flex;
            flex-wrap: wrap;
            align-items: center;
            padding: 8px 10px 8px 10px;

            .item-box {
              width: 100%;
              height: 44px;
              display: flex;
              flex-wrap: wrap;
              font-size: 14px;
              font-weight: 500;
              color: #333333;
              position: relative;
              align-items: center;
              margin-bottom: 12px;
              justify-content: space-between;

              &-inner-one {
                display: flex;
                align-items: center;
              }

              &-input {
                width: 113px;
                height: 28px;
                background: #ffffff;
                border: 1px solid #e2e6e9;
                border-radius: 4px 4px 4px 4px;

                .pic-del {
                  width: 14px;
                  height: 14px;
                }
              }

              &-inner {
                .pic-del {
                  width: 14px;
                  height: 14px;
                  cursor: pointer;
                }

                .ant-radio-group {
                  .radio-item {
                    margin: 0;
                  }
                }
              }
            }

            .item-box-para {
              width: 610px;
              // height: 219px;
              padding-top: 8px;
              padding-left: 10px;
              padding-right: 10px;
              background: #f5f9fe;
              border: 1px solid #e2e6e9;
              border-radius: 2px 2px 2px 2px;

              .header {
                width: 590px;
                height: 24px;
                display: flex;
                margin-bottom: 15px;
                align-items: center;
                background: #f5f9fe;
                justify-content: space-between;

                &-left {
                  height: 22px;
                  font-size: 14px;
                  font-weight: 500;
                  color: #8a92a0;
                  line-height: 22px;
                }
                &-right {
                  height: 22px;
                  font-size: 14px;
                  font-weight: 500;
                  color: #8a92a0;
                  line-height: 22px;

                  &-add {
                    display: flex;
                    cursor: pointer;
                    align-items: center;

                    .config {
                      margin-left: 4px;
                      color: #1677ff;
                    }

                    .pc-config {
                      width: 14px;
                      height: 14px;
                    }
                  }

                  &-del {
                    display: flex;
                    align-items: center;

                    .pic-del {
                      width: 14px;
                      height: 14px;
                      margin-left: 10px;
                    }

                    .delete {
                      margin-left: 5px;
                    }
                  }
                }
              }

              .bottom {
                width: 590px;
                display: flex;
                flex-wrap: wrap;
                align-items: center;

                &-item {
                  width: 590px;
                  height: 40px;
                  display: flex;
                  align-items: center;

                  .item-box {
                    width: 590px;
                    height: 40px;
                    display: flex;
                    align-items: center;
                    //padding: 6px 10px 6px 10px;

                    .left {
                      width: 451px;
                      height: 28px;
                      display: flex;
                      align-items: center;
                      justify-content: space-between;

                      &-number {
                        text-align: center;
                        width: 20px;
                        height: 20px;
                        background: #ff6c4b;
                        border-radius: 4px 4px 4px 4px;
                        box-shadow: 0px 2px 4px 0px rgba(255, 108, 75, 0.25);
                      }
                      &-type {
                        width: 42px;
                        height: 24px;
                        display: flex;
                        font-size: 12px;
                        font-weight: 500;
                        color: #1677ff;
                        text-align: center;
                        align-items: center;
                        justify-content: center;
                        background-color: #b2d2fe;

                        &-name {
                          height: 20px;
                          line-height: 20px;
                        }
                      }

                      &-input {
                        width: 370px !important;
                      }
                    }
                    .middle {
                      height: 24px;
                      width: 41px;
                      padding: 2px 4px;
                      border-radius: 2px;
                      display: flex;
                      justify-content: center;
                      align-items: center;
                      background: rgba(22, 119, 255, 0.3);

                      &-name {
                        height: 20px;
                        line-height: 20px;
                        font-size: 12px;
                        color: #1677ff;
                        font-weight: 400;
                      }
                    }

                    .right {
                      cursor: pointer;
                      display: flex;
                      // width: 80px;
                      height: 14px;
                      justify-content: space-between;
                      align-items: center;

                      .action-icon {
                        width: 14px;
                        height: 14px;
                        margin-right: 8px;
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
    .bottom-btn {
      position: absolute;
      bottom: 20px;
      right: 20px;
    }
  }
}

.XPath-modal {
  &-content {
    .modal-top {
      display: flex;
      height: 300px;
      justify-content: space-between;

      .left {
        width: 572px;
        height: 100%;

        &-title {
          width: 100%;
          height: 25px;
          display: flex;
          align-items: center;
          margin-bottom: 10px;

          .name {
            width: 78px; //这里原型图是94px
            line-height: 25px;
            font-size: 14px;
            font-weight: 600;
            color: #333333;
            margin-right: 8px;
          }

          .path {
            overflow: hidden;
            white-space: nowrap;
            word-break: break-all;
            text-overflow: ellipsis;
            width: calc(100% - 78px);
          }
        }

        &-content {
          width: 100%;
          padding: 8px;
          overflow-y: auto;
          height: calc(100% - 35px);
          border: 1px solid #e2e6e9;
          border-radius: 2px 2px 2px 2px;

          &-title {
            font-size: 12px;
            font-weight: 600;
            color: #333333;
            margin-bottom: 10px;
          }

          &-item {
            font-size: 12px;
            font-weight: 500;
            color: #333333;
            line-height: 17px;
            margin-bottom: 10px;

            .tag-name {
              font-size: 12px;
              font-weight: 500;
              color: #1677ff;
              margin-right: 5px;
            }

            .tag-item {
              display: flex;
              font-size: 12px;
              font-weight: 500;
              color: #666666;

              &-label {
                font-weight: 600;
                line-height: 20px;
              }
            }
          }
        }
      }

      .right {
        width: 360px;
        height: 100%;

        &-title {
          height: 25px;
          font-size: 14px;
          font-weight: 600;
          color: #333333;
          line-height: 25px;
          margin-bottom: 10px;
        }

        &-content {
          width: 100%;
          padding: 8px;
          height: calc(100% - 35px);
          border: 1px solid #e2e6e9;
          border-radius: 3px 3px 3px 3px;

          &-item {
            display: flex;

            .item-label {
              width: 75px;
            }

            .item-content {
              width: calc(100% - 75px);
            }
          }
        }
      }
    }

    .modal-bottom {
      margin-top: 15px;

      &-title {
        height: 32px;
        font-size: 14px;
        font-weight: 600;
        color: #333;
        line-height: 32px;
        margin-bottom: 8px;

        .result-radio {
          font-weight: 500;
          margin-left: 14px;
        }
      }

      &-input {
        background: #ffffff;
        border: 1px solid #e2e6e9;
        border-radius: 3px 3px 3px 3px;
      }
    }

    .test {
      .test-title {
        height: 19px;
        font-size: 14px;
        font-weight: 600;
        color: #3e8eff;
        line-height: 16px;
        margin-top: 15px;
        margin-bottom: 8px;
        cursor: pointer;
      }
    }
  }
}

.test-content {
  &-table {
    margin-bottom: 12px;

    .table-td {
      width: 100px;
      padding: 2px 5px;
      max-width: 100px;
      overflow: hidden;
      text-align: center;
      white-space: nowrap;
      text-overflow: ellipsis;
      border: 1px solid #e3e6eb;
    }
  }
}

.config-modal {
  width: 462px;

  &-content {
    width: 100%;

    .content-top {
      width: 100%;

      &-item-flex {
        width: 100%;
        margin-bottom: 15px;
        display: flex;
        &-label-test {
          width: 75px;
          font-size: 12px;
          font-weight: 500;
          color: #3e8eff;
          text-align: right;
          line-height: 32px;
          display: inline-block;
          cursor: pointer;
        }
        &-label {
          width: 75px;
          font-size: 12px;
          font-weight: 500;
          color: #333333;
          text-align: right;
          line-height: 32px;
          display: inline-block;
        }
        &-notes {
          width: calc(100% - 75px);
        }
      }

      &-item {
        width: 100%;
        margin-bottom: 15px;
        &-radio-buttom {
          .radio-item {
            border-radius: 3px 3px 3px 3px;
            opacity: 1;
            margin-right: 9px;
            border: 1px solid #e2e6e9;
            .ant-radio-button-checked {
              border: 1px solid #1890ff;
            }
          }
          .ant-radio-button-wrapper:not(:first-child)::before {
            width: 0px;
          }
          .ant-radio-button-wrapper:first-child {
            border-right-color: #e2e6e9 !important;
          }
        }

        &-label {
          width: 75px;
          font-size: 12px;
          font-weight: 500;
          color: #333333;
          text-align: right;
          display: inline-block;
        }

        &-text {
          font-size: 12px;
          font-weight: 500;
          color: #333333;
        }

        &-radio {
          .ant-radio-wrapper {
            font-size: 12px;
            font-weight: 500;
            color: #333333;
          }
        }

        &-input {
          width: calc(100% - 75px);
        }

        &-select {
          width: calc(100% - 75px);
        }

        &-des {
          display: flex;
          font-size: 12px;
          font-weight: 500;
          line-height: 17px;
          margin-bottom: 9px;
          .img {
            margin-right: 2px;
          }
        }

        &-fix {
          color: #333333;
          font-size: 12px;
          font-weight: 500;
          line-height: 17px;
          margin-bottom: 9px;

          .fix-img {
            width: 100%;
            height: 150px;
            margin: 9px 0px;
            overflow: auto;

            .img {
              width: 100%;
              margin-bottom: 15px;
            }
          }
        }
      }
    }
  }
}
</style>
