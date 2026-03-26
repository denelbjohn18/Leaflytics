const fs = require('fs');
const path = require('path');
const p = path.join(__dirname, 'model', 'model.json');

// Re-read fresh backup if needed, or just process current
let d;
try {
  d = JSON.parse(fs.readFileSync(p));
} catch(e) {
  console.error("Failed to read model.json");
  process.exit(1);
}

function convertInboundNodes(nodes) {
  if (!Array.isArray(nodes)) return nodes;
  
  // If it's already an array of arrays, it's Keras 2
  if (nodes.length > 0 && Array.isArray(nodes[0])) {
    return nodes;
  }
  
  const newNodes = [];
  
  for (const node of nodes) {
    if (node.args && Array.isArray(node.args)) {
      const nodeArgs = [];
      for (const arg of node.args) {
        if (arg.class_name === '__keras_tensor__' && arg.config && arg.config.keras_history) {
          const history = arg.config.keras_history;
          // keras_history is [node_name, node_index, tensor_index]
          // Keras 2 inbound node format: [node_name, node_index, tensor_index, kwargs]
          const kwargs = node.kwargs || {};
          nodeArgs.push([history[0], history[1], history[2], kwargs]);
        }
      }
      if (nodeArgs.length > 0) {
        newNodes.push(nodeArgs);
      }
    } else {
      // Unrecognized format
      newNodes.push(node);
    }
  }
  
  return newNodes;
}

function processLayers(layers) {
  if (!layers) return;
  layers.forEach(layer => {
    // 1. Fix missing batchInputShape just in case
    if (layer.class_name === 'InputLayer' && layer.config.batch_shape && !layer.config.batchInputShape) {
      layer.config.batchInputShape = layer.config.batch_shape;
    }
    
    // 2. Convert inbound_nodes
    if (layer.inbound_nodes) {
      layer.inbound_nodes = convertInboundNodes(layer.inbound_nodes);
    }
    
    // 3. Recurse into nested models
    if (layer.config && layer.config.layers) {
      processLayers(layer.config.layers);
    }
  });
}

if (d.modelTopology && d.modelTopology.model_config && d.modelTopology.model_config.config && d.modelTopology.model_config.config.layers) {
  processLayers(d.modelTopology.model_config.config.layers);
  fs.writeFileSync(p, JSON.stringify(d, null, 2));
  console.log('Patched Keras 3 topology to Keras 2 format successfully.');
} else {
  console.log('Could not find modelTopology layers to patch.');
}
