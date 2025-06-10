import { MarkerType } from '@vue-flow/core'

export const initialNodes = [
    {
        "id": "start",
        "type": "input",
        "initialized": false,
        "position": {
            "x": 312.0415402567094,
            "y": 0.8163360560093356
        },
        "data": {
            "label": "Start",
            "role_messages": [
                {
                    "role": "system",
                    "content": "You are Helio AI, a professional and intelligent voice assistant for HG Investments. Your primary task is to call a potential investor and engage them in a polite and professional conversation about investing in an AI tech company. When speaking, ensure that you: - Actively listen and stop speaking immediately if the user starts talking. - Analyze the user's response and adjust your reply accordingly. - Maintain a friendly yet professional tone to build trust. - If the user asks a question, provide a clear and concise response. - If the user expresses disinterest, politely acknowledge their response and say: 'Have a great day!'. Stay focused, stay sharp, and provide value in every interaction."
                }
            ],
            "task_messages": [
                {
                    "role": "system",
                    "content": "Introduce yourself as Helio AI from HG Investments with this opening: 'Hello! This is Helio AI from HG Investments. I hope you're doing well. I'm reaching out because we are currently offering investors the opportunity to invest in an AI tech company, and I would like to discuss this with you further.' Then ask if they are interested in learning more. Engage in conversation, answer any questions they might have, and determine their interest level. Based on their response: - If they are interested, call the 'user_interested' function. - If they are unsure and want more information, call the 'user_unsure' function. - If they are not interested, call the 'user_not_interested' function. Also, if you see 'user is silent for 5 seconds', say 'Hello, are you still there?' If you see 'user is silent for 10 seconds', say 'It seems like now may not be a good time. I'll try reaching out later. Have a great day!' and call the 'end_call' function."
                }
            ],
            "pre_actions": [],
            "post_actions": [],
            "function_name": "",
            "function_description": ""
        },
        "class": "light"
    },
    {
        "id": "user_interested",
        "type": "function",
        "initialized": false,
        "position": {
            "x": -1.2256709451575176,
            "y": 149.79649941656945
        },
        "data": {
            "label": "User Interested",
            "function_name": "user_interested",
            "function_description": "User is interested in the investment opportunity."
        },
        "class": "light",
        "style": {
            "background": "#6a1b9a",
            "color": "white",
            "border": "2px solid #4a148c",
            "borderRadius": "8px"
        }
    },
    {
        "id": "user_unsure",
        "type": "function",
        "initialized": false,
        "position": {
            "x": 374.6935822637107,
            "y": 155.5108518086348
        },
        "data": {
            "label": "User Unsure",
            "function_name": "user_unsure",
            "function_description": "User is unsure and wants more information."
        },
        "class": "light",
        "style": {
            "background": "#6a1b9a",
            "color": "white",
            "border": "2px solid #4a148c",
            "borderRadius": "8px"
        }
    },
    {
        "id": "user_not_interested",
        "type": "function",
        "initialized": false,
        "position": {
            "x": 187.14212368728124,
            "y": 144.48914819136522
        },
        "data": {
            "label": "User Not Interested",
            "function_name": "user_not_interested",
            "function_description": "User is not interested in the investment opportunity."
        },
        "class": "light",
        "style": {
            "background": "#6a1b9a",
            "color": "white",
            "border": "2px solid #4a148c",
            "borderRadius": "8px"
        }
    },
    {
        "id": "end_call",
        "type": "function",
        "initialized": false,
        "position": {
            "x": 552.8606767794632,
            "y": 154.6921820303384
        },
        "data": {
            "label": "End Call",
            "function_name": "end_call",
            "function_description": "End the conversation.",
            "role_messages": [],
            "task_messages": [],
            "pre_actions": [],
            "post_actions": []
        },
        "class": "light",
        "style": {
            "background": "#6a1b9a",
            "color": "white",
            "border": "2px solid #4a148c",
            "borderRadius": "8px"
        }
    },
    {
        "id": "end_interested",
        "type": "output",
        "initialized": false,
        "position": {
            "x": -3.581194309587005,
            "y": 355.63264212429186
        },
        "data": {
            "label": "End Interested",
            "task_messages": [
                {
                    "role": "system",
                    "content": "Say: 'Great! I will have a member from our team contact you soon to discuss the details. Please hold on while I transfer you to a human agent.' and then wait for the transfer to complete."
                }
            ],
            "post_actions": [
                {
                    "type": "transfer_call"
                }
            ],
            "role_messages": [],
            "pre_actions": [],
            "function_name": "",
            "function_description": ""
        },
        "class": "light"
    },
    {
        "id": "end_unsure",
        "type": "output",
        "initialized": false,
        "position": {
            "x": 377.9589264877479,
            "y": 360.815869311552
        },
        "data": {
            "label": "End Unsure",
            "task_messages": [
                {
                    "role": "system",
                    "content": "Say: 'Sounds great! I'm going to make note of that and have a member from our team reach out to you to provide more details. Expect a follow-up soon! Have a great day!' and then end the conversation."
                }
            ],
            "post_actions": [
                {
                    "type": "end_conversation"
                }
            ]
        },
        "class": "light"
    },
    {
        "id": "end_not_interested",
        "type": "output",
        "initialized": false,
        "position": {
            "x": 185.50945157526252,
            "y": 353.87584597432914
        },
        "data": {
            "label": "End Not Interested",
            "task_messages": [
                {
                    "role": "system",
                    "content": "Say: 'No worries! If you change your mind, feel free to give us a call. Thank you for your time. Have a great day!' and then end the conversation."
                }
            ],
            "post_actions": [
                {
                    "type": "end_conversation"
                }
            ],
            "role_messages": [],
            "pre_actions": [],
            "function_name": "",
            "function_description": ""
        },
        "class": "light"
    },
    {
        "id": "end",
        "type": "output",
        "initialized": false,
        "position": {
            "x": 568.3710618436406,
            "y": 363.262543757293
        },
        "data": {
            "label": "End",
            "task_messages": [
                {
                    "role": "system",
                    "content": "The conversation has ended. No further response is needed."
                }
            ],
            "post_actions": [
                {
                    "type": "end_conversation"
                }
            ]
        },
        "class": "light"
    }
]

export const initialEdges = [
    {
        "id": "start-to-interested",
        "type": "default",
        "source": "start",
        "target": "user_interested",
        "data": {},
        "label": "",
        "markerEnd": "arrowclosed",
        "sourceX": 387.0415402567094,
        "sourceY": 47.816336056009334,
        "targetX": 73.77432905484248,
        "targetY": 139.79649941656945
    },
    {
        "id": "start-to-unsure",
        "type": "default",
        "source": "start",
        "target": "user_unsure",
        "data": {},
        "label": "",
        "markerEnd": "arrowclosed",
        "sourceX": 387.0415402567094,
        "sourceY": 47.816336056009334,
        "targetX": 449.6935822637107,
        "targetY": 145.5108518086348
    },
    {
        "id": "start-to-not-interested",
        "type": "default",
        "source": "start",
        "target": "user_not_interested",
        "data": {},
        "label": "",
        "markerEnd": "arrowclosed",
        "sourceX": 387.0415402567094,
        "sourceY": 47.816336056009334,
        "targetX": 262.14212368728124,
        "targetY": 134.48914819136522
    },
    {
        "id": "start-to-end-call",
        "type": "default",
        "source": "start",
        "target": "end_call",
        "data": {},
        "label": "",
        "markerEnd": "arrowclosed",
        "sourceX": 387.0415402567094,
        "sourceY": 47.816336056009334,
        "targetX": 627.8606767794632,
        "targetY": 144.6921820303384
    },
    {
        "id": "interested-to-end",
        "type": "default",
        "source": "user_interested",
        "target": "end_interested",
        "data": {},
        "label": "",
        "markerEnd": "arrowclosed",
        "sourceX": 73.77432905484248,
        "sourceY": 197.79649941656945,
        "targetX": 71.418805690413,
        "targetY": 344.63264212429186
    },
    {
        "id": "unsure-to-end",
        "type": "default",
        "source": "user_unsure",
        "target": "end_unsure",
        "data": {},
        "label": "",
        "markerEnd": "arrowclosed",
        "sourceX": 449.6935822637107,
        "sourceY": 203.5108518086348,
        "targetX": 452.9589264877479,
        "targetY": 349.815869311552
    },
    {
        "id": "not-interested-to-end",
        "type": "default",
        "source": "user_not_interested",
        "target": "end_not_interested",
        "data": {},
        "label": "",
        "markerEnd": "arrowclosed",
        "sourceX": 262.14212368728124,
        "sourceY": 206.48914819136522,
        "targetX": 260.5094515752625,
        "targetY": 342.87584597432914
    },
    {
        "id": "end-call-to-end",
        "type": "default",
        "source": "end_call",
        "target": "end",
        "data": {},
        "label": "",
        "markerEnd": "arrowclosed",
        "sourceX": 627.8606767794632,
        "sourceY": 202.6921820303384,
        "targetX": 643.3710618436406,
        "targetY": 352.262543757293
    }
]