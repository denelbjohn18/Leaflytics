import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import * as path from 'path';
import { exec } from 'child_process';
import { promisify } from 'util';
import * as fs from 'fs';
import { PLANT_VILLAGE_CLASSES } from './labels';

const execAsync = promisify(exec);

@Injectable()
export class AnalysisService {
  private readonly logger = new Logger(AnalysisService.name);

  async loadModel() {
    this.logger.log('Python ML Model is loaded lazily per process. Skipping Node-side initialization.');
  }

  async analyzeImage(file: Express.Multer.File) {
    try {
      this.logger.log('Starting Python inference via child_process...');
      
      // Save buffer to a temporary file for Python to read
      const tempImagePath = path.join(process.cwd(), `temp_${Date.now()}.jpg`);
      fs.writeFileSync(tempImagePath, file.buffer);

      const modelPath = path.join(process.cwd(), '..', 'model files', 'plant_disease_model.h5');
      const pythonPath = path.join(process.cwd(), 'venv', 'bin', 'python');
      const scriptPath = path.join(process.cwd(), 'infer.py');

      if (!fs.existsSync(modelPath)) {
        throw new Error('H5 Model file not found at: ' + modelPath);
      }

      const { stdout, stderr } = await execAsync(`"${pythonPath}" "${scriptPath}" "${modelPath}" "${tempImagePath}" "efficientnetv2"`);

      // Clean up temp image
      if (fs.existsSync(tempImagePath)) {
        fs.unlinkSync(tempImagePath);
      }

      if (stderr && !stdout) {
        throw new Error('Python Script Stderr: ' + stderr);
      }

      // Parse JSON from stdout
      // The python script might output tensorflow warnings before the final JSON line.
      // So we split by lines and find the JSON one.
      const lines = stdout.split('\n').filter(l => l.trim() !== '');
      let parsed = null;
      for (const line of lines) {
        if (line.startsWith('{')) {
          try { parsed = JSON.parse(line); break; } catch (e) {}
        }
      }

      if (!parsed) {
        throw new Error('Failed to parse Python output: ' + stdout);
      }

      if (parsed.error) {
        throw new Error('Python Execution Error: ' + parsed.error);
      }

      const { maxIndex, maxProb } = parsed;

      if (maxProb < 0.60) {
        return {
          disease: 'Uncertain',
          crop: 'Unknown',
          confidence: `${(maxProb * 100).toFixed(2)}%`,
          suggestion: 'Uncertain / Please take a clearer picture',
        };
      }

      // Parse Crop and Disease
      const label = PLANT_VILLAGE_CLASSES[maxIndex] || 'Unknown___Unknown';
      const [crop, diseaseRaw] = label.split('___');
      
      let suggestion = 'Maintain current care routine.';
      let diseaseDisplay = 'Healthy';

      if (diseaseRaw && diseaseRaw.toLowerCase() !== 'healthy') {
        diseaseDisplay = diseaseRaw.replace(/_/g, ' ');
        suggestion = `Consult a local agriculturist about specific treatments for ${diseaseDisplay} on ${crop}. Applying an appropriate fungicide/bactericide may be required.`;
      }

      return {
        disease: diseaseDisplay,
        crop: crop.replace(/_/g, ' '),
        confidence: `${(maxProb * 100).toFixed(2)}%`,
        suggestion,
      };
    } catch (err: any) {
      this.logger.error('Error during image analysis', err);
      throw new BadRequestException('Detailed Error: ' + (err.stack || err.message));
    }
  }
}
