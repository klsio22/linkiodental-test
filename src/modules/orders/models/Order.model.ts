import mongoose, { Schema, Document, Model } from 'mongoose';
import { IOrder, OrderState } from '../types/order.types';

export interface IOrderDocument extends IOrder, Document {
  canAdvanceState(): boolean;
  advanceState(): Promise<IOrderDocument>;
}

const orderSchema = new Schema<IOrderDocument>(
  {
    patientName: {
      type: String,
      required: [true, 'Patient name is required'],
      trim: true,
      minlength: [3, 'Patient name must have at least 3 characters'],
    },
    dentistName: {
      type: String,
      required: [true, 'Dentist name is required'],
      trim: true,
      minlength: [3, 'Dentist name must have at least 3 characters'],
    },
    services: {
      type: [String],
      required: [true, 'At least one service must be informed'],
      validate: {
        validator: function (v: string[]) {
          return v && v.length > 0;
        },
        message: 'At least one service must be informed',
      },
    },
    totalValue: {
      type: Number,
      required: [true, 'Total value is required'],
      min: [0.01, 'Total value must be greater than zero'],
    },
    deadline: {
      type: Date,
      required: [true, 'Deadline is required'],
      validate: {
        validator: function (v: Date) {
          return v > new Date();
        },
        message: 'Deadline must be a future date',
      },
    },
    state: {
      type: String,
      enum: Object.values(OrderState),
      default: OrderState.CREATED,
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform: (_doc, ret: any) => {
        ret.id = ret._id;
        delete ret._id;
        delete ret.__v;
        return ret;
      },
    },
  }
);

orderSchema.index({ state: 1, createdAt: -1 });
orderSchema.index({ patientName: 1 });
orderSchema.index({ dentistName: 1 });

orderSchema.methods.canAdvanceState = function (): boolean {
  const stateSequence = [OrderState.CREATED, OrderState.ANALYSIS, OrderState.COMPLETED];
  const currentIndex = stateSequence.indexOf(this.state);
  return currentIndex < stateSequence.length - 1;
};

// Método de instância: avançar o estado
orderSchema.methods.advanceState = async function (): Promise<IOrderDocument> {
  const stateSequence = [OrderState.CREATED, OrderState.ANALYSIS, OrderState.COMPLETED];
  const currentIndex = stateSequence.indexOf(this.state);

  if (currentIndex === -1) {
    throw new Error('Invalid current state');
  }

  if (currentIndex >= stateSequence.length - 1) {
    throw new Error('Order is already in final state');
  }

  this.state = stateSequence[currentIndex + 1];
  return await this.save();
};

// Validação pré-save: garantir que serviços não estão vazios e valor é positivo
orderSchema.pre('save', function (next) {
  if (this.services.length === 0) {
    next(new Error('Order must have at least one service'));
  } else if (this.totalValue <= 0) {
    next(new Error('Total value must be greater than zero'));
  } else {
    next();
  }
});

export const Order: Model<IOrderDocument> = mongoose.model<IOrderDocument>('Order', orderSchema);
