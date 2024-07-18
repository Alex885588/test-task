import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema()
export class Actions extends Document {

    @Prop({ required: true, unique: true })
    trx_id: string;

    @Prop({ required: true })
    block_time: Date;

    @Prop({ required: true })
    block_num: string;

    @Prop({ default: Date.now })
    createdAt: Date;

}

export const ActionsSchema = SchemaFactory.createForClass(Actions);
