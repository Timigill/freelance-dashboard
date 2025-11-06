import IncomeSource from '@/models/IncomeSource';
import Client from '@/models/Client';
import { NextResponse } from 'next/server';
import { dbConnect } from '@/lib/dbConnect';

export async function GET() {
  await dbConnect();
  const clients = await Client.find().lean();

  const clientIds = clients.map(c => c._id);
  const incomeSources = await IncomeSource.find({ clientId: { $in: clientIds }, isActive: true }).lean();

  const incomeMap = {};
  incomeSources.forEach(src => {
    const id = src.clientId.toString();
    if (!incomeMap[id]) incomeMap[id] = 0;
    if (src.payments?.length) {
      src.payments.forEach(p => { incomeMap[id] += p.amount; });
    } else {
      incomeMap[id] += Number(src.amount || 0);
    }
  });

  const clientsWithIncome = clients.map(c => ({
    _id: c._id,
    name: c.name,
    totalIncome: incomeMap[c._id.toString()] || 0,
  }));

  return NextResponse.json(clientsWithIncome);
}
