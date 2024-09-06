import { Modal, message } from "ant-design-vue";
// 确认弹窗
export function modalConfirm(title, content, onOk) {
  Modal.confirm({
    title: title,
    // icon: <exclamation-circle-outlined style="color: #FE9E17 " />,
    content: content,
    okText: "确认",
    okType: "primary",
    centered: true,
    cancelText: "取消",
    onOk: onOk,
    onCancel: () => {
      message.info("已取消");
    },
  });
}

// 重置toRefs导出的响应式变量
export const resetData = (data) => {
  const keys = Object.keys(data);
  let obj = {};
  keys.forEach((item) => {
    if (Array.isArray(data[item])) {
      obj[item] = [];
    } else if (data[item] instanceof Object) {
      obj[item] = {};
    } else {
      obj[item] = undefined;
    }
  });
  Object.assign(data, obj);
};


/**
 * 下载文件
 * @param {Blob|string} content - 文件内容或 URL
 * @param {string} fileName - 文件名
 * @param {Object} config - 配置选项，包括文件类型
 */
export function downloadFile(content, fileName, config) {
  let blob =
    content instanceof Blob
      ? content
      : new Blob([content], config || undefined);
  let aLink = document.createElement("a");
  let evt = new MouseEvent("click", {
    view: window,
    bubbles: false,
    cancelable: true,
  });
  evt.initEvent("click", false, false);
  aLink.href = URL.createObjectURL(blob);
  aLink.download = fileName || "";
  document.body.appendChild(aLink);
  aLink.dispatchEvent(evt);

  window.setTimeout(() => {
    document.body.removeChild(aLink);
    aLink = null;
    evt = null;
  });
}

