import { createRouter, createWebHistory } from 'vue-router'
import { routes } from '../config/routes'

const router = createRouter({
    history: createWebHistory(),
    routes
})

// Navigation guard example
router.beforeEach((to, from, next) => {
    // Set page title
    document.title = to.meta.title ? `${to.meta.title} - Halsell AI` : 'Halsell AI'

    // Handle authentication if needed
    if (to.meta.requiresAuth) {
        // Add your authentication logic here
        // For example: if (!isAuthenticated) next({ name: 'login' })
    }

    next()
})

export default router 