import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Types } from 'mongoose';

@Schema()
export class Accommodation {
  @Prop({ required: true, ref: 'User' })
  owner: Types.ObjectId;

  @Prop({ required: true })
  title: string;

  @Prop({ required: true })
  address: string;

  @Prop({ type: [String], default: [] })
  photos: string[];

  @Prop({ required: true })
  description: string;

  @Prop({ type: [String], default: [] })
  perks: string[];

  @Prop()
  extraInfo: string;

  @Prop({ type: String, required: true })
  checkIn: string;

  @Prop({ type: String, required: true })
  checkOut: string;

  @Prop({ required: true })
  maxGuests: number;

  @Prop({ required: true })
  price: number;
}

export const AccommodationSchema = SchemaFactory.createForClass(Accommodation);
