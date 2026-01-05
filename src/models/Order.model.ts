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
      required: [true, 'Nome do paciente é obrigatório'],
      trim: true,
      minlength: [3, 'Nome do paciente deve ter no mínimo 3 caracteres'],
    },
    dentistName: {
      type: String,
      required: [true, 'Nome do dentista é obrigatório'],
      trim: true,
      minlength: [3, 'Nome do dentista deve ter no mínimo 3 caracteres'],
    },
    services: {
      type: [String],
      required: [true, 'Pelo menos um serviço deve ser informado'],
      validate: {
        validator: function (v: string[]) {
          return v && v.length > 0;
        },
        message: 'Pelo menos um serviço deve ser informado',
      },
    },
    totalValue: {
      type: Number,
      required: [true, 'Valor total é obrigatório'],
      min: [0.01, 'Valor total deve ser maior que zero'],
    },
    deadline: {
      type: Date,
      required: [true, 'Prazo é obrigatório'],
      validate: {
        validator: function (v: Date) {
          return v > new Date();
        },
        message: 'Prazo deve ser uma data futura',
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

// Índices para otimizar buscas
orderSchema.index({ state: 1, createdAt: -1 });
orderSchema.index({ patientName: 1 });
orderSchema.index({ dentistName: 1 });

// Método de instância: verificar se pode avançar o estado
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
    throw new Error('Estado atual inválido');
  }

  if (currentIndex >= stateSequence.length - 1) {
    throw new Error('Pedido já está no estado final');
  }

  this.state = stateSequence[currentIndex + 1];
  return await this.save();
};

// Validação pré-save: garantir que serviços não estão vazios e valor é positivo
orderSchema.pre('save', function (next) {
  if (this.services.length === 0) {
    next(new Error('Pedido deve ter pelo menos um serviço'));
  } else if (this.totalValue <= 0) {
    next(new Error('Valor total deve ser maior que zero'));
  } else {
    next();
  }
});

export const Order: Model<IOrderDocument> = mongoose.model<IOrderDocument>('Order', orderSchema);
