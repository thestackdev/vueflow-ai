import { ref } from 'vue'

const messageData = ref({
    incoming: {},
    outgoing: {}
})

export const useMessageStore = () => {
    const fetchMessages = async () => {
        try {
            const response = await fetch('http://165.227.240.39:5000/api/system-messages')
            if (!response.ok) {
                throw new Error('Failed to fetch message data')
            }
            const data = await response.json()
            if (data.success) {
                messageData.value = data.messages
            }
        } catch (error) {
            console.error('Error fetching message data:', error)
        }
    }

    const saveMessages = async (type, messages) => {
        try {
            const payload = {
                ...messageData.value,
                [type]: messages
            }

            const response = await fetch('http://165.227.240.39:5000/api/system-messages', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload),
            })

            if (!response.ok) {
                throw new Error('Failed to save messages')
            }

            const result = await response.json()
            if (result.success) {
                messageData.value = payload
                return true
            }
            return false
        } catch (error) {
            console.error('Error saving messages:', error)
            return false
        }
    }

    return {
        messageData,
        fetchMessages,
        saveMessages
    }
} 