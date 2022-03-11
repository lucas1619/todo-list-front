<template>
  <b-card>
    <b-card-header>
      <b-card-title>
        <h3>ToDo List</h3>
      </b-card-title>
    </b-card-header>
    <div class="d-flex align-items-center justify-content-end">
      <b-button v-b-modal.add-modal variant="primary" class="mb-2"
        >New task</b-button
      >
    </div>
    <b-table class="border" :items="todoList" :fields="fields">
      <template #cell(completed)="{ item }">
        <b-form-checkbox @change="changeStatus(item)" v-model="item.status" />
      </template>
      <template #cell(title)="{ item }">
        <span :class="{ 'text-underline': item.status }">
          {{ item.name }}
        </span>
      </template>
      <template #cell(categories)="{ item }">
        <b-row style="max-width: 250px">
          <b-col
            v-for="(category, index) in item.categories"
            :key="index"
            cols="4"
          >
            <b-badge pill :variant="category.color">
              {{ category.name }}
            </b-badge>
          </b-col>
        </b-row>
      </template>
      <template #cell(actions)="{ item }">
        <b-button
          @click="editTask(item)"
          variant="flat-info"
          class="btn-icon rounded-circle"
          size="sm"
        >
          <feather-icon icon="EditIcon" />
        </b-button>
        <b-button
          variant="flat-danger"
          class="btn-icon rounded-circle"
          size="sm"
          @click="removeTodo(item)"
        >
          <feather-icon icon="Trash2Icon" />
        </b-button>
      </template>
    </b-table>
    <b-modal
      id="edit-modal"
      title="Edit modal"
      ok-title="Save"
      ok-only
      @ok="saveTask"
    >
      <b-form>
        <b-form-group label="Title">
          <b-form-input v-model="selectedTask.name" />
        </b-form-group>
        <b-form-group label="Description">
          <b-form-textarea v-model="selectedTask.description" />
        </b-form-group>
        <b-form-group label="Categories">
          <b-row>
            <b-col cols="12">
              <v-select
                v-model="selectedTask.categories"
                :closeOnSelect="false"
                :options="categories"
                :clearable="false"
                label="name"
                multiple
              ></v-select>
            </b-col>
            <b-col
              cols="12"
              class="d-flex align-items-center justify-content-end mt-50"
            >
              <b-button
                v-b-modal.add-category-modal
                class="btn-icon"
                variant="outline-secondary"
              >
                New Category</b-button
              >
            </b-col>
          </b-row>
        </b-form-group>
      </b-form>
    </b-modal>
    <b-modal
      id="add-category-modal"
      no-close-on-backdrop
      title="Add category"
      ok-only
      ok-title="Add"
      @ok="addCategory"
    >
      <b-form>
        <b-form-group label="Category name">
          <b-form-input v-model="newCategory.name" />
        </b-form-group>
        <b-form-group label="Category color">
          <v-select
            v-model="newCategory.color"
            size="sm"
            :options="colors"
            label="name"
            :reduce="(color) => color.color"
          ></v-select>
        </b-form-group>
      </b-form>
    </b-modal>
    <b-modal
      title="Add task"
      id="add-modal"
      ok-only
      ok-title="Add"
      @ok="addTask"
    >
      <b-form>
        <b-form-group label="Title">
          <b-form-input v-model="newTask.name" />
        </b-form-group>
        <b-form-group label="Description">
          <b-form-textarea v-model="newTask.description" />
        </b-form-group>
        <b-form-group label="Categories">
          <b-row>
            <b-col cols="12">
              <v-select
                v-model="newTask.categories"
                :closeOnSelect="false"
                :options="categories"
                :clearable="false"
                label="name"
                multiple
              />
            </b-col>
            <b-col
              cols="12"
              class="d-flex align-items-center justify-content-end mt-50"
            >
              <b-button
                v-b-modal.add-category-modal
                class="btn-icon"
                variant="outline-secondary"
              >
                New Category</b-button
              >
            </b-col>
          </b-row>
        </b-form-group>
      </b-form>
    </b-modal>
  </b-card>
</template>

<script>
import vSelect from "vue-select";
import axios from "axios";

export default {
  components: {
    vSelect,
  },
  data() {
    return {
      colors: [
        {
          name: "Primary",
          color: "primary",
        },
        {
          name: "Secondary",
          color: "secondary",
        },
        {
          name: "Success",
          color: "success",
        },
        {
          name: "Danger",
          color: "danger",
        },
        {
          name: "Warning",
          color: "warning",
        },
        {
          name: "Info",
          color: "info",
        },
        {
          name: "Light",
          color: "light",
        },
        {
          name: "Dark",
          color: "dark",
        },
      ],
      newCategory: {
        name: "",
        color: "primary",
      },
      newTask: {
        name: "",
        status: false,
        description: "",
        categories: [],
      },
      categories: [],
      todoList: [],
      //fields todo list
      fields: [
        {
          key: "completed",
          label: "Done",
        },
        {
          key: "title",
          label: "Title",
        },
        {
          key: "categories",
          label: "Categories",
        },
        {
          key: "actions",
          label: "Actions",
        },
      ],
      selectedTask: {},
    };
  },
  async created() {
    await Promise.all([this.getCategories(), this.getTasks()]);
  },
  methods: {
    async getTasks() {
      const response = await axios.get("http://127.0.0.1:8000/api/task");
      this.todoList = response.data.data;
    },
    async getCategories() {
      const response = await axios.get("http://127.0.0.1:8000/api/categories");
      this.categories = response.data.data;
    },

    async addCategory() {
      try {
        const response = await axios.post(
          "http://127.0.0.1:8000/api/category",
          this.newCategory
        );
        if (response.status === 201) {
          this.newCategory.id = response.data.newCategory.id;
          this.categories.push(this.newCategory);
          this.newCategory = {
            name: "",
            color: "primary",
          };
        }
      } catch (error) {
        alert("error.response.data.error");
        console.log(error);
      }
    },
    async addTask() {
      console.log(this.newTask);
      const response = await axios.post(
        "http://127.0.0.1:8000/api/task",
        this.newTask
      );
      if (response.status === 201) {
        console.log(response.data);
        this.newTask.id = response.data.newTask.id;
        this.todoList.push(this.newTask);
        this.newTask = {
          id: "",
          name: "",
          description: "",
          categories: [],
        };
      }
    },
    async removeTodo(item) {
      try {
        const response = await axios.delete(
          "http://127.0.0.1:8000/api/task/" + item.id
        );
        if (response.status === 204) {
          this.todoList = this.todoList.filter((todo) => todo.id !== item.id);
        }
      } catch (error) {
        console.log(error);
      }
    },
    editTask(task) {
      this.selectedTask = { ...task };
      this.$bvModal.show("edit-modal");
    },
    async saveTask() {
      const response = await axios.put(
        "http://127.0.0.1:8000/api/task/" + this.selectedTask.id,
        this.selectedTask
      );
      if (response.status === 200) {
        this.todoList = this.todoList.map((todo) => {
          if (todo.id === this.selectedTask.id) {
            return this.selectedTask;
          }
          return todo;
        });
      }
    },
    async changeStatus(item) {
      await axios.put("http://127.0.0.1:8000/api/task/" + item.id + "/status", {
        status: item.status,
      });
    },
  },
};
</script>

<style scoped>
.text-underline {
  text-decoration: line-through;
}
</style>
