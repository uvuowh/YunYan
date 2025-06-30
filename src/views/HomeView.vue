<template>
  <div class="space-y-8">
    <!-- Hero Section -->
    <section class="hero bg-gradient-to-r from-primary/10 to-secondary/10 rounded-lg">
      <div class="hero-content text-center py-16">
        <div class="max-w-md">
          <h1 class="text-5xl font-bold">Welcome to YunYan</h1>
          <p class="py-6 text-lg">
            A modern desktop application built with Vue 3, TypeScript, and Tauri.
            Experience the power of web technologies in a native desktop environment.
          </p>
          <div class="space-x-4">
            <BaseButton
              v-if="!userStore.isAuthenticated"
              variant="primary"
              size="lg"
              @click="router.push('/login')"
            >
              Get Started
            </BaseButton>
            <BaseButton
              v-else
              variant="primary"
              size="lg"
              @click="router.push('/dashboard')"
            >
              Go to Dashboard
            </BaseButton>
            <BaseButton
              variant="outline"
              size="lg"
              @click="scrollToFeatures"
            >
              Learn More
            </BaseButton>
          </div>
        </div>
      </div>
    </section>

    <!-- Features Section -->
    <section ref="featuresSection" class="py-16">
      <div class="text-center mb-12">
        <h2 class="text-3xl font-bold mb-4">Features</h2>
        <p class="text-lg text-base-content/70 max-w-2xl mx-auto">
          Built with modern technologies and best practices for a superior user experience.
        </p>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <BaseCard
          v-for="feature in features"
          :key="feature.title"
          :title="feature.title"
          :description="feature.description"
          variant="bordered"
          hoverable
          class="h-full"
        >
          <template #title>
            <span class="text-2xl mr-2">{{ feature.icon }}</span>
            {{ feature.title }}
          </template>
        </BaseCard>
      </div>
    </section>

    <!-- Stats Section -->
    <section class="stats stats-vertical lg:stats-horizontal shadow w-full">
      <div class="stat">
        <div class="stat-figure text-primary">
          <span class="text-3xl">⚡</span>
        </div>
        <div class="stat-title">Performance</div>
        <div class="stat-value text-primary">Fast</div>
        <div class="stat-desc">Built with Vite and optimized for speed</div>
      </div>

      <div class="stat">
        <div class="stat-figure text-secondary">
          <span class="text-3xl">🔒</span>
        </div>
        <div class="stat-title">Security</div>
        <div class="stat-value text-secondary">Secure</div>
        <div class="stat-desc">Tauri's security-first approach</div>
      </div>

      <div class="stat">
        <div class="stat-figure text-accent">
          <span class="text-3xl">🎨</span>
        </div>
        <div class="stat-title">Design</div>
        <div class="stat-value text-accent">Modern</div>
        <div class="stat-desc">Beautiful UI with Tailwind CSS</div>
      </div>
    </section>

    <!-- CTA Section -->
    <section class="text-center py-16 bg-base-200 rounded-lg">
      <h2 class="text-3xl font-bold mb-4">Ready to get started?</h2>
      <p class="text-lg text-base-content/70 mb-8 max-w-md mx-auto">
        Join thousands of users who are already using YunYan to boost their productivity.
      </p>
      <div class="space-x-4">
        <BaseButton
          variant="primary"
          size="lg"
          @click="handleGetStarted"
        >
          Get Started Now
        </BaseButton>
        <BaseButton
          variant="ghost"
          size="lg"
          @click="handleLearnMore"
        >
          Documentation
        </BaseButton>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import BaseButton from '@/components/ui/BaseButton.vue'
import BaseCard from '@/components/ui/BaseCard.vue'
import { useUserStore, useAppStore } from '@/stores'

const router = useRouter()
const userStore = useUserStore()
const appStore = useAppStore()

const featuresSection = ref<HTMLElement>()

interface Feature {
  title: string
  description: string
  icon: string
}

const features: Feature[] = [
  {
    title: 'Vue 3 Composition API',
    description: 'Built with the latest Vue 3 features including Composition API and script setup syntax.',
    icon: '🚀',
  },
  {
    title: 'TypeScript Support',
    description: 'Full TypeScript support for better development experience and type safety.',
    icon: '📝',
  },
  {
    title: 'Tauri Desktop',
    description: 'Native desktop application with web technologies, small bundle size.',
    icon: '💻',
  },
  {
    title: 'Modern UI',
    description: 'Beautiful and responsive design with Tailwind CSS and DaisyUI components.',
    icon: '🎨',
  },
  {
    title: 'State Management',
    description: 'Efficient state management with Pinia for scalable applications.',
    icon: '🗃️',
  },
  {
    title: 'Developer Experience',
    description: 'Hot reload, TypeScript, ESLint, and Prettier for the best DX.',
    icon: '⚡',
  },
]

function scrollToFeatures(): void {
  featuresSection.value?.scrollIntoView({ behavior: 'smooth' })
}

function handleGetStarted(): void {
  if (userStore.isAuthenticated) {
    router.push('/dashboard')
  } else {
    router.push('/login')
  }
}

function handleLearnMore(): void {
  appStore.showInfo('Documentation', 'Documentation will be available soon!')
}
</script>
