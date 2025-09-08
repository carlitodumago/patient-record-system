<template>
  <MainLayout>
    <div class="users-registration">
      <h1>User Management</h1>
      
      <div class="card mb-4">
        <div class="card-header">
          <h2>Register New Users</h2>
        </div>
        <div class="card-body">
          <div class="row">
            <div class="col-md-6">
              <h3>Single Registration</h3>
              <RegisterUserModal 
                :show="showSingleRegister" 
                @close="showSingleRegister = false"
                @user-registered="handleUserRegistered"
              />
              <button 
                class="btn btn-primary"
                @click="showSingleRegister = true"
              >
                Register Single User
              </button>
            </div>
            
            <div class="col-md-6">
              <h3>Bulk Registration</h3>
              <div class="mb-3">
                <label class="form-label">Upload CSV/Excel File</label>
                <input 
                  type="file" 
                  class="form-control"
                  accept=".csv,.xlsx"
                  @change="handleFileUpload"
                >
              </div>
              <button 
                class="btn btn-primary"
                :disabled="!bulkFile"
                @click="processBulkUpload"
              >
                Process Bulk Upload
              </button>
            </div>
          </div>
        </div>
      </div>
      
      <div class="card">
        <div class="card-header">
          <h2>Existing Users</h2>
        </div>
        <div class="card-body">
          <table class="table table-striped">
            <thead>
              <tr>
                <th>Username</th>
                <th>Full Name</th>
                <th>Email</th>
                <th>Role</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="user in users" :key="user.id">
                <td>{{ user.username }}</td>
                <td>{{ user.fullName }}</td>
                <td>{{ user.email }}</td>
                <td>{{ user.role }}</td>
                <td>
                  <button class="btn btn-sm btn-outline-primary">Edit</button>
                  <button class="btn btn-sm btn-outline-danger">Delete</button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </MainLayout>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { userService } from '@/services/api';
import RegisterUserModal from '@/components/RegisterUserModal.vue';
import MainLayout from '@/layouts/MainLayout.vue';

const users = ref([]);
const showSingleRegister = ref(false);
const bulkFile = ref(null);

const fetchUsers = async () => {
  try {
    const response = await userService.getAllUsers();
    users.value = response;
  } catch (error) {
    console.error('Failed to fetch users:', error);
  }
};

const handleUserRegistered = (newUser) => {
  users.value.push(newUser);
  showSingleRegister.value = false;
};

const handleFileUpload = (event) => {
  bulkFile.value = event.target.files[0];
};

const processBulkUpload = () => {
  // TODO: Implement bulk user registration
  console.log('Processing bulk upload:', bulkFile.value);
  alert('Bulk upload functionality will be implemented soon');
  bulkFile.value = null;
};

onMounted(() => {
  fetchUsers();
});
</script>

<style scoped>
.users-registration {
  padding: 20px;
}

.card {
  margin-bottom: 20px;
}

.table {
  margin-top: 20px;
}
</style>
