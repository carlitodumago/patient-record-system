<script setup>
import { useRouter } from 'vue-router';

const router = useRouter();

const goBack = () => {
  router.go(-1);
};
</script>

<template>
  <v-container fluid class="not-found-container">
    <v-row justify="center" align="center" class="fill-height">
      <v-col cols="12" md="6" lg="4">
        <v-card class="error-content" elevation="10">
          <v-card-text class="text-center pa-8">
            <div class="error-code">404</div>
            <v-icon size="4rem" color="primary" class="mb-4">
              mdi-alert-circle-outline
            </v-icon>
            <h1 class="error-title mb-4">404 Not Found</h1>
            <p class="error-message mb-6">
              Sorry, the page you are looking for doesn't exist or has been moved.
            </p>
            <v-btn color="primary" @click="goBack" prepend-icon="mdi-arrow-left">
              Go Back
            </v-btn>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<style scoped>
.not-found-container {
  min-height: 80vh;
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.8), rgba(240, 242, 245, 0.8));
}

.error-code {
  font-size: 8rem;
  font-weight: 800;
  opacity: 0.05;
  line-height: 1;
  text-align: center;
  margin-bottom: 1rem;
}

.error-title {
  font-size: 2.5rem;
  font-weight: 600;
  margin-bottom: 1rem;
}

.error-message {
  font-size: 1.1rem;
  color: #6c757d;
}
</style>
