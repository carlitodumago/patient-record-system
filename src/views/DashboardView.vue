<template>
  <div class="container-fluid mt-3">
    <h1 class="mb-2">WELCOME!</h1>
    <p class="text-muted">You have 150 records: 10 pending reviews.</p>
    
    <div class="row mt-4">
      <div class="col-md-4 mb-4">
        <div class="card text-white">
          <div class="card-body d-flex justify-content-between align-items-center">
            <div>
              <h5 class="card-title">150</h5>
              <p class="card-text">Total Records</p>
            </div>
            <i class="bi bi-file-earmark-text display-4"></i>
          </div>
        </div>
      </div>
      
      <div class="col-md-4 mb-4">
        <div class="card text-white">
          <div class="card-body d-flex justify-content-between align-items-center">
            <div>
              <h5 class="card-title">25</h5>
              <p class="card-text">Patient Types</p>
            </div>
            <i class="bi bi-people display-4"></i>
          </div>
        </div>
      </div>
    </div>

    <div class="row mt-4">
      <div class="col-12">
        <div class="card">
          <div class="card-body">
            <h5 class="card-title">Recent Records</h5>
            <table class="table table-striped">
              <thead>
                <tr>
                  <th scope="col">Record ID</th>
                  <th scope="col">Type</th>
                  <th scope="col">Patient Name</th>
                  <th scope="col">Date</th>
                  <th scope="col">Status</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>PR-001</td>
                  <td>Visit</td>
                  <td>John Doe</td>
                  <td>03/06/2025 10:30</td>
                  <td><span class="badge bg-success">Verified</span></td>
                </tr>
                <tr>
                  <td>PR-002</td>
                  <td>History</td>
                  <td>Jane Smith</td>
                  <td>03/05/2025 14:00</td>
                  <td><span class="badge bg-warning text-dark">Pending</span></td>
                </tr>
                <!-- Add more rows as needed -->
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>

  </div>
</template>

<script>
export default {
  name: 'DashboardView',
}
</script>

<style scoped>
/* Add your styles here */

</style> 