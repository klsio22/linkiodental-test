import mongoose, { Schema, Document, Model } from 'mongoose';
import { IOrder, OrderState, OrderStatus, ServiceStatus, Service } from '../types/order.types';

export interface IOrderDocument extends IOrder, Document {
  canAdvanceState(): boolean;
  advanceState(): Promise<IOrderDocument>;
}

const serviceSchema = new Schema<Service>(
  {
    name: {
      type: String,
      required: [true, 'Service name is required'],
    },
    value: {
      type: Number,
      required: [true, 'Service value is required'],
      min: [0.01, 'Service value must be greater than zero'],
    },
    status: {
      type: String,
      enum: Object.values(ServiceStatus),
      default: ServiceStatus.PENDING,
    },
  },
);

const orderSchema = new Schema<IOrderDocument>(
  {
    userId: {
      type: String,
      ref: 'User',
      required: [true, 'User ID is required'],
      index: true,
    },
    lab: {
      type: String,
      required: [true, 'Lab is required'],
    },
    patient: {
      type: String,
      required: [true, 'Patient is required'],
      minlength: [3, 'Patient name must have at least 3 characters'],
    },
    customer: {
      type: String,
      required: [true, 'Customer is required'],
      minlength: [3, 'Customer name must have at least 3 characters'],
    },
    services: {
      type: [serviceSchema],
      required: [true, 'At least one service must be informed'],
      validate: {
        validator: function (v: Service[]) {
          return v && v.length > 0;
        },
        message: 'At least one service must be informed',
      },
    },
    state: {
      type: String,
      enum: Object.values(OrderState),
      default: OrderState.CREATED,
    },
    status: {
      type: String,
      enum: Object.values(OrderStatus),
      default: OrderStatus.ACTIVE,
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

orderSchema.index({ userId: 1, createdAt: -1 });
orderSchema.index({ userId: 1, state: 1 });
orderSchema.index({ userId: 1, status: 1 });
orderSchema.index({ patient: 1 });
orderSchema.index({ customer: 1 });

orderSchema.methods.canAdvanceState = function (): boolean {
  const stateSequence = [OrderState.CREATED, OrderState.ANALYSIS, OrderState.COMPLETED];
  const currentIndex = stateSequence.indexOf(this.state);
  return currentIndex < stateSequence.length - 1;
};

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

orderSchema.pre('save', function (next) {
  const doc = this as any;
  if (doc.services && doc.services.length === 0) {
    next(new Error('Order must have at least one service'));
  } else {
    next();
  }
});

export const Order: Model<IOrderDocument> = mongoose.model<IOrderDocument>('Order', orderSchema);
