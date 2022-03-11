export default [
  {
    path: "/todo/list",
    name: "todo-list",
    component: () => import("@/views/todo/ToDoList.vue"),
  },
  {
    path: "/todo/other",
    name: "todo-other",
    component: () => import("@/views/todo/ToDoOther.vue"),
  },
];
