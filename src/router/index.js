import { createRouter, createWebHistory } from 'vue-router'
import { routes } from '../config/routes'

const router = createRouter({
    history: createWebHistory(),
    routes
})

router.beforeEach((to, from, next) => {
    document.title = to.meta.title ? `${to.meta.title} - Halsell AI` : 'Halsell AI'

    if (to.meta.requiresAuth) {
    }

    next()
})

export default router