import { createRouter, createWebHashHistory } from "vue-router";
const layout = () => import("../layout");
const docParse = () => import("../views/docParse");
const pdfParse = () => import("../views/pdfParse");

const routes = [
  {
    path: "/",
    name: "layout",
    component: layout,
    redirect: "doc-parse",
    children: [
      {
        path: "doc-parse",
        name: "docParse",
        component: docParse,
      },
      {
        path: "pdf-parse",
        name: "pdfParse",
        component: pdfParse,
      },
    ],
  },
];

const router = createRouter({
  history: createWebHashHistory(),
  routes,
});

export default router;
