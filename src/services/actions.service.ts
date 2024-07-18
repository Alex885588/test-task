import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Actions } from 'src/schemas/Actions';
import { ActionsDto } from 'src/dto/actions.dto';
import axios from 'axios';
import { Cron, CronExpression } from '@nestjs/schedule';
import { Connection } from 'mongoose';
import { InjectConnection } from '@nestjs/mongoose';

@Injectable()
export class ActionsService {
    private readonly logger = new Logger(ActionsService.name);

    constructor(
        @InjectModel(Actions.name) private actionsModel: Model<Actions>,
        @InjectConnection() private readonly connection: Connection
    ) { }

    @Cron(CronExpression.EVERY_MINUTE)
    async handleCron() {
        console.log('Cron job is working');
        const requestBody = { account_name: 'eosio', pos: -1, offset: -100 };
        let response;
        try {
            response = await axios.post(process.env.REQUEST_URL, requestBody);
        } catch (error) {
            console.error('Error fetching data:', error);
            return;
        }
        const session = await this.connection.startSession();
        session.startTransaction();
        try {
            const filteredActions = response.data.actions.filter((action, index, self) =>
                index === self.map(a => a.action_trace.trx_id).lastIndexOf(action.action_trace.trx_id)
            );
            const ids = filteredActions.map(t => t.action_trace.trx_id);
            const items = await this.actionsModel.find({ trx_id: { $in: ids } });
            const existingTrxIds = new Set(items.map(item => item.trx_id));
            const newItems = filteredActions.filter(action => !existingTrxIds.has(action.action_trace.trx_id));
            const newItemsToInsert = newItems.map(action => ({
                trx_id: action.action_trace.trx_id,
                block_time: action.block_time,
                block_num: action.block_num,
            }));
            await this.actionsModel.insertMany(newItemsToInsert)
            await session.commitTransaction();
        } catch (error) {
            await session.abortTransaction();
            console.error('Transaction aborted due to error:', error);
        } finally {
            session.endSession();
        }
    }
}
