import HomePage from '../components/HomePage.vue'
import SystemMessageFlow from '../components/SystemMessageFlow.vue'

export const routes = [
    {
        path: '/',
        name: 'home',
        component: HomePage,
        meta: {
            title: 'Home',
            requiresAuth: false
        }
    },
    {
        path: '/flow/incoming',
        name: 'incoming',
        component: SystemMessageFlow,
        meta: {
            title: 'Incoming Call Handler',
            requiresAuth: false
        }
    },
    {
        path: '/flow/outgoing',
        name: 'outgoing',
        component: SystemMessageFlow,
        meta: {
            title: 'Outgoing Call Handler',
            requiresAuth: false
        }
    }
]

// Helper function to get route by name
export const getRouteByName = (name) => {
    return routes.find(route => route.name === name)
}

// Helper function to get route by path
export const getRouteByPath = (path) => {
    return routes.find(route => route.path === path)
} 