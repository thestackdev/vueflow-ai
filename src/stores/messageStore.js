import { ref } from 'vue'

const messageData = ref({
})

export const useMessageStore = () => {
    const fetchMessages = async () => {

    }

    const saveMessages = async (type, messages) => {

    }

    return {
        messageData,
        fetchMessages,
        saveMessages
    }
} 