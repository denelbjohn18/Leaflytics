import { Injectable, Logger, BadRequestException, OnModuleInit } from '@nestjs/common';
import * as path from 'path';
import * as fs from 'fs';
import { exec } from 'child_process';
import { promisify } from 'util';
import * as os from 'os';

const execAsync = promisify(exec);

@Injectable()
export class AnalysisService implements OnModuleInit {
  private readonly logger = new Logger(AnalysisService.name);

  async onModuleInit() {
    this.logger.log('AnalysisService initialized (Using Python child process for inference)');
  }

  async analyzeImage(file: Express.Multer.File) {
    let tempFilePath = '';
    try {
      this.logger.log('Starting Python inference process...');

      // Save file temporarily
      const tempDir = os.tmpdir();
      tempFilePath = path.join(tempDir, `upload-${Date.now()}.jpg`);
      fs.writeFileSync(tempFilePath, file.buffer);

      const scriptPath = path.join(process.cwd(), 'src', 'analysis', 'run_inference.py');
      const pythonPath = path.join(process.cwd(), 'venv', 'bin', 'python');
      
      const { stdout, stderr } = await execAsync(`"${pythonPath}" "${scriptPath}" "${tempFilePath}"`);
      
      if (stderr && !stdout) {
         this.logger.warn(`Python script warning: ${stderr}`);
      }

      const result = JSON.parse(stdout.trim());
      
      if (result.error) {
        throw new Error(result.error);
      }

      const maxProb = result.maxProb;
      const label = result.label;

      this.logger.log(`Prediction: confidence=${(maxProb * 100).toFixed(2)}%`);

      if (maxProb < 0.60) {
        return {
          disease: 'Uncertain',
          crop: 'Unknown',
          confidence: `${(maxProb * 100).toFixed(2)}%`,
          suggestion: 'Uncertain / Please take a clearer picture',
        };
      }

      const [cropRaw, diseaseRaw] = label.split('___');
      const crop = cropRaw.replace(/_/g, ' ');

      let suggestion = 'Maintain current care routine.';
      let diseaseDisplay = 'Healthy';

      if (diseaseRaw && diseaseRaw.toLowerCase() !== 'healthy') {
        diseaseDisplay = diseaseRaw.replace(/_/g, ' ');
        suggestion = `Consult a local agriculturist about specific treatments for ${diseaseDisplay} on ${crop}. Applying an appropriate fungicide/bactericide may be required.`;
      }

      return {
        disease: diseaseDisplay,
        crop: crop,
        confidence: `${(maxProb * 100).toFixed(2)}%`,
        suggestion,
      };
    } catch (err: any) {
      this.logger.error('Error during image analysis', err);
      throw new BadRequestException('Detailed Error: ' + (err.stack || err.message));
    } finally {
      if (tempFilePath && fs.existsSync(tempFilePath)) {
        fs.unlinkSync(tempFilePath);
      }
    }
  }
}
