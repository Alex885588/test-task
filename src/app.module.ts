import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ScheduleModule } from '@nestjs/schedule';
import { ConfigModule } from '@nestjs/config';
import { Actions, ActionsSchema } from './schemas/Actions';
import { ActionsService } from './services/actions.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    MongooseModule.forRoot(`mongodb://${process.env.HOST}:${process.env.PORT}/${process.env.DB_NAME}`),
    MongooseModule.forFeature([
      { name: Actions.name, schema: ActionsSchema },
    ]),
    ScheduleModule.forRoot(),
  ],
  controllers: [],
  providers: [ActionsService],
})
export class AppModule { }
