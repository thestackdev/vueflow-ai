export const initialNodes = [
    {
        id: '1',
        position: { x: 0, y: 0 },
        type: 'value',
        data: { value: 10 },
    },
    {
        id: '2',
        position: { x: 0, y: 100 },
        type: 'value',
        data: { value: 30 },
    },
    {
        id: '3',
        position: { x: 300, y: 35 },
        type: 'operator',
        data: { operator: '+' },
    },
    {
        id: '4',
        position: { x: 650, y: 15 },
        type: 'result',
    },
]

export const initialEdges = [
    { id: 'e1-3', source: '1', target: '3', animated: true, targetHandle: 'target-a' },
    { id: 'e2-3', source: '2', target: '3', animated: true, targetHandle: 'target-b' },
    { id: 'e3-4', source: '3', target: '4', animated: true },
]
