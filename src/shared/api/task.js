import axiosInstance from "./index.js";

const taskUrl = "/doc/tasks";
const fileUrl = "/doc/file";

// 分页任务列表获取+根据任务名称查询任务
export async function getTaskList(json) {
  const res = await axiosInstance.put(`${taskUrl}/list`, json);
  return res;
}

// 获取任务详情
export async function getTaskDetail(id) {
  const res = await axiosInstance.get(`${taskUrl}/getParserDetails?id=${id}`);
  return res;
}

// 根据任务解析id查看结果
export async function getResultByParserId(id) {
  const res = await axiosInstance.get(
    `${taskUrl}/getResultByParserId?id=${id}`
  );
  return res;
}

// 下载文件接口
export async function getFile(filePath) {
  const res = await axiosInstance.get(
    `${fileUrl}/getFileByPath?path=${filePath}`
  );
  return res;
}

// 取消解析
export async function cancelParse(id) {
  const res = await axiosInstance.get(`${taskUrl}/shutdownParserTask?id=${id}`);
  return res;
}

// 编辑结果
export async function editResult(json) {
  const res = await axiosInstance.post(`${taskUrl}/editParserResult`, json, {
    timeout: -1,
  });
  return res;
}

// 删除结果
export async function deleteResult(id) {
  const res = await axiosInstance.get(`${taskUrl}/deleteParserResult?id=${id}`);
  return res;
}

// 获取解析批次对应文件
export async function getParserFileList(id) {
  const res = await axiosInstance.get(
    `${taskUrl}/getParserFileList?parserId=${id}`
  );
  return res;
}
//删除任务
export async function delTaskById(id) {
  const res = await axiosInstance.delete(`${taskUrl}/${id}`);
  return res;
}

//新增任务
export async function addTask(json) {
  const res = await axiosInstance.post(`${taskUrl}`, json);
  return res;
}

//查看任务详情
export async function findTaskById(id) {
  const res = await axiosInstance.get(`${taskUrl}/${id}`);
  return res;
}

//编辑任务
export async function editTaskBy(json) {
  const res = await axiosInstance.put(`${taskUrl}`, json);
  return res;
}

//立即执行任务
export async function executeTaskById(id) {
  const res = await axiosInstance.get(`${taskUrl}/execute/${id}`);
  return res;
}

//策略测试
export async function policyTest(json) {
  const res = await axiosInstance.put(`${taskUrl}/rule/test`, json);
  return res;
}

//获取文档解析结果
export async function getFileParserRes(parserId, outputId) {
  const res = await axiosInstance.get(
    `${taskUrl}/getFileParserRes?parserId=${parserId}&outputId=${outputId}`
  );
  return res;
}

//导出
export async function exportExcel(parserId) {
  const res = await axiosInstance.get(
    `${taskUrl}/exportExcel?parserId=${parserId}`,
    { responseType: "blob" }
  );
  return res;
}

//开启任务自动更新
export async function autoUpdate(id) {
  const res = await axiosInstance.put(`${taskUrl}/autoParser/enable/${id}`);
  return res;
}

//关闭任务自动更新
export async function closeUpdate(id) {
  const res = await axiosInstance.put(`${taskUrl}/autoParser/disable/${id}`);
  return res;
}

//对抓取文档进行策略测试-xpath&&正则 测试
export async function combineTest(json) {
  const res = await axiosInstance.put(`${taskUrl}/rule/testAfterFetch`, json);
  return res;
}
