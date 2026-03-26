import { Module } from '@nestjs/common';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { AnalysisModule } from './analysis/analysis.module';

@Module({
  imports: [
    ServeStaticModule.forRoot(
      {
        rootPath: join(process.cwd(), '..', 'frontend', 'dist'),
      },
      {
        rootPath: join(process.cwd(), 'model'),
        serveRoot: '/model',
      }
    ),
    AnalysisModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
