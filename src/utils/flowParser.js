/**
 * Converts flow configuration to the format used in ha-investments-campaign.json
 * @param {Object} flowConfig - The flow configuration object from VueFlow toObject()
 * @returns {Object} - The converted flow configuration
 */
export function parseFlowConfig(flowConfig) {
    const nodes = flowConfig.nodes || [];
    const edges = flowConfig.edges || [];

    // Find the initial node (usually the one with type 'input' or id 'start')
    let initialNodeId = "start";
    const startNode = nodes.find(node =>
        node.id === "start" ||
        node.type === "input" ||
        node.data?.isStart
    );
    if (startNode) {
        initialNodeId = startNode.id;
    }

    // Create the base structure
    const parsedConfig = {
        initial_node: initialNodeId,
        nodes: {}
    };

    // Process each node
    nodes.forEach(node => {
        const nodeData = {
            role_messages: [],
            task_messages: [],
            functions: [],
            post_actions: []
        };

        // Handle role messages
        if (node.data.role_messages && Array.isArray(node.data.role_messages)) {
            nodeData.role_messages = node.data.role_messages.filter(msg =>
                msg.role && msg.content
            ).map(msg => ({
                role: msg.role,
                content: msg.content
            }));
        }

        // Handle task messages
        if (node.data.task_messages && Array.isArray(node.data.task_messages)) {
            nodeData.task_messages = node.data.task_messages.filter(msg =>
                msg.role && msg.content
            ).map(msg => ({
                role: msg.role,
                content: msg.content
            }));
        }

        // Handle functions - check different possible structures
        if (node.data.functions && Array.isArray(node.data.functions)) {
            nodeData.functions = node.data.functions.map(func => {
                // Handle both nested and flat function structures
                const functionData = func.function || func;

                return {
                    type: "function",
                    function: {
                        name: functionData.name || "",
                        description: functionData.description || "",
                        parameters: {
                            type: "object",
                            properties: functionData.parameters?.properties || {}
                        },
                        transition_to: functionData.transition_to || ""
                    }
                };
            }).filter(func => func.function.name); // Only include functions with names
        }

        // Handle function node data (legacy support)
        if (node.type === 'function' && node.data.function_name) {
            // Find edges from this node to determine transition_to
            const outgoingEdges = edges.filter(edge => edge.source === node.id);

            outgoingEdges.forEach(edge => {
                nodeData.functions.push({
                    type: "function",
                    function: {
                        name: node.data.function_name,
                        description: node.data.function_description || "",
                        parameters: {
                            type: "object",
                            properties: {}
                        },
                        transition_to: edge.target
                    }
                });
            });
        }

        // Handle post actions
        if (node.data.post_actions && Array.isArray(node.data.post_actions)) {
            nodeData.post_actions = node.data.post_actions.map(action => {
                if (typeof action === 'string') {
                    return { type: action };
                }
                return {
                    type: action.type || action
                };
            }).filter(action => action.type);
        }

        // Add the node to the parsed config
        parsedConfig.nodes[node.id] = nodeData;
    });

    return parsedConfig;
}

/**
 * Enhanced parser that handles VueFlow toObject() output specifically
 * @param {Object} vueFlowConfig - The configuration from VueFlow toObject()
 * @returns {Object} - The converted flow configuration in ha-investments format
 */
export function parseVueFlowToHAInvestments(vueFlowConfig) {
    const parsedConfig = parseFlowConfig(vueFlowConfig);

    // Post-process to ensure compliance with ha-investments format
    Object.entries(parsedConfig.nodes).forEach(([nodeId, nodeData]) => {
        // Ensure all required arrays exist
        nodeData.role_messages = nodeData.role_messages || [];
        nodeData.task_messages = nodeData.task_messages || [];
        nodeData.functions = nodeData.functions || [];
        nodeData.post_actions = nodeData.post_actions || [];

        // Remove empty functions
        nodeData.functions = nodeData.functions.filter(func =>
            func.function && func.function.name && func.function.name.trim()
        );
    });

    return parsedConfig;
}

/**
 * Validates the parsed flow configuration
 * @param {Object} parsedConfig - The parsed flow configuration
 * @returns {Object} - Validation result with isValid flag and errors array
 */
export function validateFlowConfig(parsedConfig) {
    const errors = [];

    // Check if initial_node exists
    if (!parsedConfig.initial_node) {
        errors.push("Missing initial_node in flow configuration");
    }

    // Check if nodes exist
    if (!parsedConfig.nodes || Object.keys(parsedConfig.nodes).length === 0) {
        errors.push("No nodes found in flow configuration");
    }

    // Check if initial_node exists in nodes
    if (parsedConfig.initial_node && !parsedConfig.nodes[parsedConfig.initial_node]) {
        errors.push(`Initial node '${parsedConfig.initial_node}' not found in nodes`);
    }

    // Validate each node
    for (const [nodeId, nodeData] of Object.entries(parsedConfig.nodes || {})) {
        // Check required arrays
        if (!Array.isArray(nodeData.role_messages)) {
            errors.push(`Invalid role_messages in node ${nodeId}`);
        }
        if (!Array.isArray(nodeData.task_messages)) {
            errors.push(`Invalid task_messages in node ${nodeId}`);
        }
        if (!Array.isArray(nodeData.functions)) {
            errors.push(`Invalid functions in node ${nodeId}`);
        }
        if (!Array.isArray(nodeData.post_actions)) {
            errors.push(`Invalid post_actions in node ${nodeId}`);
        }

        // Validate functions
        for (const func of nodeData.functions || []) {
            if (!func.function || !func.function.name) {
                errors.push(`Function missing name in node ${nodeId}`);
            }
            if (func.function && func.function.transition_to && !parsedConfig.nodes[func.function.transition_to]) {
                errors.push(`Function in node ${nodeId} references non-existent target: ${func.function.transition_to}`);
            }
        }

        // Validate post actions
        for (const action of nodeData.post_actions || []) {
            if (!action.type) {
                errors.push(`Post action missing type in node ${nodeId}`);
            }
        }

        // Validate messages
        for (const msg of [...(nodeData.role_messages || []), ...(nodeData.task_messages || [])]) {
            if (!msg.role || !msg.content) {
                errors.push(`Message missing role or content in node ${nodeId}`);
            }
        }
    }

    return {
        isValid: errors.length === 0,
        errors: errors
    };
}

/**
 * Exports the configuration with proper filename formatting
 * @param {Object} parsedConfig - The parsed configuration
 * @param {string} campaignName - The campaign name for the filename
 */
export function exportHAInvestmentsConfig(parsedConfig, campaignName = 'ha-investments-campaign') {
    const validation = validateFlowConfig(parsedConfig);

    if (!validation.isValid) {
        console.error('Configuration validation failed:', validation.errors);
        alert('Configuration validation failed:\n' + validation.errors.join('\n'));
        return false;
    }

    const blob = new Blob([JSON.stringify(parsedConfig, null, 4)], {
        type: "application/json",
    });

    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${campaignName}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    return true;
}

/**
 * Test function to verify parser compatibility with ha-investments-campaign.json
 * @param {Object} originalConfig - The original ha-investments-campaign.json
 */
export function testParserCompatibility(originalConfig) {
    console.log('Testing parser compatibility...');

    // Convert original to VueFlow-like format and back
    const mockVueFlowConfig = {
        nodes: Object.entries(originalConfig.nodes).map(([nodeId, nodeData], index) => ({
            id: nodeId,
            type: nodeId.includes('end') ? 'output' : (nodeId === 'start' ? 'input' : 'default'),
            position: { x: index * 200, y: index * 100 },
            data: {
                role_messages: nodeData.role_messages || [],
                task_messages: nodeData.task_messages || [],
                functions: nodeData.functions || [],
                post_actions: nodeData.post_actions || []
            }
        })),
        edges: []
    };

    // Add edges based on function transitions
    Object.entries(originalConfig.nodes).forEach(([nodeId, nodeData]) => {
        if (nodeData.functions) {
            nodeData.functions.forEach((func, index) => {
                if (func.function && func.function.transition_to) {
                    mockVueFlowConfig.edges.push({
                        id: `edge-${nodeId}-${func.function.transition_to}-${index}`,
                        source: nodeId,
                        target: func.function.transition_to,
                        type: 'smoothstep',
                        label: func.function.name
                    });
                }
            });
        }
    });

    // Parse it back
    const parsedConfig = parseVueFlowToHAInvestments(mockVueFlowConfig);

    // Validate
    const validation = validateFlowConfig(parsedConfig);

    console.log('Original config:', originalConfig);
    console.log('Mock VueFlow config:', mockVueFlowConfig);
    console.log('Parsed config:', parsedConfig);
    console.log('Validation result:', validation);

    return {
        originalConfig,
        mockVueFlowConfig,
        parsedConfig,
        validation,
        isCompatible: validation.isValid
    };
} 