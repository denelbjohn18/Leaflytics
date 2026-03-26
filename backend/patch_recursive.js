const fs = require('fs');
const path = require('path');
const p = path.join(__dirname, 'model', 'model.json');
const d = JSON.parse(fs.readFileSync(p));

function patchLayers(layers) {
  if (!layers) return;
  layers.forEach(layer => {
    if (layer.class_name === 'InputLayer' && layer.config.batch_shape) {
      layer.config.batchInputShape = layer.config.batch_shape;
    }
    if (layer.config && layer.config.layers) {
      patchLayers(layer.config.layers);
    }
  });
}

patchLayers(d.modelTopology.model_config.config.layers);
fs.writeFileSync(p, JSON.stringify(d, null, 2));
console.log('Patched all InputLayers.');
