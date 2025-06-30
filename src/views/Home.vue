<template>
  <div class="home-view">
    <div class="welcome-content">
      <h1>欢迎使用云雁</h1>
      <p>一个结合思源笔记和Heptabase白板功能的桌面应用</p>

      <div class="demo-section">
        <h2>Tauri 演示</h2>
        <div class="demo-form">
          <Input 
            v-model="name" 
            label="姓名" 
            placeholder="请输入您的姓名..." 
          />
          <Button @click="greet" :disabled="!name">
            问候
          </Button>
        </div>
        <p v-if="greetMsg" class="greet-message">{{ greetMsg }}</p>
      </div>

      <div class="features-section">
        <h2>主要功能</h2>
        <div class="features-grid">
          <div class="feature-card" @click="navigateTo('/notes')">
            <h3>📝 笔记系统</h3>
            <p>类似思源笔记的文件系统和双向链接</p>
          </div>
          <div class="feature-card" @click="navigateTo('/whiteboard')">
            <h3>🎨 白板功能</h3>
            <p>类似Heptabase的可视化思维导图</p>
          </div>
          <div class="feature-card" @click="navigateTo('/hybrid')">
            <h3>🔄 混合视图</h3>
            <p>在笔记和白板之间无缝同步数据</p>
          </div>
        </div>
      </div>

      <div class="quick-actions">
        <h2>快速开始</h2>
        <div class="actions-grid">
          <Button variant="primary" size="lg" @click="navigateTo('/notes')">
            开始记笔记
          </Button>
          <Button variant="outline" size="lg" @click="navigateTo('/whiteboard')">
            创建白板
          </Button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { useRouter } from "vue-router";
import { invoke } from "@tauri-apps/api/core";
import Button from "@/components/ui/Button.vue";
import Input from "@/components/ui/Input.vue";

const router = useRouter();
const greetMsg = ref("");
const name = ref("");

async function greet() {
  greetMsg.value = await invoke("greet", { name: name.value });
}

function navigateTo(path: string) {
  router.push(path);
}
</script>

<style scoped>
.home-view {
  padding: 2rem;
  max-width: 1000px;
  margin: 0 auto;
}

.welcome-content h1 {
  font-size: 3rem;
  font-weight: 700;
  color: var(--text-primary);
  margin-bottom: 1rem;
  text-align: center;
  background: linear-gradient(135deg, var(--accent-color), #8b5cf6);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.welcome-content > p {
  font-size: 1.25rem;
  color: var(--text-secondary);
  text-align: center;
  margin-bottom: 3rem;
}

.demo-section {
  background-color: var(--bg-secondary);
  border-radius: var(--radius-lg);
  padding: 2rem;
  margin-bottom: 3rem;
  border: 1px solid var(--border-color);
}

.demo-section h2 {
  font-size: 1.5rem;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 1.5rem;
}

.demo-form {
  display: flex;
  gap: 1rem;
  align-items: end;
  margin-bottom: 1rem;
}

.greet-message {
  padding: 1rem;
  background-color: var(--accent-light);
  color: var(--accent-color);
  border-radius: var(--radius-md);
  font-weight: 500;
}

.features-section h2,
.quick-actions h2 {
  font-size: 2rem;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 2rem;
  text-align: center;
}

.features-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 2rem;
  margin-bottom: 3rem;
}

.feature-card {
  background-color: var(--bg-secondary);
  border-radius: var(--radius-lg);
  padding: 2rem;
  text-align: center;
  border: 1px solid var(--border-color);
  transition: all var(--transition-normal);
  cursor: pointer;
}

.feature-card:hover {
  transform: translateY(-4px);
  box-shadow: var(--shadow-lg);
  border-color: var(--accent-color);
}

.feature-card h3 {
  font-size: 1.5rem;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 1rem;
}

.feature-card p {
  color: var(--text-secondary);
  line-height: 1.6;
  font-size: 1.1rem;
}

.quick-actions {
  text-align: center;
}

.actions-grid {
  display: flex;
  gap: 1.5rem;
  justify-content: center;
  flex-wrap: wrap;
}

@media (max-width: 768px) {
  .home-view {
    padding: 1rem;
  }
  
  .welcome-content h1 {
    font-size: 2.5rem;
  }
  
  .demo-form {
    flex-direction: column;
    align-items: stretch;
  }
  
  .features-grid {
    grid-template-columns: 1fr;
    gap: 1.5rem;
  }
  
  .actions-grid {
    flex-direction: column;
    align-items: center;
  }
}
</style>
